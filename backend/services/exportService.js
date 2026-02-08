const { query } = require('../db/connection');

class ExportService {
  async exportData(format, data) {
    let result;

    switch (data.type) {
      case 'contacts':
        result = await query('SELECT * FROM contacts ORDER BY last_name');
        break;
      case 'schools':
        result = await query('SELECT * FROM school_districts ORDER BY name');
        break;
      case 'pipeline':
        result = await query(
          `SELECT p.*, sd.name as school_district_name
           FROM pipeline p
           LEFT JOIN school_districts sd ON p.school_district_id = sd.id
           ORDER BY p.opportunity_value DESC`
        );
        break;
      case 'communications':
        result = await query('SELECT * FROM communications ORDER BY date DESC');
        break;
      default:
        result = { rows: [] };
    }

    if (format === 'csv') {
      return this.toCSV(result.rows);
    }

    return {
      format,
      data: result.rows,
      count: result.rows.length,
      exportedAt: new Date().toISOString()
    };
  }

  toCSV(rows) {
    if (rows.length === 0) return '';

    const headers = Object.keys(rows[0]);
    const csvRows = [headers.join(',')];

    for (const row of rows) {
      const values = headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}

module.exports = new ExportService();
