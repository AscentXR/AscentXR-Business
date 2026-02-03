// CRM Service - Stub for deployment
class CRMService {
  async getContacts() {
    return [];
  }

  async getDeals() {
    return [];
  }

  async createContact(data) {
    return { id: 'mock-' + Date.now(), ...data };
  }
}

module.exports = new CRMService();
