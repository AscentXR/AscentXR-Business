import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn().mockResolvedValue({ data: { success: true, data: [] } });
const mockPost = vi.fn().mockResolvedValue({ data: { success: true, data: {} } });
const mockPut = vi.fn().mockResolvedValue({ data: { success: true, data: {} } });
const mockDelete = vi.fn().mockResolvedValue({ data: { success: true } });

vi.mock('../../api/client', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    put: (...args: any[]) => mockPut(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
}));

import { auth, crm, finance, goals } from '../../api/endpoints';

describe('API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('auth.login calls POST /auth/login with credentials', async () => {
    await auth.login('admin', 'password');
    expect(mockPost).toHaveBeenCalledWith('/auth/login', { username: 'admin', password: 'password' });
  });

  it('crm.getContacts calls GET /crm/contacts with params', async () => {
    await crm.getContacts({ page: 1, limit: 10 });
    expect(mockGet).toHaveBeenCalledWith('/crm/contacts', { params: { page: 1, limit: 10 } });
  });

  it('finance.getInvoices calls GET /finance/invoices', async () => {
    await finance.getInvoices({ status: 'paid' });
    expect(mockGet).toHaveBeenCalledWith('/finance/invoices', { params: { status: 'paid' } });
  });

  it('goals.create calls POST /goals with data', async () => {
    const goalData = { title: 'New Goal', goal_type: 'objective' as const, quarter: 'Q1 2026' };
    await goals.create(goalData);
    expect(mockPost).toHaveBeenCalledWith('/goals', goalData);
  });
});
