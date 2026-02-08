import { useState, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import TabBar from '../components/shared/TabBar';
import DataTable from '../components/shared/DataTable';
import type { Column } from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import SearchInput from '../components/shared/SearchInput';
import AgentTriggerButton from '../components/shared/AgentTriggerButton';
import ErrorState from '../components/shared/ErrorState';
import { crm } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import type { Contact, Deal } from '../types';

const TABS = ['Pipeline', 'Contacts', 'Deals', 'Proposals'];
const PIPELINE_STAGES = ['Discovery', 'Needs Assessment', 'Proposal', 'Negotiation', 'Contract Review'];
const STAGE_COLORS: Record<string, string> = {
  Discovery: 'border-blue-400',
  'Needs Assessment': 'border-cyan-400',
  Proposal: 'border-[#7C3AED]',
  Negotiation: 'border-amber-400',
  'Contract Review': 'border-emerald-400',
};

export default function Sales() {
  const [tab, setTab] = useState('Pipeline');
  const [contactSearch, setContactSearch] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Partial<Contact>>({});
  const [editingDeal, setEditingDeal] = useState<Partial<Deal>>({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const { data: contactsData, loading: contactsLoading, error: contactsError, refetch: refetchContacts } = useApi<{ contacts: Contact[]; total: number }>(
    () => crm.getContacts({ limit: 100 }),
    []
  );

  const { data: dealsData, loading: dealsLoading, error: dealsError, refetch: refetchDeals } = useApi<Deal[]>(
    () => crm.getDeals(),
    []
  );

  const primaryError = contactsError || dealsError;

  const contacts = contactsData?.contacts || [];
  const deals = dealsData || [];

  const filteredContacts = useMemo(() => {
    if (!contactSearch) return contacts;
    const s = contactSearch.toLowerCase();
    return contacts.filter(
      (c) =>
        c.first_name.toLowerCase().includes(s) ||
        c.last_name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        (c.school_district_name || '').toLowerCase().includes(s)
    );
  }, [contacts, contactSearch]);

  const dealsByStage = useMemo(() => {
    const map: Record<string, Deal[]> = {};
    PIPELINE_STAGES.forEach((s) => (map[s] = []));
    deals.forEach((d) => {
      const stage = PIPELINE_STAGES.find((s) => s.toLowerCase().replace(/\s+/g, '_') === d.stage?.toLowerCase().replace(/\s+/g, '_'))
        || PIPELINE_STAGES.find((s) => d.stage?.toLowerCase().includes(s.toLowerCase().split(' ')[0]))
        || 'Discovery';
      if (map[stage]) map[stage].push(d);
      else map['Discovery'].push(d);
    });
    return map;
  }, [deals]);

  async function handleSaveContact() {
    setSaving(true);
    try {
      if (editingContact.id) {
        await crm.updateContact(editingContact.id, editingContact);
      } else {
        await crm.createContact(editingContact);
      }
      showToast('Contact saved successfully', 'success');
      setShowContactModal(false);
      setEditingContact({});
      refetchContacts();
    } catch (err: any) { showToast(err.response?.data?.error || 'Operation failed', 'error'); }
    finally { setSaving(false); }
  }

  const contactColumns: Column<Contact>[] = [
    { key: 'name', label: 'Name', render: (c) => <span className="font-medium text-white">{c.first_name} {c.last_name}</span> },
    { key: 'title', label: 'Title' },
    { key: 'email', label: 'Email' },
    { key: 'school_district_name', label: 'District' },
    {
      key: 'is_decision_maker',
      label: 'DM',
      render: (c) => c.is_decision_maker ? (
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/30">DM</span>
      ) : <span className="text-gray-600">-</span>,
    },
  ];

  const dealColumns: Column<Deal>[] = [
    { key: 'school_district_name', label: 'District', sortable: true, render: (d) => <span className="font-medium text-white">{d.school_district_name}</span> },
    { key: 'stage', label: 'Stage', render: (d) => <StatusBadge status={d.stage.toLowerCase().replace(/\s+/g, '_')} /> },
    { key: 'opportunity_value', label: 'Value', sortable: true, render: (d) => <span>${d.opportunity_value?.toLocaleString()}</span> },
    { key: 'probability', label: 'Probability', sortable: true, render: (d) => <span>{d.probability}%</span> },
    { key: 'next_action', label: 'Next Action' },
    { key: 'next_action_date', label: 'Next Date', sortable: true, render: (d) => d.next_action_date?.slice(0, 10) },
  ];

  return (
    <PageShell
      title="Sales"
      subtitle="CRM & Pipeline Management"
      actions={
        <div className="flex gap-2 flex-wrap">
          <AgentTriggerButton agentId="research" label="Research District" prompt="Research top school districts in our pipeline" businessArea="sales" />
          <AgentTriggerButton agentId="proposal" label="Draft Proposal" prompt="Draft a proposal for the highest-value deal in pipeline" businessArea="sales" />
          <AgentTriggerButton agentId="qualify" label="Qualify Lead" prompt="Score and qualify the latest leads" businessArea="sales" />
        </div>
      }
    >
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {primaryError && <ErrorState error={primaryError} onRetry={contactsError ? refetchContacts : refetchDeals} />}
      {!primaryError && <>
      {/* Pipeline Tab */}
      {tab === 'Pipeline' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage} className={`flex-shrink-0 w-72 bg-navy-800/60 backdrop-blur-md rounded-xl border-t-2 ${STAGE_COLORS[stage]} border border-navy-700/50`}>
              <div className="p-3 border-b border-navy-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">{stage}</h3>
                  <span className="text-xs text-gray-400 bg-navy-700 px-2 py-0.5 rounded-full">
                    {dealsByStage[stage]?.length || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ${(dealsByStage[stage]?.reduce((sum, d) => sum + (d.opportunity_value || 0), 0) || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                {dealsLoading ? (
                  [1, 2].map((i) => <div key={i} className="h-20 bg-navy-700 rounded animate-pulse" />)
                ) : (dealsByStage[stage] || []).length === 0 ? (
                  <p className="text-xs text-gray-600 text-center py-4">No deals</p>
                ) : (
                  (dealsByStage[stage] || []).map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-navy-700/50 rounded-lg p-3 hover:bg-navy-700 transition-colors cursor-pointer"
                      onClick={() => { setEditingDeal(deal); setShowDealModal(true); }}
                    >
                      <p className="text-sm font-medium text-white truncate">{deal.school_district_name}</p>
                      <p className="text-xs text-gray-400 mt-1">${deal.opportunity_value?.toLocaleString()}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{deal.probability}% likely</span>
                        <span className="text-xs text-gray-500">Score: {deal.total_score}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contacts Tab */}
      {tab === 'Contacts' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchInput value={contactSearch} onChange={setContactSearch} placeholder="Search contacts..." />
            </div>
            <button
              onClick={() => { setEditingContact({}); setShowContactModal(true); }}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#2563EB]/80 text-white text-sm rounded-lg transition-colors"
            >
              + Add Contact
            </button>
          </div>
          <DataTable
            columns={contactColumns}
            data={filteredContacts}
            loading={contactsLoading}
            searchable
            pagination
            onRowClick={(c) => { setEditingContact(c); setShowContactModal(true); }}
          />
        </div>
      )}

      {/* Deals Tab */}
      {tab === 'Deals' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setEditingDeal({}); setShowDealModal(true); }}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#2563EB]/80 text-white text-sm rounded-lg transition-colors"
            >
              + Add Deal
            </button>
          </div>
          <DataTable
            columns={dealColumns}
            data={deals}
            loading={dealsLoading}
            searchable
            pagination
            onRowClick={(d) => { setEditingDeal(d); setShowDealModal(true); }}
          />
        </div>
      )}

      {/* Proposals Tab */}
      {tab === 'Proposals' && (
        <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg text-white font-medium mb-2">Proposals</h3>
          <p className="text-gray-400 text-sm mb-4">Generate proposals using AI agents for deals in your pipeline.</p>
          <AgentTriggerButton agentId="proposal" label="Draft Proposal" prompt="Draft a proposal for our top pipeline deal" businessArea="sales" />
        </div>
      )}

      </>}
      {/* Contact Modal */}
      <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title={editingContact.id ? 'Edit Contact' : 'New Contact'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">First Name</label>
              <input value={editingContact.first_name || ''} onChange={(e) => setEditingContact({ ...editingContact, first_name: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Last Name</label>
              <input value={editingContact.last_name || ''} onChange={(e) => setEditingContact({ ...editingContact, last_name: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input value={editingContact.title || ''} onChange={(e) => setEditingContact({ ...editingContact, title: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" value={editingContact.email || ''} onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Phone</label>
            <input value={editingContact.phone || ''} onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={editingContact.is_decision_maker || false} onChange={(e) => setEditingContact({ ...editingContact, is_decision_maker: e.target.checked })} className="rounded border-navy-600 bg-navy-700 text-[#2563EB]" />
              Decision Maker
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={editingContact.is_primary || false} onChange={(e) => setEditingContact({ ...editingContact, is_primary: e.target.checked })} className="rounded border-navy-600 bg-navy-700 text-[#2563EB]" />
              Primary Contact
            </label>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Notes</label>
            <textarea value={editingContact.notes || ''} onChange={(e) => setEditingContact({ ...editingContact, notes: e.target.value })} rows={3} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowContactModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleSaveContact} disabled={saving} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Deal Modal */}
      <Modal isOpen={showDealModal} onClose={() => setShowDealModal(false)} title={editingDeal.id ? 'Deal Details' : 'New Deal'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">District</label>
            <input value={editingDeal.school_district_name || ''} readOnly={!!editingDeal.id} onChange={(e) => setEditingDeal({ ...editingDeal, school_district_name: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Stage</label>
              <select value={editingDeal.stage || ''} onChange={(e) => setEditingDeal({ ...editingDeal, stage: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                {PIPELINE_STAGES.map((s) => <option key={s} value={s.toLowerCase().replace(/\s+/g, '_')}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Value ($)</label>
              <input type="number" value={editingDeal.opportunity_value || ''} onChange={(e) => setEditingDeal({ ...editingDeal, opportunity_value: Number(e.target.value) })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Probability (%)</label>
              <input type="number" min={0} max={100} value={editingDeal.probability || ''} onChange={(e) => setEditingDeal({ ...editingDeal, probability: Number(e.target.value) })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Next Action Date</label>
              <input type="date" value={editingDeal.next_action_date?.slice(0, 10) || ''} onChange={(e) => setEditingDeal({ ...editingDeal, next_action_date: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Next Action</label>
            <input value={editingDeal.next_action || ''} onChange={(e) => setEditingDeal({ ...editingDeal, next_action: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowDealModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Close</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
