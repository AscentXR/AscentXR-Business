const { query } = require('../db/connection');

class ProductService {
  // ========================
  // PRODUCTS
  // ========================

  async getProducts({ page = 1, limit = 50, search = '', category = '', status = '' } = {}) {
    const offset = (page - 1) * limit;
    let sql = `SELECT p.*, (SELECT COUNT(*) FROM product_features pf WHERE pf.product_id = p.id) as feature_count FROM products p`;
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (category) {
      conditions.push(`p.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    if (status) {
      conditions.push(`p.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY p.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Count query
    let countSql = 'SELECT COUNT(*) FROM products p';
    const countParams = [];
    const countConditions = [];
    let countIdx = 1;

    if (search) {
      countConditions.push(`(p.name ILIKE $${countIdx} OR p.description ILIKE $${countIdx})`);
      countParams.push(`%${search}%`);
      countIdx++;
    }
    if (category) {
      countConditions.push(`p.category = $${countIdx}`);
      countParams.push(category);
      countIdx++;
    }
    if (status) {
      countConditions.push(`p.status = $${countIdx}`);
      countParams.push(status);
      countIdx++;
    }
    if (countConditions.length > 0) {
      countSql += ` WHERE ${countConditions.join(' AND ')}`;
    }
    const countResult = await query(countSql, countParams);

    return {
      products: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getProductById(id) {
    const [product, features] = await Promise.all([
      query('SELECT * FROM products WHERE id = $1', [id]),
      query('SELECT * FROM product_features WHERE product_id = $1 ORDER BY priority ASC, created_at ASC', [id])
    ]);
    if (!product.rows[0]) return null;
    return { ...product.rows[0], product_features: features.rows };
  }

  async createProduct(data) {
    const { name, description, category, pricing_model, base_price, price_max, billing_frequency, status, features, target_audience, competitive_advantage } = data;
    const result = await query(
      `INSERT INTO products (name, description, category, pricing_model, base_price, price_max, billing_frequency, status, features, target_audience, competitive_advantage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [name, description || null, category, pricing_model, base_price, price_max || null, billing_frequency || null, status || 'active', JSON.stringify(features || []), target_audience || null, competitive_advantage || null]
    );
    return result.rows[0];
  }

  async updateProduct(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['name', 'description', 'category', 'pricing_model', 'base_price', 'price_max', 'billing_frequency', 'status', 'features', 'target_audience', 'competitive_advantage'];
    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(key === 'features' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteProduct(id) {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // PRODUCT FEATURES
  // ========================

  async getFeaturesByProduct(productId) {
    const result = await query(
      'SELECT * FROM product_features WHERE product_id = $1 ORDER BY priority ASC, created_at ASC',
      [productId]
    );
    return result.rows;
  }

  async createFeature(data) {
    const { product_id, name, description, status, priority, target_date, released_at } = data;
    const result = await query(
      `INSERT INTO product_features (product_id, name, description, status, priority, target_date, released_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [product_id, name, description || null, status || 'planned', priority || 3, target_date || null, released_at || null]
    );
    return result.rows[0];
  }

  async updateFeature(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['name', 'description', 'status', 'priority', 'target_date', 'released_at'];
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
      `UPDATE product_features SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteFeature(id) {
    const result = await query('DELETE FROM product_features WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }
}

// Route-compatible aliases
const instance = new ProductService();
instance.getProductFeatures = instance.getFeaturesByProduct.bind(instance);
instance.createProductFeature = function(productId, data) {
  return instance.createFeature({ ...data, product_id: productId });
};
module.exports = instance;
