import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Megaphone,
  Package,
  DollarSign,
  Receipt,
  Palette,
  Bot,
  Target,
  Heart,
  Handshake,
  Users,
  Shield,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Command Center', icon: LayoutDashboard },
  { path: '/sales', label: 'Sales & CRM', icon: TrendingUp },
  { path: '/marketing', label: 'Marketing', icon: Megaphone },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/finance', label: 'Finance', icon: DollarSign },
  { path: '/taxes', label: 'Taxes', icon: Receipt },
  { path: '/brand', label: 'Brand', icon: Palette },
  { path: '/agents', label: 'Agents', icon: Bot },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/customer-success', label: 'Customer Success', icon: Heart },
  { path: '/partnerships', label: 'Partnerships', icon: Handshake },
  { path: '/team', label: 'Team', icon: Users },
  { path: '/legal', label: 'Legal', icon: Shield },
  { path: '/documents', label: 'Documents', icon: FileText },
];

const REVENUE_TARGET = 300000;
const REVENUE_CURRENT = 47500; // Will be replaced with live data

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const revenuePercent = Math.min(100, Math.round((REVENUE_CURRENT / REVENUE_TARGET) * 100));

  return (
    <aside
      className={clsx(
        'flex flex-col bg-navy-800 border-r border-navy-700 transition-all duration-300 h-full',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo & Revenue Target */}
      <div className="p-4 border-b border-navy-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ascent-blue flex items-center justify-center font-bold text-sm flex-shrink-0">
            AX
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white truncate">AscentXR</h1>
              <p className="text-xs text-gray-400 truncate">Business Control Center</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">Revenue Target</span>
              <span className="text-ascent-blue font-semibold">{revenuePercent}%</span>
            </div>
            <div className="w-full bg-navy-900 rounded-full h-2">
              <div
                className="bg-ascent-blue h-2 rounded-full transition-all duration-500"
                style={{ width: `${revenuePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs mt-1 text-gray-500">
              <span>${(REVENUE_CURRENT / 1000).toFixed(0)}K</span>
              <span>${(REVENUE_TARGET / 1000).toFixed(0)}K</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm transition-colors duration-150',
                isActive
                  ? 'bg-ascent-blue/20 text-ascent-blue font-medium'
                  : 'text-gray-400 hover:bg-navy-700 hover:text-white'
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: Settings & Collapse */}
      <div className="border-t border-navy-700 p-2">
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={clsx(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150',
            location.pathname === '/settings'
              ? 'bg-ascent-blue/20 text-ascent-blue font-medium'
              : 'text-gray-400 hover:bg-navy-700 hover:text-white'
          )}
        >
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-navy-700 hover:text-white transition-colors duration-150 w-full mt-1"
        >
          {collapsed ? (
            <ChevronRight size={18} className="flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft size={18} className="flex-shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
