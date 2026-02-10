import { useState, useEffect, useCallback } from 'react';
import { Download, DollarSign, Target, Users, TrendingUp, BarChart3, Activity, Eye } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import TabBar from '../components/shared/TabBar';
import KPICard from '../components/shared/KPICard';
import Chart from '../components/shared/Chart';
import DataTable, { Column } from '../components/shared/DataTable';
import ProgressBar from '../components/shared/ProgressBar';
import ErrorState from '../components/shared/ErrorState';
import { useToast } from '../context/ToastContext';
import { marketingDashboard } from '../api/endpoints';

const TABS = ['Overview', 'Campaign Analytics', 'Content Performance', 'LinkedIn Analytics', 'Forecast & Targets'];
const TAB_SECTIONS = ['overview', 'campaigns', 'content', 'linkedin', 'forecast'];

const PRESETS: { label: string; key: string; getDates: () => { start: string; end: string } }[] = [
  { label: 'Last 7d', key: '7d', getDates: () => ({ start: daysAgo(7), end: today() }) },
  { label: 'Last 30d', key: '30d', getDates: () => ({ start: daysAgo(30), end: today() }) },
  { label: 'Last 90d', key: '90d', getDates: () => ({ start: daysAgo(90), end: today() }) },
  { label: 'This Quarter', key: 'quarter', getDates: () => ({ start: quarterStart(), end: today() }) },
  { label: 'YTD', key: 'ytd', getDates: () => ({ start: `${new Date().getFullYear()}-01-01`, end: today() }) },
  { label: 'All Time', key: 'all', getDates: () => ({ start: '', end: '' }) },
];

function today() { return new Date().toISOString().slice(0, 10); }
function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
function quarterStart() { const d = new Date(); const q = Math.floor(d.getMonth() / 3) * 3; return new Date(d.getFullYear(), q, 1).toISOString().slice(0, 10); }
function fmt$(v: number) { return v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${Math.round(v)}`; }
function fmtPct(v: number) { return `${v.toFixed(1)}%`; }
function fmtNum(v: number) { return v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(Math.round(v)); }

export default function MarketingDashboard() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string; preset: string }>({ start: '', end: '', preset: 'all' });
  const { showToast } = useToast();

  const dateParams = dateRange.start && dateRange.end
    ? { start_date: dateRange.start, end_date: dateRange.end }
    : undefined;

  function handlePreset(p: typeof PRESETS[0]) {
    const { start, end } = p.getDates();
    setDateRange({ start, end, preset: p.key });
  }

  async function handleExport() {
    const idx = TABS.indexOf(activeTab);
    const section = TAB_SECTIONS[idx];
    try {
      const res = await marketingDashboard.exportCSV(section, dateParams);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marketing-${section}-${today()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export downloaded', 'success');
    } catch {
      showToast('Export failed', 'error');
    }
  }

  const dateFilter = (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {PRESETS.map((p) => (
        <button
          key={p.key}
          onClick={() => handlePreset(p)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            dateRange.preset === p.key
              ? 'bg-[#2563EB]/20 text-[#2563EB] border-[#2563EB]/50'
              : 'bg-navy-800/60 text-gray-400 border-navy-700/50 hover:text-white'
          }`}
        >
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-2 ml-2">
        <span className="text-xs text-gray-500">From:</span>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ start: e.target.value, end: dateRange.end, preset: 'custom' })}
          className="bg-navy-800 border border-navy-700 text-white rounded-lg px-3 py-1.5 text-sm"
        />
        <span className="text-xs text-gray-500">To:</span>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ start: dateRange.start, end: e.target.value, preset: 'custom' })}
          className="bg-navy-800 border border-navy-700 text-white rounded-lg px-3 py-1.5 text-sm"
        />
      </div>
    </div>
  );

  return (
    <PageShell
      title="Marketing Dashboard"
      subtitle="Campaign analytics, content performance & LinkedIn insights"
      actions={
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB]/80 transition-colors">
          <Download size={16} />
          Export CSV
        </button>
      }
    >
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      {dateFilter}
      {activeTab === TABS[0] && <OverviewTab dateParams={dateParams} />}
      {activeTab === TABS[1] && <CampaignTab dateParams={dateParams} />}
      {activeTab === TABS[2] && <ContentTab dateParams={dateParams} />}
      {activeTab === TABS[3] && <LinkedInTab dateParams={dateParams} />}
      {activeTab === TABS[4] && <ForecastTab />}
    </PageShell>
  );
}

// ─── Overview Tab ────────────────────────────────────────────
function OverviewTab({ dateParams }: { dateParams?: { start_date: string; end_date: string } }) {
  const [data, setData] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ovRes, cpRes] = await Promise.all([
        marketingDashboard.getOverview(dateParams),
        marketingDashboard.getCampaigns(dateParams),
      ]);
      setData(ovRes.data.data);
      setCampaigns(cpRes.data.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  }, [dateParams?.start_date, dateParams?.end_date]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!data) return null;

  const channelChart = (campaigns?.byChannel || []).map((c: any) => ({
    name: c.channel,
    Spent: parseFloat(c.spent),
    Leads: parseInt(c.leads),
  }));

  const contentPipeline = data.contentPipeline || {};
  const pipelineChart = Object.entries(contentPipeline).map(([status, count]) => ({
    name: status,
    value: count as number,
  }));

  const campaignColumns: Column<any>[] = [
    { key: 'name', label: 'Campaign', sortable: true },
    { key: 'channel', label: 'Channel', sortable: true },
    { key: 'spent', label: 'Spent', sortable: true, render: (r) => fmt$(parseFloat(r.spent)) },
    { key: 'leads_generated', label: 'Leads', sortable: true },
    { key: 'conversions', label: 'Conv.', sortable: true },
    { key: 'ctr', label: 'CTR', render: (r) => `${parseFloat(r.ctr).toFixed(2)}%` },
    { key: 'cost_per_lead', label: 'CPL', render: (r) => fmt$(parseFloat(r.cost_per_lead)) },
    { key: 'roas', label: 'ROAS', render: (r) => `${parseFloat(r.roas).toFixed(2)}` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Leads" value={fmtNum(data.totalLeads)} icon={Users} />
        <KPICard label="Conversions" value={fmtNum(data.totalConversions)} icon={Target} />
        <KPICard label="Cost Per Lead" value={fmt$(data.costPerLead)} icon={DollarSign} />
        <KPICard label="LinkedIn Eng. Rate" value={fmtPct(data.linkedinEngagementRate)} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Campaign Performance by Channel">
          {channelChart.length > 0
            ? <Chart type="bar" data={channelChart} config={{ xKey: 'name', dataKeys: [
                { key: 'Spent', label: 'Spent', color: '#2563EB' },
                { key: 'Leads', label: 'Leads', color: '#0D9488' },
              ], showLegend: true }} />
            : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Content Pipeline Status">
          {pipelineChart.length > 0
            ? <Chart type="pie" data={pipelineChart} config={{ dataKeys: [{ key: 'value' }], showLegend: true }} />
            : <EmptyChart />}
        </ChartCard>
      </div>

      <ChartCard title="Campaign ROI">
        <DataTable columns={campaignColumns} data={campaigns?.campaigns || []} pagination pageSize={10} searchable emptyMessage="No campaigns found" />
      </ChartCard>
    </div>
  );
}

// ─── Campaign Tab ────────────────────────────────────────────
function CampaignTab({ dateParams }: { dateParams?: { start_date: string; end_date: string } }) {
  const [data, setData] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cpRes, ovRes] = await Promise.all([
        marketingDashboard.getCampaigns(dateParams),
        marketingDashboard.getOverview(dateParams),
      ]);
      setData(cpRes.data.data);
      setOverview(ovRes.data.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [dateParams?.start_date, dateParams?.end_date]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!data || !overview) return null;

  const budgetRemaining = overview.totalBudget - overview.totalSpent;

  const budgetChart = (data.campaigns || []).slice(0, 10).map((c: any) => ({
    name: c.name.length > 20 ? c.name.slice(0, 20) + '...' : c.name,
    Budget: parseFloat(c.budget),
    Spent: parseFloat(c.spent),
  }));

  const channelPie = (data.byChannel || []).map((c: any) => ({
    name: c.channel,
    value: parseInt(c.leads),
  }));

  const campaignColumns: Column<any>[] = [
    { key: 'name', label: 'Campaign', sortable: true },
    { key: 'channel', label: 'Channel', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <span className="capitalize">{r.status}</span> },
    { key: 'budget', label: 'Budget', sortable: true, render: (r) => fmt$(parseFloat(r.budget)) },
    { key: 'spent', label: 'Spent', sortable: true, render: (r) => fmt$(parseFloat(r.spent)) },
    { key: 'leads_generated', label: 'Leads', sortable: true },
    { key: 'conversions', label: 'Conv.', sortable: true },
    { key: 'ctr', label: 'CTR', render: (r) => `${parseFloat(r.ctr).toFixed(2)}%` },
    { key: 'cost_per_lead', label: 'CPL', render: (r) => fmt$(parseFloat(r.cost_per_lead)) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Budget" value={fmt$(overview.totalBudget)} icon={DollarSign} />
        <KPICard label="Total Spent" value={fmt$(overview.totalSpent)} icon={BarChart3} />
        <KPICard label="Budget Remaining" value={fmt$(budgetRemaining)} icon={TrendingUp} />
        <KPICard label="Active Campaigns" value={String(overview.activeCampaigns)} icon={Activity} />
      </div>

      <ChartCard title="Budget vs Spent per Campaign">
        {budgetChart.length > 0
          ? <Chart type="bar" data={budgetChart} config={{ xKey: 'name', dataKeys: [
              { key: 'Budget', label: 'Budget', color: '#2563EB' },
              { key: 'Spent', label: 'Spent', color: '#0D9488' },
            ], showLegend: true }} />
          : <EmptyChart />}
      </ChartCard>

      <ChartCard title="Leads by Channel">
        {channelPie.length > 0
          ? <Chart type="pie" data={channelPie} config={{ dataKeys: [{ key: 'value' }], showLegend: true }} />
          : <EmptyChart />}
      </ChartCard>

      <ChartCard title="All Campaigns">
        <DataTable columns={campaignColumns} data={data.campaigns || []} searchable pagination pageSize={10} emptyMessage="No campaigns found" />
      </ChartCard>
    </div>
  );
}

// ─── Content Tab ─────────────────────────────────────────────
function ContentTab({ dateParams }: { dateParams?: { start_date: string; end_date: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await marketingDashboard.getContent(dateParams);
      setData(res.data.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [dateParams?.start_date, dateParams?.end_date]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!data) return null;

  // Aggregate by type
  const typeMap: Record<string, number> = {};
  let totalItems = 0;
  let publishedCount = 0;
  (data.byTypeStatus || []).forEach((r: any) => {
    const count = parseInt(r.count);
    totalItems += count;
    if (r.status === 'published') publishedCount += count;
    typeMap[r.content_type] = (typeMap[r.content_type] || 0) + count;
  });
  const typeChart = Object.entries(typeMap).map(([type, count]) => ({ name: type, value: count }));

  const cadenceChart = (data.cadence || []).map((c: any) => ({
    name: c.week.slice(5),
    Total: parseInt(c.total),
    Published: parseInt(c.published),
  }));

  const pillarChart = (data.byPillar || []).map((p: any) => ({
    name: p.pillar,
    value: parseInt(p.count),
  }));

  const publishingRate = totalItems > 0 ? (publishedCount / totalItems * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Total Content Items" value={String(totalItems)} icon={BarChart3} />
        <KPICard label="Published" value={String(publishedCount)} icon={Eye} />
        <KPICard label="Publishing Rate" value={fmtPct(publishingRate)} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Content by Type">
          {typeChart.length > 0
            ? <Chart type="pie" data={typeChart} config={{ dataKeys: [{ key: 'value' }], showLegend: true }} />
            : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Publishing Cadence (Weekly)">
          {cadenceChart.length > 0
            ? <Chart type="line" data={cadenceChart} config={{ xKey: 'name', dataKeys: [
                { key: 'Total', label: 'Total', color: '#2563EB' },
                { key: 'Published', label: 'Published', color: '#10B981' },
              ], showLegend: true }} />
            : <EmptyChart />}
        </ChartCard>
      </div>

      <ChartCard title="Content by Pillar">
        {pillarChart.length > 0
          ? <Chart type="bar" data={pillarChart} config={{ xKey: 'name', dataKeys: [{ key: 'value', label: 'Items', color: '#2563EB' }] }} />
          : <EmptyChart />}
      </ChartCard>
    </div>
  );
}

// ─── LinkedIn Tab ────────────────────────────────────────────
function LinkedInTab({ dateParams }: { dateParams?: { start_date: string; end_date: string } }) {
  const [data, setData] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [liRes, ovRes] = await Promise.all([
        marketingDashboard.getLinkedIn(dateParams),
        marketingDashboard.getOverview(dateParams),
      ]);
      setData(liRes.data.data);
      setOverview(ovRes.data.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load LinkedIn data');
    } finally {
      setLoading(false);
    }
  }, [dateParams?.start_date, dateParams?.end_date]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!data || !overview) return null;

  const trendChart = (data.weeklyTrend || []).map((w: any) => ({
    name: w.week.slice(5),
    Impressions: parseInt(w.impressions),
    Engagements: parseInt(w.engagements),
    Clicks: parseInt(w.clicks),
  }));

  const postColumns: Column<any>[] = [
    { key: 'excerpt', label: 'Post', render: (r) => <span className="text-xs">{r.excerpt}...</span> },
    { key: 'published_time', label: 'Published', render: (r) => r.published_time?.slice(0, 10) || '-' },
    { key: 'impressions', label: 'Impr.', sortable: true },
    { key: 'engagements', label: 'Eng.', sortable: true },
    { key: 'clicks', label: 'Clicks', sortable: true },
    { key: 'shares', label: 'Shares', sortable: true },
    { key: 'engagement_rate', label: 'Rate', render: (r) => `${parseFloat(r.engagement_rate).toFixed(2)}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Impressions" value={fmtNum(overview.linkedinImpressions)} icon={Eye} />
        <KPICard label="Total Engagements" value={fmtNum(data.weeklyTrend?.reduce((s: number, w: any) => s + parseInt(w.engagements), 0) || 0)} icon={Activity} />
        <KPICard label="Engagement Rate" value={fmtPct(overview.linkedinEngagementRate)} icon={TrendingUp} />
        <KPICard label="Published Posts" value={String(overview.publishedPosts)} icon={BarChart3} />
      </div>

      <ChartCard title="LinkedIn Engagement Trend">
        {trendChart.length > 0
          ? <Chart type="area" data={trendChart} config={{ xKey: 'name', dataKeys: [
              { key: 'Impressions', label: 'Impressions', color: '#2563EB' },
              { key: 'Engagements', label: 'Engagements', color: '#0D9488' },
              { key: 'Clicks', label: 'Clicks', color: '#F59E0B' },
            ], showLegend: true }} />
          : <EmptyChart />}
      </ChartCard>

      <ChartCard title="Top Posts by Engagement">
        <DataTable columns={postColumns} data={data.topPosts || []} pagination pageSize={10} emptyMessage="No posts found" />
      </ChartCard>
    </div>
  );
}

// ─── Forecast Tab ────────────────────────────────────────────
function ForecastTab() {
  const [data, setData] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [fcRes, ovRes] = await Promise.all([
        marketingDashboard.getForecast(),
        marketingDashboard.getOverview(),
      ]);
      setData(fcRes.data.data);
      setOverview(ovRes.data.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load forecast');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!data) return null;

  const skillRate = overview?.totalSkills > 0
    ? (overview.completedSkills / overview.totalSkills * 100)
    : 0;

  // Group forecasts by scenario for chart
  const forecastByPeriod: Record<string, Record<string, number>> = {};
  (data.forecasts || []).forEach((f: any) => {
    if (!forecastByPeriod[f.period]) forecastByPeriod[f.period] = {};
    forecastByPeriod[f.period][f.scenario] = parseFloat(f.projected_value || 0);
  });
  const forecastChart = Object.entries(forecastByPeriod).sort(([a], [b]) => a.localeCompare(b)).map(([period, vals]) => ({
    name: period,
    Conservative: vals.conservative || 0,
    Baseline: vals.baseline || 0,
    Optimistic: vals.optimistic || 0,
  }));

  const budgetChart = (data.budgetTrend || []).map((b: any) => ({
    name: b.month,
    Budget: parseFloat(b.budget),
    Spent: parseFloat(b.spent),
  }));

  return (
    <div className="space-y-6">
      <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Marketing Skill Completion</span>
          <span className="text-sm text-white font-semibold">{overview?.completedSkills || 0} / {overview?.totalSkills || 0}</span>
        </div>
        <ProgressBar value={overview?.completedSkills || 0} max={overview?.totalSkills || 1} showPercentage color="teal" size="lg" />
      </div>

      <ChartCard title="Marketing Forecast">
        {forecastChart.length > 0
          ? <Chart type="line" data={forecastChart} config={{ xKey: 'name', dataKeys: [
              { key: 'Optimistic', label: 'Optimistic', color: '#10B981' },
              { key: 'Baseline', label: 'Baseline', color: '#2563EB' },
              { key: 'Conservative', label: 'Conservative', color: '#F59E0B' },
            ], showLegend: true }} />
          : <EmptyChart />}
      </ChartCard>

      <ChartCard title="Budget Utilization Over Time">
        {budgetChart.length > 0
          ? <Chart type="area" data={budgetChart} config={{ xKey: 'name', dataKeys: [
              { key: 'Budget', label: 'Budget', color: '#2563EB' },
              { key: 'Spent', label: 'Spent', color: '#0D9488' },
            ], showLegend: true }} />
          : <EmptyChart />}
      </ChartCard>
    </div>
  );
}

// ─── Shared Helpers ──────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <svg className="w-8 h-8 animate-spin text-[#2563EB]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

function EmptyChart() {
  return <p className="text-center text-gray-500 text-sm py-12">No data available</p>;
}
