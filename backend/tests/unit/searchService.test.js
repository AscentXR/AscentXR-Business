const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

describe('Search Service', () => {
  const searchService = require('../../services/searchService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  /**
   * Helper to mock all 12 parallel search queries with empty results by default.
   * The search service runs 12 queries in parallel:
   *   0: contacts, 1: schoolDistricts, 2: pipelineDeals, 3: documents,
   *   4: goals, 5: products, 6: invoices, 7: partners,
   *   8: agents, 9: campaigns, 10: supportTickets, 11: contracts
   */
  function mockAllSearchQueries(overrides = {}) {
    const defaults = {
      contacts: { rows: [] },
      schoolDistricts: { rows: [] },
      pipelineDeals: { rows: [] },
      documents: { rows: [] },
      goals: { rows: [] },
      products: { rows: [] },
      invoices: { rows: [] },
      partners: { rows: [] },
      agents: { rows: [] },
      campaigns: { rows: [] },
      supportTickets: { rows: [] },
      contracts: { rows: [] }
    };

    const merged = { ...defaults, ...overrides };
    const order = ['contacts', 'schoolDistricts', 'pipelineDeals', 'documents', 'goals', 'products', 'invoices', 'partners', 'agents', 'campaigns', 'supportTickets', 'contracts'];

    for (const key of order) {
      mockQuery.mockResolvedValueOnce(merged[key]);
    }
  }

  // 1. search queries multiple tables
  it('should query multiple tables in parallel', async () => {
    mockAllSearchQueries({
      contacts: { rows: [{ id: 'c1', first_name: 'Sarah', last_name: 'Martinez', email: 'sarah@ips.edu', title: 'Director' }] },
      products: { rows: [{ id: 'p1', name: 'XR Training', category: 'training', description: 'Training module' }] },
      goals: { rows: [{ id: 'g1', title: 'Build pipeline', goal_type: 'objective', business_area: 'sales', quarter: 'Q1_2026' }] }
    });

    const result = await searchService.search('training');

    expect(result.total).toBe(3);
    expect(result.results).toHaveLength(3);
    // All 12 queries should have been called
    expect(mockQuery).toHaveBeenCalledTimes(12);
    // Each query should receive the search term
    for (let i = 0; i < 12; i++) {
      expect(mockQuery.mock.calls[i][1][0]).toBe('%training%');
    }
  });

  // 2. search groups results by section
  it('should group results by section', async () => {
    mockAllSearchQueries({
      contacts: { rows: [{ id: 'c1', first_name: 'Sarah', last_name: 'Martinez', email: 'sarah@ips.edu', title: 'Director' }] },
      schoolDistricts: { rows: [{ id: 'sd1', name: 'IPS', city: 'Indianapolis', state: 'IN' }] },
      products: { rows: [{ id: 'p1', name: 'XR Platform', category: 'platform', description: 'Main product' }] },
      supportTickets: { rows: [{ id: 'st1', subject: 'Login help', status: 'open', priority: 'medium', school_district_name: 'IPS' }] }
    });

    const result = await searchService.search('IPS');

    expect(result.grouped).toBeDefined();
    // contacts and schoolDistricts both map to 'crm' section
    expect(result.grouped.crm).toBeDefined();
    expect(result.grouped.crm).toHaveLength(2);
    // products
    expect(result.grouped.products).toBeDefined();
    expect(result.grouped.products).toHaveLength(1);
    // support tickets -> customer_success
    expect(result.grouped.customer_success).toBeDefined();
    expect(result.grouped.customer_success).toHaveLength(1);
  });

  // 3. search handles empty query
  it('should return empty results for empty query', async () => {
    const result = await searchService.search('');

    expect(result.results).toHaveLength(0);
    expect(result.total).toBe(0);
    // No queries should be executed
    expect(mockQuery).not.toHaveBeenCalled();
  });

  // 4. search handles no results
  it('should handle no results across all tables', async () => {
    mockAllSearchQueries();

    const result = await searchService.search('nonexistentxyz123');

    expect(result.results).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.grouped).toEqual({});
    expect(result.query).toBe('nonexistentxyz123');
  });

  // 5. search with special characters (SQL-safe)
  it('should handle special characters safely in search query', async () => {
    mockAllSearchQueries();

    const result = await searchService.search("O'Brien; DROP TABLE--");

    // Should not throw and should pass the term as a parameterized query
    expect(result.total).toBe(0);
    expect(mockQuery).toHaveBeenCalledTimes(12);
    // The search term should be wrapped in % for ILIKE and passed as a parameter
    expect(mockQuery.mock.calls[0][1][0]).toBe("%O'Brien; DROP TABLE--%");
  });

  // 6. search limits results
  it('should respect the limit parameter', async () => {
    mockAllSearchQueries({
      contacts: { rows: [
        { id: 'c1', first_name: 'Sarah', last_name: 'A', email: 'a@test.edu', title: 'Dir' },
        { id: 'c2', first_name: 'John', last_name: 'B', email: 'b@test.edu', title: 'Dir' }
      ] }
    });

    const result = await searchService.search('test', { limit: 5 });

    // Verify the limit was passed to each query
    for (let i = 0; i < 12; i++) {
      expect(mockQuery.mock.calls[i][1][1]).toBe(5);
    }
    expect(result.results).toHaveLength(2);
  });
});
