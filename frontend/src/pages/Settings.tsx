import { useState, useEffect, useCallback } from 'react';
import PageShell from '../components/layout/PageShell';
import TabBar from '../components/shared/TabBar';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { adminUsers, adminBackup } from '../api/endpoints';
import type { BackupInfo, BackupProgress } from '../types';

const ALL_TABS = ['General', 'Integrations', 'API Keys', 'Users', 'Backups'];

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  icon: string;
  category: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used?: string;
  status: 'active' | 'revoked';
}

const MOCK_INTEGRATIONS: Integration[] = [
  { id: '1', name: 'Google Workspace', description: 'Calendar, Drive, and Gmail integration', status: 'connected', icon: 'G', category: 'Productivity' },
  { id: '2', name: 'Slack', description: 'Team messaging and notifications', status: 'connected', icon: 'S', category: 'Communication' },
  { id: '3', name: 'LinkedIn', description: 'Social media posting and analytics', status: 'connected', icon: 'in', category: 'Marketing' },
  { id: '4', name: 'HubSpot', description: 'CRM and marketing automation', status: 'disconnected', icon: 'H', category: 'CRM' },
  { id: '5', name: 'QuickBooks', description: 'Accounting and invoicing', status: 'disconnected', icon: 'QB', category: 'Finance' },
  { id: '6', name: 'Stripe', description: 'Payment processing', status: 'connected', icon: '$', category: 'Finance' },
  { id: '7', name: 'Zoom', description: 'Video conferencing', status: 'error', icon: 'Z', category: 'Communication' },
  { id: '8', name: 'GitHub', description: 'Code repository and CI/CD', status: 'connected', icon: 'GH', category: 'Development' },
];

const MOCK_API_KEYS: ApiKey[] = [
  { id: '1', name: 'Production API', key: 'axr_prod_****...7f3a', created_at: '2025-11-15', last_used: '2026-02-08', status: 'active' },
  { id: '2', name: 'Staging API', key: 'axr_stg_****...2b1c', created_at: '2025-12-01', last_used: '2026-02-07', status: 'active' },
  { id: '3', name: 'Old Integration Key', key: 'axr_int_****...9d4e', created_at: '2025-06-10', status: 'revoked' },
];

const STATUS_ICON_COLORS: Record<string, string> = {
  connected: 'bg-emerald-500/20 text-emerald-400',
  disconnected: 'bg-gray-500/20 text-gray-400',
  error: 'bg-red-500/20 text-red-400',
};

function loadSettings() {
  try {
    const saved = localStorage.getItem('settings');
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export default function Settings() {
  const [tab, setTab] = useState('General');
  const { user } = useAuth();
  const { showToast } = useToast();

  const saved = loadSettings();

  // General settings state
  const [companyName, setCompanyName] = useState(saved?.companyName ?? 'Ascent XR');
  const [timezone, setTimezone] = useState(saved?.timezone ?? 'America/New_York');
  const [currency, setCurrency] = useState(saved?.currency ?? 'USD');
  const [dateFormat, setDateFormat] = useState(saved?.dateFormat ?? 'MM/DD/YYYY');
  const [emailNotifications, setEmailNotifications] = useState(saved?.emailNotifications ?? true);
  const [pushNotifications, setPushNotifications] = useState(saved?.pushNotifications ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(saved?.weeklyDigest ?? true);
  const [agentAlerts, setAgentAlerts] = useState(saved?.agentAlerts ?? true);
  const [darkMode, setDarkMode] = useState(saved?.darkMode ?? true);

  // API Key modal state
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  // User management state
  const [managedUsers, setManagedUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('viewer');

  // Backup state
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [showCreateBackupModal, setShowCreateBackupModal] = useState(false);
  const [backupLabel, setBackupLabel] = useState('');
  const [backupIncludeFiles, setBackupIncludeFiles] = useState(false);
  const [backupCreating, setBackupCreating] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState<string | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState<BackupProgress | null>(null);
  const { subscribe } = useWebSocket();

  const TABS = user?.role === 'admin' ? ALL_TABS : ALL_TABS.filter(t => t !== 'Backups');

  function handleSaveSettings() {
    const settings = { companyName, timezone, currency, dateFormat, emailNotifications, pushNotifications, weeklyDigest, agentAlerts, darkMode };
    localStorage.setItem('settings', JSON.stringify(settings));
    showToast('Settings saved successfully', 'success');
  }

  useEffect(() => {
    if (tab === 'Users' && user?.role === 'admin') {
      loadUsers();
    }
  }, [tab, user?.role]);

  async function loadUsers() {
    setUsersLoading(true);
    try {
      const res = await adminUsers.list();
      setManagedUsers(res.data.data || []);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setUsersLoading(false);
    }
  }

  async function handleCreateUser() {
    try {
      await adminUsers.create({ email: newUserEmail, displayName: newUserName, password: newUserPassword, role: newUserRole });
      showToast('User created successfully', 'success');
      setShowCreateUserModal(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserPassword('');
      setNewUserRole('viewer');
      loadUsers();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to create user', 'error');
    }
  }

  async function handleRoleChange(uid: string, newRole: string) {
    try {
      await adminUsers.updateRole(uid, newRole);
      showToast('Role updated', 'success');
      loadUsers();
    } catch {
      showToast('Failed to update role', 'error');
    }
  }

  async function handleDisableUser(uid: string) {
    try {
      await adminUsers.disable(uid);
      showToast('User disabled', 'success');
      loadUsers();
    } catch {
      showToast('Failed to disable user', 'error');
    }
  }

  async function handleEnableUser(uid: string) {
    try {
      await adminUsers.enable(uid);
      showToast('User enabled', 'success');
      loadUsers();
    } catch {
      showToast('Failed to enable user', 'error');
    }
  }

  async function handleDeleteUser(uid: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminUsers.delete(uid);
      showToast('User deleted', 'success');
      loadUsers();
    } catch {
      showToast('Failed to delete user', 'error');
    }
  }

  // Backup functions
  const loadBackups = useCallback(async () => {
    setBackupsLoading(true);
    try {
      const res = await adminBackup.list();
      setBackups(res.data.data || []);
    } catch {
      showToast('Failed to load backups', 'error');
    } finally {
      setBackupsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (tab === 'Backups' && user?.role === 'admin') {
      loadBackups();
    }
  }, [tab, user?.role, loadBackups]);

  useEffect(() => {
    const unsub1 = subscribe('backup:progress', (data: BackupProgress) => {
      setBackupProgress(data);
      if (data.stage === 'complete') {
        setTimeout(() => setBackupProgress(null), 3000);
        loadBackups();
      }
    });
    const unsub2 = subscribe('restore:progress', (data: BackupProgress) => {
      setBackupProgress(data);
      if (data.stage === 'complete') {
        setTimeout(() => setBackupProgress(null), 3000);
      }
    });
    return () => { unsub1(); unsub2(); };
  }, [subscribe, loadBackups]);

  async function handleCreateBackup() {
    setBackupCreating(true);
    try {
      await adminBackup.create({ label: backupLabel || undefined, includeFiles: backupIncludeFiles });
      showToast('Backup created successfully', 'success');
      setShowCreateBackupModal(false);
      setBackupLabel('');
      setBackupIncludeFiles(false);
      loadBackups();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to create backup', 'error');
    } finally {
      setBackupCreating(false);
    }
  }

  async function handleRestore(filename: string) {
    setRestoring(true);
    try {
      const res = await adminBackup.restore(filename);
      const data = res.data.data;
      showToast(`Restored ${data?.tablesRestored} tables (${data?.rowsRestored} rows)`, 'success');
      setShowRestoreModal(null);
      setRestoreConfirmText('');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to restore backup', 'error');
    } finally {
      setRestoring(false);
    }
  }

  async function handleDeleteBackup(filename: string) {
    if (!confirm('Are you sure you want to delete this backup?')) return;
    try {
      await adminBackup.delete(filename);
      showToast('Backup deleted', 'success');
      loadBackups();
    } catch {
      showToast('Failed to delete backup', 'error');
    }
  }

  async function handleDownloadBackup(filename: string) {
    try {
      const res = await adminBackup.download(filename);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast('Failed to download backup', 'error');
    }
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <PageShell title="Settings" subtitle="Application configuration and preferences">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {/* General Settings */}
      {tab === 'General' && (
        <div className="max-w-2xl space-y-6">
          {/* Company Info */}
          <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white mb-4">Company Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Timezone</label>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                    <option value="America/New_York">Eastern (ET)</option>
                    <option value="America/Chicago">Central (CT)</option>
                    <option value="America/Denver">Mountain (MT)</option>
                    <option value="America/Los_Angeles">Pacific (PT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date Format</label>
                <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white mb-4">Notifications</h3>
            <div className="space-y-4">
              {[
                { label: 'Email Notifications', description: 'Receive notifications via email', value: emailNotifications, setter: setEmailNotifications },
                { label: 'Push Notifications', description: 'Browser push notifications for important events', value: pushNotifications, setter: setPushNotifications },
                { label: 'Weekly Digest', description: 'Receive a weekly summary of business metrics', value: weeklyDigest, setter: setWeeklyDigest },
                { label: 'Agent Task Alerts', description: 'Get notified when AI agents complete tasks', value: agentAlerts, setter: setAgentAlerts },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{pref.label}</p>
                    <p className="text-xs text-gray-400">{pref.description}</p>
                  </div>
                  <button
                    onClick={() => pref.setter(!pref.value)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${pref.value ? 'bg-[#2563EB]' : 'bg-navy-700'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${pref.value ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white mb-4">Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Dark Mode</p>
                <p className="text-xs text-gray-400">Use dark theme throughout the application</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-[#2563EB]' : 'bg-navy-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button onClick={handleSaveSettings} className="px-6 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">Save Changes</button>
          </div>
        </div>
      )}

      {/* Integrations */}
      {tab === 'Integrations' && (
        <div className="space-y-6">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-400">Demo mode -- integration connections are simulated. Connect real services in production.</p>
          </div>
          {['Productivity', 'Communication', 'Marketing', 'CRM', 'Finance', 'Development'].map((category) => {
            const items = MOCK_INTEGRATIONS.filter((i) => i.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="text-sm font-medium text-white mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((integration) => (
                    <div key={integration.id} className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${STATUS_ICON_COLORS[integration.status]}`}>
                          {integration.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">{integration.name}</h4>
                          <p className="text-xs text-gray-400">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={integration.status} />
                        <button className={`px-3 py-1.5 text-xs rounded-lg ${
                          integration.status === 'connected'
                            ? 'bg-navy-700 text-gray-400 hover:text-white'
                            : 'bg-[#2563EB] text-white hover:bg-[#2563EB]/80'
                        }`}>
                          {integration.status === 'connected' ? 'Configure' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* API Keys */}
      {tab === 'API Keys' && (
        <div className="max-w-3xl space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-400">Demo mode -- API keys shown are simulated. Generate real keys in production.</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Manage API keys for external integrations.</p>
            <button onClick={() => setShowApiKeyModal(true)} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">+ Generate Key</button>
          </div>
          <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-navy-700 text-xs text-gray-500 font-medium">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Key</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-2">Last Used</div>
              <div className="col-span-2">Status</div>
            </div>
            {MOCK_API_KEYS.map((key) => (
              <div key={key.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-navy-700/50 hover:bg-navy-700/30 transition-colors items-center">
                <div className="col-span-3 text-sm text-white">{key.name}</div>
                <div className="col-span-3 text-sm text-gray-400 font-mono">{key.key}</div>
                <div className="col-span-2 text-xs text-gray-400">{key.created_at}</div>
                <div className="col-span-2 text-xs text-gray-400">{key.last_used || 'Never'}</div>
                <div className="col-span-2 flex items-center gap-2">
                  <StatusBadge status={key.status} />
                  {key.status === 'active' && (
                    <button className="text-xs text-red-400 hover:text-red-300">Revoke</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'Users' && (
        <div className="max-w-3xl space-y-4">
          {user?.role === 'admin' ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Manage user access and permissions.</p>
                <button onClick={() => setShowCreateUserModal(true)} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80">+ Create User</button>
              </div>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : (
                <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-navy-700 text-xs text-gray-500 font-medium">
                    <div className="col-span-3">Name</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-2">Role</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                  {managedUsers.map((u: any) => (
                    <div key={u.firebase_uid || u.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-navy-700/50 hover:bg-navy-700/30 transition-colors items-center">
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#2563EB]/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#2563EB]">
                            {(u.display_name || u.email || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-white">{u.display_name || u.email}</span>
                      </div>
                      <div className="col-span-3 text-sm text-gray-400 truncate">{u.email}</div>
                      <div className="col-span-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-ascent-blue/20 text-ascent-blue' : 'bg-learning-teal/20 text-learning-teal'}`}>
                          {u.role === 'admin' ? 'Admin' : 'Viewer'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <StatusBadge status={u.is_enabled !== false ? 'active' : 'error'} />
                      </div>
                      <div className="col-span-2 flex gap-1">
                        <button
                          onClick={() => handleRoleChange(u.firebase_uid, u.role === 'admin' ? 'viewer' : 'admin')}
                          className="text-xs px-2 py-1 text-gray-400 hover:text-white bg-navy-700 rounded"
                          title={`Change to ${u.role === 'admin' ? 'viewer' : 'admin'}`}
                        >
                          Role
                        </button>
                        <button
                          onClick={() => u.is_enabled !== false ? handleDisableUser(u.firebase_uid) : handleEnableUser(u.firebase_uid)}
                          className="text-xs px-2 py-1 text-gray-400 hover:text-white bg-navy-700 rounded"
                        >
                          {u.is_enabled !== false ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.firebase_uid)}
                          className="text-xs px-2 py-1 text-red-400 hover:text-red-300 bg-navy-700 rounded"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  ))}
                  {managedUsers.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">No users found</div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-8 text-center">
              <p className="text-gray-400">You don't have permission to manage users.</p>
              <p className="text-xs text-gray-500 mt-2">Contact an administrator for access.</p>
            </div>
          )}
        </div>
      )}

      {/* Generate API Key Modal */}
      <Modal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} title="Generate API Key">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Key Name</label>
            <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g., Production API Key" className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-400">API keys provide full access to your account. Keep them secure and never share them publicly.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowApiKeyModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={() => { setShowApiKeyModal(false); setNewKeyName(''); }} disabled={!newKeyName.trim()} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg disabled:opacity-50">Generate</button>
          </div>
        </div>
      </Modal>
      {/* Backups */}
      {tab === 'Backups' && user?.role === 'admin' && (
        <div className="max-w-4xl space-y-4">
          {/* Progress bar */}
          {backupProgress && (
            <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white">{backupProgress.message}</p>
                {backupProgress.progress != null && (
                  <span className="text-xs text-gray-400">{backupProgress.progress}%</span>
                )}
              </div>
              {backupProgress.progress != null && (
                <div className="w-full bg-navy-700 rounded-full h-2">
                  <div
                    className="bg-[#2563EB] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${backupProgress.progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Database backups and restore points.</p>
            <button
              onClick={() => setShowCreateBackupModal(true)}
              disabled={backupCreating}
              className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#2563EB]/80 disabled:opacity-50"
            >
              {backupCreating ? 'Creating...' : '+ Create Backup'}
            </button>
          </div>

          {backupsLoading ? (
            <div className="flex justify-center py-8">
              <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-navy-700 text-xs text-gray-500 font-medium">
                <div className="col-span-4">Filename</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-3">Created</div>
                <div className="col-span-3">Actions</div>
              </div>
              {backups.map((backup) => (
                <div key={backup.filename} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-navy-700/50 hover:bg-navy-700/30 transition-colors items-center">
                  <div className="col-span-4 text-sm text-white font-mono truncate" title={backup.filename}>{backup.filename}</div>
                  <div className="col-span-2 text-sm text-gray-400">{formatBytes(backup.size)}</div>
                  <div className="col-span-3 text-xs text-gray-400">{new Date(backup.created).toLocaleString()}</div>
                  <div className="col-span-3 flex gap-1">
                    <button
                      onClick={() => handleDownloadBackup(backup.filename)}
                      className="text-xs px-2 py-1 text-gray-400 hover:text-white bg-navy-700 rounded"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => setShowRestoreModal(backup.filename)}
                      className="text-xs px-2 py-1 text-amber-400 hover:text-amber-300 bg-navy-700 rounded"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup.filename)}
                      className="text-xs px-2 py-1 text-red-400 hover:text-red-300 bg-navy-700 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {backups.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-500">No backups found. Create one to get started.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Backup Modal */}
      <Modal isOpen={showCreateBackupModal} onClose={() => setShowCreateBackupModal(false)} title="Create Backup">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Label (optional)</label>
            <input value={backupLabel} onChange={(e) => setBackupLabel(e.target.value)} placeholder="e.g., Pre-migration backup" className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Include uploaded files</p>
              <p className="text-xs text-gray-400">Adds all uploaded files to the backup archive</p>
            </div>
            <button
              onClick={() => setBackupIncludeFiles(!backupIncludeFiles)}
              className={`relative w-11 h-6 rounded-full transition-colors ${backupIncludeFiles ? 'bg-[#2563EB]' : 'bg-navy-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${backupIncludeFiles ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400">This will export all database tables and create a downloadable ZIP archive.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreateBackupModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleCreateBackup} disabled={backupCreating} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg disabled:opacity-50">
              {backupCreating ? 'Creating...' : 'Create Backup'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Restore Confirmation Modal */}
      <Modal isOpen={!!showRestoreModal} onClose={() => { setShowRestoreModal(null); setRestoreConfirmText(''); }} title="Restore from Backup">
        <div className="space-y-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-400 font-medium">WARNING: This will overwrite ALL current database data with the backup contents. This action cannot be undone.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Type RESTORE to confirm</label>
            <input
              value={restoreConfirmText}
              onChange={(e) => setRestoreConfirmText(e.target.value)}
              placeholder="RESTORE"
              className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowRestoreModal(null); setRestoreConfirmText(''); }} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button
              onClick={() => showRestoreModal && handleRestore(showRestoreModal)}
              disabled={restoreConfirmText !== 'RESTORE' || restoring}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg disabled:opacity-50 hover:bg-red-500"
            >
              {restoring ? 'Restoring...' : 'Restore Backup'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create User Modal */}
      <Modal isOpen={showCreateUserModal} onClose={() => setShowCreateUserModal(false)} title="Create User">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} type="email" placeholder="user@example.com" className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Display Name</label>
            <input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Full Name" className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Temporary Password</label>
            <input value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} type="password" placeholder="Min 6 characters" className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Role</label>
            <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreateUserModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleCreateUser} disabled={!newUserEmail.trim() || !newUserPassword.trim() || newUserPassword.length < 6} className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg disabled:opacity-50">Create User</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
