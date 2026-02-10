import { useState, useContext } from 'react';
import { AgentContext } from '../../context/AgentContext';

interface AgentTriggerButtonProps {
  agentId: string;
  label: string;
  prompt: string;
  businessArea?: string;
  context?: any;
  onComplete?: (result: string) => void;
}

export default function AgentTriggerButton({
  agentId,
  label,
  prompt,
  businessArea,
  context,
  onComplete,
}: AgentTriggerButtonProps) {
  const agentCtx = useContext(AgentContext);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!agentCtx) return;
    setLoading(true);
    try {
      const task = await agentCtx.executeTask({
        agent_id: agentId,
        title: label,
        prompt,
        business_area: businessArea,
        context,
      });
      onComplete?.(task.result || 'Task submitted');
    } catch {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0D9488]/20 text-[#0D9488] border border-[#0D9488]/30 hover:bg-[#0D9488]/30 transition-colors disabled:opacity-50"
    >
      <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {loading ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        )}
      </svg>
      {loading ? 'Running...' : label}
    </button>
  );
}
