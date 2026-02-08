import { useState, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import TabBar from '../components/shared/TabBar';
import DataTable from '../components/shared/DataTable';
import type { Column } from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import AgentTriggerButton from '../components/shared/AgentTriggerButton';
import { legal } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import type { Contract, ComplianceItem } from '../types';

const TABS = ['Contracts', 'Compliance'];
const FRAMEWORKS = ['FERPA', 'COPPA', 'Section 508', 'WCAG', 'SOC 2'];

export default function Legal() {
  const [tab, setTab] = useState('Contracts');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'contract' | 'compliance'>('contract');
  const [editingContract, setEditingContract] = useState<Partial<Contract>>({});
  const [editingCompliance, setEditingCompliance] = useState<Partial<ComplianceItem>>({});
  const [saving, setSaving] = useState(false);

  const { data: contractsData, loading: contractsLoading, refetch: refetchContracts } = useApi<Contract[]>(() => legal.getContracts(), []);
  const { data: complianceData, loading: complianceLoading, refetch: refetchCompliance } = useApi<ComplianceItem[]>(() => legal.getCompliance(), []);

  const contracts = contractsData || [];
  const complianceItems = complianceData || [];

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
      setShowModal(false); setEditingContract({}); refetchContracts();
    } catch {} finally { setSaving(false); }
  }

  async function handleSaveCompliance() {
    setSaving(true);
    try {
      if (editingCompliance.id) await legal.updateComplianceItem(editingCompliance.id, editingCompliance);
      else await legal.createComplianceItem(editingCompliance);
      setShowModal(false); setEditingCompliance({}); refetchCompliance();
    } catch {} finally { setSaving(false); }
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
