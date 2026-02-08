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
import ErrorState from '../components/shared/ErrorState';
import { finance, knowledgeBase, businessActivities, forecasts, goals } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import type { Invoice, Expense, Budget, KnowledgeBaseArticle, BusinessActivity, Forecast, Goal } from '../types';

const TABS = ['Overview', 'Invoices', 'Expenses', 'Budgets', 'Knowledge Base', 'Goals', 'Forecasts', 'Activities'];

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
  const { showToast } = useToast();

  const { data: invoicesData, loading: invoicesLoading, error: invoicesError, refetch: refetchInvoices } = useApi<Invoice[]>(() => finance.getInvoices(), []);
  const { data: expensesData, loading: expensesLoading, error: expensesError, refetch: refetchExpenses } = useApi<Expense[]>(() => finance.getExpenses(), []);
  const { data: budgetsData, loading: budgetsLoading, error: budgetsError, refetch: refetchBudgets } = useApi<Budget[]>(() => finance.getBudgets(), []);
  const { data: kbData } = useApi<any>(() => knowledgeBase.getArticles({ business_area: 'finance' }), []);
  const { data: activitiesData } = useApi<any>(() => businessActivities.getActivities({ business_area: 'finance' }), []);
  const { data: forecastsData } = useApi<Forecast[]>(() => forecasts.getForecasts({ business_area: 'finance' }), []);
  const { data: goalsData } = useApi<Goal[]>(() => goals.list({ business_area: 'finance', quarter: 'Q1 2026' }), []);

  const kbArticles: KnowledgeBaseArticle[] = kbData?.articles || kbData || [];
  const activities: BusinessActivity[] = activitiesData?.activities || activitiesData || [];
  const forecastItems: Forecast[] = forecastsData || [];
  const goalItems: Goal[] = goalsData || [];

  const [kbSearch, setKbSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [scenarioFilter, setScenarioFilter] = useState('baseline');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);

  const filteredArticles = kbSearch ? kbArticles.filter(a => a.title.toLowerCase().includes(kbSearch.toLowerCase()) || a.tags?.some(t => t.toLowerCase().includes(kbSearch.toLowerCase()))) : kbArticles;
  const filteredActivities = activityFilter ? activities.filter(a => a.priority === activityFilter) : activities;
  const filteredForecasts = forecastItems.filter(f => f.scenario === scenarioFilter);

  const primaryError = invoicesError || expensesError || budgetsError;

  const invoices = invoicesData || [];
  const expenses = expensesData || [];
  const budgets = budgetsData || [];

  useEffect(() => {
    finance.getSummary().then((r) => setSummary(r.data.data || r.data)).catch((err: any) => { showToast(err.response?.data?.error || 'Failed to load financial summary', 'error'); });
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
      showToast('Invoice saved successfully', 'success');
      setShowModal(false); setEditingInvoice({}); refetchInvoices();
    } catch (err: any) { showToast(err.response?.data?.error || 'Operation failed', 'error'); } finally { setSaving(false); }
  }

  async function handleSaveExpense() {
    setSaving(true);
    try { await finance.createExpense(editingExpense); showToast('Expense saved successfully', 'success'); setShowModal(false); setEditingExpense({}); refetchExpenses(); }
    catch (err: any) { showToast(err.response?.data?.error || 'Operation failed', 'error'); } finally { setSaving(false); }
  }

  async function handleSaveBudget() {
    setSaving(true);
    try {
      if (editingBudget.id) await finance.updateBudget(editingBudget.id, editingBudget);
      else await finance.createBudget(editingBudget);
      showToast('Budget saved successfully', 'success');
      setShowModal(false); setEditingBudget({}); refetchBudgets();
    } catch (err: any) { showToast(err.response?.data?.error || 'Operation failed', 'error'); } finally { setSaving(false); }
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

      {primaryError && <ErrorState error={primaryError} onRetry={invoicesError ? refetchInvoices : expensesError ? refetchExpenses : refetchBudgets} />}
      {!primaryError && <>
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

      {tab === 'Knowledge Base' && (
        <div className="space-y-4">
          <input value={kbSearch} onChange={(e) => setKbSearch(e.target.value)} placeholder="Search articles..." className="w-full px-4 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          {filteredArticles.length === 0 ? <p className="text-gray-500 text-center py-8">No articles found.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <div key={article.id} onClick={() => setSelectedArticle(article)} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 cursor-pointer hover:border-[#2563EB]/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-white flex-1">{article.is_pinned && <span className="text-amber-400 mr-1">*</span>}{article.title}</h4>
                  </div>
                  {article.summary && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{article.summary}</p>}
                  <div className="flex flex-wrap gap-1">{article.tags?.map((tag) => <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-gray-400">{tag}</span>)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Goals' && (
        <div className="space-y-4">
          {goalItems.length === 0 ? <p className="text-gray-500 text-center py-8">No goals for this quarter.</p> : goalItems.filter(g => g.goal_type === 'objective').map((obj) => (
            <div key={obj.id} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white">{obj.title}</h4>
                <StatusBadge status={obj.status} />
              </div>
              <ProgressBar value={obj.progress} color="blue" />
              <div className="mt-3 space-y-2">
                {goalItems.filter(kr => kr.parent_id === obj.id).map((kr) => (
                  <div key={kr.id} className="flex items-center justify-between p-2 bg-navy-700/50 rounded-lg">
                    <span className="text-xs text-gray-300 flex-1">{kr.title}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-gray-400">{kr.current_value}/{kr.target_value} {kr.unit}</span>
                      <div className="w-16"><ProgressBar value={kr.progress} color="blue" size="sm" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Forecasts' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['conservative', 'baseline', 'optimistic'].map((s) => (
              <button key={s} onClick={() => setScenarioFilter(s)} className={`px-3 py-1 text-xs rounded-full capitalize ${scenarioFilter === s ? 'bg-[#2563EB] text-white' : 'bg-navy-700 text-gray-400 hover:text-white'}`}>{s}</button>
            ))}
          </div>
          {filteredForecasts.length === 0 ? <p className="text-gray-500 text-center py-8">No forecasts available.</p> : (
            <div className="bg-navy-800/60 border border-navy-700/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-navy-700 text-xs text-gray-500 font-medium">
                <div className="col-span-2">Period</div><div className="col-span-3">Type</div><div className="col-span-2">Metric</div><div className="col-span-2">Projected</div><div className="col-span-2">Actual</div><div className="col-span-1">Conf.</div>
              </div>
              {filteredForecasts.map((f) => (
                <div key={f.id} className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-navy-700/50 text-sm items-center">
                  <div className="col-span-2 text-gray-400">{f.period}</div>
                  <div className="col-span-3 text-white">{f.forecast_type}</div>
                  <div className="col-span-2 text-gray-400">{f.metric || '-'}</div>
                  <div className="col-span-2 text-white">{f.projected_value != null ? `$${Number(f.projected_value).toLocaleString()}` : '-'}</div>
                  <div className="col-span-2 text-gray-400">{f.actual_value != null ? `$${Number(f.actual_value).toLocaleString()}` : '-'}</div>
                  <div className="col-span-1"><span className={`text-xs px-1.5 py-0.5 rounded ${f.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' : f.confidence === 'low' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{f.confidence}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Activities' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['', 'asap', 'high', 'medium', 'low'].map((p) => (
              <button key={p} onClick={() => setActivityFilter(p)} className={`px-3 py-1 text-xs rounded-full capitalize ${activityFilter === p ? 'bg-[#2563EB] text-white' : 'bg-navy-700 text-gray-400 hover:text-white'}`}>{p || 'All'}</button>
            ))}
          </div>
          {filteredActivities.length === 0 ? <p className="text-gray-500 text-center py-8">No activities found.</p> : (
            <div className="space-y-2">
              {filteredActivities.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-navy-800/60 border border-navy-700/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${a.priority === 'asap' ? 'bg-red-500/20 text-red-400' : a.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : a.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-navy-700 text-gray-400'}`}>{a.priority}</span>
                      <span className="text-sm text-white truncate">{a.title}</span>
                    </div>
                    {a.description && <p className="text-xs text-gray-500 mt-1 truncate">{a.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {a.due_date && <span className="text-xs text-gray-400">{a.due_date.slice(0, 10)}</span>}
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      </>}
      {/* Article Detail Modal */}
      <Modal isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} title={selectedArticle?.title || ''}>
        <div className="prose prose-invert prose-sm max-w-none">
          <div className="text-sm text-gray-300 whitespace-pre-wrap">{selectedArticle?.content}</div>
          {selectedArticle?.tags && <div className="flex flex-wrap gap-1 mt-4">{selectedArticle.tags.map((tag) => <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-gray-400">{tag}</span>)}</div>}
        </div>
      </Modal>

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
