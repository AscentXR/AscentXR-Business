const { query } = require('../db/connection');

class KnowledgeBaseService {
  async getArticles({ business_area = '', category = '', search = '', page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM knowledge_base_articles';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (business_area) {
      conditions.push(`business_area = $${paramIndex}`);
      params.push(business_area);
      paramIndex++;
    }
    if (category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR summary ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY is_pinned DESC, priority DESC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Count
    let countSql = 'SELECT COUNT(*) FROM knowledge_base_articles';
    const countParams = [];
    const countConditions = [];
    let cIdx = 1;
    if (business_area) { countConditions.push(`business_area = $${cIdx}`); countParams.push(business_area); cIdx++; }
    if (category) { countConditions.push(`category = $${cIdx}`); countParams.push(category); cIdx++; }
    if (search) { countConditions.push(`(title ILIKE $${cIdx} OR summary ILIKE $${cIdx} OR content ILIKE $${cIdx})`); countParams.push(`%${search}%`); cIdx++; }
    if (countConditions.length > 0) { countSql += ` WHERE ${countConditions.join(' AND ')}`; }
    const countResult = await query(countSql, countParams);

    return {
      articles: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getArticleById(id) {
    const result = await query('SELECT * FROM knowledge_base_articles WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createArticle(data) {
    const { business_area, category, title, summary, content, tags, is_pinned, priority, author } = data;
    const result = await query(
      `INSERT INTO knowledge_base_articles (business_area, category, title, summary, content, tags, is_pinned, priority, author)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [business_area, category, title, summary || null, content, tags || [], is_pinned || false, priority || 0, author || null]
    );
    return result.rows[0];
  }

  async updateArticle(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['business_area', 'category', 'title', 'summary', 'content', 'tags', 'is_pinned', 'priority', 'author'];
    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    const result = await query(
      `UPDATE knowledge_base_articles SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteArticle(id) {
    const result = await query('DELETE FROM knowledge_base_articles WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  async searchArticles(searchQuery) {
    const result = await query(
      `SELECT id, business_area, category, title, summary, tags, is_pinned, priority, created_at
       FROM knowledge_base_articles
       WHERE title ILIKE $1 OR summary ILIKE $1 OR content ILIKE $1 OR $2 = ANY(tags)
       ORDER BY is_pinned DESC, priority DESC, created_at DESC
       LIMIT 20`,
      [`%${searchQuery}%`, searchQuery.toLowerCase()]
    );
    return result.rows;
  }
}

module.exports = new KnowledgeBaseService();
