import { Play, Pause, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import type { Agent, AgentTask } from '../../types';

interface AgentCardProps {
  agent: Agent;
  onTrigger: (agentId: string) => void;
  activeTasks?: AgentTask[];
}

const statusConfig: Record<Agent['status'], { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  paused: { label: 'Paused', color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
  stopped: { label: 'Stopped', color: 'text-gray-400', bg: 'bg-gray-500/15' },
};

export default function AgentCard({ agent, onTrigger, activeTasks = [] }: AgentCardProps) {
  const status = statusConfig[agent.status];
  const isRunning = activeTasks.some(
    (t) => t.status === 'running' || t.status === 'streaming'
  );
  const latestTask = activeTasks[0];

  return (
    <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 relative overflow-hidden">
      {/* Subtle top border accent */}
      <div
        className={clsx(
          'absolute top-0 left-0 right-0 h-0.5',
          agent.status === 'active' ? 'bg-emerald-500' : agent.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-600'
        )}
      />

      {/* Header: Name & Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white truncate">{agent.name}</h3>
          {agent.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{agent.description}</p>
          )}
        </div>
        <span
          className={clsx(
            'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2',
            status.bg,
            status.color
          )}
        >
          {status.label}
        </span>
      </div>

      {/* Capabilities */}
      {agent.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.capabilities.slice(0, 4).map((cap) => (
            <span
              key={cap}
              className="text-[10px] px-2 py-0.5 bg-navy-700/60 rounded text-gray-400"
            >
              {cap}
            </span>
          ))}
          {agent.capabilities.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 bg-navy-700/60 rounded text-gray-400">
              +{agent.capabilities.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">
            Tasks: {agent.tasks_completed}/{agent.total_tasks}
          </span>
          <span className="text-ascent-blue font-medium">{agent.progress}%</span>
        </div>
        <div className="w-full bg-navy-900 rounded-full h-1.5">
          <div
            className="bg-ascent-blue h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, agent.progress)}%` }}
          />
        </div>
      </div>

      {/* Active Task Indicator */}
      {isRunning && latestTask && (
        <div className="mb-3 p-2.5 bg-navy-900/60 rounded-lg border border-navy-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 size={12} className="text-ascent-blue animate-spin" />
            <span className="text-xs font-medium text-ascent-blue">Running</span>
          </div>
          <p className="text-xs text-gray-400 truncate">
            {latestTask.title || latestTask.current_task || 'Processing...'}
          </p>
          {latestTask.result && latestTask.status === 'streaming' && (
            <div className="mt-1.5 max-h-16 overflow-y-auto">
              <p className="text-[10px] text-gray-500 font-mono whitespace-pre-wrap">
                {latestTask.result.slice(-200)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Current Task (non-running) */}
      {!isRunning && agent.current_task && (
        <p className="text-xs text-gray-500 mb-3 truncate">
          Current: {agent.current_task}
        </p>
      )}

      {/* Recent completed task status */}
      {!isRunning && latestTask && (latestTask.status === 'approved' || latestTask.status === 'rejected' || latestTask.status === 'failed') && (
        <div className="flex items-center gap-1.5 mb-3 text-xs">
          {latestTask.status === 'approved' && (
            <>
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Last task approved</span>
            </>
          )}
          {latestTask.status === 'rejected' && (
            <>
              <XCircle size={12} className="text-orange-400" />
              <span className="text-orange-400">Last task rejected</span>
            </>
          )}
          {latestTask.status === 'failed' && (
            <>
              <XCircle size={12} className="text-red-400" />
              <span className="text-red-400">Last task failed</span>
            </>
          )}
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => onTrigger(agent.id)}
        disabled={isRunning}
        className={clsx(
          'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          isRunning
            ? 'bg-navy-700 text-gray-500 cursor-not-allowed'
            : agent.status === 'active'
              ? 'bg-ascent-blue hover:bg-ascent-blue-dark text-white'
              : 'bg-navy-700 hover:bg-navy-600 text-gray-300'
        )}
      >
        {isRunning ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Running...
          </>
        ) : agent.status === 'paused' ? (
          <>
            <Play size={14} />
            Resume
          </>
        ) : (
          <>
            <Play size={14} />
            Trigger
          </>
        )}
      </button>
    </div>
  );
}
