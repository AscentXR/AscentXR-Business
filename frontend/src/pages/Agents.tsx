import { useState, useContext } from 'react';
import PageShell from '../components/layout/PageShell';
import DataTable from '../components/shared/DataTable';
import type { Column } from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import ProgressBar from '../components/shared/ProgressBar';
import Modal from '../components/shared/Modal';
import { agents } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { AgentContext } from '../context/AgentContext';
import type { Agent, AgentTask } from '../types';

export default function Agents() {
  const [showExecModal, setShowExecModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPrompt, setTaskPrompt] = useState('');
  const [executing, setExecuting] = useState(false);
  const agentCtx = useContext(AgentContext);

  const { data: agentsResponse, loading: agentsLoading } = useApi<{ agents: Agent[]; systemMetrics: any }>(() => agents.list(), []);
  const { data: tasksData, loading: tasksLoading, refetch: refetchTasks } = useApi<AgentTask[]>(() => agents.getTasks(), []);

  const agentList = agentsResponse?.agents || [];
  const tasks = tasksData || [];

  async function handleExecute() {
    if (!selectedAgent || !taskPrompt) return;
    setExecuting(true);
    try {
      await agentCtx?.executeTask({ agent_id: selectedAgent, title: taskTitle || 'Manual Task', prompt: taskPrompt });
      setShowExecModal(false);
      setTaskTitle(''); setTaskPrompt(''); setSelectedAgent('');
      refetchTasks();
    } catch { /* handled */ }
    finally { setExecuting(false); }
  }

  const taskColumns: Column<AgentTask>[] = [
    { key: 'title', label: 'Task', render: (t) => <span className="font-medium text-white">{t.title}</span> },
    { key: 'agent_name', label: 'Agent', render: (t) => <span>{t.agent_name || t.agent_id}</span> },
    { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'business_area', label: 'Area', render: (t) => <span className="capitalize">{t.business_area || '-'}</span> },
    { key: 'execution_time_ms', label: 'Time', render: (t) => t.execution_time_ms ? `${(t.execution_time_ms / 1000).toFixed(1)}s` : '-' },
    { key: 'created_at', label: 'Created', sortable: true, render: (t) => t.created_at?.slice(0, 16).replace('T', ' ') },
  ];

  // Active streaming tasks
  const activeTasks = agentCtx?.activeTasks.filter((t) => t.status === 'running' || t.status === 'streaming') || [];

  return (
    <PageShell
      title="Agent Coordination"
      subtitle="Manage AI agents and their tasks"
      actions={
        <button onClick={() => setShowExecModal(true)} className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-[#7C3AED]/80">
          + Execute Task
        </button>
      }
    >
      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {agentsLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-navy-700 rounded w-32 mb-3" />
              <div className="h-3 bg-navy-700 rounded w-full mb-2" />
              <div className="h-2 bg-navy-700 rounded w-3/4" />
            </div>
          ))
        ) : agentList.map((agent) => (
          <div key={agent.id} className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${agent.status === 'active' ? 'bg-[#7C3AED]/20' : 'bg-navy-700'}`}>
                  <svg className={`w-5 h-5 ${agent.status === 'active' ? 'text-[#7C3AED]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{agent.name}</h3>
                  <StatusBadge status={agent.status} />
                </div>
              </div>
            </div>
            {agent.description && <p className="text-xs text-gray-400 mb-3">{agent.description}</p>}
            <div className="mb-2">
              <ProgressBar value={agent.tasks_completed} max={agent.total_tasks || 1} label={`${agent.tasks_completed}/${agent.total_tasks} tasks`} color="purple" size="sm" />
            </div>
            {agent.current_task && <p className="text-xs text-[#7C3AED] truncate">Current: {agent.current_task}</p>}
            {agent.capabilities && agent.capabilities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {agent.capabilities.slice(0, 3).map((cap, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-gray-400">{cap}</span>
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
        <DataTable columns={taskColumns} data={tasks} loading={tasksLoading} searchable pagination pageSize={10} />
      </div>

      {/* Execute Modal */}
      <Modal isOpen={showExecModal} onClose={() => setShowExecModal(false)} title="Execute Agent Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Agent</label>
            <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#7C3AED]">
              <option value="">Select an agent...</option>
              {agentList.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Task Title</label>
            <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Brief description" className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#7C3AED]" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Prompt</label>
            <textarea value={taskPrompt} onChange={(e) => setTaskPrompt(e.target.value)} rows={4} placeholder="What should the agent do?" className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#7C3AED]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowExecModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleExecute} disabled={executing || !selectedAgent || !taskPrompt} className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg disabled:opacity-50">{executing ? 'Executing...' : 'Execute'}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
