// Document Service - Stub for deployment
const fs = require('fs');
const path = require('path');

class DocumentService {
  async getDocuments() {
    return [];
  }

  async getDocument(id) {
    return { id, content: '' };
  }
}

module.exports = new DocumentService();
