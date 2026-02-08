import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Briefcase, Cpu } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import KPICard from '../components/shared/KPICard';
import ProgressBar from '../components/shared/ProgressBar';
import StatusBadge from '../components/shared/StatusBadge';
import { metrics, goals, agents, notifications } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import type { Goal, AgentTask, Notification } from '../types';

interface DashboardMetrics {
  revenue: number;
  revenueTarget: number;
  pipelineValue: number;
  activeDeals: number;
  activeAgents: number;
  revenueHistory: { month: string; value: number }[];
}

export default function CommandCenter() {
  const [dashMetrics, setDashMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const { data: goalsData, loading: goalsLoading } = useApi<Goal[]>(
    () => goals.list({ quarter: 'Q1 2026' }),
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

  useEffect(() => {
    async function loadMetrics() {
      try {
        const resp = await metrics.all();
        const d = resp.data.data || resp.data;
        setDashMetrics({
          revenue: d.revenue ?? 47500,
          revenueTarget: 300000,
          pipelineValue: d.pipelineValue ?? 285000,
          activeDeals: d.activeDeals ?? 12,
          activeAgents: d.activeAgents ?? 6,
          revenueHistory: d.revenueHistory ?? [
            { month: 'Sep', value: 0 },
            { month: 'Oct', value: 5000 },
            { month: 'Nov', value: 12000 },
            { month: 'Dec', value: 22000 },
            { month: 'Jan', value: 35000 },
            { month: 'Feb', value: 47500 },
          ],
        });
      } catch {
        setDashMetrics({
          revenue: 47500,
          revenueTarget: 300000,
          pipelineValue: 285000,
          activeDeals: 12,
          activeAgents: 6,
          revenueHistory: [
            { month: 'Sep', value: 0 },
            { month: 'Oct', value: 5000 },
            { month: 'Nov', value: 12000 },
            { month: 'Dec', value: 22000 },
            { month: 'Jan', value: 35000 },
            { month: 'Feb', value: 47500 },
          ],
        });
      } finally {
        setMetricsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const topGoals = (goalsData || [])
    .filter((g) => g.goal_type === 'objective')
    .slice(0, 5);

  const recentTasks = (tasksData || []).slice(0, 5);
  const recentAlerts = (alertsData || []).slice(0, 5);

  const milestones = [
    { date: '2025-09-01', label: 'Company Founded', done: true },
    { date: '2025-11-15', label: 'First Pilot Customer', done: true },
    { date: '2026-01-10', label: 'Product v1.0 Launch', done: true },
    { date: '2026-03-31', label: '$100K Revenue', done: false },
    { date: '2026-06-30', label: '$300K Revenue Target', done: false },
  ];

  const maxChartVal = dashMetrics
    ? Math.max(...dashMetrics.revenueHistory.map((d) => d.value), 1)
    : 1;

  return (
    <PageShell title="Command Center" subtitle="Mission Control for Ascent XR">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Revenue"
          value={dashMetrics ? `$${(dashMetrics.revenue / 1000).toFixed(1)}K` : '--'}
          change={15.8}
          icon={DollarSign}
        />
        <KPICard
          label="Pipeline Value"
          value={dashMetrics ? `$${(dashMetrics.pipelineValue / 1000).toFixed(0)}K` : '--'}
          change={22.3}
          icon={TrendingUp}
        />
        <KPICard
          label="Active Deals"
          value={String(dashMetrics?.activeDeals ?? '--')}
          change={8.5}
          icon={Briefcase}
        />
        <KPICard
          label="Active Agents"
          value={String(dashMetrics?.activeAgents ?? '--')}
          icon={Cpu}
        />
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
        {/* Revenue Chart */}
        <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Revenue Trend</h3>
          {metricsLoading ? (
            <div className="h-48 animate-pulse bg-navy-700 rounded" />
          ) : (
            <div className="h-48 flex items-end gap-2">
              {dashMetrics?.revenueHistory.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">${(d.value / 1000).toFixed(0)}K</span>
                  <div
                    className="w-full bg-gradient-to-t from-[#2563EB] to-[#2563EB]/60 rounded-t transition-all duration-500"
                    style={{ height: `${(d.value / maxChartVal) * 140}px`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-gray-500">{d.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goal Progress */}
        <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Top Objectives - Q1 2026</h3>
          {goalsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-navy-700 rounded" />)}
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
                    color={goal.status === 'behind' || goal.status === 'at_risk' ? 'red' : 'blue'}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Agent Activity */}
        <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Recent Agent Activity</h3>
          {tasksLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-navy-700 rounded" />)}
            </div>
          ) : recentTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent agent activity.</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-navy-700/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{task.title}</p>
                    <p className="text-xs text-gray-400">{task.agent_name || task.agent_id}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Active Alerts</h3>
          {alertsLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-navy-700 rounded" />)}
            </div>
          ) : recentAlerts.length === 0 ? (
            <p className="text-gray-500 text-sm">No active alerts.</p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-navy-700/50">
                  <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                    alert.severity === 'critical' ? 'bg-red-500' :
                    alert.severity === 'high' ? 'bg-orange-500' :
                    alert.severity === 'medium' ? 'bg-amber-500' : 'bg-gray-500'
                  }`} />
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
              <div key={i} className="flex flex-col items-center text-center" style={{ width: `${100 / milestones.length}%` }}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                  ms.done
                    ? 'bg-[#2563EB] border-[#2563EB]'
                    : 'bg-navy-800 border-navy-600'
                }`}>
                  {ms.done && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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
