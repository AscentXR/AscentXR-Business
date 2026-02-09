import { useState, useContext, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Megaphone, TrendingUp, Palette, Heart, DollarSign,
  LayoutDashboard, CheckCircle, Clock, AlertTriangle, Play,
  ChevronRight, Calendar, Users, RefreshCw,
} from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import DataTable from '../components/shared/DataTable';
import type { Column } from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import ProgressBar from '../components/shared/ProgressBar';
import Modal from '../components/shared/Modal';
import TabBar from '../components/shared/TabBar';
import KanbanBoard from '../components/shared/KanbanBoard';
import type { KanbanColumn, KanbanItem } from '../components/shared/KanbanBoard';
import ErrorState from '../components/shared/ErrorState';
import { agents, agentTeams } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { AgentContext } from '../context/AgentContext';
import { useToast } from '../context/ToastContext';
import type { Agent, AgentTask, AgentTeam } from '../types';

const TABS = ['Teams', 'Agents', 'Daily Tasks', 'Workflow', 'Analytics'];

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'inbox', title: 'INBOX', color: '#6b7280' },
  { id: 'assigned', title: 'ASSIGNED', color: '#3b82f6' },
  { id: 'in_progress', title: 'IN PROGRESS', color: '#f59e0b' },
  { id: 'review', title: 'REVIEW', color: '#8b5cf6' },
  { id: 'done', title: 'DONE', color: '#10b981' },
];

const STATUS_TO_COLUMN: Record<string, string> = {
  queued: 'inbox',
  assigned: 'assigned',
  running: 'in_progress',
  streaming: 'in_progress',
  review: 'review',
  approved: 'done',
  rejected: 'done',
  failed: 'done',
};

const COLUMN_TO_STATUS: Record<string, string> = {
  inbox: 'queued',
  assigned: 'assigned',
  in_progress: 'running',
  review: 'review',
  done: 'approved',
};

const STATUS_COLORS = ['#6b7280', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TEAM_ICONS: Record<string, React.ComponentType<any>> = {
  'megaphone': Megaphone,
  'trending-up': TrendingUp,
  'palette': Palette,
  'heart': Heart,
  'dollar-sign': DollarSign,
  'layout-dashboard': LayoutDashboard,
};

function getActivityLabel(currentTask?: string): string | null {
  if (!currentTask) return null;
  const lower = currentTask.toLowerCase();
  if (lower.includes('research')) return 'RESEARCHING';
  if (lower.includes('analyz') || lower.includes('analysis')) return 'ANALYZING';
  if (lower.includes('writ') || lower.includes('draft')) return 'WRITING';
  if (lower.includes('review')) return 'REVIEWING';
  if (lower.includes('search')) return 'SEARCHING';
  if (lower.includes('generat')) return 'GENERATING';
  if (lower.includes('process')) return 'PROCESSING';
  return 'WORKING';
}

export default function Agents() {
  const [showExecModal, setShowExecModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPrompt, setTaskPrompt] = useState('');
  const [executing, setExecuting] = useState(false);
  const [tab, setTab] = useState('Teams');
  const [selectedTeam, setSelectedTeam] = useState<AgentTeam | null>(null);
  const [dailyDate, setDailyDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dailyStatus, setDailyStatus] = useState('');
  const [triggering, setTriggering] = useState(false);
  const agentCtx = useContext(AgentContext);
  const { showToast } = useToast();

  const { data: agentList, loading: agentsLoading, error: agentsError, refetch: refetchAgents } = useApi<Agent[]>(
    () => agents.list(), []
  );
  const {
    data: tasksData,
    loading: tasksLoading,
    refetch: refetchTasks,
  } = useApi<AgentTask[]>(() => agents.getTasks(), []);

  const { data: teamsData, loading: teamsLoading, refetch: refetchTeams } = useApi<AgentTeam[]>(
    () => agentTeams.list(), []
  );

  const { data: dailyTasksData, loading: dailyTasksLoading, refetch: refetchDailyTasks } = useApi<{ tasks: AgentTask[]; total: number; date: string }>(
    () => agentTeams.getDailyTasks({ date: dailyDate, status: dailyStatus || undefined }),
    [dailyDate, dailyStatus]
  );

  // Load team detail when a team is selected
  const [teamDetail, setTeamDetail] = useState<AgentTeam | null>(null);
  const [teamDetailLoading, setTeamDetailLoading] = useState(false);

  useEffect(() => {
    if (!selectedTeam) {
      setTeamDetail(null);
      return;
    }
    setTeamDetailLoading(true);
    agentTeams.get(selectedTeam.id)
      .then(r => setTeamDetail(r.data.data || r.data))
      .catch(() => showToast('Failed to load team details', 'error'))
      .finally(() => setTeamDetailLoading(false));
  }, [selectedTeam?.id]);

  const safeAgentList = agentList || [];
  const tasks = tasksData || [];
  const teams = teamsData || [];
  const dailyTasks = dailyTasksData?.tasks || [];

  async function handleExecute() {
    if (!selectedAgent || !taskPrompt) return;
    setExecuting(true);
    try {
      await agentCtx?.executeTask({
        agent_id: selectedAgent,
        title: taskTitle || 'Manual Task',
        prompt: taskPrompt,
      });
      setShowExecModal(false);
      setTaskTitle('');
      setTaskPrompt('');
      setSelectedAgent('');
      refetchTasks();
      showToast('Task executed successfully', 'success');
    } catch {
      showToast('Failed to execute task', 'error');
    } finally {
      setExecuting(false);
    }
  }

  async function handleTriggerDaily() {
    setTriggering(true);
    try {
      const resp = await agentTeams.triggerDaily(dailyDate);
      const data = resp.data.data || resp.data;
      showToast(`Generated ${data.generated} tasks (${data.skipped} skipped, ${data.errors} errors)`, 'success');
      refetchDailyTasks();
      refetchTeams();
    } catch {
      showToast('Failed to trigger daily tasks', 'error');
    } finally {
      setTriggering(false);
    }
  }

  async function handleReviewTask(taskId: string, action: 'approved' | 'rejected') {
    try {
      await agents.reviewTask(taskId, action);
      showToast(`Task ${action}`, 'success');
      refetchDailyTasks();
      refetchTeams();
    } catch {
      showToast('Failed to review task', 'error');
    }
  }

  const taskColumns: Column<AgentTask>[] = [
    {
      key: 'title',
      label: 'Task',
      render: (t) => <span className="font-medium text-white">{t.title}</span>,
    },
    {
      key: 'agent_name',
      label: 'Agent',
      render: (t) => <span>{t.agent_name || t.agent_id}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'business_area',
      label: 'Area',
      render: (t) => <span className="capitalize">{t.business_area || '-'}</span>,
    },
    {
      key: 'execution_time_ms',
      label: 'Time',
      render: (t) =>
        t.execution_time_ms ? `${(t.execution_time_ms / 1000).toFixed(1)}s` : '-',
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (t) => t.created_at?.slice(0, 16).replace('T', ' '),
    },
  ];

  const dailyTaskColumns: Column<AgentTask>[] = [
    {
      key: 'title',
      label: 'Task',
      render: (t) => <span className="font-medium text-white">{t.title}</span>,
    },
    {
      key: 'team_name',
      label: 'Team',
      render: (t) => <span>{t.team_name || '-'}</span>,
    },
    {
      key: 'agent_name',
      label: 'Agent',
      render: (t) => <span>{t.agent_name || t.agent_id}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'execution_time_ms',
      label: 'Time',
      render: (t) =>
        t.execution_time_ms ? `${(t.execution_time_ms / 1000).toFixed(1)}s` : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (t) => {
        if (t.status !== 'review') return <span className="text-gray-500">-</span>;
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleReviewTask(t.id, 'approved'); }}
              className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded hover:bg-emerald-500/30"
            >
              Approve
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleReviewTask(t.id, 'rejected'); }}
              className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30"
            >
              Reject
            </button>
          </div>
        );
      },
    },
  ];

  // Active streaming tasks
  const activeTasks =
    agentCtx?.activeTasks.filter(
      (t) => t.status === 'running' || t.status === 'streaming'
    ) || [];

  // Kanban items mapped from tasks
  const kanbanItems: KanbanItem[] = tasks.map((t) => ({
    id: t.id,
    columnId: STATUS_TO_COLUMN[t.status] || 'inbox',
    title: t.title,
    subtitle: t.agent_name || t.agent_id,
    metadata: {
      status: t.status,
      ...(t.business_area ? { area: t.business_area } : {}),
    },
  }));

  async function handleKanbanMove(itemId: string, newColumnId: string) {
    const newStatus = COLUMN_TO_STATUS[newColumnId];
    if (!newStatus) return;

    try {
      if (newColumnId === 'done') {
        await agents.reviewTask(itemId, 'approved');
      }
      refetchTasks();
      showToast(`Task moved to ${newColumnId.replace('_', ' ')}`, 'success');
    } catch (err: any) {
      console.error('Failed to move task', err);
      showToast('Failed to move task', 'error');
    }
  }

  // Analytics data
  const tasksPerAgent = safeAgentList.map((a) => ({
    name: a.name,
    completed: a.tasks_completed,
    total: a.total_tasks,
  }));

  const statusCounts = tasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <PageShell
      title="Agent Teams"
      subtitle="Autonomous AI agent teams and daily task management"
      actions={
        <button
          onClick={() => setShowExecModal(true)}
          className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-[#7C3AED]/80"
        >
          + Execute Task
        </button>
      }
    >
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {agentsError && <ErrorState error={agentsError} onRetry={refetchAgents} />}
      {!agentsError && <>

      {/* Teams Tab */}
      {tab === 'Teams' && (
        <>
          {selectedTeam && teamDetail ? (
            /* Team Detail Panel */
            <div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4"
              >
                <ChevronRight size={14} className="rotate-180" /> Back to Teams
              </button>

              <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#7C3AED]/20 flex items-center justify-center">
                    {(() => {
                      const IconComp = TEAM_ICONS[teamDetail.icon || ''] || Users;
                      return <IconComp size={24} className="text-[#7C3AED]" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{teamDetail.name}</h2>
                    <p className="text-sm text-gray-400">{teamDetail.description}</p>
                  </div>
                </div>

                {/* Team Members */}
                <h3 className="text-sm font-medium text-white mb-3">Team Members</h3>
                {teamDetailLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-navy-700 rounded" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(teamDetail.members || []).map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-navy-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.agent_status === 'active' ? 'bg-emerald-500/20' : 'bg-navy-600'}`}>
                            <span className="text-xs font-bold text-gray-300">{m.agent_name?.charAt(0)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-white font-medium">{m.agent_name}</span>
                            {m.role_in_team === 'lead' && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-[#7C3AED]/20 text-[#7C3AED]">Lead</span>
                            )}
                            <p className="text-xs text-gray-400 truncate max-w-md">{m.agent_description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={m.agent_status} />
                          <span className="text-xs text-gray-500">{m.agent_tasks_completed} tasks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Team's Today's Tasks */}
              <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-6">
                <h3 className="text-sm font-medium text-white mb-3">Today's Tasks</h3>
                <DataTable
                  columns={dailyTaskColumns}
                  data={dailyTasks.filter(t => t.team_id === teamDetail.id)}
                  loading={dailyTasksLoading}
                  pagination
                  pageSize={10}
                  emptyMessage="No tasks generated for this team today."
                />
              </div>
            </div>
          ) : (
            /* Team Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamsLoading
                ? [1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-5 animate-pulse">
                      <div className="h-5 bg-navy-700 rounded w-32 mb-3" />
                      <div className="h-3 bg-navy-700 rounded w-full mb-2" />
                      <div className="h-2 bg-navy-700 rounded w-3/4" />
                    </div>
                  ))
                : teams.map((team) => {
                    const IconComp = TEAM_ICONS[team.icon || ''] || Users;
                    const totalToday = Number(team.tasks_today) || 0;
                    const completedToday = Number(team.tasks_completed) || 0;
                    const reviewCount = Number(team.tasks_review) || 0;
                    const runningCount = Number(team.tasks_running) || 0;

                    return (
                      <div
                        key={team.id}
                        onClick={() => setSelectedTeam(team)}
                        className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 cursor-pointer hover:border-[#7C3AED]/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/20 flex items-center justify-center">
                              <IconComp size={20} className="text-[#7C3AED]" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold text-sm">{team.name}</h3>
                              <span className="text-xs text-gray-400">{team.member_count} agents</span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-gray-500" />
                        </div>

                        {team.description && (
                          <p className="text-xs text-gray-400 mb-3 line-clamp-2">{team.description}</p>
                        )}

                        {/* Today's progress */}
                        <div className="mb-3">
                          <ProgressBar
                            value={completedToday}
                            max={totalToday || 1}
                            label={`${completedToday}/${totalToday} today`}
                            color="purple"
                            size="sm"
                          />
                        </div>

                        {/* Status indicators */}
                        <div className="flex items-center gap-3 text-xs">
                          {reviewCount > 0 && (
                            <span className="flex items-center gap-1 text-amber-400">
                              <Clock size={12} /> {reviewCount} review
                            </span>
                          )}
                          {runningCount > 0 && (
                            <span className="flex items-center gap-1 text-blue-400">
                              <Play size={12} /> {runningCount} running
                            </span>
                          )}
                          {Number(team.tasks_failed) > 0 && (
                            <span className="flex items-center gap-1 text-red-400">
                              <AlertTriangle size={12} /> {team.tasks_failed} failed
                            </span>
                          )}
                          {totalToday > 0 && completedToday === totalToday && (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle size={12} /> All done
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
            </div>
          )}
        </>
      )}

      {/* Agents Tab */}
      {tab === 'Agents' && (
        <>
          {/* Agent Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {agentsLoading
              ? [1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-5 animate-pulse"
                  >
                    <div className="h-5 bg-navy-700 rounded w-32 mb-3" />
                    <div className="h-3 bg-navy-700 rounded w-full mb-2" />
                    <div className="h-2 bg-navy-700 rounded w-3/4" />
                  </div>
                ))
              : safeAgentList.map((agent) => (
                  <div
                    key={agent.id}
                    className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            agent.status === 'active' ? 'bg-[#7C3AED]/20' : 'bg-navy-700'
                          }`}
                        >
                          <svg
                            className={`w-5 h-5 ${
                              agent.status === 'active' ? 'text-[#7C3AED]' : 'text-gray-500'
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm">{agent.name}</h3>
                          <div className="flex items-center gap-1.5">
                            {agent.status === 'active' && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                            )}
                            <StatusBadge status={agent.status} />
                          </div>
                        </div>
                      </div>
                    </div>
                    {agent.description && (
                      <p className="text-xs text-gray-400 mb-3">{agent.description}</p>
                    )}
                    <div className="mb-2">
                      <ProgressBar
                        value={agent.tasks_completed}
                        max={agent.total_tasks || 1}
                        label={`${agent.tasks_completed}/${agent.total_tasks} tasks`}
                        color="purple"
                        size="sm"
                      />
                    </div>
                    {agent.current_task && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#7C3AED]/20 text-[#7C3AED]">
                          [{getActivityLabel(agent.current_task)}]
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                          {agent.current_task}
                        </span>
                      </div>
                    )}
                    {agent.capabilities && agent.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {agent.capabilities.slice(0, 3).map((cap, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-gray-400"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
          </div>

          {/* Active Task Streaming */}
          {activeTasks.length > 0 && (
            <div className="bg-navy-800/60 backdrop-blur-md border border-[#7C3AED]/30 rounded-xl p-5 mb-6">
              <h3 className="text-sm font-medium text-[#7C3AED] mb-3">Active Tasks</h3>
              <div className="space-y-3">
                {activeTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-navy-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white font-medium">{task.title}</span>
                      <StatusBadge status={task.status} />
                    </div>
                    {task.result && (
                      <pre className="text-xs text-gray-300 bg-navy-900 rounded p-3 max-h-32 overflow-y-auto whitespace-pre-wrap font-mono">
                        {task.result}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Task Queue */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Task History</h3>
            <DataTable
              columns={taskColumns}
              data={tasks}
              loading={tasksLoading}
              searchable
              pagination
              pageSize={10}
            />
          </div>
        </>
      )}

      {/* Daily Tasks Tab */}
      {tab === 'Daily Tasks' && (
        <div>
          {/* Controls */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="px-3 py-1.5 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
            <select
              value={dailyStatus}
              onChange={(e) => setDailyStatus(e.target.value)}
              className="px-3 py-1.5 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#7C3AED]"
            >
              <option value="">All Statuses</option>
              <option value="review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="running">Running</option>
              <option value="queued">Queued</option>
              <option value="failed">Failed</option>
            </select>
            <button
              onClick={handleTriggerDaily}
              disabled={triggering}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-[#7C3AED]/80 disabled:opacity-50"
            >
              <RefreshCw size={14} className={triggering ? 'animate-spin' : ''} />
              {triggering ? 'Generating...' : 'Trigger Daily Run'}
            </button>
          </div>

          {/* Summary */}
          {dailyTasksData && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {[
                { label: 'Total', value: dailyTasksData.total, color: 'text-white' },
                { label: 'Completed', value: dailyTasks.filter(t => ['approved', 'rejected'].includes(t.status)).length, color: 'text-emerald-400' },
                { label: 'Review', value: dailyTasks.filter(t => t.status === 'review').length, color: 'text-amber-400' },
                { label: 'Running', value: dailyTasks.filter(t => ['running', 'streaming', 'queued'].includes(t.status)).length, color: 'text-blue-400' },
                { label: 'Failed', value: dailyTasks.filter(t => t.status === 'failed').length, color: 'text-red-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-navy-800/60 border border-navy-700/50 rounded-lg p-3 text-center">
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tasks Table */}
          <DataTable
            columns={dailyTaskColumns}
            data={dailyTasks}
            loading={dailyTasksLoading}
            searchable
            pagination
            pageSize={15}
            emptyMessage={`No tasks found for ${dailyDate}.`}
          />
        </div>
      )}

      {/* Workflow Tab - Kanban Board */}
      {tab === 'Workflow' && (
        <div>
          {tasksLoading ? (
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="min-w-[280px] h-64 bg-navy-800/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No tasks to display. Execute a task to get started.</p>
            </div>
          ) : (
            <KanbanBoard
              columns={KANBAN_COLUMNS}
              items={kanbanItems}
              onMove={handleKanbanMove}
            />
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {tab === 'Analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tasks per Agent */}
            <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-white mb-4">
                Tasks Completed per Agent
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={tasksPerAgent}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#142d63" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: '#142d63' }}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#142d63' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f2554',
                      border: '1px solid #142d63',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar
                    dataKey="completed"
                    fill="#7C3AED"
                    name="Completed"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Task Status Distribution */}
            <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-white mb-4">
                Task Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f2554',
                      border: '1px solid #142d63',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Agent Performance Summary */}
          <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white mb-4">
              Agent Performance Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-navy-700/30 rounded-lg">
                <p className="text-2xl font-bold text-white">{tasks.length}</p>
                <p className="text-xs text-gray-400 mt-1">Total Tasks</p>
              </div>
              <div className="text-center p-4 bg-navy-700/30 rounded-lg">
                <p className="text-2xl font-bold text-emerald-400">
                  {tasks.filter((t) => t.status === 'approved').length}
                </p>
                <p className="text-xs text-gray-400 mt-1">Approved</p>
              </div>
              <div className="text-center p-4 bg-navy-700/30 rounded-lg">
                <p className="text-2xl font-bold text-[#7C3AED]">
                  {tasks.length > 0
                    ? `${Math.round(
                        tasks
                          .filter((t) => t.execution_time_ms)
                          .reduce((s, t) => s + (t.execution_time_ms || 0), 0) /
                          Math.max(
                            tasks.filter((t) => t.execution_time_ms).length,
                            1
                          ) /
                          1000
                      )}s`
                    : '-'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Avg Execution Time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      </>}
      {/* Execute Modal */}
      <Modal
        isOpen={showExecModal}
        onClose={() => setShowExecModal(false)}
        title="Execute Agent Task"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#7C3AED]"
            >
              <option value="">Select an agent...</option>
              {safeAgentList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Task Title</label>
            <input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Brief description"
              className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#7C3AED]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Prompt</label>
            <textarea
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              rows={4}
              placeholder="What should the agent do?"
              className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#7C3AED]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowExecModal(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              disabled={executing || !selectedAgent || !taskPrompt}
              className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg disabled:opacity-50"
            >
              {executing ? 'Executing...' : 'Execute'}
            </button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
