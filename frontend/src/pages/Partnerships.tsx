import { useState, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import DataTable from '../components/shared/DataTable';
import type { Column } from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import KPICard from '../components/shared/KPICard';
import Modal from '../components/shared/Modal';
import AgentTriggerButton from '../components/shared/AgentTriggerButton';
import ErrorState from '../components/shared/ErrorState';
import { partnerships } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import type { Partner, PartnerDeal } from '../types';
import { Handshake, DollarSign, TrendingUp, Users } from 'lucide-react';

export default function Partnerships() {
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partial<Partner>>({});
  const [editingDeal, setEditingDeal] = useState<Partial<PartnerDeal>>({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const { data: partnersData, loading: partnersLoading, error: partnersError, refetch: refetchPartners } = useApi<Partner[]>(() => partnerships.list(), []);
  const { data: dealsData, loading: dealsLoading, error: dealsError, refetch: refetchDeals } = useApi<PartnerDeal[]>(() => partnerships.getDeals(), []);

  const primaryError = partnersError || dealsError;

  const partners = partnersData || [];
  const deals = dealsData || [];

  // KPI calculations
  const activePartners = partners.filter((p) => p.status === 'active').length;
  const totalDealValue = deals.reduce((s, d) => s + (d.deal_value || 0), 0);
  const totalCommissions = deals.reduce((s, d) => s + (d.commission_amount || 0), 0);
  const wonDeals = deals.filter((d) => d.status === 'won' || d.status === 'paid').length;

  const commissionByPartner = useMemo(() => {
    const map: Record<string, { name: string; total: number; count: number }> = {};
    deals.forEach((d) => {
      const name = d.partner_name || d.partner_id;
      if (!map[name]) map[name] = { name, total: 0, count: 0 };
      map[name].total += d.commission_amount || 0;
      map[name].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [deals]);

  async function handleSavePartner() {
    setSaving(true);
    try {
      if (editingPartner.id) await partnerships.update(editingPartner.id, editingPartner);
      else await partnerships.create(editingPartner);
      showToast('Partner saved successfully', 'success');
      setShowPartnerModal(false); setEditingPartner({}); refetchPartners();
    } catch (err: any) { showToast(err.response?.data?.error || 'Operation failed', 'error'); } finally { setSaving(false); }
  }

  async function handleSaveDeal() {
    setSaving(true);
    try {
      await partnerships.createDeal(editingDeal);
      showToast('Deal saved successfully', 'success');
      setShowDealModal(false); setEditingDeal({}); refetchDeals();
    } catch (err: any) { showToast(err.response?.data?.error || 'Operation failed', 'error'); } finally { setSaving(false); }
  }

  const dealColumns: Column<PartnerDeal>[] = [
    { key: 'partner_name', label: 'Partner', render: (d) => <span className="font-medium text-white">{d.partner_name || d.partner_id}</span> },
    { key: 'deal_value', label: 'Deal Value', sortable: true, render: (d) => `$${d.deal_value?.toLocaleString() || '0'}` },
    { key: 'commission_amount', label: 'Commission', sortable: true, render: (d) => <span className="text-emerald-400">${d.commission_amount?.toLocaleString() || '0'}</span> },
    { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
  ];

  return (
    <PageShell
      title="Partnerships"
      subtitle="Partner management and deal tracking"
      actions={
        <div className="flex gap-2">
          <AgentTriggerButton agentId="partnerships" label="Analyze Partner Performance" prompt="Analyze partner performance metrics and identify top-performing and underperforming partnerships" businessArea="partnerships" />
          <button onClick={() => { setEditingPartner({}); setShowPartnerModal(true); }} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">+ New Partner</button>
          <button onClick={() => { setEditingDeal({}); setShowDealModal(true); }} className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-[#7C3AED]/80">+ New Deal</button>
        </div>
      }
    >
      {primaryError && <ErrorState error={primaryError} onRetry={partnersError ? refetchPartners : refetchDeals} />}
      {!primaryError && <>
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Active Partners" value={String(activePartners)} icon={Handshake} />
        <KPICard label="Total Deal Value" value={`$${totalDealValue.toLocaleString()}`} icon={DollarSign} />
        <KPICard label="Total Commissions" value={`$${totalCommissions.toLocaleString()}`} icon={TrendingUp} />
        <KPICard label="Won Deals" value={String(wonDeals)} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Partner Cards */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Partners</h3>
          </div>
          {partnersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-36 bg-navy-700 rounded-xl" />)}
            </div>
          ) : partners.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No partners configured.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 hover:border-[#2563EB]/30 transition-colors cursor-pointer"
                  onClick={() => { setEditingPartner(partner); setShowPartnerModal(true); }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{partner.name}</h4>
                      <span className="text-xs text-[#2563EB] capitalize">{partner.type}</span>
                    </div>
                    <StatusBadge status={partner.status} />
                  </div>
                  <div className="space-y-2">
                    {partner.contact_name && (
                      <p className="text-xs text-gray-400">Contact: {partner.contact_name}</p>
                    )}
                    {partner.contact_email && (
                      <p className="text-xs text-gray-400">{partner.contact_email}</p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-navy-700/50">
                      <span className="text-xs text-gray-400">Commission</span>
                      <span className="text-sm font-medium text-emerald-400">
                        {partner.commission_type === 'percentage'
                          ? `${partner.commission_rate}%`
                          : `$${partner.commission_rate.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commission Summary */}
        <div>
          <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white mb-4">Commission Summary</h3>
            {commissionByPartner.length === 0 ? (
              <p className="text-gray-500 text-sm">No commission data.</p>
            ) : (
              <div className="space-y-3">
                {commissionByPartner.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.count} deals</p>
                    </div>
                    <span className="text-sm font-medium text-emerald-400">${item.total.toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-navy-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Total</span>
                    <span className="text-sm font-bold text-emerald-400">${totalCommissions.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deals Table */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Partner Deals</h3>
        <DataTable columns={dealColumns} data={deals} loading={dealsLoading} searchable pagination pageSize={10} />
      </div>

      </>}
      {/* Partner Modal */}
      <Modal isOpen={showPartnerModal} onClose={() => setShowPartnerModal(false)} title={editingPartner.id ? 'Edit Partner' : 'New Partner'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input value={editingPartner.name || ''} onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select value={editingPartner.type || 'reseller'} onChange={(e) => setEditingPartner({ ...editingPartner, type: e.target.value as Partner['type'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="reseller">Reseller</option><option value="referral">Referral</option><option value="technology">Technology</option><option value="integration">Integration</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select value={editingPartner.status || 'prospect'} onChange={(e) => setEditingPartner({ ...editingPartner, status: e.target.value as Partner['status'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="prospect">Prospect</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="churned">Churned</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Contact Name</label>
              <input value={editingPartner.contact_name || ''} onChange={(e) => setEditingPartner({ ...editingPartner, contact_name: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Contact Email</label>
              <input value={editingPartner.contact_email || ''} onChange={(e) => setEditingPartner({ ...editingPartner, contact_email: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Commission Rate</label>
              <input type="number" value={editingPartner.commission_rate || ''} onChange={(e) => setEditingPartner({ ...editingPartner, commission_rate: Number(e.target.value) })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Commission Type</label>
              <select value={editingPartner.commission_type || 'percentage'} onChange={(e) => setEditingPartner({ ...editingPartner, commission_type: e.target.value as Partner['commission_type'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="percentage">Percentage</option><option value="flat">Flat Rate</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowPartnerModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleSavePartner} disabled={saving} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      {/* Deal Modal */}
      <Modal isOpen={showDealModal} onClose={() => setShowDealModal(false)} title="New Partner Deal">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Partner</label>
            <select value={editingDeal.partner_id || ''} onChange={(e) => setEditingDeal({ ...editingDeal, partner_id: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
              <option value="">Select partner...</option>
              {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Deal Value ($)</label>
              <input type="number" value={editingDeal.deal_value || ''} onChange={(e) => setEditingDeal({ ...editingDeal, deal_value: Number(e.target.value) })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Commission ($)</label>
              <input type="number" value={editingDeal.commission_amount || ''} onChange={(e) => setEditingDeal({ ...editingDeal, commission_amount: Number(e.target.value) })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select value={editingDeal.status || 'pending'} onChange={(e) => setEditingDeal({ ...editingDeal, status: e.target.value as PartnerDeal['status'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
              <option value="pending">Pending</option><option value="won">Won</option><option value="lost">Lost</option><option value="paid">Paid</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowDealModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleSaveDeal} disabled={saving} className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
