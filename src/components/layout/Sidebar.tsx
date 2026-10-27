import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  Target,
  PiggyBank,
  BarChart3,
  Settings,
  Plus,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  onAddTransaction: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/accounts', icon: Wallet, label: 'Accounts' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/budgets', icon: Target, label: 'Budgets' },
  { to: '/savings', icon: PiggyBank, label: 'Savings Goals' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ onAddTransaction }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--bg-sidebar)] select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--border-color)]">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center shadow-xs">
              <span className="text-white font-extrabold text-base tracking-tighter">F</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-[var(--text-main)]">Finora</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[var(--primary-light)] text-[var(--primary)] px-1.5 py-0.5 rounded border border-[var(--primary)]/20">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium leading-none -mt-0.5">Finance Suite</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center shadow-xs">
            <span className="text-white font-extrabold text-base tracking-tighter">F</span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-muted)] rounded-lg transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="p-3">
        <button
          onClick={onAddTransaction}
          className={`btn-primary w-full shadow-sm hover:shadow-md transition-all ${
            collapsed ? 'px-0 justify-center' : 'justify-center'
          }`}
          title="Add New Transaction"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          {!collapsed && <span className="font-semibold text-sm">Add Transaction</span>}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        <div className="px-2.5 pb-1 pt-2">
          {!collapsed && (
            <p className="text-[11px] font-semibold text-[var(--text-muted)] opacity-70 uppercase tracking-wider">
              Menu
            </p>
          )}
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--primary)] bg-[var(--bg-highlight)] border border-[var(--primary)]/20 font-semibold text-sm transition-colors'
                : 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-muted)] text-sm font-medium transition-colors'
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Currency & Workspace Banner */}
      {!collapsed && (
        <div className="mx-3 my-2 p-3 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)] text-xs">
          <div className="flex items-center justify-between text-[var(--text-main)] font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" /> INR Workspace
            </span>
            <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px] border border-emerald-500/20">
              Active
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
            All reports formatted in Indian Rupee (₹).
          </p>
        </div>
      )}

      {/* User Profile & Sign Out Footer */}
      <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-sidebar)]">
        <div className={`flex items-center gap-3 p-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-bold text-xs flex items-center justify-center flex-shrink-0 border border-[var(--primary)]/20">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--text-main)] truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">
                {profile?.email || 'user@finora.local'}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleSignOut}
              className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button Floating */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 bg-[var(--primary)] text-white p-3 rounded-full shadow-lg hover:bg-[var(--primary-hover)] transition-all"
        title="Open navigation menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] z-50 transform transition-transform duration-300 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-muted)] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] sticky top-0 transition-all duration-200 z-20 ${
          collapsed ? 'w-[74px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
