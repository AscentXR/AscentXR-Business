import { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, BarChart3, PieChart } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import TabBar from '../components/shared/TabBar';
import KPICard from '../components/shared/KPICard';
import DataTable from '../components/shared/DataTable';
import type { Column } from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import ProgressBar from '../components/shared/ProgressBar';
import Modal from '../components/shared/Modal';
import AgentTriggerButton from '../components/shared/AgentTriggerButton';
import { finance } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import type { Invoice, Expense, Budget } from '../types';

const TABS = ['Overview', 'Invoices', 'Expenses', 'Budgets'];

export default function Finance() {
  const [tab, setTab] = useState('Overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'invoice' | 'expense' | 'budget'>('invoice');
  const [editingInvoice, setEditingInvoice] = useState<Partial<Invoice>>({});
  const [editingExpense, setEditingExpense] = useState<Partial<Expense>>({});
  const [editingBudget, setEditingBudget] = useState<Partial<Budget>>({});
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [expenseFilter, setExpenseFilter] = useState('');

  const { data: invoicesData, loading: invoicesLoading, refetch: refetchInvoices } = useApi<Invoice[]>(() => finance.getInvoices(), []);
  const { data: expensesData, loading: expensesLoading, refetch: refetchExpenses } = useApi<Expense[]>(() => finance.getExpenses(), []);
  const { data: budgetsData, loading: budgetsLoading, refetch: refetchBudgets } = useApi<Budget[]>(() => finance.getBudgets(), []);

  const invoices = invoicesData || [];
  const expenses = expensesData || [];
  const budgets = budgetsData || [];

  useEffect(() => {
    finance.getSummary().then((r) => setSummary(r.data.data || r.data)).catch(() => {});
  }, []);

  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  const totalBudget = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const budgetUtil = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const filteredExpenses = expenseFilter ? expenses.filter((e) => e.category === expenseFilter) : expenses;
  const expenseCategories = [...new Set(expenses.map((e) => e.category))];

  async function handleSaveInvoice() {
    setSaving(true);
    try {
      if (editingInvoice.id) await finance.updateInvoice(editingInvoice.id, editingInvoice);
      else await finance.createInvoice(editingInvoice);
      setShowModal(false); setEditingInvoice({}); refetchInvoices();
    } catch {} finally { setSaving(false); }
  }

  async function handleSaveExpense() {
    setSaving(true);
    try { await finance.createExpense(editingExpense); setShowModal(false); setEditingExpense({}); refetchExpenses(); }
    catch {} finally { setSaving(false); }
  }

  async function handleSaveBudget() {
    setSaving(true);
    try {
      if (editingBudget.id) await finance.updateBudget(editingBudget.id, editingBudget);
      else await finance.createBudget(editingBudget);
      setShowModal(false); setEditingBudget({}); refetchBudgets();
    } catch {} finally { setSaving(false); }
  }

  const invoiceColumns: Column<Invoice>[] = [
    { key: 'invoice_number', label: 'Invoice #', render: (i) => <span className="font-medium text-white">{i.invoice_number}</span> },
    { key: 'school_district_name', label: 'Client' },
    { key: 'status', label: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    { key: 'total', label: 'Total', sortable: true, render: (i) => <span>${i.total?.toLocaleString()}</span> },
    { key: 'issue_date', label: 'Issued', sortable: true, render: (i) => i.issue_date?.slice(0, 10) },
    { key: 'due_date', label: 'Due', sortable: true, render: (i) => i.due_date?.slice(0, 10) },
    { key: 'paid_amount', label: 'Paid', render: (i) => <span>${i.paid_amount?.toLocaleString()}</span> },
  ];

  const expenseColumns: Column<Expense>[] = [
    { key: 'description', label: 'Description', render: (e) => <span className="font-medium text-white">{e.description}</span> },
    { key: 'category', label: 'Category', render: (e) => <span className="capitalize">{e.category}</span> },
    { key: 'amount', label: 'Amount', sortable: true, render: (e) => <span>${e.amount?.toLocaleString()}</span> },
    { key: 'expense_date', label: 'Date', sortable: true, render: (e) => e.expense_date?.slice(0, 10) },
    { key: 'status', label: 'Status', render: (e) => <StatusBadge status={e.status} /> },
    { key: 'is_tax_deductible', label: 'Deductible', render: (e) => e.is_tax_deductible ? <span className="text-emerald-400 text-xs">Yes</span> : <span className="text-gray-600">No</span> },
  ];

  return (
    <PageShell
      title="Finance"
      subtitle="Invoices, Expenses & Budgets"
      actions={
        <div className="flex gap-2 flex-wrap">
          <AgentTriggerButton agentId="finance" label="Categorize Expenses" prompt="Review and categorize uncategorized expenses" businessArea="finance" />
          <AgentTriggerButton agentId="finance" label="Draft Invoice" prompt="Draft an invoice for the most recent completed deal" businessArea="finance" />
          <AgentTriggerButton agentId="finance" label="Cash Flow Forecast" prompt="Generate a 90-day cash flow forecast based on pipeline and expenses" businessArea="finance" />
        </div>
      }
    >
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Revenue" value={`$${(totalRevenue / 1000).toFixed(1)}K`} change={12.5} icon={DollarSign} />
            <KPICard label="Expenses" value={`$${(totalExpenses / 1000).toFixed(1)}K`} change={-3.2} icon={TrendingDown} />
            <KPICard label="Net Income" value={`$${(netIncome / 1000).toFixed(1)}K`} change={18.7} icon={BarChart3} />
            <KPICard label="Budget Utilization" value={`${budgetUtil}%`} icon={PieChart} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-white mb-4">Invoice Summary</h3>
              <div className="space-y-3">
                {['draft', 'sent', 'paid', 'overdue'].map((status) => {
                  const count = invoices.filter((i) => i.status === status).length;
                  const total = invoices.filter((i) => i.status === status).reduce((s, i) => s + i.total, 0);
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <StatusBadge status={status} />
                      <span className="text-sm text-gray-300">{count} invoices - ${total.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-white mb-4">Expense Breakdown</h3>
              <div className="space-y-3">
                {expenseCategories.slice(0, 6).map((cat) => {
                  const total = expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
                  return (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 capitalize">{cat}</span>
                      <span className="text-sm text-white font-medium">${total.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Invoices' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditingInvoice({}); setModalType('invoice'); setShowModal(true); }} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">+ New Invoice</button>
          </div>
          <DataTable columns={invoiceColumns} data={invoices} loading={invoicesLoading} searchable pagination onRowClick={(i) => { setEditingInvoice(i); setModalType('invoice'); setShowModal(true); }} />
        </div>
      )}

      {tab === 'Expenses' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <select value={expenseFilter} onChange={(e) => setExpenseFilter(e.target.value)} className="px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
              <option value="">All Categories</option>
              {expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex-1" />
            <button onClick={() => { setEditingExpense({}); setModalType('expense'); setShowModal(true); }} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">+ Add Expense</button>
          </div>
          <DataTable columns={expenseColumns} data={filteredExpenses} loading={expensesLoading} searchable pagination />
        </div>
      )}

      {tab === 'Budgets' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditingBudget({}); setModalType('budget'); setShowModal(true); }} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">+ New Budget</button>
          </div>
          {budgetsLoading ? (
            <div className="space-y-4 animate-pulse">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-navy-700 rounded" />)}</div>
          ) : budgets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No budgets configured.</p>
          ) : (
            <div className="space-y-4">
              {budgets.map((b) => (
                <div key={b.id} className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white capitalize">{b.category}</span>
                    <span className="text-sm text-gray-400">${b.spent.toLocaleString()} / ${b.allocated.toLocaleString()}</span>
                  </div>
                  <ProgressBar value={b.spent} max={b.allocated} warning color="blue" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal && modalType === 'invoice'} onClose={() => setShowModal(false)} title="Invoice Details">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Invoice #</label>
              <input value={editingInvoice.invoice_number || ''} onChange={(e) => setEditingInvoice({ ...editingInvoice, invoice_number: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select value={editingInvoice.status || 'draft'} onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value as Invoice['status'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Issue Date</label>
              <input type="date" value={editingInvoice.issue_date?.slice(0, 10) || ''} onChange={(e) => setEditingInvoice({ ...editingInvoice, issue_date: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Due Date</label>
              <input type="date" value={editingInvoice.due_date?.slice(0, 10) || ''} onChange={(e) => setEditingInvoice({ ...editingInvoice, due_date: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleSaveInvoice} disabled={saving} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showModal && modalType === 'expense'} onClose={() => setShowModal(false)} title="Add Expense">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <input value={editingExpense.description || ''} onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount ($)</label>
              <input type="number" value={editingExpense.amount || ''} onChange={(e) => setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <input value={editingExpense.category || ''} onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleSaveExpense} disabled={saving} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showModal && modalType === 'budget'} onClose={() => setShowModal(false)} title="Budget">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <input value={editingBudget.category || ''} onChange={(e) => setEditingBudget({ ...editingBudget, category: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Allocated ($)</label>
              <input type="number" value={editingBudget.allocated || ''} onChange={(e) => setEditingBudget({ ...editingBudget, allocated: Number(e.target.value) })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleSaveBudget} disabled={saving} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
