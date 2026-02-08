import { useState, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import TabBar from '../components/shared/TabBar';
import DataTable from '../components/shared/DataTable';
import type { Column } from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import KPICard from '../components/shared/KPICard';
import ProgressBar from '../components/shared/ProgressBar';
import Modal from '../components/shared/Modal';
import AgentTriggerButton from '../components/shared/AgentTriggerButton';
import { customerSuccess } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import type { CustomerHealth, SupportTicket } from '../types';
import { Heart, AlertTriangle, Users, RotateCcw } from 'lucide-react';

const TABS = ['Health Dashboard', 'Support Tickets', 'Renewals'];

const RISK_COLORS: Record<string, string> = {
  healthy: 'border-emerald-500/30 bg-emerald-500/5',
  watch: 'border-amber-500/30 bg-amber-500/5',
  at_risk: 'border-orange-500/30 bg-orange-500/5',
  critical: 'border-red-500/30 bg-red-500/5',
};

const RISK_TEXT: Record<string, string> = {
  healthy: 'text-emerald-400',
  watch: 'text-amber-400',
  at_risk: 'text-orange-400',
  critical: 'text-red-400',
};

export default function CustomerSuccess() {
  const [tab, setTab] = useState('Health Dashboard');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Partial<SupportTicket>>({});
  const [saving, setSaving] = useState(false);

  const { data: healthData, loading: healthLoading } = useApi<CustomerHealth[]>(() => customerSuccess.getHealthScores(), []);
  const { data: ticketsData, loading: ticketsLoading, refetch: refetchTickets } = useApi<SupportTicket[]>(() => customerSuccess.getTickets(), []);
  const { data: renewalsData, loading: renewalsLoading } = useApi<any>(() => customerSuccess.getRenewals(), []);

  const healthScores = healthData || [];
  const tickets = ticketsData || [];
  const renewals = renewalsData || [];

  // KPI calculations
  const avgHealth = healthScores.length > 0 ? Math.round(healthScores.reduce((s, h) => s + h.overall_score, 0) / healthScores.length) : 0;
  const atRiskCount = healthScores.filter((h) => h.risk_level === 'at_risk' || h.risk_level === 'critical').length;
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress' || t.status === 'waiting').length;
  const expansionCount = healthScores.filter((h) => h.expansion_opportunity).length;

  const healthByRisk = useMemo(() => {
    const groups: Record<string, CustomerHealth[]> = { healthy: [], watch: [], at_risk: [], critical: [] };
    healthScores.forEach((h) => {
      if (groups[h.risk_level]) groups[h.risk_level].push(h);
    });
    return groups;
  }, [healthScores]);

  async function handleSaveTicket() {
    setSaving(true);
    try {
      if (editingTicket.id) await customerSuccess.updateTicket(editingTicket.id, editingTicket);
      else await customerSuccess.createTicket(editingTicket);
      setShowTicketModal(false); setEditingTicket({}); refetchTickets();
    } catch {} finally { setSaving(false); }
  }

  const ticketColumns: Column<SupportTicket>[] = [
    { key: 'subject', label: 'Subject', render: (t) => <span className="font-medium text-white">{t.subject}</span> },
    { key: 'school_district_name', label: 'District', render: (t) => <span>{t.school_district_name || '-'}</span> },
    { key: 'priority', label: 'Priority', render: (t) => <StatusBadge status={t.priority} /> },
    { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'tier', label: 'Tier', render: (t) => (
      <span className={`text-xs px-2 py-0.5 rounded-full ${t.tier === 'L3' ? 'bg-red-500/20 text-red-400' : t.tier === 'L2' ? 'bg-amber-500/20 text-amber-400' : 'bg-navy-700 text-gray-400'}`}>
        {t.tier}
      </span>
    )},
    { key: 'assigned_to', label: 'Assigned', render: (t) => <span>{t.assigned_to || 'Unassigned'}</span> },
    { key: 'sla_response_due', label: 'SLA Due', sortable: true, render: (t) => {
      if (!t.sla_response_due) return <span className="text-gray-500">-</span>;
      const isOverdue = new Date(t.sla_response_due) < new Date() && t.status !== 'resolved' && t.status !== 'closed';
      return (
        <span className={isOverdue ? 'text-red-400 font-medium' : ''}>
          {t.sla_response_due.slice(0, 10)}
          {isOverdue && <span className="text-xs ml-1">(overdue)</span>}
        </span>
      );
    }},
  ];

  return (
    <PageShell
      title="Customer Success"
      subtitle="Health scores, support, and renewals"
      actions={
        <div className="flex gap-2">
          <AgentTriggerButton agentId="customer-success" label="Analyze Churn Risk" prompt="Analyze customer health scores and identify accounts at risk of churning with recommended interventions" businessArea="customer_success" />
          <button onClick={() => { setEditingTicket({}); setShowTicketModal(true); }} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">+ New Ticket</button>
        </div>
      }
    >
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Avg Health Score" value={`${avgHealth}%`} icon={Heart} />
        <KPICard label="At-Risk Accounts" value={String(atRiskCount)} icon={AlertTriangle} />
        <KPICard label="Open Tickets" value={String(openTickets)} icon={Users} />
        <KPICard label="Expansion Opportunities" value={String(expansionCount)} icon={RotateCcw} />
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {/* Health Dashboard */}
      {tab === 'Health Dashboard' && (
        <div className="space-y-6">
          {healthLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-navy-700 rounded-xl" />)}
            </div>
          ) : healthScores.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No health scores available.</p>
          ) : (
            <>
              {/* Risk Level Groups */}
              {(['critical', 'at_risk', 'watch', 'healthy'] as const).map((level) => {
                const items = healthByRisk[level];
                if (!items || items.length === 0) return null;
                return (
                  <div key={level}>
                    <h3 className={`text-sm font-medium mb-3 capitalize ${RISK_TEXT[level]}`}>
                      {level.replace('_', ' ')} ({items.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((health) => (
                        <div key={health.id} className={`border rounded-xl p-4 ${RISK_COLORS[health.risk_level]}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-white truncate">{health.school_district_name || 'District'}</h4>
                            <span className={`text-lg font-bold ${RISK_TEXT[health.risk_level]}`}>{health.overall_score}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Usage</span>
                              <ProgressBar value={health.usage_score} color={health.usage_score < 50 ? 'red' : 'blue'} size="sm" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Engagement</span>
                              <ProgressBar value={health.engagement_score} color={health.engagement_score < 50 ? 'red' : 'blue'} size="sm" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Support</span>
                              <ProgressBar value={health.support_score} color={health.support_score < 50 ? 'red' : 'blue'} size="sm" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Adoption</span>
                              <ProgressBar value={health.adoption_score} color={health.adoption_score < 50 ? 'red' : 'blue'} size="sm" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-navy-700/50">
                            {health.contract_value && (
                              <span className="text-xs text-gray-400">${health.contract_value.toLocaleString()}</span>
                            )}
                            {health.renewal_date && (
                              <span className="text-xs text-gray-400">Renews: {health.renewal_date.slice(0, 10)}</span>
                            )}
                            {health.expansion_opportunity && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Expansion</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Support Tickets */}
      {tab === 'Support Tickets' && (
        <DataTable
          columns={ticketColumns}
          data={tickets}
          loading={ticketsLoading}
          searchable
          pagination
          pageSize={10}
          onRowClick={(t) => { setEditingTicket(t); setShowTicketModal(true); }}
        />
      )}

      {/* Renewals */}
      {tab === 'Renewals' && (
        <div>
          {renewalsLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-navy-700 rounded-xl" />)}
            </div>
          ) : Array.isArray(renewals) && renewals.length > 0 ? (
            <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-navy-700 text-xs text-gray-500 font-medium">
                <div className="col-span-3">District</div>
                <div className="col-span-2">Contract Value</div>
                <div className="col-span-2">Renewal Date</div>
                <div className="col-span-2">Health Score</div>
                <div className="col-span-3">Risk Level</div>
              </div>
              {renewals.map((item: any, i: number) => (
                <div key={item.id || i} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-navy-700/50 hover:bg-navy-700/30 transition-colors items-center">
                  <div className="col-span-3 text-sm text-white">{item.school_district_name || item.name || '-'}</div>
                  <div className="col-span-2 text-sm text-white">{item.contract_value ? `$${item.contract_value.toLocaleString()}` : '-'}</div>
                  <div className="col-span-2 text-sm text-gray-400">{item.renewal_date?.slice(0, 10) || '-'}</div>
                  <div className="col-span-2"><ProgressBar value={item.overall_score || 0} color={item.overall_score < 50 ? 'red' : 'blue'} size="sm" /></div>
                  <div className="col-span-3"><StatusBadge status={item.risk_level || 'unknown'} /></div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No renewal data available.</p>
          )}
        </div>
      )}

      {/* Ticket Modal */}
      <Modal isOpen={showTicketModal} onClose={() => setShowTicketModal(false)} title={editingTicket.id ? 'Edit Ticket' : 'New Ticket'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Subject</label>
            <input value={editingTicket.subject || ''} onChange={(e) => setEditingTicket({ ...editingTicket, subject: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea value={editingTicket.description || ''} onChange={(e) => setEditingTicket({ ...editingTicket, description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Priority</label>
              <select value={editingTicket.priority || 'medium'} onChange={(e) => setEditingTicket({ ...editingTicket, priority: e.target.value as SupportTicket['priority'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tier</label>
              <select value={editingTicket.tier || 'L1'} onChange={(e) => setEditingTicket({ ...editingTicket, tier: e.target.value as SupportTicket['tier'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="L1">L1</option><option value="L2">L2</option><option value="L3">L3</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select value={editingTicket.status || 'open'} onChange={(e) => setEditingTicket({ ...editingTicket, status: e.target.value as SupportTicket['status'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="open">Open</option><option value="in_progress">In Progress</option><option value="waiting">Waiting</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Assigned To</label>
              <input value={editingTicket.assigned_to || ''} onChange={(e) => setEditingTicket({ ...editingTicket, assigned_to: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowTicketModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleSaveTicket} disabled={saving} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
