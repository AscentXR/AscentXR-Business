import { useState, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import TabBar from '../components/shared/TabBar';
import DataTable from '../components/shared/DataTable';
import type { Column } from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import ProgressBar from '../components/shared/ProgressBar';
import Modal from '../components/shared/Modal';
import AgentTriggerButton from '../components/shared/AgentTriggerButton';
import ErrorState from '../components/shared/ErrorState';
import { legal, knowledgeBase, businessActivities, forecasts, goals } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import type { Contract, ComplianceItem, KnowledgeBaseArticle, BusinessActivity, Forecast, Goal } from '../types';

const TABS = ['Contracts', 'Compliance', 'Knowledge Base', 'Goals', 'Forecasts', 'Activities'];
const FRAMEWORKS = ['FERPA', 'COPPA', 'Section 508', 'WCAG', 'SOC 2'];

export default function Legal() {
  const [tab, setTab] = useState('Contracts');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'contract' | 'compliance'>('contract');
  const [editingContract, setEditingContract] = useState<Partial<Contract>>({});
  const [editingCompliance, setEditingCompliance] = useState<Partial<ComplianceItem>>({});
  const [saving, setSaving] = useState(false);
  const [kbSearch, setKbSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [scenarioFilter, setScenarioFilter] = useState('baseline');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
  const { showToast } = useToast();

  const { data: contractsData, loading: contractsLoading, error: contractsError, refetch: refetchContracts } = useApi<Contract[]>(() => legal.getContracts(), []);
  const { data: complianceData, loading: complianceLoading, error: complianceError, refetch: refetchCompliance } = useApi<ComplianceItem[]>(() => legal.getCompliance(), []);

  const primaryError = contractsError || complianceError;

  const contracts = contractsData || [];
  const complianceItems = complianceData || [];

  const { data: kbData } = useApi<any>(() => knowledgeBase.getArticles({ business_area: 'legal' }), []);
  const { data: activitiesDataRaw } = useApi<any>(() => businessActivities.getActivities({ business_area: 'legal' }), []);
  const { data: forecastsDataRaw } = useApi<Forecast[]>(() => forecasts.getForecasts({ business_area: 'legal' }), []);
  const { data: goalsDataRaw } = useApi<Goal[]>(() => goals.list({ business_area: 'legal', quarter: 'Q1 2026' }), []);

  const kbArticles: KnowledgeBaseArticle[] = kbData?.articles || kbData || [];
  const legalActivities: BusinessActivity[] = activitiesDataRaw?.activities || activitiesDataRaw || [];
  const legalForecasts: Forecast[] = forecastsDataRaw || [];
  const legalGoals: Goal[] = goalsDataRaw || [];

  const filteredKbArticles = kbSearch ? kbArticles.filter(a => a.title.toLowerCase().includes(kbSearch.toLowerCase())) : kbArticles;
  const filteredActivities = activityFilter ? legalActivities.filter(a => a.priority === activityFilter) : legalActivities;
  const filteredForecasts = legalForecasts.filter(f => f.scenario === scenarioFilter);

  const complianceByFramework = useMemo(() => {
    const map: Record<string, ComplianceItem[]> = {};
    complianceItems.forEach((item) => {
      if (!map[item.framework]) map[item.framework] = [];
      map[item.framework].push(item);
    });
    return map;
  }, [complianceItems]);

  // Check for expiring contracts (within 90 days)
  const now = new Date();
  const expiryThreshold = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

  async function handleSaveContract() {
    setSaving(true);
    try {
      if (editingContract.id) await legal.updateContract(editingContract.id, editingContract);
      else await legal.createContract(editingContract);
      showToast('Contract saved successfully', 'success');
      setShowModal(false); setEditingContract({}); refetchContracts();
    } catch (err: any) { showToast(err.response?.data?.error || 'Operation failed', 'error'); } finally { setSaving(false); }
  }

  async function handleSaveCompliance() {
    setSaving(true);
    try {
      if (editingCompliance.id) await legal.updateComplianceItem(editingCompliance.id, editingCompliance);
      else await legal.createComplianceItem(editingCompliance);
      showToast('Compliance item saved successfully', 'success');
      setShowModal(false); setEditingCompliance({}); refetchCompliance();
    } catch (err: any) { showToast(err.response?.data?.error || 'Operation failed', 'error'); } finally { setSaving(false); }
  }

  const contractColumns: Column<Contract>[] = [
    { key: 'title', label: 'Title', render: (c) => <span className="font-medium text-white">{c.title}</span> },
    { key: 'contract_type', label: 'Type', render: (c) => <span className="capitalize">{c.contract_type}</span> },
    { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'value', label: 'Value', sortable: true, render: (c) => c.value ? `$${c.value.toLocaleString()}` : '-' },
    { key: 'start_date', label: 'Start', sortable: true, render: (c) => c.start_date?.slice(0, 10) || '-' },
    {
      key: 'end_date', label: 'End', sortable: true,
      render: (c) => {
        const isExpiring = c.end_date && c.end_date < expiryThreshold && c.end_date > now.toISOString();
        return (
          <span className={isExpiring ? 'text-amber-400 font-medium' : ''}>
            {c.end_date?.slice(0, 10) || '-'}
            {isExpiring && <span className="text-xs ml-1">(expiring)</span>}
          </span>
        );
      },
    },
    { key: 'auto_renew', label: 'Auto-Renew', render: (c) => c.auto_renew ? <span className="text-emerald-400 text-xs">Yes</span> : <span className="text-gray-600">No</span> },
  ];

  return (
    <PageShell
      title="Legal"
      subtitle="Contracts & Compliance"
      actions={
        <div className="flex gap-2">
          <AgentTriggerButton agentId="legal" label="Review FERPA Compliance" prompt="Review our FERPA compliance status and identify any gaps" businessArea="legal" />
          <button onClick={() => { setEditingContract({}); setModalType('contract'); setShowModal(true); }} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">+ New Contract</button>
        </div>
      }
    >
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {primaryError && <ErrorState error={primaryError} onRetry={contractsError ? refetchContracts : refetchCompliance} />}
      {!primaryError && <>
      {tab === 'Contracts' && (
        <DataTable columns={contractColumns} data={contracts} loading={contractsLoading} searchable pagination onRowClick={(c) => { setEditingContract(c); setModalType('contract'); setShowModal(true); }} />
      )}

      {tab === 'Compliance' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => { setEditingCompliance({}); setModalType('compliance'); setShowModal(true); }} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">+ Add Requirement</button>
          </div>
          {complianceLoading ? (
            <div className="space-y-4 animate-pulse">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-navy-700 rounded" />)}</div>
          ) : Object.keys(complianceByFramework).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No compliance items configured.</p>
          ) : (
            Object.entries(complianceByFramework).map(([framework, items]) => (
              <div key={framework} className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">{framework}</h3>
                  <span className="text-xs text-gray-400">
                    {items.filter((i) => i.status === 'compliant').length}/{items.length} compliant
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-navy-700/50 rounded-lg cursor-pointer hover:bg-navy-700"
                      onClick={() => { setEditingCompliance(item); setModalType('compliance'); setShowModal(true); }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{item.requirement}</p>
                        {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <StatusBadge status={item.priority} />
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'Knowledge Base' && (
        <div className="space-y-4">
          <input value={kbSearch} onChange={(e) => setKbSearch(e.target.value)} placeholder="Search legal articles..." className="w-full px-4 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          {filteredKbArticles.length === 0 ? <p className="text-gray-500 text-center py-8">No articles found.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredKbArticles.map((article) => (
                <div key={article.id} onClick={() => setSelectedArticle(article)} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 cursor-pointer hover:border-[#2563EB]/50 transition-colors">
                  <h4 className="text-sm font-medium text-white mb-2">{article.is_pinned && <span className="text-amber-400 mr-1">*</span>}{article.title}</h4>
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
          {legalGoals.length === 0 ? <p className="text-gray-500 text-center py-8">No goals for this quarter.</p> : legalGoals.filter(g => g.goal_type === 'objective').map((obj) => (
            <div key={obj.id} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3"><h4 className="text-sm font-medium text-white">{obj.title}</h4><StatusBadge status={obj.status} /></div>
              <ProgressBar value={obj.progress} color="blue" />
              <div className="mt-3 space-y-2">{legalGoals.filter(kr => kr.parent_id === obj.id).map((kr) => (
                <div key={kr.id} className="flex items-center justify-between p-2 bg-navy-700/50 rounded-lg">
                  <span className="text-xs text-gray-300 flex-1">{kr.title}</span>
                  <div className="flex items-center gap-2 ml-2"><span className="text-xs text-gray-400">{kr.current_value}/{kr.target_value} {kr.unit}</span><div className="w-16"><ProgressBar value={kr.progress} color="blue" size="sm" /></div></div>
                </div>
              ))}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Forecasts' && (
        <div className="space-y-4">
          <div className="flex gap-2">{['conservative', 'baseline', 'optimistic'].map((s) => (
            <button key={s} onClick={() => setScenarioFilter(s)} className={`px-3 py-1 text-xs rounded-full capitalize ${scenarioFilter === s ? 'bg-[#2563EB] text-white' : 'bg-navy-700 text-gray-400 hover:text-white'}`}>{s}</button>
          ))}</div>
          {filteredForecasts.length === 0 ? <p className="text-gray-500 text-center py-8">No forecasts available.</p> : (
            <div className="bg-navy-800/60 border border-navy-700/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-navy-700 text-xs text-gray-500 font-medium">
                <div className="col-span-2">Period</div><div className="col-span-3">Type</div><div className="col-span-2">Metric</div><div className="col-span-2">Projected</div><div className="col-span-2">Actual</div><div className="col-span-1">Conf.</div>
              </div>
              {filteredForecasts.map((f) => (
                <div key={f.id} className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-navy-700/50 text-sm items-center">
                  <div className="col-span-2 text-gray-400">{f.period}</div><div className="col-span-3 text-white">{f.forecast_type}</div><div className="col-span-2 text-gray-400">{f.metric || '-'}</div>
                  <div className="col-span-2 text-white">{f.projected_value != null ? `$${Number(f.projected_value).toLocaleString()}` : '-'}</div><div className="col-span-2 text-gray-400">{f.actual_value != null ? `$${Number(f.actual_value).toLocaleString()}` : '-'}</div>
                  <div className="col-span-1"><span className={`text-xs px-1.5 py-0.5 rounded ${f.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' : f.confidence === 'low' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{f.confidence}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Activities' && (
        <div className="space-y-4">
          <div className="flex gap-2">{['', 'asap', 'high', 'medium', 'low'].map((p) => (
            <button key={p} onClick={() => setActivityFilter(p)} className={`px-3 py-1 text-xs rounded-full capitalize ${activityFilter === p ? 'bg-[#2563EB] text-white' : 'bg-navy-700 text-gray-400 hover:text-white'}`}>{p || 'All'}</button>
          ))}</div>
          {filteredActivities.length === 0 ? <p className="text-gray-500 text-center py-8">No activities found.</p> : (
            <div className="space-y-2">{filteredActivities.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-navy-800/60 border border-navy-700/50 rounded-lg">
                <div className="flex-1 min-w-0"><div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${a.priority === 'asap' ? 'bg-red-500/20 text-red-400' : a.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : a.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-navy-700 text-gray-400'}`}>{a.priority}</span>
                  <span className="text-sm text-white truncate">{a.title}</span>
                </div>{a.description && <p className="text-xs text-gray-500 mt-1 truncate">{a.description}</p>}</div>
                <div className="flex items-center gap-2 ml-4">{a.due_date && <span className="text-xs text-gray-400">{a.due_date.slice(0, 10)}</span>}<StatusBadge status={a.status} /></div>
              </div>
            ))}</div>
          )}
        </div>
      )}

      </>}

      <Modal isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} title={selectedArticle?.title || ''}>
        <div className="prose prose-invert prose-sm max-w-none">
          <div className="text-sm text-gray-300 whitespace-pre-wrap">{selectedArticle?.content}</div>
        </div>
      </Modal>

      <Modal isOpen={showModal && modalType === 'contract'} onClose={() => setShowModal(false)} title={editingContract.id ? 'Edit Contract' : 'New Contract'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input value={editingContract.title || ''} onChange={(e) => setEditingContract({ ...editingContract, title: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <input value={editingContract.contract_type || ''} onChange={(e) => setEditingContract({ ...editingContract, contract_type: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Value ($)</label>
              <input type="number" value={editingContract.value || ''} onChange={(e) => setEditingContract({ ...editingContract, value: Number(e.target.value) })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Date</label>
              <input type="date" value={editingContract.start_date?.slice(0, 10) || ''} onChange={(e) => setEditingContract({ ...editingContract, start_date: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">End Date</label>
              <input type="date" value={editingContract.end_date?.slice(0, 10) || ''} onChange={(e) => setEditingContract({ ...editingContract, end_date: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleSaveContract} disabled={saving} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showModal && modalType === 'compliance'} onClose={() => setShowModal(false)} title={editingCompliance.id ? 'Edit Requirement' : 'New Requirement'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Framework</label>
            <select value={editingCompliance.framework || ''} onChange={(e) => setEditingCompliance({ ...editingCompliance, framework: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
              <option value="">Select...</option>
              {FRAMEWORKS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Requirement</label>
            <input value={editingCompliance.requirement || ''} onChange={(e) => setEditingCompliance({ ...editingCompliance, requirement: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select value={editingCompliance.status || 'not_started'} onChange={(e) => setEditingCompliance({ ...editingCompliance, status: e.target.value as ComplianceItem['status'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
              <option value="not_started">Not Started</option><option value="in_progress">In Progress</option><option value="compliant">Compliant</option><option value="non_compliant">Non-Compliant</option><option value="needs_review">Needs Review</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleSaveCompliance} disabled={saving} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
