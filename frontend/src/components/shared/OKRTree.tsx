import { useState } from 'react';
import { ChevronRight, ChevronDown, Target, KeyRound } from 'lucide-react';
import clsx from 'clsx';
import type { Goal } from '../../types';

interface OKRTreeProps {
  goals: Goal[];
  onProgressUpdate?: (goalId: string, newProgress: number) => void;
}

function getProgressColor(progress: number): string {
  if (progress >= 66) return 'bg-emerald-500';
  if (progress >= 33) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getProgressTextColor(progress: number): string {
  if (progress >= 66) return 'text-emerald-400';
  if (progress >= 33) return 'text-yellow-400';
  return 'text-red-400';
}

function GoalNode({
  goal,
  depth,
  onProgressUpdate,
}: {
  goal: Goal;
  depth: number;
  onProgressUpdate?: (goalId: string, newProgress: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(goal.progress);
  const hasChildren = goal.children && goal.children.length > 0;
  const isObjective = goal.goal_type === 'objective';

  function handleProgressSave() {
    if (onProgressUpdate) {
      onProgressUpdate(goal.id, progressValue);
    }
    setEditingProgress(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleProgressSave();
    if (e.key === 'Escape') {
      setProgressValue(goal.progress);
      setEditingProgress(false);
    }
  }

  return (
    <div className={clsx(depth > 0 && 'ml-6 border-l border-navy-700 pl-4')}>
      <div className="flex items-start gap-3 py-2.5 group">
        {/* Expand/Collapse */}
        <div className="flex-shrink-0 mt-0.5">
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-0.5 text-gray-500 hover:text-white transition-colors"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-5" />
          )}
        </div>

        {/* Icon */}
        <div
          className={clsx(
            'flex-shrink-0 w-7 h-7 rounded flex items-center justify-center mt-0.5',
            isObjective ? 'bg-ascent-blue/15' : 'bg-learning-teal/15'
          )}
        >
          {isObjective ? (
            <Target size={14} className="text-ascent-blue" />
          ) : (
            <KeyRound size={14} className="text-learning-teal" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white truncate">{goal.title}</p>
            <span
              className={clsx(
                'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                goal.status === 'on_track' && 'bg-emerald-500/15 text-emerald-400',
                goal.status === 'behind' && 'bg-yellow-500/15 text-yellow-400',
                goal.status === 'at_risk' && 'bg-red-500/15 text-red-400',
                goal.status === 'completed' && 'bg-ascent-blue/15 text-ascent-blue'
              )}
            >
              {goal.status.replace('_', ' ')}
            </span>
          </div>

          {goal.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{goal.description}</p>
          )}

          {/* Progress bar */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 bg-navy-900 rounded-full h-2 max-w-xs">
              <div
                className={clsx('h-2 rounded-full transition-all duration-300', getProgressColor(goal.progress))}
                style={{ width: `${Math.min(100, goal.progress)}%` }}
              />
            </div>

            {editingProgress && !isObjective ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={progressValue}
                  onChange={(e) => setProgressValue(Number(e.target.value))}
                  onKeyDown={handleKeyDown}
                  onBlur={handleProgressSave}
                  autoFocus
                  className="w-14 px-1.5 py-0.5 text-xs bg-navy-900 border border-navy-700 rounded text-white focus:outline-none focus:border-ascent-blue text-center"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!isObjective && onProgressUpdate) {
                    setEditingProgress(true);
                  }
                }}
                className={clsx(
                  'text-xs font-semibold',
                  getProgressTextColor(goal.progress),
                  !isObjective && onProgressUpdate && 'hover:underline cursor-pointer'
                )}
              >
                {goal.progress}%
              </button>
            )}

            {goal.target_value !== undefined && goal.current_value !== undefined && (
              <span className="text-xs text-gray-500">
                {goal.current_value}/{goal.target_value} {goal.unit || ''}
              </span>
            )}
          </div>

          {goal.owner && (
            <p className="text-xs text-gray-600 mt-1">Owner: {goal.owner}</p>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {goal.children!.map((child) => (
            <GoalNode
              key={child.id}
              goal={child}
              depth={depth + 1}
              onProgressUpdate={onProgressUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OKRTree({ goals, onProgressUpdate }: OKRTreeProps) {
  if (goals.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Target size={40} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm">No goals defined yet</p>
      </div>
    );
  }

  return (
    <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-4">
      {goals.map((goal) => (
        <GoalNode key={goal.id} goal={goal} depth={0} onProgressUpdate={onProgressUpdate} />
      ))}
    </div>
  );
}
