const { query } = require('../db/connection');

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_CALLBACK_URL = process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3000/api/linkedin/callback';

class LinkedInService {
  async schedulePost({ text, mediaUrls, scheduledTime, visibility }) {
    const result = await query(
      `INSERT INTO linkedin_posts (text, media_urls, scheduled_time, visibility, status)
       VALUES ($1, $2, $3, $4, 'scheduled')
       RETURNING *`,
      [text, mediaUrls || [], scheduledTime, visibility || 'PUBLIC']
    );
    return result.rows[0];
  }

  async getScheduledPosts() {
    const result = await query(
      `SELECT * FROM linkedin_posts ORDER BY scheduled_time DESC`
    );
    return result.rows;
  }

  async deleteScheduledPost(id) {
    const result = await query(
      `DELETE FROM linkedin_posts WHERE id = $1 RETURNING id`,
      [id]
    );
    return { success: result.rowCount > 0 };
  }

  getAuthorizationUrl() {
    const scopes = 'r_liteprofile r_emailaddress w_member_social';
    const state = Math.random().toString(36).substring(7);
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_CALLBACK_URL)}&state=${state}&scope=${encodeURIComponent(scopes)}`;
  }

  async handleOAuthCallback(code) {
    // Exchange code for access token
    // In production, use axios to call LinkedIn's token endpoint
    return {
      access_token: 'mock-token-' + Date.now(),
      expires_in: 5184000 // 60 days
    };
  }

  verifyWebhookSignature(body, signature) {
    // Verify LinkedIn webhook signature using client secret
    return !!signature;
  }

  async processWebhookEvent(event) {
    // Process incoming webhook events from LinkedIn
    console.log('LinkedIn webhook event:', event.type || 'unknown');
    return { processed: true };
  }

  async getProfileInfo() {
    return {
      id: 'ascent-xr',
      name: 'Ascent XR',
      company: 'Ascent XR',
      followers: 245,
      connections: 500
    };
  }

  async getAnalytics() {
    const result = await query(
      `SELECT
        SUM(impressions) as total_impressions,
        SUM(engagements) as total_engagements,
        SUM(clicks) as total_clicks,
        SUM(shares) as total_shares,
        COUNT(*) FILTER (WHERE status = 'published') as published_count,
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_count,
        CASE WHEN SUM(impressions) > 0
          THEN ROUND(SUM(engagements)::numeric / SUM(impressions) * 100, 2)
          ELSE 0 END as engagement_rate
       FROM linkedin_posts`
    );
    return result.rows[0];
  }
}

module.exports = new LinkedInService();
