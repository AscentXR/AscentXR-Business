// LinkedIn Service - Stub for deployment
class LinkedInService {
  async schedulePost(data) {
    return {
      id: 'mock-' + Date.now(),
      status: 'scheduled',
      ...data
    };
  }

  async getScheduledPosts() {
    return [];
  }

  async getAnalytics() {
    return {
      impressions: 0,
      engagements: 0,
      clicks: 0
    };
  }
}

module.exports = new LinkedInService();
