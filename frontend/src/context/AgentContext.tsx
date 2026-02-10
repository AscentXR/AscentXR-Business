import { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { agents as agentApi } from '../api/endpoints';
import { useWebSocket } from '../hooks/useWebSocket';
import type { AgentTask } from '../types';

interface AgentContextType {
  activeTasks: AgentTask[];
  executeTask: (data: {
    agent_id: string;
    title: string;
    prompt: string;
    business_area?: string;
    context?: any;
  }) => Promise<AgentTask>;
  reviewTask: (id: string, action: 'approved' | 'rejected') => Promise<void>;
}

export const AgentContext = createContext<AgentContextType | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [activeTasks, setActiveTasks] = useState<AgentTask[]>([]);
  const { subscribe } = useWebSocket();

  // Listen for task updates (with proper cleanup)
  useEffect(() => {
    const unsub = subscribe('agent:task:update', (task: AgentTask) => {
      setActiveTasks((prev) => {
        const idx = prev.findIndex((t) => t.id === task.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = task;
          return next;
        }
        return [...prev, task];
      });
    });
    return unsub;
  }, [subscribe]);

  const executeTask = useCallback(async (data: {
    agent_id: string;
    title: string;
    prompt: string;
    business_area?: string;
    context?: any;
  }) => {
    const response = await agentApi.execute(data);
    const task = response.data.data;
    setActiveTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const reviewTask = useCallback(async (id: string, action: 'approved' | 'rejected') => {
    await agentApi.reviewTask(id, action);
    setActiveTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: action } : t))
    );
  }, []);

  return (
    <AgentContext.Provider value={{ activeTasks, executeTask, reviewTask }}>
      {children}
    </AgentContext.Provider>
  );
}
