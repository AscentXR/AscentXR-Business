import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Briefcase, Cpu, ClipboardCheck, AlertCircle, PlayCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageShell from '../components/layout/PageShell';
import KPICard from '../components/shared/KPICard';
import ProgressBar from '../components/shared/ProgressBar';
import StatusBadge from '../components/shared/StatusBadge';
import ErrorState from '../components/shared/ErrorState';
import { metrics, goals, agents, notifications, agentTeams } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { useWebSocket } from '../hooks/useWebSocket';
import type { Goal, AgentTask, Notification, DailyBriefing } from '../types';

interface DashboardMetrics {
  revenue: number;
  revenueTarget: number;
  pipelineValue: number;
  activeDeals: number;
  activeAgents: number;
  revenueHistory: { month: string; value: number }[];
}

interface ActivityItem {
  id: string;
  agent: string;
  action: string;
  timestamp: string;
}

export default function CommandCenter() {
  const [dashMetrics, setDashMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [systemHealth, setSystemHealth] = useState({ api: 'checking', ws: 'checking' });

  const { connected, subscribe } = useWebSocket();

  const { data: goalsData, loading: goalsLoading } = useApi<Goal[]>(
    () => goals.list({ quarter: 'Q1_2026' }),
    []
  );

  const { data: tasksData, loading: tasksLoading } = useApi<AgentTask[]>(
    () => agents.getTasks({ status: 'running' }),
    []
  );

  const { data: alertsData, loading: alertsLoading } = useApi<Notification[]>(
    () => notifications.list({ is_read: false }),
    []
  );

  const { data: briefingData, loading: briefingLoading } = useApi<DailyBriefing>(
    () => agentTeams.getDailyBriefing(),
    []
  );

  // Load metrics
  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const resp = await metrics.all();
      const d = resp.data.data || resp.data;
      setDashMetrics({
        revenue: d.revenue ?? 0,
        revenueTarget: d.revenueTarget ?? 300000,
        pipelineValue: d.pipelineValue ?? 0,
        activeDeals: d.activeDeals ?? 0,
        activeAgents: d.activeAgents ?? 0,
        revenueHistory: d.revenueHistory ?? [],
      });
    } catch {
      setMetricsError('Failed to load metrics. Please check your connection and try again.');
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // System health check
  useEffect(() => {
    fetch('/api/health')
      .then((r) =>
        r.ok
          ? setSystemHealth((h) => ({ ...h, api: 'healthy' }))
          : setSystemHealth((h) => ({ ...h, api: 'error' }))
      )
      .catch(() => setSystemHealth((h) => ({ ...h, api: 'error' })));
  }, []);

  // WebSocket health tracks connection status
  useEffect(() => {
    setSystemHealth((h) => ({ ...h, ws: connected ? 'healthy' : 'disconnected' }));
  }, [connected]);

  // Populate activity feed from running tasks initially
  useEffect(() => {
    if (tasksData && tasksData.length > 0) {
      const initial: ActivityItem[] = tasksData.slice(0, 20).map((t) => ({
        id: t.id,
        agent: t.agent_name || t.agent_id,
        action: t.title,
        timestamp: t.created_at,
      }));
      setActivityFeed(initial);
    }
  }, [tasksData]);

  // Subscribe to live agent task updates
  useEffect(() => {
    const unsub = subscribe('agent:task:update', (data: any) => {
      const item: ActivityItem = {
        id: `${Date.now()}-${Math.random()}`,
        agent: data.agent_name || data.agent_id || 'Unknown Agent',
        action: data.title || data.action || 'Task updated',
        timestamp: new Date().toISOString(),
      };
      setActivityFeed((prev) => [item, ...prev].slice(0, 20));
    });
    return unsub;
  }, [subscribe]);

  const topGoals = (goalsData || [])
    .filter((g) => g.goal_type === 'objective')
    .slice(0, 5);

  const recentAlerts = (alertsData || []).slice(0, 5);

  const milestones = [
    { date: '2025-09-01', label: 'Company Founded', done: true },
    { date: '2025-11-15', label: 'First Pilot Customer', done: true },
    { date: '2026-01-10', label: 'Product v1.0 Launch', done: true },
    { date: '2026-03-31', label: '$100K Revenue', done: false },
    { date: '2026-06-30', label: '$300K Revenue Target', done: false },
  ];

  if (metricsError && !dashMetrics) {
    return (
      <PageShell title="Command Center" subtitle="Mission Control for Ascent XR">
        <ErrorState error={metricsError} onRetry={loadMetrics} />
      </PageShell>
    );
  }

  return (
    <PageShell title="Command Center" subtitle="Mission Control for Ascent XR">
      {/* My Day Section */}
      <div className="bg-navy-800/60 backdrop-blur-md border border-[#0D9488]/30 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}
            </h2>
            <p className="text-sm text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/agents?tab=Daily+Tasks&status=review"
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-400 text-sm rounded-lg hover:bg-amber-500/30 transition-colors"
            >
              <ClipboardCheck size={14} />
              Review Pending
              {briefingData?.stats?.pending_review ? (
                <span className="px-1.5 py-0.5 bg-amber-500 text-navy-900 text-xs font-bold rounded-full">
                  {briefingData.stats.pending_review}
                </span>
              ) : null}
            </Link>
            <Link
              to="/agents"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0D9488]/20 text-[#0D9488] text-sm rounded-lg hover:bg-[#0D9488]/30 transition-colors"
            >
              <FileText size={14} />
              View Briefing
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        {briefingLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-navy-700 rounded-lg" />)}
          </div>
        ) : briefingData ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-navy-700/40 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-emerald-400">{briefingData.stats?.completed || 0}</p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
            <div className="bg-navy-700/40 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-blue-400">{briefingData.stats?.running || 0}</p>
              <p className="text-xs text-gray-400">Running</p>
            </div>
            <div className="bg-navy-700/40 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-amber-400">{briefingData.stats?.pending_review || 0}</p>
              <p className="text-xs text-gray-400">Pending Review</p>
            </div>
            <div className="bg-navy-700/40 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-red-400">{briefingData.stats?.failed || 0}</p>
              <p className="text-xs text-gray-400">Failed</p>
            </div>
            <div className="bg-navy-700/40 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-orange-400">{briefingData.alert_count || 0}</p>
              <p className="text-xs text-gray-400">Active Alerts</p>
            </div>
          </div>
        ) : null}

        {/* Team Progress */}
        {briefingData?.team_summary && briefingData.team_summary.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {briefingData.team_summary.map(team => (
              <div key={team.team_id} className="bg-navy-700/30 rounded-lg p-2">
                <p className="text-xs text-gray-400 truncate">{team.team_name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex-1 bg-navy-900 rounded-full h-1.5">
                    <div
                      className="bg-[#0D9488] h-1.5 rounded-full transition-all"
                      style={{ width: `${team.total_tasks > 0 ? Math.round((team.completed / team.total_tasks) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{team.completed}/{team.total_tasks}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Morning Briefing */}
      {briefingData?.briefing_text && (
        <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <PlayCircle size={16} className="text-[#0D9488]" />
            Morning Briefing
          </h3>
          <div className="bg-navy-900/60 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
              {briefingData.briefing_text}
            </pre>
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Revenue"
          value={dashMetrics ? `$${(dashMetrics.revenue / 1000).toFixed(1)}K` : '--'}
          icon={DollarSign}
        />
        <KPICard
          label="Pipeline Value"
          value={dashMetrics ? `$${(dashMetrics.pipelineValue / 1000).toFixed(0)}K` : '--'}
          icon={TrendingUp}
        />
        <KPICard
          label="Active Deals"
          value={String(dashMetrics?.activeDeals ?? '--')}
          icon={Briefcase}
        />
        <KPICard
          label="Active Agents"
          value={String(dashMetrics?.activeAgents ?? '--')}
          icon={Cpu}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-medium text-white mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Create Invoice', path: '/finance', icon: '\uD83D\uDCC4' },
            { label: 'Add Contact', path: '/sales', icon: '\uD83D\uDC64' },
            { label: 'Schedule Post', path: '/marketing', icon: '\uD83D\uDCC5' },
            { label: 'Run Agent Task', path: '/agents', icon: '\uD83E\uDD16' },
          ].map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="flex items-center gap-2 px-3 py-2 bg-navy-700/50 hover:bg-navy-700 text-sm text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Revenue Progress */}
      {dashMetrics && (
        <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Revenue Progress to $300K</h3>
            <span className="text-sm text-[#2563EB] font-semibold">
              ${dashMetrics.revenue.toLocaleString()} / $300,000
            </span>
          </div>
          <ProgressBar
            value={dashMetrics.revenue}
            max={dashMetrics.revenueTarget}
            color="blue"
            size="lg"
            showPercentage
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart - recharts */}
        <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Revenue Trend</h3>
          {metricsLoading ? (
            <div className="h-48 animate-pulse bg-navy-700 rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={192}>
              <BarChart data={dashMetrics?.revenueHistory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#142d63" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#142d63' }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#142d63' }}
                  tickFormatter={(v) => `$${v / 1000}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f2554',
                    border: '1px solid #142d63',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Goal Progress */}
        <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Top Objectives - Q1 2026</h3>
          {goalsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-navy-700 rounded" />
              ))}
            </div>
          ) : topGoals.length === 0 ? (
            <p className="text-gray-500 text-sm">No objectives found for this quarter.</p>
          ) : (
            <div className="space-y-4">
              {topGoals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300 truncate mr-2">{goal.title}</span>
                    <StatusBadge status={goal.status} />
                  </div>
                  <ProgressBar
                    value={goal.progress}
                    color={
                      goal.status === 'behind' || goal.status === 'at_risk' ? 'red' : 'blue'
                    }
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Live Activity Feed */}
        <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Live Activity Feed</h3>
          {tasksLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-navy-700 rounded" />
              ))}
            </div>
          ) : activityFeed.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent agent activity.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-navy-700/50"
                >
                  <span className="text-xs text-gray-500 whitespace-nowrap mt-0.5">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-[#2563EB]">{item.agent}</span>
                    <p className="text-sm text-gray-300 truncate">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts + System Health */}
        <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Active Alerts</h3>

          {/* System Health Widget */}
          <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-navy-700/30">
            <span className="text-xs text-gray-400 font-medium">System Health:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  systemHealth.api === 'healthy'
                    ? 'bg-emerald-500'
                    : systemHealth.api === 'checking'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-red-500'
                }`}
              />
              <span className="text-xs text-gray-400">API</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  systemHealth.ws === 'healthy'
                    ? 'bg-emerald-500'
                    : systemHealth.ws === 'checking'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-red-500'
                }`}
              />
              <span className="text-xs text-gray-400">WebSocket</span>
            </div>
          </div>

          {alertsLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-navy-700 rounded" />
              ))}
            </div>
          ) : recentAlerts.length === 0 ? (
            <p className="text-gray-500 text-sm">No active alerts.</p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-navy-700/50"
                >
                  <div
                    className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                      alert.severity === 'critical'
                        ? 'bg-red-500'
                        : alert.severity === 'high'
                          ? 'bg-orange-500'
                          : alert.severity === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-gray-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{alert.title}</p>
                    <p className="text-xs text-gray-400">{alert.message}</p>
                  </div>
                  <StatusBadge status={alert.severity} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-6">Milestone Timeline</h3>
        <div className="relative">
          <div className="absolute top-3 left-0 right-0 h-0.5 bg-navy-700" />
          <div className="flex justify-between relative">
            {milestones.map((ms, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center"
                style={{ width: `${100 / milestones.length}%` }}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                    ms.done
                      ? 'bg-[#2563EB] border-[#2563EB]'
                      : 'bg-navy-800 border-navy-600'
                  }`}
                >
                  {ms.done && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-gray-400 mt-2">{ms.date}</span>
                <span className={`text-xs mt-1 ${ms.done ? 'text-white' : 'text-gray-500'}`}>
                  {ms.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
