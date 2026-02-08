import { useState, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import TabBar from '../components/shared/TabBar';
import DataTable from '../components/shared/DataTable';
import type { Column } from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import AgentTriggerButton from '../components/shared/AgentTriggerButton';
import ErrorState from '../components/shared/ErrorState';
import { marketing, linkedin } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import type { Campaign, ContentCalendarItem, LinkedInPost } from '../types';

const TABS = ['Content Calendar', 'Campaigns', 'LinkedIn Posts'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Marketing() {
  const [tab, setTab] = useState('Content Calendar');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'content' | 'campaign'>('content');
  const [editingContent, setEditingContent] = useState<Partial<ContentCalendarItem>>({});
  const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign>>({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const { data: calendarData, loading: calendarLoading, error: calendarError, refetch: refetchCalendar } = useApi<ContentCalendarItem[]>(() => marketing.getCalendar(), []);
  const { data: campaignsData, loading: campaignsLoading, error: campaignsError, refetch: refetchCampaigns } = useApi<Campaign[]>(() => marketing.getCampaigns(), []);
  const { data: postsData, loading: postsLoading } = useApi<LinkedInPost[]>(() => linkedin.getPosts(), []);

  const primaryError = calendarError || campaignsError;

  const calendarItems = calendarData || [];
  const campaigns = campaignsData || [];
  const posts = postsData || [];

  const calendarGrid = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d);
      if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week); }
    return weeks;
  }, [calendarMonth]);

  function getItemsForDay(day: number) {
    const { year, month } = calendarMonth;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarItems.filter((item) => item.scheduled_date?.startsWith(dateStr));
  }

  async function handleSaveContent() {
    setSaving(true);
    try {
      if (editingContent.id) await marketing.updateCalendarItem(editingContent.id, editingContent);
      else await marketing.createCalendarItem(editingContent);
      showToast('Content saved successfully', 'success');
      setShowModal(false); setEditingContent({}); refetchCalendar();
    } catch (err: any) { showToast(err.response?.data?.error || 'Operation failed', 'error'); } finally { setSaving(false); }
  }

  async function handleSaveCampaign() {
    setSaving(true);
    try {
      if (editingCampaign.id) await marketing.updateCampaign(editingCampaign.id, editingCampaign);
      else await marketing.createCampaign(editingCampaign);
      showToast('Campaign saved successfully', 'success');
      setShowModal(false); setEditingCampaign({}); refetchCampaigns();
    } catch (err: any) { showToast(err.response?.data?.error || 'Operation failed', 'error'); } finally { setSaving(false); }
  }

  const campaignColumns: Column<Campaign>[] = [
    { key: 'name', label: 'Campaign', render: (c) => <span className="font-medium text-white">{c.name}</span> },
    { key: 'channel', label: 'Channel', render: (c) => <span className="capitalize">{c.channel}</span> },
    { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'budget', label: 'Budget', sortable: true, render: (c) => <span>${c.budget?.toLocaleString()}</span> },
    { key: 'spent', label: 'Spent', sortable: true, render: (c) => <span>${c.spent?.toLocaleString()}</span> },
    { key: 'leads_generated', label: 'Leads', sortable: true },
    { key: 'conversions', label: 'Conversions', sortable: true },
  ];

  const postColumns: Column<LinkedInPost>[] = [
    { key: 'text', label: 'Post', render: (p) => <span className="text-white truncate block max-w-sm">{p.text?.slice(0, 80)}...</span> },
    { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    { key: 'published_time', label: 'Published', render: (p) => p.published_time?.slice(0, 10) || '-' },
    { key: 'impressions', label: 'Impressions', sortable: true, render: (p) => <span>{p.impressions?.toLocaleString()}</span> },
    { key: 'engagements', label: 'Engagements', sortable: true },
    { key: 'clicks', label: 'Clicks', sortable: true },
    { key: 'shares', label: 'Shares', sortable: true },
  ];

  const monthLabel = new Date(calendarMonth.year, calendarMonth.month).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <PageShell
      title="Marketing"
      subtitle="LinkedIn, Campaigns & Content"
      actions={
        <div className="flex gap-2 flex-wrap">
          <AgentTriggerButton agentId="content" label="Draft LinkedIn Post" prompt="Draft a LinkedIn post about Ascent XR for K-12 education" businessArea="marketing" />
          <AgentTriggerButton agentId="content" label="Plan Next Week" prompt="Plan next week's content calendar with daily posts" businessArea="marketing" />
          <AgentTriggerButton agentId="analytics" label="Analyze Campaign" prompt="Analyze our active marketing campaigns and suggest optimizations" businessArea="marketing" />
        </div>
      }
    >
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {primaryError && <ErrorState error={primaryError} onRetry={calendarError ? refetchCalendar : refetchCampaigns} />}
      {!primaryError && <>
      {tab === 'Content Calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setCalendarMonth((prev) => { const d = new Date(prev.year, prev.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })} className="p-2 text-gray-400 hover:text-white">&larr;</button>
              <h3 className="text-lg font-medium text-white">{monthLabel}</h3>
              <button onClick={() => setCalendarMonth((prev) => { const d = new Date(prev.year, prev.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })} className="p-2 text-gray-400 hover:text-white">&rarr;</button>
            </div>
            <button onClick={() => { setEditingContent({}); setModalType('content'); setShowModal(true); }} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">+ Add Content</button>
          </div>
          <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 border-b border-navy-700">
              {DAYS.map((d) => <div key={d} className="px-2 py-2 text-xs font-medium text-gray-400 text-center">{d}</div>)}
            </div>
            {calendarLoading ? <div className="h-64 animate-pulse bg-navy-700/30" /> : calendarGrid.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-navy-700 last:border-b-0">
                {week.map((day, di) => (
                  <div key={di} className={`min-h-[80px] p-1 border-r border-navy-700 last:border-r-0 ${day ? '' : 'bg-navy-900/30'}`}>
                    {day && (
                      <>
                        <span className="text-xs text-gray-500 px-1">{day}</span>
                        <div className="space-y-0.5 mt-0.5">
                          {getItemsForDay(day).map((item) => (
                            <div key={item.id} className="text-xs px-1.5 py-0.5 rounded bg-[#2563EB]/20 text-[#2563EB] truncate cursor-pointer hover:bg-[#2563EB]/30" onClick={() => { setEditingContent(item); setModalType('content'); setShowModal(true); }} title={item.title}>{item.title}</div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Campaigns' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditingCampaign({}); setModalType('campaign'); setShowModal(true); }} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">+ New Campaign</button>
          </div>
          <DataTable columns={campaignColumns} data={campaigns} loading={campaignsLoading} searchable pagination onRowClick={(c) => { setEditingCampaign(c); setModalType('campaign'); setShowModal(true); }} />
        </div>
      )}

      {tab === 'LinkedIn Posts' && (
        <DataTable columns={postColumns} data={posts} loading={postsLoading} searchable pagination />
      )}

      </>}
      <Modal isOpen={showModal && modalType === 'content'} onClose={() => setShowModal(false)} title={editingContent.id ? 'Edit Content' : 'New Content Item'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input value={editingContent.title || ''} onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Content Type</label>
              <select value={editingContent.content_type || ''} onChange={(e) => setEditingContent({ ...editingContent, content_type: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="">Select...</option>
                <option value="linkedin_post">LinkedIn Post</option>
                <option value="blog">Blog Post</option>
                <option value="case_study">Case Study</option>
                <option value="whitepaper">Whitepaper</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Scheduled Date</label>
              <input type="date" value={editingContent.scheduled_date?.slice(0, 10) || ''} onChange={(e) => setEditingContent({ ...editingContent, scheduled_date: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select value={editingContent.status || 'planned'} onChange={(e) => setEditingContent({ ...editingContent, status: e.target.value as ContentCalendarItem['status'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
              <option value="planned">Planned</option><option value="draft">Draft</option><option value="review">Review</option><option value="scheduled">Scheduled</option><option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Content</label>
            <textarea value={editingContent.content || ''} onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })} rows={4} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleSaveContent} disabled={saving} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showModal && modalType === 'campaign'} onClose={() => setShowModal(false)} title={editingCampaign.id ? 'Edit Campaign' : 'New Campaign'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input value={editingCampaign.name || ''} onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Channel</label>
              <select value={editingCampaign.channel || ''} onChange={(e) => setEditingCampaign({ ...editingCampaign, channel: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="">Select...</option><option value="linkedin">LinkedIn</option><option value="email">Email</option><option value="conference">Conference</option><option value="webinar">Webinar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Budget ($)</label>
              <input type="number" value={editingCampaign.budget || ''} onChange={(e) => setEditingCampaign({ ...editingCampaign, budget: Number(e.target.value) })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea value={editingCampaign.description || ''} onChange={(e) => setEditingCampaign({ ...editingCampaign, description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleSaveCampaign} disabled={saving} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
