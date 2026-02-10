import { useState, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import StatusBadge from '../components/shared/StatusBadge';
import ProgressBar from '../components/shared/ProgressBar';
import Modal from '../components/shared/Modal';
import AgentTriggerButton from '../components/shared/AgentTriggerButton';
import ErrorState from '../components/shared/ErrorState';
import { goals } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import type { Goal } from '../types';

const QUARTERS = ['Q1 2026', 'Q2 2026'];
const BUSINESS_AREAS = ['All', 'Sales', 'Marketing', 'Finance', 'Product', 'Customer Success'];

export default function Goals() {
  const [quarter, setQuarter] = useState('Q1 2026');
  const [areaFilter, setAreaFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Goal>>({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const { data: goalsData, loading, error, refetch } = useApi<Goal[]>(() => goals.getTree({ quarter }), [quarter]);
  const goalTree = goalsData || [];

  const filteredGoals = useMemo(() => {
    if (areaFilter === 'All') return goalTree;
    return goalTree.filter((g) => g.business_area?.toLowerCase() === areaFilter.toLowerCase());
  }, [goalTree, areaFilter]);

  const behindSchedule = goalTree.filter((g) => g.status === 'behind' || g.status === 'at_risk');

  const areaSummary = useMemo(() => {
    const areas = ['Sales', 'Marketing', 'Finance', 'Product', 'Customer Success'];
    return areas.map((area) => {
      const areaGoals = goalTree.filter((g) => g.business_area?.toLowerCase() === area.toLowerCase() && g.goal_type === 'objective');
      const avgProgress = areaGoals.length > 0 ? Math.round(areaGoals.reduce((s, g) => s + g.progress, 0) / areaGoals.length) : 0;
      return { area, count: areaGoals.length, avgProgress };
    });
  }, [goalTree]);

  async function handleSave() {
    setSaving(true);
    try {
      if (editing.id) await goals.update(editing.id, editing);
      else await goals.create(editing);
      showToast('Goal saved successfully', 'success');
      setShowModal(false); setEditing({}); refetch();
    } catch (err: any) { showToast(err.response?.data?.error || 'Operation failed', 'error'); } finally { setSaving(false); }
  }

  function renderGoalNode(goal: Goal, depth: number = 0) {
    return (
      <div key={goal.id} style={{ marginLeft: `${depth * 24}px` }} className="mb-2">
        <div
          className="p-3 bg-navy-700/50 rounded-lg hover:bg-navy-700 transition-colors cursor-pointer"
          onClick={() => { setEditing(goal); setShowModal(true); }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${goal.goal_type === 'objective' ? 'bg-[#2563EB]/20 text-[#2563EB]' : 'bg-[#0D9488]/20 text-[#0D9488]'}`}>
                {goal.goal_type === 'objective' ? 'O' : 'KR'}
              </span>
              <span className="text-sm text-white">{goal.title}</span>
            </div>
            <StatusBadge status={goal.status} />
          </div>
          <ProgressBar value={goal.progress} color={goal.status === 'behind' || goal.status === 'at_risk' ? 'red' : goal.status === 'completed' ? 'green' : 'blue'} size="sm" />
          {goal.owner && <p className="text-xs text-gray-500 mt-1">Owner: {goal.owner}</p>}
        </div>
        {goal.children?.map((child) => renderGoalNode(child, depth + 1))}
      </div>
    );
  }

  return (
    <PageShell
      title="Goals & OKRs"
      subtitle="Objectives and Key Results tracking"
      actions={
        <div className="flex gap-2 flex-wrap">
          <AgentTriggerButton agentId="strategy" label="Generate Weekly Review" prompt="Generate a weekly OKR progress review with recommendations" businessArea="strategy" />
          <button onClick={() => { setEditing({ goal_type: 'objective', quarter }); setShowModal(true); }} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">+ New Goal</button>
        </div>
      }
    >
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!error && <>
      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-2">
          {QUARTERS.map((q) => (
            <button key={q} onClick={() => setQuarter(q)} className={`px-4 py-2 text-sm rounded-lg transition-colors ${quarter === q ? 'bg-[#2563EB] text-white' : 'bg-navy-700 text-gray-400 hover:text-white'}`}>{q}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {BUSINESS_AREAS.map((area) => (
            <button key={area} onClick={() => setAreaFilter(area)} className={`px-3 py-1.5 text-xs rounded-full transition-colors ${areaFilter === area ? 'bg-[#0D9488] text-white' : 'bg-navy-700 text-gray-400 hover:text-white'}`}>{area}</button>
          ))}
        </div>
      </div>

      {/* Area Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {areaSummary.map(({ area, count, avgProgress }) => (
          <div key={area} className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-4">
            <p className="text-sm font-medium text-white mb-1">{area}</p>
            <p className="text-xs text-gray-400 mb-2">{count} objectives</p>
            <ProgressBar value={avgProgress} color="blue" size="sm" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OKR Tree */}
        <div className="lg:col-span-2">
          <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white mb-4">OKR Tree - {quarter}</h3>
            {loading ? (
              <div className="space-y-3 animate-pulse">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-navy-700 rounded" />)}</div>
            ) : filteredGoals.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No goals found for this selection.</p>
            ) : (
              <div className="space-y-1">{filteredGoals.map((g) => renderGoalNode(g))}</div>
            )}
          </div>
        </div>

        {/* Behind Schedule Alerts */}
        <div>
          <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white mb-4">Behind Schedule</h3>
            {behindSchedule.length === 0 ? (
              <p className="text-gray-500 text-sm">All goals are on track.</p>
            ) : (
              <div className="space-y-3">
                {behindSchedule.map((g) => (
                  <div key={g.id} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-white">{g.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">{g.progress}% complete</span>
                      <StatusBadge status={g.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      </>}
      {/* Goal Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing.id ? 'Edit Goal' : 'New Goal'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select value={editing.goal_type || 'objective'} onChange={(e) => setEditing({ ...editing, goal_type: e.target.value as Goal['goal_type'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="objective">Objective</option><option value="key_result">Key Result</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Business Area</label>
              <select value={editing.business_area || ''} onChange={(e) => setEditing({ ...editing, business_area: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="">Select...</option>
                {BUSINESS_AREAS.filter((a) => a !== 'All').map((a) => <option key={a} value={a.toLowerCase()}>{a}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Value</label>
              <input type="number" value={editing.target_value || ''} onChange={(e) => setEditing({ ...editing, target_value: Number(e.target.value) })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Owner</label>
              <input value={editing.owner || ''} onChange={(e) => setEditing({ ...editing, owner: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
