const { query } = require('../db/connection');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DocumentService {
  async listDocuments({ category, search, page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM documents';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }
    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ` ORDER BY updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) FROM documents';
    const countParams = [];
    if (conditions.length > 0) {
      const countConditions = [];
      let ci = 1;
      if (category) {
        countConditions.push(`category = $${ci++}`);
        countParams.push(category);
      }
      if (search) {
        countConditions.push(`(title ILIKE $${ci} OR description ILIKE $${ci})`);
        countParams.push(`%${search}%`);
      }
      countSql += ' WHERE ' + countConditions.join(' AND ');
    }
    const countResult = await query(countSql, countParams);

    return {
      documents: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getCategories() {
    const result = await query(
      `SELECT category, COUNT(*) as count FROM documents GROUP BY category ORDER BY count DESC`
    );
    return result.rows;
  }

  async createDocument({ file, title, description, category, tags }) {
    const result = await query(
      `INSERT INTO documents (title, description, filename, original_name, mimetype, size, category, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, file.filename, file.originalname, file.mimetype, file.size, category, tags]
    );
    return result.rows[0];
  }

  async getDocumentById(id) {
    const result = await query('SELECT * FROM documents WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async getDocument(id) {
    return this.getDocumentById(id);
  }

  async getDocuments() {
    return this.listDocuments();
  }

  async updateDocument(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (['title', 'description', 'category', 'tags'].includes(key)) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE documents SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteDocument(id) {
    const doc = await this.getDocumentById(id);
    if (!doc) return { success: false, error: 'Document not found' };

    // Delete file from disk
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, doc.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await query('DELETE FROM documents WHERE id = $1', [id]);
    return { success: true };
  }

  async getDocumentPreview(id) {
    const doc = await this.getDocumentById(id);
    if (!doc) return null;

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, doc.filename);

    if (!fs.existsSync(filePath)) {
      return { id, preview: 'File not found on disk', type: doc.mimetype };
    }

    if (doc.mimetype && doc.mimetype.startsWith('text/')) {
      const content = fs.readFileSync(filePath, 'utf8');
      return {
        id,
        preview: content.substring(0, 1000),
        type: doc.mimetype,
        truncated: content.length > 1000
      };
    }

    return {
      id,
      preview: 'Preview not available for this file type',
      type: doc.mimetype
    };
  }

  async createShareLink(id, { expiresAt, password } = {}) {
    const doc = await this.getDocumentById(id);
    if (!doc) return null;

    const shareToken = crypto.randomBytes(32).toString('hex');
    return {
      documentId: id,
      shareUrl: `/api/documents/shared/${shareToken}`,
      token: shareToken,
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      passwordProtected: !!password
    };
  }
}

module.exports = new DocumentService();
