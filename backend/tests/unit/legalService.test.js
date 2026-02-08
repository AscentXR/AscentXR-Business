const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

const { createContract, createComplianceItem } = require('../fixtures/testData');

describe('Legal Service', () => {
  const legalService = require('../../services/legalService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ========================
  // CONTRACTS
  // ========================

  // 1. getContracts returns paginated list
  it('should get contracts with pagination', async () => {
    const c1 = createContract({ school_district_name: 'IPS', partner_name: null });
    const c2 = createContract({ id: 'contract-uuid-2', title: 'Partner Agreement', contract_type: 'partnership', school_district_name: null, partner_name: 'EdTech Resellers' });

    mockQuery
      .mockResolvedValueOnce({ rows: [c1, c2] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const result = await legalService.getContracts();

    expect(result.contracts).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.contracts[0].title).toBe('IPS District License');
  });

  // 2. getContracts with status filter
  it('should filter contracts by status', async () => {
    const c1 = createContract({ school_district_name: 'IPS', partner_name: null });

    mockQuery
      .mockResolvedValueOnce({ rows: [c1] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const result = await legalService.getContracts({ status: 'signed' });

    expect(result.contracts).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  // 3. getContractById
  it('should get contract by id with joined data', async () => {
    const contract = createContract({ school_district_name: 'IPS', partner_name: null });

    mockQuery.mockResolvedValueOnce({ rows: [contract] });

    const result = await legalService.getContractById('contract-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('contract-uuid-1');
    expect(result.title).toBe('IPS District License');
    expect(result.value).toBe(50000);
    expect(mockQuery.mock.calls[0][1]).toEqual(['contract-uuid-1']);
  });

  // 4. getContractById returns null for missing
  it('should return null for non-existent contract', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await legalService.getContractById('missing');

    expect(result).toBeNull();
  });

  // 5. createContract
  it('should create a contract', async () => {
    const contract = createContract();

    mockQuery.mockResolvedValueOnce({ rows: [contract] });

    const result = await legalService.createContract({
      title: 'IPS District License',
      contract_type: 'license',
      status: 'signed',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      value: 50000,
      auto_renew: true
    });

    expect(result.id).toBe('contract-uuid-1');
    expect(result.title).toBe('IPS District License');
    expect(result.auto_renew).toBe(true);
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO contracts');
  });

  // 6. updateContract
  it('should update a contract', async () => {
    const updated = createContract({ status: 'active', signed_by: 'Jim', signed_at: '2026-02-01T12:00:00Z' });

    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const result = await legalService.updateContract('contract-uuid-1', {
      status: 'active',
      signed_by: 'Jim',
      signed_at: '2026-02-01T12:00:00Z'
    });

    expect(result).not.toBeNull();
    expect(result.status).toBe('active');
    expect(result.signed_by).toBe('Jim');
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE contracts SET');
  });

  // 7. updateContract returns null for empty data
  it('should return null when updating with no allowed fields', async () => {
    const result = await legalService.updateContract('contract-uuid-1', { forbidden_field: 'value' });

    expect(result).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  // 8. deleteContract
  it('should delete a contract', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'contract-uuid-1' }] });

    const result = await legalService.deleteContract('contract-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('contract-uuid-1');
    expect(mockQuery.mock.calls[0][0]).toContain('DELETE FROM contracts');
  });

  // ========================
  // COMPLIANCE ITEMS
  // ========================

  // 9. getComplianceItems returns list
  it('should get compliance items ordered by priority', async () => {
    const ci1 = createComplianceItem();
    const ci2 = createComplianceItem({ id: 'compliance-uuid-2', framework: 'COPPA', requirement: 'Parental consent', priority: 'critical', status: 'in_progress' });

    mockQuery.mockResolvedValueOnce({ rows: [ci2, ci1] });

    const result = await legalService.getComplianceItems();

    expect(result).toHaveLength(2);
    // critical priority should come first based on ORDER BY
    expect(result[0].priority).toBe('critical');
    expect(result[1].framework).toBe('FERPA');
  });

  // 10. getComplianceItems with filter
  it('should filter compliance items by framework', async () => {
    const ci1 = createComplianceItem();

    mockQuery.mockResolvedValueOnce({ rows: [ci1] });

    const result = await legalService.getComplianceItems({ framework: 'FERPA' });

    expect(result).toHaveLength(1);
    expect(mockQuery.mock.calls[0][1]).toEqual(['FERPA']);
  });

  // 11. createComplianceItem
  it('should create a compliance item', async () => {
    const item = createComplianceItem();

    mockQuery.mockResolvedValueOnce({ rows: [item] });

    const result = await legalService.createComplianceItem({
      framework: 'FERPA',
      requirement: 'Data encryption at rest',
      description: 'All student data must be encrypted',
      priority: 'high',
      assigned_to: 'jim'
    });

    expect(result.id).toBe('compliance-uuid-1');
    expect(result.framework).toBe('FERPA');
    expect(result.requirement).toBe('Data encryption at rest');
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO compliance_items');
  });

  // 12. updateComplianceItem
  it('should update a compliance item', async () => {
    const updated = createComplianceItem({ status: 'non_compliant', evidence_notes: 'Audit finding #42' });

    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const result = await legalService.updateComplianceItem('compliance-uuid-1', {
      status: 'non_compliant',
      evidence_notes: 'Audit finding #42'
    });

    expect(result).not.toBeNull();
    expect(result.status).toBe('non_compliant');
    expect(result.evidence_notes).toBe('Audit finding #42');
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE compliance_items SET');
  });

  // ========================
  // SUMMARY
  // ========================

  // 13. getSummary returns aggregated legal data with compliance rate
  it('should get legal summary with compliance rate calculation', async () => {
    const contractStats = {
      total_contracts: '12', active_contracts: '8', signed_contracts: '3',
      total_value: '450000', expiring_soon: '2'
    };
    const complianceStats = {
      total_items: '10', compliant: '7', non_compliant: '1',
      needs_review: '1', in_progress: '1', not_started: '0'
    };
    const expiringContracts = [
      createContract({ id: 'contract-uuid-3', title: 'MSD License', end_date: '2026-03-01', school_district_name: 'MSD' })
    ];

    // getSummary fires 3 queries via Promise.all
    mockQuery
      .mockResolvedValueOnce({ rows: [contractStats] })
      .mockResolvedValueOnce({ rows: [complianceStats] })
      .mockResolvedValueOnce({ rows: expiringContracts });

    const result = await legalService.getSummary();

    expect(result.contracts.total_contracts).toBe('12');
    expect(result.compliance.total_items).toBe('10');
    // compliance_rate = (7 / 10) * 10000 / 100 = 70
    expect(result.compliance_rate).toBe(70);
    expect(result.expiring_contracts).toHaveLength(1);
    expect(result.expiring_contracts[0].title).toBe('MSD License');
  });
});
