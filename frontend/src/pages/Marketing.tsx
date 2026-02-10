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
import { marketing, linkedin, knowledgeBase, businessActivities, forecasts, goals, marketingSkills, skillCalendar } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { useWebSocket } from '../hooks/useWebSocket';
import { useSkillTaskTracker } from '../hooks/useSkillTaskTracker';
import { useToast } from '../context/ToastContext';
import type { Campaign, ContentCalendarItem, LinkedInPost, KnowledgeBaseArticle, BusinessActivity, Forecast, Goal, MarketingSkill, MarketingWorkflow, WorkflowRun, ExecutionPlan, SkillCalendarEntry, PlanStats } from '../types';

const TABS = ['Plan Calendar', 'Content Calendar', 'Campaigns', 'LinkedIn Posts', 'Skills & Workflows', 'Knowledge Base', 'Goals', 'Forecasts', 'Activities'];

const SKILL_CATEGORY_COLORS: Record<string, string> = {
  'Conversion Optimization': 'bg-orange-500/20 text-orange-400',
  'Content & Copy': 'bg-blue-500/20 text-blue-400',
  'SEO & Discovery': 'bg-green-500/20 text-green-400',
  'Paid & Distribution': 'bg-teal-500/20 text-teal-400',
  'Measurement & Testing': 'bg-cyan-500/20 text-cyan-400',
  'Growth Engineering': 'bg-pink-500/20 text-pink-400',
  'Strategy & Monetization': 'bg-amber-500/20 text-amber-400',
  'Foundation': 'bg-gray-500/20 text-gray-400',
};
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ENTRY_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-500/20 text-gray-400 border-gray-600/30',
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-600/30',
  running: 'bg-amber-500/20 text-amber-400 border-amber-600/30 animate-pulse',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-600/30',
  failed: 'bg-red-500/20 text-red-400 border-red-600/30',
  skipped: 'bg-gray-500/10 text-gray-500 border-gray-700/30 line-through',
};

export default function Marketing() {
  const [tab, setTab] = useState('Plan Calendar');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'content' | 'campaign'>('content');
  const [editingContent, setEditingContent] = useState<Partial<ContentCalendarItem>>({});
  const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign>>({});
  const [saving, setSaving] = useState(false);
  const [kbSearch, setKbSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [scenarioFilter, setScenarioFilter] = useState('baseline');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [skillCategoryFilter, setSkillCategoryFilter] = useState('');
  const [executingSkill, setExecutingSkill] = useState<string | null>(null);
  const [startingWorkflow, setStartingWorkflow] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<SkillCalendarEntry | null>(null);
  const { showToast } = useToast();
  const { subscribe } = useWebSocket();
  const { skillTasks, trackSkill, clearSkill } = useSkillTaskTracker(subscribe);

  // Content Calendar month (independent)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  // Plan Calendar month (independent)
  const [planCalendarMonth, setPlanCalendarMonth] = useState({ year: 2026, month: 1 }); // Feb 2026
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // Content Calendar data
  const { data: calendarData, loading: calendarLoading, error: calendarError, refetch: refetchCalendar } = useApi<ContentCalendarItem[]>(() => marketing.getCalendar(), []);
  const { data: campaignsData, loading: campaignsLoading, error: campaignsError, refetch: refetchCampaigns } = useApi<Campaign[]>(() => marketing.getCampaigns(), []);
  const { data: postsData, loading: postsLoading } = useApi<LinkedInPost[]>(() => linkedin.getPosts(), []);

  const { data: kbData } = useApi<any>(() => knowledgeBase.getArticles({ business_area: 'marketing' }), []);
  const { data: activitiesData } = useApi<any>(() => businessActivities.getActivities({ business_area: 'marketing' }), []);
  const { data: forecastsData } = useApi<Forecast[]>(() => forecasts.getForecasts({ business_area: 'marketing' }), []);
  const { data: goalsData } = useApi<Goal[]>(() => goals.list({ business_area: 'marketing', quarter: 'Q1_2026' }), []);

  // Skills & Workflows data
  const { data: skillsData } = useApi<any>(() => marketingSkills.getSkills(skillCategoryFilter ? { category: skillCategoryFilter } : {}), [skillCategoryFilter]);
  const { data: categoriesData } = useApi<any>(() => marketingSkills.getCategories(), []);
  const { data: workflowsData } = useApi<MarketingWorkflow[]>(() => marketingSkills.getWorkflows(), []);
  const { data: activeRunsData, refetch: refetchRuns } = useApi<WorkflowRun[]>(() => marketingSkills.getWorkflowRuns(), []);

  // Plan Calendar data
  const { data: plansData } = useApi<ExecutionPlan[]>(() => skillCalendar.getPlans({ business_area: 'marketing' }), []);
  const plans: ExecutionPlan[] = plansData || [];

  // Auto-select first plan
  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  const { data: entriesData, refetch: refetchEntries } = useApi<SkillCalendarEntry[]>(
    () => selectedPlanId ? skillCalendar.getEntries({ plan_id: selectedPlanId }) : Promise.resolve({ data: { data: [] } } as any),
    [selectedPlanId]
  );
  const { data: planStatsData, refetch: refetchStats } = useApi<PlanStats>(
    () => selectedPlanId ? skillCalendar.getPlanStats(selectedPlanId) : Promise.resolve({ data: { data: null } } as any),
    [selectedPlanId]
  );

  const planEntries: SkillCalendarEntry[] = entriesData || [];
  const planStats: PlanStats | null = planStatsData || null;

  const skillItems: MarketingSkill[] = skillsData?.skills || skillsData || [];
  const categoryItems = categoriesData || [];
  const workflowItems: MarketingWorkflow[] = workflowsData || [];
  const runItems: WorkflowRun[] = activeRunsData || [];

  const kbArticles: KnowledgeBaseArticle[] = kbData?.articles || kbData || [];
  const mActivities: BusinessActivity[] = activitiesData?.activities || activitiesData || [];
  const forecastItems: Forecast[] = forecastsData || [];
  const goalItems: Goal[] = goalsData || [];

  const primaryError = calendarError || campaignsError;

  const calendarItems = calendarData || [];
  const campaigns = campaignsData || [];
  const posts = postsData || [];

  // WebSocket: refetch workflow runs on task updates
  useEffect(() => {
    const unsub = subscribe('agent:task:update', (task: any) => {
      const ctx = typeof task.context === 'string' ? JSON.parse(task.context) : (task.context || {});
      if (ctx.workflow_run_id) refetchRuns();
      if (ctx.calendar_entry_id) { refetchEntries(); refetchStats(); }
    });
    return unsub;
  }, [subscribe, refetchRuns, refetchEntries, refetchStats]);

  // Content Calendar grid
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

  // Plan Calendar grid
  const planCalendarGrid = useMemo(() => {
    const { year, month } = planCalendarMonth;
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
  }, [planCalendarMonth]);

  function getItemsForDay(day: number) {
    const { year, month } = calendarMonth;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarItems.filter((item) => item.scheduled_date?.startsWith(dateStr));
  }

  function getPlanEntriesForDay(day: number) {
    const { year, month } = planCalendarMonth;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return planEntries.filter((e) => e.scheduled_date?.startsWith(dateStr));
  }

  const filteredArticles = useMemo(() => {
    if (!kbSearch) return kbArticles;
    const s = kbSearch.toLowerCase();
    return kbArticles.filter((a) => a.title.toLowerCase().includes(s) || a.summary?.toLowerCase().includes(s));
  }, [kbArticles, kbSearch]);

  const filteredForecasts = useMemo(() => forecastItems.filter((f) => f.scenario === scenarioFilter), [forecastItems, scenarioFilter]);

  const filteredActivities = useMemo(() => {
    if (!activityFilter) return mActivities;
    return mActivities.filter((a) => a.priority === activityFilter);
  }, [mActivities, activityFilter]);

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

  async function handleExecuteSkill(skill: MarketingSkill) {
    setExecutingSkill(skill.id);
    try {
      const res = await marketingSkills.executeSkill(skill.id, {});
      const taskId = res.data?.data?.task_id;
      if (taskId) trackSkill(skill.id, taskId);
      showToast(`Skill "${skill.name}" started`, 'success');
    } catch (err: any) { showToast(err.response?.data?.error?.message || 'Failed to execute skill', 'error'); }
    finally { setExecutingSkill(null); }
  }

  async function handleExecuteEntry(entry: SkillCalendarEntry) {
    try {
      const res = await skillCalendar.executeEntry(entry.id);
      const taskId = res.data?.data?.task_id;
      if (taskId) trackSkill(entry.id, taskId);
      showToast(`Skill "${entry.skill_name}" started from plan`, 'success');
      refetchEntries();
      refetchStats();
      setSelectedEntry(null);
    } catch (err: any) { showToast(err.response?.data?.error?.message || 'Failed to execute', 'error'); }
  }

  async function handleSkipEntry(entry: SkillCalendarEntry) {
    try {
      await skillCalendar.skipEntry(entry.id);
      showToast(`Skipped "${entry.skill_name}"`, 'success');
      refetchEntries();
      refetchStats();
      setSelectedEntry(null);
    } catch (err: any) { showToast(err.response?.data?.error?.message || 'Failed to skip', 'error'); }
  }

  async function handleStartWorkflow(workflow: MarketingWorkflow) {
    setStartingWorkflow(workflow.id);
    try {
      await marketingSkills.startWorkflowRun(workflow.id, {});
      showToast(`Workflow "${workflow.name}" started`, 'success');
      refetchRuns();
    } catch (err: any) { showToast(err.response?.data?.error?.message || 'Failed to start workflow', 'error'); }
    finally { setStartingWorkflow(null); }
  }

  async function handleAdvanceRun(runId: string) {
    try {
      await marketingSkills.advanceWorkflowRun(runId);
      showToast('Advanced to next step', 'success');
      refetchRuns();
    } catch (err: any) { showToast(err.response?.data?.error?.message || 'Failed to advance', 'error'); }
  }

  async function handleCancelRun(runId: string) {
    try {
      await marketingSkills.cancelWorkflowRun(runId);
      showToast('Workflow cancelled', 'success');
      refetchRuns();
    } catch (err: any) { showToast(err.response?.data?.error?.message || 'Failed to cancel', 'error'); }
  }

  function renderRelevanceStars(score: number) {
    const full = Math.min(score, 10);
    return (
      <div className="flex items-center gap-0.5" title={`EdTech relevance: ${full}/10`}>
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = (i + 1) * 2;
          return (
            <span key={i} className={`text-xs ${full >= starValue ? 'text-amber-400' : full >= starValue - 1 ? 'text-amber-400/50' : 'text-gray-600'}`}>
              {full >= starValue ? '\u2605' : full >= starValue - 1 ? '\u2605' : '\u2606'}
            </span>
          );
        })}
      </div>
    );
  }

  function renderSkillTaskStatus(id: string) {
    const state = skillTasks[id];
    if (!state) return null;
    const isActive = state.status === 'queued' || state.status === 'running' || state.status === 'streaming';
    const isDone = state.status === 'review' || state.status === 'approved';
    const isFailed = state.status === 'failed' || state.status === 'rejected';
    return (
      <div className={`mt-2 p-2 rounded-lg border text-xs ${isDone ? 'border-emerald-600/30 bg-emerald-500/10' : isFailed ? 'border-red-600/30 bg-red-500/10' : 'border-blue-600/30 bg-blue-500/10'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-400' : isFailed ? 'bg-red-400' : 'bg-blue-400 animate-pulse'}`} />
            <span className={isDone ? 'text-emerald-400' : isFailed ? 'text-red-400' : 'text-blue-400'}>
              {state.status === 'queued' ? 'Queued' : state.status === 'running' ? 'Running' : state.status === 'streaming' ? 'Streaming' : isDone ? 'Complete' : 'Failed'}
            </span>
            {isDone && state.executionTime && <span className="text-gray-500">{(state.executionTime / 1000).toFixed(1)}s</span>}
          </div>
          {(isDone || isFailed) && <button onClick={() => clearSkill(id)} className="text-gray-500 hover:text-white">Dismiss</button>}
        </div>
        {isDone && state.result && (
          <details className="mt-1">
            <summary className="text-gray-400 cursor-pointer hover:text-white">View result</summary>
            <div className="mt-1 text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">{state.result.slice(0, 500)}{state.result.length > 500 ? '...' : ''}</div>
          </details>
        )}
        {isFailed && state.error && <p className="mt-1 text-red-400">{state.error}</p>}
      </div>
    );
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
  const planMonthLabel = new Date(planCalendarMonth.year, planCalendarMonth.month).toLocaleString('default', { month: 'long', year: 'numeric' });
  const activePlan = plans.find(p => p.id === selectedPlanId);

  return (
    <PageShell
      title="Marketing"
      subtitle="LinkedIn, Campaigns & Content"
      actions={
        <div className="flex gap-2 flex-wrap">
          <AgentTriggerButton agentId="content" label="Draft LTVR LinkedIn Post" prompt="Draft a LinkedIn post promoting Learning Time VR for K-12 education. Reference specific products: VR Classroom Pack (Pico 4 headsets + VictoryXR, $5K-$15K/yr) or Tablet Subscription (WebXR on Chromebooks, $1.5K-$5K/yr). Use 'Learn Beyond Limits' tagline. Target superintendents and tech directors. Use LTVR brand voice — approachable, outcome-focused." businessArea="marketing" />
          <AgentTriggerButton agentId="content" label="Plan LTVR Content Week" prompt="Plan next week's Learning Time VR content calendar. Cover 5 pillars: (1) LTVR product benefits, (2) Student outcome case studies, (3) District ROI, (4) Teacher success stories, (5) EdTech innovation. Target mix: 3 LinkedIn posts, 1 blog/case study, 1 email outreach. Use LTVR brand voice and reference specific products." businessArea="marketing" />
          <AgentTriggerButton agentId="analytics" label="Analyze Campaign" prompt="Analyze our active Learning Time VR marketing campaigns and suggest optimizations. Compare VR Headset Pack messaging vs Tablet Subscription messaging performance. Review LinkedIn engagement, email open rates, and lead conversion. Recommend A/B tests." businessArea="marketing" />
        </div>
      }
    >
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {primaryError && <ErrorState error={primaryError} onRetry={calendarError ? refetchCalendar : refetchCampaigns} />}
      {!primaryError && <>

      {/* Plan Calendar Tab */}
      {tab === 'Plan Calendar' && (
        <div className="space-y-4">
          {/* Plan selector + stats */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} className="px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {activePlan && <StatusBadge status={activePlan.status} />}
            </div>
            {planStats && (
              <div className="flex items-center gap-4 text-xs">
                <span className="text-emerald-400">{planStats.completed} done</span>
                <span className="text-amber-400">{planStats.running} running</span>
                <span className="text-gray-400">{planStats.pending} pending</span>
                <span className="text-red-400">{planStats.failed} failed</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {planStats && (
            <div className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white font-medium">Plan Progress</span>
                <span className="text-sm text-[#2563EB] font-bold">{planStats.progress}%</span>
              </div>
              <ProgressBar value={planStats.progress} color="blue" />
              {planStats.phases.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {planStats.phases.map(p => (
                    <div key={p.phase} className="p-2 bg-navy-700/50 rounded-lg">
                      <p className="text-xs text-gray-400 truncate" title={p.phase}>{p.phase}</p>
                      <p className="text-sm text-white font-medium">{p.completed}/{p.total}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Month navigation */}
          <div className="flex items-center gap-3">
            <button onClick={() => setPlanCalendarMonth((prev) => { const d = new Date(prev.year, prev.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })} className="p-2 text-gray-400 hover:text-white">&larr;</button>
            <h3 className="text-lg font-medium text-white">{planMonthLabel}</h3>
            <button onClick={() => setPlanCalendarMonth((prev) => { const d = new Date(prev.year, prev.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })} className="p-2 text-gray-400 hover:text-white">&rarr;</button>
          </div>

          {/* Calendar grid */}
          <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 border-b border-navy-700">
              {DAYS.map((d) => <div key={d} className="px-2 py-2 text-xs font-medium text-gray-400 text-center">{d}</div>)}
            </div>
            {planCalendarGrid.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-navy-700 last:border-b-0">
                {week.map((day, di) => {
                  const dayEntries = day ? getPlanEntriesForDay(day) : [];
                  return (
                    <div key={di} className={`min-h-[90px] p-1 border-r border-navy-700 last:border-r-0 ${day ? '' : 'bg-navy-900/30'}`}>
                      {day && (
                        <>
                          <span className="text-xs text-gray-500 px-1">{day}</span>
                          <div className="space-y-0.5 mt-0.5">
                            {dayEntries.map((entry) => {
                              const taskState = skillTasks[entry.id];
                              const displayStatus = taskState ? (taskState.status === 'review' ? 'completed' : taskState.status === 'queued' ? 'running' : taskState.status) : entry.status;
                              const colors = ENTRY_STATUS_COLORS[displayStatus] || ENTRY_STATUS_COLORS.pending;
                              return (
                                <div
                                  key={entry.id}
                                  className={`text-xs px-1.5 py-0.5 rounded border cursor-pointer hover:opacity-80 truncate ${colors}`}
                                  onClick={() => setSelectedEntry(entry)}
                                  title={`${entry.skill_name || entry.title_override} (${displayStatus})`}
                                >
                                  {entry.skill_name || entry.title_override}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

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

      {tab === 'Skills & Workflows' && (
        <div className="space-y-8">
          {/* Section A: Skills Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Marketing Skills</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSkillCategoryFilter('')} className={`px-3 py-1 text-xs rounded-full ${!skillCategoryFilter ? 'bg-[#2563EB] text-white' : 'bg-navy-700 text-gray-400 hover:text-white'}`}>All</button>
              {categoryItems.map((cat: any) => (
                <button key={cat.category} onClick={() => setSkillCategoryFilter(cat.category)} className={`px-3 py-1 text-xs rounded-full ${skillCategoryFilter === cat.category ? 'bg-[#2563EB] text-white' : SKILL_CATEGORY_COLORS[cat.category] || 'bg-navy-700 text-gray-400'} hover:opacity-80`}>
                  {cat.category} ({cat.count})
                </button>
              ))}
            </div>
            {skillItems.length === 0 ? <p className="text-gray-500 text-center py-8">No skills found.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillItems.map((skill) => {
                  const taskState = skillTasks[skill.id];
                  const isRunning = taskState && (taskState.status === 'queued' || taskState.status === 'running' || taskState.status === 'streaming');
                  return (
                    <div key={skill.id} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-white flex-1">{skill.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ml-2 whitespace-nowrap ${SKILL_CATEGORY_COLORS[skill.category] || 'bg-navy-700 text-gray-400'}`}>{skill.category}</span>
                      </div>
                      {skill.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{skill.description}</p>}
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="flex items-center gap-3">
                          {renderRelevanceStars(skill.edtech_relevance)}
                          <span className="text-xs text-gray-500">{skill.estimated_duration_minutes}min</span>
                        </div>
                        <button onClick={() => handleExecuteSkill(skill)} disabled={executingSkill === skill.id || !!isRunning} className="px-3 py-1 text-xs bg-[#2563EB] text-white rounded-lg hover:bg-[#2563EB]/80 disabled:opacity-50">
                          {executingSkill === skill.id ? 'Starting...' : isRunning ? 'Running...' : 'Run Skill'}
                        </button>
                      </div>
                      {renderSkillTaskStatus(skill.id)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: Workflows */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Workflow Templates</h3>
            {workflowItems.length === 0 ? <p className="text-gray-500 text-center py-8">No workflows available.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflowItems.map((wf) => (
                  <div key={wf.id} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-white">{wf.name}</h4>
                      {wf.category && <span className="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-gray-400 ml-2">{wf.category}</span>}
                    </div>
                    {wf.description && <p className="text-xs text-gray-400 mb-3">{wf.description}</p>}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{wf.step_count} steps</span>
                        <span>{wf.estimated_total_minutes}min total</span>
                      </div>
                      <button onClick={() => handleStartWorkflow(wf)} disabled={startingWorkflow === wf.id} className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-600/80 disabled:opacity-50">
                        {startingWorkflow === wf.id ? 'Starting...' : 'Start Workflow'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Workflow Runs */}
          {runItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Workflow Runs</h3>
              <div className="space-y-3">
                {runItems.map((run) => (
                  <div key={run.id} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-white">{run.workflow_name}</h4>
                        <span className="text-xs text-gray-500">Started {run.created_at?.slice(0, 10)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={run.status} />
                        {(run.status === 'running' || run.status === 'paused') && (
                          <>
                            <button onClick={() => handleAdvanceRun(run.id)} className="px-3 py-1 text-xs bg-[#2563EB] text-white rounded-lg hover:bg-[#2563EB]/80">Advance</button>
                            <button onClick={() => handleCancelRun(run.id)} className="px-3 py-1 text-xs bg-red-600/80 text-white rounded-lg hover:bg-red-600">Cancel</button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: run.total_steps }, (_, i) => {
                        const stepNum = i + 1;
                        const isCompleted = stepNum < run.current_step;
                        const isCurrent = stepNum === run.current_step && run.status === 'running';
                        return (
                          <div key={i} className="flex items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-[#2563EB] text-white ring-2 ring-[#2563EB]/30' : 'bg-navy-700 text-gray-500'}`}>
                              {isCompleted ? '\u2713' : stepNum}
                            </div>
                            {i < run.total_steps - 1 && <div className={`w-4 h-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-navy-700'}`} />}
                          </div>
                        );
                      })}
                      <span className="text-xs text-gray-500 ml-2">Step {run.current_step}/{run.total_steps}</span>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="flex items-center justify-between mb-3"><h4 className="text-sm font-medium text-white">{obj.title}</h4><StatusBadge status={obj.status} /></div>
              <ProgressBar value={obj.progress} color="blue" />
              <div className="mt-3 space-y-2">{goalItems.filter(kr => kr.parent_id === obj.id).map((kr) => (
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

      {/* Content Modal */}
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

      {/* Article Modal */}
      <Modal isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} title={selectedArticle?.title || ''}>
        <div className="prose prose-invert prose-sm max-w-none">
          <div className="text-sm text-gray-300 whitespace-pre-wrap">{selectedArticle?.content}</div>
        </div>
      </Modal>

      {/* Plan Calendar Entry Detail Modal */}
      <Modal isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} title={selectedEntry?.skill_name || selectedEntry?.title_override || 'Entry Details'}>
        {selectedEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-gray-500">Scheduled</p><p className="text-sm text-white">{selectedEntry.scheduled_date?.slice(0, 10)}</p></div>
              <div><p className="text-xs text-gray-500">Status</p><StatusBadge status={selectedEntry.status} /></div>
              <div><p className="text-xs text-gray-500">Phase</p><p className="text-sm text-white">{selectedEntry.phase || '-'}</p></div>
              <div><p className="text-xs text-gray-500">Category</p><p className="text-sm text-white">{selectedEntry.skill_category || '-'}</p></div>
              <div><p className="text-xs text-gray-500">Duration</p><p className="text-sm text-white">{selectedEntry.skill_duration_minutes || '-'} min</p></div>
              <div><p className="text-xs text-gray-500">Priority</p><p className="text-sm text-white">{selectedEntry.priority}/5</p></div>
            </div>
            {selectedEntry.skill_description && <p className="text-xs text-gray-400">{selectedEntry.skill_description}</p>}
            {selectedEntry.notes && <div><p className="text-xs text-gray-500">Notes</p><p className="text-sm text-gray-300">{selectedEntry.notes}</p></div>}
            {selectedEntry.result_summary && (
              <div>
                <p className="text-xs text-gray-500">Result</p>
                <div className="text-sm text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto bg-navy-700/50 p-2 rounded">{selectedEntry.result_summary.slice(0, 500)}</div>
              </div>
            )}
            {renderSkillTaskStatus(selectedEntry.id)}
            <div className="flex justify-end gap-3 pt-2">
              {(selectedEntry.status === 'pending' || selectedEntry.status === 'scheduled') && (
                <>
                  <button onClick={() => handleSkipEntry(selectedEntry)} className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-navy-700 rounded-lg">Skip</button>
                  <button onClick={() => handleExecuteEntry(selectedEntry)} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">Run Skill</button>
                </>
              )}
              {selectedEntry.status === 'failed' && (
                <button onClick={() => handleExecuteEntry(selectedEntry)} className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-600/80">Retry</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </PageShell>
  );
}
