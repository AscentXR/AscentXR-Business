// Export Service - Stub for deployment
class ExportService {
  async exportData(format, data) {
    return {
      url: '/exports/mock-export.' + format,
      format,
      size: 0
    };
  }
}

module.exports = new ExportService();
