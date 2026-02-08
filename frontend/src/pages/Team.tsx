import { useState } from 'react';
import PageShell from '../components/layout/PageShell';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { team } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import type { TeamMember } from '../types';

export default function Team() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<TeamMember>>({});
  const [saving, setSaving] = useState(false);

  const { data: membersData, loading, refetch } = useApi<TeamMember[]>(() => team.list(), []);
  const members = membersData || [];

  const humans = members.filter((m) => m.type === 'human');
  const aiAgents = members.filter((m) => m.type === 'ai_agent');

  async function handleSave() {
    setSaving(true);
    try {
      if (editing.id) await team.update(editing.id, editing);
      else await team.create(editing);
      setShowModal(false); setEditing({}); refetch();
    } catch {} finally { setSaving(false); }
  }

  function renderMemberCard(member: TeamMember) {
    return (
      <div
        key={member.id}
        className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 hover:border-[#2563EB]/30 transition-colors cursor-pointer"
        onClick={() => { setEditing(member); setShowModal(true); }}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${member.type === 'ai_agent' ? 'bg-[#7C3AED]/20' : 'bg-[#2563EB]/20'}`}>
            {member.avatar_url ? (
              <img src={member.avatar_url} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <span className={`text-lg font-bold ${member.type === 'ai_agent' ? 'text-[#7C3AED]' : 'text-[#2563EB]'}`}>
                {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold text-sm truncate">{member.name}</h3>
              <StatusBadge status={member.status} />
            </div>
            <p className="text-xs text-[#2563EB]">{member.role}</p>
            {member.department && <p className="text-xs text-gray-400 mt-0.5">{member.department}</p>}
            {member.bio && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{member.bio}</p>}
            {member.responsibilities && member.responsibilities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {member.responsibilities.slice(0, 3).map((r, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-gray-400">{r}</span>
                ))}
                {member.responsibilities.length > 3 && (
                  <span className="text-xs text-gray-500">+{member.responsibilities.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageShell title="Team" subtitle="Human team members and AI agents">
      {/* Human Team */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-white mb-4">Human Team</h3>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-navy-700 rounded-xl animate-pulse" />)}
          </div>
        ) : humans.length === 0 ? (
          <p className="text-gray-500 text-sm">No human team members configured.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {humans.map(renderMemberCard)}
          </div>
        )}
      </div>

      {/* AI Agents */}
      <div>
        <h3 className="text-sm font-medium text-white mb-4">AI Agents</h3>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-navy-700 rounded-xl animate-pulse" />)}
          </div>
        ) : aiAgents.length === 0 ? (
          <p className="text-gray-500 text-sm">No AI agents configured.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiAgents.map(renderMemberCard)}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing.id ? 'Edit Profile' : 'New Team Member'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Role</label>
              <input value={editing.role || ''} onChange={(e) => setEditing({ ...editing, role: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select value={editing.type || 'human'} onChange={(e) => setEditing({ ...editing, type: e.target.value as TeamMember['type'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="human">Human</option><option value="ai_agent">AI Agent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Department</label>
              <input value={editing.department || ''} onChange={(e) => setEditing({ ...editing, department: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Bio</label>
            <textarea value={editing.bio || ''} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} rows={3} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
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
