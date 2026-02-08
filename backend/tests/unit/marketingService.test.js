const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

const { createCampaign, createContentItem } = require('../fixtures/testData');

describe('Marketing Service', () => {
  const marketingService = require('../../services/marketingService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ========================
  // CAMPAIGNS
  // ========================

  // 1. getCampaigns returns paginated list
  it('should get campaigns with pagination', async () => {
    const c1 = createCampaign();
    const c2 = createCampaign({ id: 'camp-uuid-2', name: 'Email Nurture Series', channel: 'email', leads_generated: 40 });

    mockQuery
      .mockResolvedValueOnce({ rows: [c1, c2] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const result = await marketingService.getCampaigns();

    expect(result.campaigns).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.campaigns[0].name).toBe('Q1 LinkedIn Campaign');
  });

  // 2. getCampaigns with channel filter
  it('should filter campaigns by channel', async () => {
    const c1 = createCampaign();

    mockQuery
      .mockResolvedValueOnce({ rows: [c1] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const result = await marketingService.getCampaigns({ channel: 'linkedin' });

    expect(result.campaigns).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  // 3. getCampaignById with content items
  it('should get campaign by id with content items', async () => {
    const campaign = createCampaign();
    const contentItems = [
      createContentItem({ id: 'content-uuid-1', title: 'Post 1' }),
      createContentItem({ id: 'content-uuid-2', title: 'Post 2' })
    ];

    // getCampaignById fires 2 queries via Promise.all
    mockQuery
      .mockResolvedValueOnce({ rows: [campaign] })
      .mockResolvedValueOnce({ rows: contentItems });

    const result = await marketingService.getCampaignById('camp-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('camp-uuid-1');
    expect(result.content_items).toHaveLength(2);
  });

  // 4. getCampaignById returns null for missing
  it('should return null for non-existent campaign', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await marketingService.getCampaignById('missing');

    expect(result).toBeNull();
  });

  // 5. createCampaign
  it('should create a campaign', async () => {
    const campaign = createCampaign();

    mockQuery.mockResolvedValueOnce({ rows: [campaign] });

    const result = await marketingService.createCampaign({
      name: 'Q1 LinkedIn Campaign',
      channel: 'linkedin',
      status: 'active',
      budget: 5000
    });

    expect(result.id).toBe('camp-uuid-1');
    expect(result.name).toBe('Q1 LinkedIn Campaign');
    expect(result.channel).toBe('linkedin');
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO campaigns');
  });

  // 6. updateCampaign
  it('should update a campaign', async () => {
    const updated = createCampaign({ status: 'completed', leads_generated: 50 });

    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const result = await marketingService.updateCampaign('camp-uuid-1', {
      status: 'completed',
      leads_generated: 50
    });

    expect(result).not.toBeNull();
    expect(result.status).toBe('completed');
    expect(result.leads_generated).toBe(50);
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE campaigns SET');
  });

  // 7. updateCampaign returns null for empty data
  it('should return null when updating with no allowed fields', async () => {
    const result = await marketingService.updateCampaign('camp-uuid-1', { forbidden_field: 'value' });

    expect(result).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  // 8. deleteCampaign
  it('should delete a campaign', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'camp-uuid-1' }] });

    const result = await marketingService.deleteCampaign('camp-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('camp-uuid-1');
    expect(mockQuery.mock.calls[0][0]).toContain('DELETE FROM campaigns');
  });

  // ========================
  // CONTENT CALENDAR
  // ========================

  // 9. getContentCalendar returns paginated list
  it('should get content calendar with pagination', async () => {
    const item1 = createContentItem({ campaign_name: 'Q1 LinkedIn Campaign' });
    const item2 = createContentItem({ id: 'content-uuid-2', title: 'Case Study', content_type: 'article', campaign_name: 'Q1 LinkedIn Campaign' });

    mockQuery
      .mockResolvedValueOnce({ rows: [item1, item2] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const result = await marketingService.getContentCalendar();

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  // 10. createContentItem
  it('should create a content item', async () => {
    const item = createContentItem();

    mockQuery.mockResolvedValueOnce({ rows: [item] });

    const result = await marketingService.createContentItem({
      title: 'XR in Education Post',
      content_type: 'linkedin_post',
      content_pillar: 'thought_leadership',
      scheduled_date: '2026-02-15',
      status: 'planned',
      campaign_id: 'camp-uuid-1'
    });

    expect(result.id).toBe('content-uuid-1');
    expect(result.title).toBe('XR in Education Post');
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO content_calendar');
  });

  // ========================
  // ANALYTICS
  // ========================

  // 11. getAnalytics returns aggregated data
  it('should get marketing analytics with cost per lead calculation', async () => {
    const campaignStats = {
      total_campaigns: '5', active_campaigns: '2',
      total_budget: '25000', total_spent: '10000',
      total_leads: '100', total_conversions: '10',
      total_impressions: '50000', total_clicks: '2500'
    };
    const channelBreakdown = [
      { channel: 'linkedin', count: '3', leads: '60', conversions: '6', spent: '6000' },
      { channel: 'email', count: '2', leads: '40', conversions: '4', spent: '4000' }
    ];
    const contentStats = {
      total_content: '20', published: '12', planned: '5', drafts: '3'
    };

    // getAnalytics fires 3 queries via Promise.all
    mockQuery
      .mockResolvedValueOnce({ rows: [campaignStats] })
      .mockResolvedValueOnce({ rows: channelBreakdown })
      .mockResolvedValueOnce({ rows: [contentStats] });

    const result = await marketingService.getAnalytics();

    expect(result.campaigns.total_campaigns).toBe('5');
    expect(result.channels).toHaveLength(2);
    expect(result.content.published).toBe('12');
    // cost_per_lead = 10000 / 100 = 100
    expect(result.cost_per_lead).toBe(100);
    // conversion_rate = (2500 / 50000) * 10000 / 100 = 5
    expect(result.conversion_rate).toBe(5);
  });

  // 12. getAnalytics handles zero leads (no division by zero)
  it('should handle zero leads without division error', async () => {
    const campaignStats = {
      total_campaigns: '0', active_campaigns: '0',
      total_budget: '0', total_spent: '0',
      total_leads: '0', total_conversions: '0',
      total_impressions: '0', total_clicks: '0'
    };

    mockQuery
      .mockResolvedValueOnce({ rows: [campaignStats] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total_content: '0', published: '0', planned: '0', drafts: '0' }] });

    const result = await marketingService.getAnalytics();

    expect(result.cost_per_lead).toBe(0);
    expect(result.conversion_rate).toBe(0);
  });
});
