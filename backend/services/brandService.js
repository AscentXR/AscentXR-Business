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
}

// Route-compatible aliases
const instance = new BrandService();
instance.getAssets = instance.getBrandAssets.bind(instance);
instance.createAsset = instance.createBrandAsset.bind(instance);
instance.updateAsset = instance.updateBrandAsset.bind(instance);
instance.deleteAsset = instance.deleteBrandAsset.bind(instance);
module.exports = instance;
