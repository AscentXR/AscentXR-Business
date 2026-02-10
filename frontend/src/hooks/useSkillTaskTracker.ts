import { useState, useRef, useEffect, useCallback } from 'react';
import type { AgentTask } from '../types';

export interface SkillTaskState {
  taskId: string;
  status: AgentTask['status'];
  result?: string;
  error?: string;
  executionTime?: number;
  startedAt?: number;
}

/**
 * Shared hook for real-time skill execution tracking.
 * Used by both Skills tab and Plan Calendar to show live progress.
 */
export function useSkillTaskTracker(
  subscribe: (event: string, handler: (data: any) => void) => (() => void)
) {
  const [skillTasks, setSkillTasks] = useState<Record<string, SkillTaskState>>({});
  const reverseMap = useRef<Record<string, string>>({}); // taskId -> skillId

  useEffect(() => {
    const unsub = subscribe('agent:task:update', (task: AgentTask) => {
      const skillId = reverseMap.current[task.id];
      if (!skillId) return;

      setSkillTasks((prev) => ({
        ...prev,
        [skillId]: {
          taskId: task.id,
          status: task.status,
          result: task.result || undefined,
          error: task.error || undefined,
          executionTime: task.execution_time_ms || undefined,
          startedAt: prev[skillId]?.startedAt
        }
      }));
    });
    return unsub;
  }, [subscribe]);

  const trackSkill = useCallback((skillId: string, taskId: string) => {
    reverseMap.current[taskId] = skillId;
    setSkillTasks((prev) => ({
      ...prev,
      [skillId]: { taskId, status: 'queued', startedAt: Date.now() }
    }));
  }, []);

  const clearSkill = useCallback((skillId: string) => {
    setSkillTasks((prev) => {
      const state = prev[skillId];
      if (state) {
        delete reverseMap.current[state.taskId];
      }
      const next = { ...prev };
      delete next[skillId];
      return next;
    });
  }, []);

  return { skillTasks, trackSkill, clearSkill };
}
