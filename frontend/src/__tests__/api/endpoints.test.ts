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

import { auth, crm, finance, goals, adminUsers } from '../../api/endpoints';

describe('API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('auth.session calls GET /auth/session', async () => {
    await auth.session();
    expect(mockGet).toHaveBeenCalledWith('/auth/session');
  });

  it('auth.syncSession calls POST /auth/session/sync', async () => {
    await auth.syncSession();
    expect(mockPost).toHaveBeenCalledWith('/auth/session/sync');
  });

  it('auth.logout calls POST /auth/logout', async () => {
    await auth.logout();
    expect(mockPost).toHaveBeenCalledWith('/auth/logout');
  });

  it('adminUsers.list calls GET /admin/users', async () => {
    await adminUsers.list();
    expect(mockGet).toHaveBeenCalledWith('/admin/users');
  });

  it('adminUsers.create calls POST /admin/users', async () => {
    const data = { email: 'test@test.com', displayName: 'Test', password: 'pass123', role: 'viewer' };
    await adminUsers.create(data);
    expect(mockPost).toHaveBeenCalledWith('/admin/users', data);
  });

  it('adminUsers.updateRole calls PUT /admin/users/:uid', async () => {
    await adminUsers.updateRole('uid-123', 'admin');
    expect(mockPut).toHaveBeenCalledWith('/admin/users/uid-123', { role: 'admin' });
  });

  it('adminUsers.delete calls DELETE /admin/users/:uid', async () => {
    await adminUsers.delete('uid-123');
    expect(mockDelete).toHaveBeenCalledWith('/admin/users/uid-123');
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
