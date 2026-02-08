const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

const { createPartner, createDeal } = require('../fixtures/testData');

describe('Partnership Service', () => {
  const partnershipService = require('../../services/partnershipService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ========================
  // PARTNERS
  // ========================

  // 1. getPartners returns paginated list
  it('should get partners with pagination', async () => {
    const p1 = createPartner({ deal_count: '3', total_deal_value: '75000', total_commission: '11250' });
    const p2 = createPartner({ id: 'partner-uuid-2', name: 'School Tech Alliance', type: 'referral', deal_count: '1', total_deal_value: '20000', total_commission: '3000' });

    mockQuery
      .mockResolvedValueOnce({ rows: [p1, p2] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const result = await partnershipService.getPartners();

    expect(result.partners).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.partners[0].name).toBe('EdTech Resellers');
  });

  // 2. getPartners with type filter
  it('should filter partners by type', async () => {
    const p1 = createPartner({ deal_count: '3', total_deal_value: '75000', total_commission: '11250' });

    mockQuery
      .mockResolvedValueOnce({ rows: [p1] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const result = await partnershipService.getPartners({ type: 'reseller' });

    expect(result.partners).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  // 3. getPartnerById with deals
  it('should get partner by id with associated deals', async () => {
    const partner = createPartner({ deal_count: '2', total_deal_value: '50000', total_commission: '7500' });
    const deals = [
      createDeal({ id: 'deal-uuid-1', school_district_name: 'IPS' }),
      createDeal({ id: 'deal-uuid-2', deal_value: 25000, status: 'won', school_district_name: 'MSD' })
    ];

    // getPartnerById fires 2 queries via Promise.all
    mockQuery
      .mockResolvedValueOnce({ rows: [partner] })
      .mockResolvedValueOnce({ rows: deals });

    const result = await partnershipService.getPartnerById('partner-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('partner-uuid-1');
    expect(result.deals).toHaveLength(2);
  });

  // 4. getPartnerById returns null for missing
  it('should return null for non-existent partner', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await partnershipService.getPartnerById('missing');

    expect(result).toBeNull();
  });

  // 5. createPartner
  it('should create a partner', async () => {
    const partner = createPartner();

    mockQuery.mockResolvedValueOnce({ rows: [partner] });

    const result = await partnershipService.createPartner({
      name: 'EdTech Resellers',
      type: 'reseller',
      commission_rate: 15,
      commission_type: 'percentage'
    });

    expect(result.id).toBe('partner-uuid-1');
    expect(result.name).toBe('EdTech Resellers');
    expect(result.commission_rate).toBe(15);
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO partners');
  });

  // 6. updatePartner
  it('should update a partner', async () => {
    const updated = createPartner({ status: 'inactive', commission_rate: 20 });

    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const result = await partnershipService.updatePartner('partner-uuid-1', {
      status: 'inactive',
      commission_rate: 20
    });

    expect(result).not.toBeNull();
    expect(result.status).toBe('inactive');
    expect(result.commission_rate).toBe(20);
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE partners SET');
  });

  // 7. deletePartner
  it('should delete a partner', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'partner-uuid-1' }] });

    const result = await partnershipService.deletePartner('partner-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('partner-uuid-1');
    expect(mockQuery.mock.calls[0][0]).toContain('DELETE FROM partners');
  });

  // ========================
  // COMMISSION CALCULATION
  // ========================

  // 8. calculateCommission with percentage type
  it('should calculate percentage commission correctly', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ commission_rate: 15, commission_type: 'percentage' }] });

    const result = await partnershipService.calculateCommission('partner-uuid-1', 50000);

    // 50000 * 15 / 100 = 7500
    expect(result).toBe(7500);
  });

  // 9. calculateCommission with flat type
  it('should calculate flat commission correctly', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ commission_rate: 2000, commission_type: 'flat' }] });

    const result = await partnershipService.calculateCommission('partner-uuid-1', 50000);

    expect(result).toBe(2000);
  });

  // 10. calculateCommission returns 0 for missing partner
  it('should return 0 commission for non-existent partner', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await partnershipService.calculateCommission('missing', 50000);

    expect(result).toBe(0);
  });

  // ========================
  // DEALS
  // ========================

  // 11. createDeal with auto commission calculation
  it('should create a deal and auto-calculate commission', async () => {
    // First query: calculateCommission looks up partner
    mockQuery.mockResolvedValueOnce({ rows: [{ commission_rate: 15, commission_type: 'percentage' }] });
    // Second query: INSERT INTO partner_deals
    const deal = createDeal({ commission_amount: 3750 });
    mockQuery.mockResolvedValueOnce({ rows: [deal] });

    const result = await partnershipService.createDeal({
      partner_id: 'partner-uuid-1',
      deal_value: 25000,
      status: 'pending'
    });

    expect(result.id).toBe('deal-uuid-1');
    expect(result.commission_amount).toBe(3750);
    expect(mockQuery.mock.calls[1][0]).toContain('INSERT INTO partner_deals');
  });

  // ========================
  // SUMMARY
  // ========================

  // 12. getSummary returns aggregated partnership data
  it('should get partnership summary with top partners', async () => {
    const partnerStats = { total_partners: '10', active_partners: '7', prospect_partners: '3' };
    const dealStats = {
      total_deals: '25', won_deals: '15', pending_deals: '5',
      total_revenue: '500000', total_commissions: '75000',
      earned_commissions: '60000', paid_commissions: '45000'
    };
    const topPartners = [
      { name: 'EdTech Resellers', type: 'reseller', deals: '8', revenue: '200000' },
      { name: 'School Tech Alliance', type: 'referral', deals: '5', revenue: '150000' }
    ];

    // getSummary fires 3 queries via Promise.all
    mockQuery
      .mockResolvedValueOnce({ rows: [partnerStats] })
      .mockResolvedValueOnce({ rows: [dealStats] })
      .mockResolvedValueOnce({ rows: topPartners });

    const result = await partnershipService.getSummary();

    expect(result.partners.total_partners).toBe('10');
    expect(result.deals.total_revenue).toBe('500000');
    expect(result.top_partners).toHaveLength(2);
    expect(result.top_partners[0].name).toBe('EdTech Resellers');
  });
});
