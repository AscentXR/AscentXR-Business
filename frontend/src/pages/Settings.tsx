import { useState, useEffect } from 'react';
import PageShell from '../components/layout/PageShell';
import TabBar from '../components/shared/TabBar';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const TABS = ['General', 'Integrations', 'API Keys', 'Users'];

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

  function handleSaveSettings() {
    const settings = { companyName, timezone, currency, dateFormat, emailNotifications, pushNotifications, weeklyDigest, agentAlerts, darkMode };
    localStorage.setItem('settings', JSON.stringify(settings));
    showToast('Settings saved successfully', 'success');
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
          <p className="text-sm text-gray-400">Manage user access and permissions.</p>
          <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-navy-700 text-xs text-gray-500 font-medium">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Username</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-3">Status</div>
            </div>
            {user && (
              <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-navy-700/50 items-center">
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2563EB]/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#2563EB]">{user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <span className="text-sm text-white">{user.name}</span>
                </div>
                <div className="col-span-3 text-sm text-gray-400">{user.username}</div>
                <div className="col-span-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-[#7C3AED]/20 text-[#7C3AED]">{user.role}</span>
                </div>
                <div className="col-span-3"><StatusBadge status="active" /></div>
              </div>
            )}
            {/* Additional placeholder users */}
            {[
              { name: 'Sarah Chen', username: 'sarah', role: 'CTO', initials: 'SC' },
              { name: 'Alex Rivera', username: 'alex', role: 'VP Sales', initials: 'AR' },
            ].map((u) => (
              <div key={u.username} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-navy-700/50 items-center">
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-400">{u.initials}</span>
                  </div>
                  <span className="text-sm text-white">{u.name}</span>
                </div>
                <div className="col-span-3 text-sm text-gray-400">{u.username}</div>
                <div className="col-span-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-navy-700 text-gray-400">{u.role}</span>
                </div>
                <div className="col-span-3"><StatusBadge status="active" /></div>
              </div>
            ))}
          </div>
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
    </PageShell>
  );
}
