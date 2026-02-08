import { useState, useMemo, useEffect } from 'react';
import PageShell from '../components/layout/PageShell';
import TabBar from '../components/shared/TabBar';
import DataTable from '../components/shared/DataTable';
import type { Column } from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import ProgressBar from '../components/shared/ProgressBar';
import Modal from '../components/shared/Modal';
import AgentTriggerButton from '../components/shared/AgentTriggerButton';
import ErrorState from '../components/shared/ErrorState';
import { taxes, knowledgeBase, businessActivities, forecasts, goals } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import type { TaxEvent, TaxDeduction, KnowledgeBaseArticle, BusinessActivity, Forecast, Goal } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TAX_TABS = ['Dashboard', 'Knowledge Base', 'Goals', 'Forecasts', 'Activities'];

export default function Taxes() {
  const [tab, setTab] = useState('Dashboard');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [summary, setSummary] = useState<any>(null);
  const [kbSearch, setKbSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [scenarioFilter, setScenarioFilter] = useState('baseline');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
  const { showToast } = useToast();

  const { data: eventsData, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useApi<TaxEvent[]>(() => taxes.getEvents(), []);
  const { data: deductionsData, loading: deductionsLoading, error: deductionsError, refetch: refetchDeductions } = useApi<TaxDeduction[]>(() => taxes.getDeductions({ tax_year: 2026 }), []);

  const primaryError = eventsError || deductionsError;

  const events = eventsData || [];
  const deductions = deductionsData || [];

  const { data: kbData } = useApi<any>(() => knowledgeBase.getArticles({ business_area: 'taxes' }), []);
  const { data: activitiesDataRaw } = useApi<any>(() => businessActivities.getActivities({ business_area: 'taxes' }), []);
  const { data: forecastsDataRaw } = useApi<Forecast[]>(() => forecasts.getForecasts({ business_area: 'taxes' }), []);
  const { data: goalsDataRaw } = useApi<Goal[]>(() => goals.list({ business_area: 'taxes', quarter: 'Q1_2026' }), []);

  const kbArticles: KnowledgeBaseArticle[] = kbData?.articles || kbData || [];
  const taxActivities: BusinessActivity[] = activitiesDataRaw?.activities || activitiesDataRaw || [];
  const taxForecasts: Forecast[] = forecastsDataRaw || [];
  const taxGoals: Goal[] = goalsDataRaw || [];

  const filteredKbArticles = kbSearch ? kbArticles.filter(a => a.title.toLowerCase().includes(kbSearch.toLowerCase())) : kbArticles;
  const filteredTaxActivities = activityFilter ? taxActivities.filter(a => a.priority === activityFilter) : taxActivities;
  const filteredTaxForecasts = taxForecasts.filter(f => f.scenario === scenarioFilter);

  useEffect(() => {
    taxes.getSummary(2026).then((r) => setSummary(r.data.data || r.data)).catch((err: any) => { showToast(err.response?.data?.error || 'Failed to load tax summary', 'error'); });
  }, []);

  const calendarGrid = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) { week.push(d); if (week.length === 7) { weeks.push(week); week = []; } }
    if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week); }
    return weeks;
  }, [calendarMonth]);

  function getEventsForDay(day: number) {
    const { year, month } = calendarMonth;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.due_date?.startsWith(dateStr));
  }

  const upcomingDeadlines = [...events]
    .filter((e) => e.status !== 'completed')
    .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));

  const deductionColumns: Column<TaxDeduction>[] = [
    { key: 'description', label: 'Description', render: (d) => <span className="font-medium text-white">{d.description}</span> },
    { key: 'category', label: 'Category', render: (d) => <span className="capitalize">{d.category}</span> },
    { key: 'amount', label: 'Amount', sortable: true, render: (d) => <span>${d.amount?.toLocaleString()}</span> },
    { key: 'is_r_and_d', label: 'R&D', render: (d) => d.is_r_and_d ? <span className="text-[#7C3AED] text-xs font-medium">R&D</span> : <span className="text-gray-600">-</span> },
    { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
  ];

  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
  const rdDeductions = deductions.filter((d) => d.is_r_and_d).reduce((s, d) => s + d.amount, 0);
  const rdCreditEstimate = rdDeductions * 0.2;

  const deductionsByCategory = deductions.reduce<Record<string, number>>((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + d.amount;
    return acc;
  }, {});

  const monthLabel = new Date(calendarMonth.year, calendarMonth.month).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <PageShell
      title="Taxes & Compliance"
      subtitle="Tax calendar, deductions, and R&D credits"
      actions={
        <div className="flex gap-2 flex-wrap">
          <AgentTriggerButton agentId="finance" label="Identify R&D Expenses" prompt="Review expenses and identify potential R&D tax credit qualifying expenses" businessArea="finance" />
          <AgentTriggerButton agentId="finance" label="Prepare Quarterly Estimate" prompt="Prepare quarterly tax estimate based on current revenue and deductions" businessArea="finance" />
        </div>
      }
    >
      <TabBar tabs={TAX_TABS} active={tab} onChange={setTab} />

      {primaryError && <ErrorState error={primaryError} onRetry={eventsError ? refetchEvents : refetchDeductions} />}
      {!primaryError && <>
      {tab === 'Dashboard' && <>
      {/* Tax Calendar */}
      <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between p-4 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <button onClick={() => setCalendarMonth((prev) => { const d = new Date(prev.year, prev.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })} className="p-2 text-gray-400 hover:text-white">&larr;</button>
            <h3 className="text-lg font-medium text-white">{monthLabel}</h3>
            <button onClick={() => setCalendarMonth((prev) => { const d = new Date(prev.year, prev.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })} className="p-2 text-gray-400 hover:text-white">&rarr;</button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-navy-700">
          {DAYS.map((d) => <div key={d} className="px-2 py-2 text-xs font-medium text-gray-400 text-center">{d}</div>)}
        </div>
        {eventsLoading ? <div className="h-48 animate-pulse bg-navy-700/30" /> : calendarGrid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-navy-700 last:border-b-0">
            {week.map((day, di) => (
              <div key={di} className={`min-h-[60px] p-1 border-r border-navy-700 last:border-r-0 ${day ? '' : 'bg-navy-900/30'}`}>
                {day && (
                  <>
                    <span className="text-xs text-gray-500 px-1">{day}</span>
                    {getEventsForDay(day).map((ev) => (
                      <div key={ev.id} className={`text-xs px-1.5 py-0.5 mt-0.5 rounded truncate ${ev.status === 'overdue' ? 'bg-red-500/20 text-red-400' : ev.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`} title={ev.title}>{ev.title}</div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Upcoming Deadlines */}
        <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Upcoming Deadlines</h3>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming deadlines.</p>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.slice(0, 8).map((ev) => (
                <div key={ev.id} className="flex items-center justify-between p-3 bg-navy-700/50 rounded-lg">
                  <div>
                    <p className="text-sm text-white">{ev.title}</p>
                    <p className="text-xs text-gray-400">{ev.due_date?.slice(0, 10)}{ev.amount ? ` - $${ev.amount.toLocaleString()}` : ''}</p>
                  </div>
                  <StatusBadge status={ev.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deduction Summary */}
        <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Deduction Summary - 2026</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-navy-700/50 rounded-lg">
              <span className="text-sm text-gray-300">Total Deductions</span>
              <span className="text-lg font-bold text-white">${totalDeductions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-lg">
              <span className="text-sm text-[#7C3AED]">R&D Deductions</span>
              <span className="text-lg font-bold text-[#7C3AED]">${rdDeductions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <span className="text-sm text-emerald-400">Estimated R&D Credit (20%)</span>
              <span className="text-lg font-bold text-emerald-400">${rdCreditEstimate.toLocaleString()}</span>
            </div>
            <div className="border-t border-navy-700 pt-3">
              <h4 className="text-xs text-gray-400 mb-2 uppercase tracking-wider">By Category</h4>
              {Object.entries(deductionsByCategory).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between py-1">
                  <span className="text-sm text-gray-300 capitalize">{cat}</span>
                  <span className="text-sm text-white">${amt.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deduction Tracker */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Deduction Tracker</h3>
        <DataTable columns={deductionColumns} data={deductions} loading={deductionsLoading} searchable pagination />
      </div>
      </>}

      {tab === 'Knowledge Base' && (
        <div className="space-y-4">
          <input value={kbSearch} onChange={(e) => setKbSearch(e.target.value)} placeholder="Search tax articles..." className="w-full px-4 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          {filteredKbArticles.length === 0 ? <p className="text-gray-500 text-center py-8">No articles found.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredKbArticles.map((article) => (
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
          {taxGoals.length === 0 ? <p className="text-gray-500 text-center py-8">No goals for this quarter.</p> : taxGoals.filter(g => g.goal_type === 'objective').map((obj) => (
            <div key={obj.id} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3"><h4 className="text-sm font-medium text-white">{obj.title}</h4><StatusBadge status={obj.status} /></div>
              <ProgressBar value={obj.progress} color="blue" />
              <div className="mt-3 space-y-2">{taxGoals.filter(kr => kr.parent_id === obj.id).map((kr) => (
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
          {filteredTaxForecasts.length === 0 ? <p className="text-gray-500 text-center py-8">No forecasts available.</p> : (
            <div className="bg-navy-800/60 border border-navy-700/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-navy-700 text-xs text-gray-500 font-medium">
                <div className="col-span-2">Period</div><div className="col-span-3">Type</div><div className="col-span-2">Metric</div><div className="col-span-2">Projected</div><div className="col-span-2">Actual</div><div className="col-span-1">Conf.</div>
              </div>
              {filteredTaxForecasts.map((f) => (
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
          {filteredTaxActivities.length === 0 ? <p className="text-gray-500 text-center py-8">No activities found.</p> : (
            <div className="space-y-2">{filteredTaxActivities.map((a) => (
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
    </PageShell>
  );
}
