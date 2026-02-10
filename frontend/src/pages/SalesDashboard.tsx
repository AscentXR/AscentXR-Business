import { useState, useEffect, useCallback } from 'react';
import { Download, DollarSign, Target, Users, MessageSquare, BarChart3, TrendingUp, Activity } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import TabBar from '../components/shared/TabBar';
import KPICard from '../components/shared/KPICard';
import Chart from '../components/shared/Chart';
import DataTable, { Column } from '../components/shared/DataTable';
import ProgressBar from '../components/shared/ProgressBar';
import ErrorState from '../components/shared/ErrorState';
import { useToast } from '../context/ToastContext';
import { salesDashboard } from '../api/endpoints';

const TABS = ['Overview', 'Pipeline Analytics', 'District Performance', 'Activity Analytics', 'Forecast & Targets'];
const TAB_SECTIONS = ['overview', 'pipeline', 'districts', 'activity', 'forecast'];

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

export default function SalesDashboard() {
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
      const res = await salesDashboard.exportCSV(section, dateParams);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-${section}-${today()}.csv`;
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
      title="Sales Dashboard"
      subtitle="Pipeline analytics, district performance & forecasting"
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
      {activeTab === TABS[1] && <PipelineTab dateParams={dateParams} />}
      {activeTab === TABS[2] && <DistrictTab />}
      {activeTab === TABS[3] && <ActivityTab dateParams={dateParams} />}
      {activeTab === TABS[4] && <ForecastTab />}
    </PageShell>
  );
}

// ─── Overview Tab ────────────────────────────────────────────
function OverviewTab({ dateParams }: { dateParams?: { start_date: string; end_date: string } }) {
  const [data, setData] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ovRes, plRes, fcRes] = await Promise.all([
        salesDashboard.getOverview(dateParams),
        salesDashboard.getPipeline(dateParams),
        salesDashboard.getForecast(),
      ]);
      setData(ovRes.data.data);
      setPipeline(plRes.data.data);
      setForecast(fcRes.data.data);
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

  const stageChart = (pipeline?.stages || []).map((s: any) => ({
    name: formatStage(s.stage),
    value: parseFloat(s.total_value),
    deals: parseInt(s.deal_count),
  }));

  const forecastChart = (forecast?.forecast || []).map((f: any) => ({
    name: f.month,
    Projected: f.projected,
    Optimistic: f.optimistic,
    Conservative: f.conservative,
  }));

  const topDealsColumns: Column<any>[] = [
    { key: 'district', label: 'District', sortable: true },
    { key: 'stage', label: 'Stage', render: (r) => <span className="capitalize">{formatStage(r.stage)}</span> },
    { key: 'value', label: 'Value', sortable: true, render: (r) => fmt$(parseFloat(r.value)) },
    { key: 'probability', label: 'Prob.', render: (r) => `${r.probability}%` },
    { key: 'weighted', label: 'Weighted', sortable: true, render: (r) => fmt$(parseFloat(r.weighted)) },
    { key: 'next_action_date', label: 'Next Action', render: (r) => r.next_action_date?.slice(0, 10) || '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Pipeline" value={fmt$(data.totalPipeline)} icon={DollarSign} />
        <KPICard label="Weighted Pipeline" value={fmt$(data.weightedPipeline)} icon={BarChart3} />
        <KPICard label="Win Rate" value={fmtPct(data.winRate)} icon={Target} />
        <KPICard label="Avg Deal Size" value={fmt$(data.avgDealSize)} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Pipeline by Stage">
          {stageChart.length > 0
            ? <Chart type="bar" data={stageChart} config={{ xKey: 'name', dataKeys: [{ key: 'value', label: 'Value', color: '#2563EB' }] }} />
            : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Revenue Forecast (12mo)">
          {forecastChart.length > 0
            ? <Chart type="area" data={forecastChart} config={{ xKey: 'name', dataKeys: [
                { key: 'Optimistic', label: 'Optimistic', color: '#10B981' },
                { key: 'Projected', label: 'Projected', color: '#2563EB' },
                { key: 'Conservative', label: 'Conservative', color: '#F59E0B' },
              ], showLegend: true }} />
            : <EmptyChart />}
        </ChartCard>
      </div>

      <ChartCard title="Top Deals">
        <DataTable columns={topDealsColumns} data={pipeline?.topDeals || []} pagination pageSize={10} emptyMessage="No deals found" />
      </ChartCard>
    </div>
  );
}

// ─── Pipeline Tab ────────────────────────────────────────────
function PipelineTab({ dateParams }: { dateParams?: { start_date: string; end_date: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await salesDashboard.getPipeline(dateParams);
      setData(res.data.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  }, [dateParams?.start_date, dateParams?.end_date]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!data) return null;

  const stages = (data.stages || []).map((s: any) => ({
    name: formatStage(s.stage),
    deals: parseInt(s.deal_count),
    value: parseFloat(s.total_value),
    weighted: parseFloat(s.weighted_value),
  }));

  const trend = (data.trend || []).map((t: any) => ({
    name: t.month,
    'New Deals': parseInt(t.new_deals),
    'New Value': parseFloat(t.new_value),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {(data.stages || []).map((s: any) => (
          <div key={s.stage} className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-400 capitalize">{formatStage(s.stage)}</p>
            <p className="text-lg font-bold text-white mt-1">{s.deal_count} deals</p>
            <p className="text-sm text-gray-400">{fmt$(parseFloat(s.total_value))}</p>
          </div>
        ))}
      </div>

      <ChartCard title="Pipeline by Stage">
        {stages.length > 0
          ? <Chart type="bar" data={stages} config={{ xKey: 'name', dataKeys: [
              { key: 'value', label: 'Total Value', color: '#2563EB' },
              { key: 'weighted', label: 'Weighted', color: '#0D9488' },
            ], showLegend: true }} />
          : <EmptyChart />}
      </ChartCard>

      <ChartCard title="Pipeline Trend Over Time">
        {trend.length > 0
          ? <Chart type="line" data={trend} config={{ xKey: 'name', dataKeys: [
              { key: 'New Deals', label: 'New Deals', color: '#2563EB' },
            ], showLegend: true }} />
          : <EmptyChart />}
      </ChartCard>
    </div>
  );
}

// ─── District Tab ────────────────────────────────────────────
function DistrictTab() {
  const [data, setData] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [distRes, ovRes] = await Promise.all([
        salesDashboard.getDistricts(),
        salesDashboard.getOverview(),
      ]);
      setData(distRes.data.data);
      setOverview(ovRes.data.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load districts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!data) return null;

  const byState = (data.byState || []).map((s: any) => ({
    name: s.state,
    value: parseFloat(s.total_value),
    districts: parseInt(s.district_count),
  }));

  const byBudget = (data.byBudget || []).map((b: any) => ({
    name: b.budget_range || 'Unknown',
    value: parseFloat(b.total_value),
  }));

  const districtColumns: Column<any>[] = [
    { key: 'name', label: 'District', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    { key: 'budget_range', label: 'Budget', sortable: true },
    { key: 'tech_readiness_score', label: 'Tech Score', sortable: true, render: (r) => r.tech_readiness_score?.toFixed(1) || '-' },
    { key: 'opportunity_value', label: 'Opp. Value', sortable: true, render: (r) => fmt$(parseFloat(r.opportunity_value || 0)) },
    { key: 'probability', label: 'Prob.', render: (r) => `${r.probability || 0}%` },
    { key: 'stage', label: 'Stage', render: (r) => r.stage ? <span className="capitalize">{formatStage(r.stage)}</span> : '-' },
    { key: 'teacher_adoption_rate', label: 'Adoption', sortable: true, render: (r) => r.teacher_adoption_rate ? `${parseFloat(r.teacher_adoption_rate).toFixed(1)}%` : '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Active Districts" value={String(overview?.activeDistricts ?? 0)} icon={Users} />
        <KPICard label="Avg Tech Readiness" value={byState.length > 0 ? (data.byState.reduce((a: number, s: any) => a + parseFloat(s.avg_tech_score || 0), 0) / data.byState.length).toFixed(1) : '0'} icon={Activity} />
        <KPICard label="Avg Adoption Rate" value={fmtPct(overview?.avgAdoption ?? 0)} icon={Target} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Pipeline by State">
          {byState.length > 0
            ? <Chart type="bar" data={byState.slice(0, 10)} config={{ xKey: 'name', dataKeys: [{ key: 'value', label: 'Total Value', color: '#2563EB' }] }} />
            : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Pipeline by Budget Range">
          {byBudget.length > 0
            ? <Chart type="pie" data={byBudget} config={{ dataKeys: [{ key: 'value' }], showLegend: true }} />
            : <EmptyChart />}
        </ChartCard>
      </div>

      <ChartCard title="Top Districts">
        <DataTable columns={districtColumns} data={data.topDistricts || []} searchable pagination pageSize={10} emptyMessage="No district data" />
      </ChartCard>
    </div>
  );
}

// ─── Activity Tab ────────────────────────────────────────────
function ActivityTab({ dateParams }: { dateParams?: { start_date: string; end_date: string } }) {
  const [data, setData] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [actRes, ovRes] = await Promise.all([
        salesDashboard.getActivity(dateParams),
        salesDashboard.getOverview(dateParams),
      ]);
      setData(actRes.data.data);
      setOverview(ovRes.data.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [dateParams?.start_date, dateParams?.end_date]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!data) return null;

  // Pivot weekly activity into stacked data
  const weekMap: Record<string, Record<string, number>> = {};
  (data.weeklyActivity || []).forEach((r: any) => {
    if (!weekMap[r.week]) weekMap[r.week] = {};
    weekMap[r.week][r.type] = parseInt(r.count);
  });
  const commTypes = [...new Set((data.weeklyActivity || []).map((r: any) => r.type))];
  const weeklyChart = Object.entries(weekMap).sort(([a], [b]) => a.localeCompare(b)).map(([week, types]) => ({
    name: week.slice(5),
    ...types,
  }));

  const followUps = data.followUps || { overdue: 0, upcoming: 0 };
  const followUpChart = [
    { name: 'Overdue', value: parseInt(followUps.overdue) || 0 },
    { name: 'Upcoming (7d)', value: parseInt(followUps.upcoming) || 0 },
  ];

  const skillRate = overview?.totalSkills > 0
    ? (overview.completedSkills / overview.totalSkills * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Communications (30d)" value={String(overview?.communicationsLast30 ?? 0)} change={overview?.communicationsTrend} icon={MessageSquare} />
        <KPICard label="Overdue Follow-ups" value={String(parseInt(followUps.overdue) || 0)} icon={Activity} />
        <KPICard label="Skill Completion" value={fmtPct(skillRate)} icon={Target} />
      </div>

      <ChartCard title="Communication Trend by Type">
        {weeklyChart.length > 0
          ? <Chart type="area" data={weeklyChart} config={{
              xKey: 'name',
              dataKeys: (commTypes as string[]).map((t, i) => ({ key: t, label: t, color: ['#2563EB', '#0D9488', '#F59E0B', '#EF4444', '#06B6D4'][i % 5] })),
              stacked: true,
              showLegend: true,
            }} />
          : <EmptyChart />}
      </ChartCard>

      <ChartCard title="Follow-up Compliance">
        {followUpChart.some(f => f.value > 0)
          ? <Chart type="bar" data={followUpChart} config={{ xKey: 'name', dataKeys: [{ key: 'value', label: 'Count', color: '#2563EB' }], height: 200 }} />
          : <EmptyChart />}
      </ChartCard>
    </div>
  );
}

// ─── Forecast Tab ────────────────────────────────────────────
function ForecastTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await salesDashboard.getForecast();
      setData(res.data.data);
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

  const forecastChart = (data.forecast || []).map((f: any) => ({
    name: f.month,
    Projected: f.projected,
    Optimistic: f.optimistic,
    Conservative: f.conservative,
  }));

  const totalProjected = (data.forecast || []).reduce((s: number, f: any) => s + f.projected, 0);
  const targetRevenue = 300000;

  const forecastColumns: Column<any>[] = [
    { key: 'month', label: 'Month', sortable: true },
    { key: 'conservative', label: 'Conservative', render: (r) => fmt$(r.conservative) },
    { key: 'projected', label: 'Projected', render: (r) => fmt$(r.projected) },
    { key: 'optimistic', label: 'Optimistic', render: (r) => fmt$(r.optimistic) },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Revenue Target Progress</span>
          <span className="text-sm text-white font-semibold">{fmt$(totalProjected)} / {fmt$(targetRevenue)}</span>
        </div>
        <ProgressBar value={totalProjected} max={targetRevenue} showPercentage color="blue" size="lg" />
      </div>

      <ChartCard title="12-Month Revenue Forecast">
        {forecastChart.length > 0
          ? <Chart type="area" data={forecastChart} config={{ xKey: 'name', dataKeys: [
              { key: 'Optimistic', label: 'Optimistic', color: '#10B981' },
              { key: 'Projected', label: 'Projected', color: '#2563EB' },
              { key: 'Conservative', label: 'Conservative', color: '#F59E0B' },
            ], showLegend: true }} />
          : <EmptyChart />}
      </ChartCard>

      <ChartCard title="Monthly Breakdown">
        <DataTable columns={forecastColumns} data={data.forecast || []} pagination pageSize={12} emptyMessage="No forecast data" />
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

function formatStage(stage: string) {
  return (stage || '').replace(/_/g, ' ');
}
