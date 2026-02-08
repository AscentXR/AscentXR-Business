const { query } = require('../db/connection');

class BrandService {
  async getBrandAssets({ asset_type = '', category = '', status = '' } = {}) {
    let sql = 'SELECT * FROM brand_assets';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (asset_type) {
      conditions.push(`asset_type = $${paramIndex}`);
      params.push(asset_type);
      paramIndex++;
    }
    if (category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY asset_type ASC, name ASC';
    const result = await query(sql, params);
    return result.rows;
  }

  async getBrandAssetById(id) {
    const result = await query('SELECT * FROM brand_assets WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createBrandAsset(data) {
    const { name, asset_type, category, value, description, file_url, usage_notes, status } = data;
    const result = await query(
      `INSERT INTO brand_assets (name, asset_type, category, value, description, file_url, usage_notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, asset_type, category || null, value || null, description || null, file_url || null, usage_notes || null, status || 'active']
    );
    return result.rows[0];
  }

  async updateBrandAsset(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['name', 'asset_type', 'category', 'value', 'description', 'file_url', 'usage_notes', 'status'];
    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE brand_assets SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteBrandAsset(id) {
    const result = await query('DELETE FROM brand_assets WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  async getByType() {
    const result = await query(
      `SELECT asset_type, json_agg(json_build_object(
        'id', id, 'name', name, 'category', category, 'value', value,
        'description', description, 'file_url', file_url, 'status', status
       ) ORDER BY name) as assets
       FROM brand_assets
       WHERE status = 'active'
       GROUP BY asset_type
       ORDER BY asset_type`
    );

    const byType = {};
    result.rows.forEach(row => {
      byType[row.asset_type] = row.assets;
    });
    return byType;
  }

  // ========================
  // ENHANCED DASHBOARD
  // ========================

  async getDashboardMetrics() {
    const result = await query(
      `SELECT
        COUNT(*) as total_assets,
        COUNT(*) FILTER (WHERE status = 'active') as active_assets,
        COUNT(DISTINCT asset_type) as asset_types,
        COUNT(DISTINCT category) as categories
       FROM brand_assets`
    );

    const byType = await query(
      `SELECT asset_type, COUNT(*) as count FROM brand_assets WHERE status = 'active' GROUP BY asset_type ORDER BY count DESC`
    );

    const r = result.rows[0];
    // Simple consistency score based on asset coverage
    const requiredTypes = ['logo', 'color', 'font', 'template', 'guideline'];
    const existingTypes = byType.rows.map(t => t.asset_type);
    const coverage = requiredTypes.filter(t => existingTypes.includes(t)).length / requiredTypes.length;

    return {
      total_assets: parseInt(r.total_assets),
      active_assets: parseInt(r.active_assets),
      asset_types: parseInt(r.asset_types),
      consistency_score: Math.round(coverage * 100),
      coverage_by_type: byType.rows
    };
  }

  async getConsistencyScore() {
    const metrics = await this.getDashboardMetrics();
    return {
      score: metrics.consistency_score,
      coverage_by_type: metrics.coverage_by_type,
      recommendations: metrics.consistency_score < 80
        ? ['Add missing brand asset types', 'Ensure all core brand elements are documented']
        : ['Brand assets are well-documented', 'Consider adding seasonal variations']
    };
  }
}

// Route-compatible aliases
const instance = new BrandService();
instance.getAssets = instance.getBrandAssets.bind(instance);
instance.createAsset = instance.createBrandAsset.bind(instance);
instance.updateAsset = instance.updateBrandAsset.bind(instance);
instance.deleteAsset = instance.deleteBrandAsset.bind(instance);
module.exports = instance;
