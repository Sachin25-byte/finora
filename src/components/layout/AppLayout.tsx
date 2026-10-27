import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import TransactionModal from '../transactions/TransactionModal';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search,
  Bell,
  Plus,
  Calendar,
  Sparkles,
  ShieldCheck,
  User,
  ExternalLink
} from 'lucide-react';

import { TopNavThemeSwitcher } from '../ui/ThemeSwitcher';

export default function AppLayout() {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { profile } = useAuth();

  const getPageTitle = (path: string) => {
    if (path.includes('/dashboard')) return 'Financial Dashboard';
    if (path.includes('/transactions')) return 'Transaction Management';
    if (path.includes('/accounts')) return 'Accounts & Wallets';
    if (path.includes('/categories')) return 'Expense & Income Categories';
    if (path.includes('/budgets')) return 'Monthly Budgets';
    if (path.includes('/savings')) return 'Savings Goals';
    if (path.includes('/reports')) return 'Financial Analytics & Reports';
    if (path.includes('/settings')) return 'Settings & Preferences';
    return 'Finora Overview';
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar onAddTransaction={() => setShowTransactionModal(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Compact Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-color)] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-colors duration-200 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[var(--text-main)] tracking-tight truncate">
                {getPageTitle(location.pathname)}
              </h1>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Calendar className="w-3.5 h-3.5 opacity-70" />
                <span>{currentDateFormatted}</span>
                <span className="hidden sm:inline opacity-40">•</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-emerald-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Live Sync
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search */}
            <div className="relative hidden md:block w-52 lg:w-64">
              <Search className="w-4 h-4 text-[var(--text-muted)] opacity-70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search financial records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-muted)] border border-[var(--border-color)] rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--bg-card)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
              />
            </div>

            {/* Quick Theme Switcher */}
            <TopNavThemeSwitcher />

            {/* Notification Bell */}
            <button
              className="relative p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-muted)] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--primary)] ring-2 ring-[var(--bg-header)]"></span>
            </button>

            {/* Add Transaction Button */}
            <button
              onClick={() => setShowTransactionModal(true)}
              className="btn-primary text-xs py-2 px-3 sm:px-3.5 gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Profile Avatar Pill */}
            <Link
              to="/settings"
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-muted)] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-bold text-xs flex items-center justify-center">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'G'}
              </div>
              <span className="text-xs font-semibold text-[var(--text-main)] hidden sm:inline max-w-[100px] truncate">
                {profile?.full_name?.split(' ')[0] || 'User'}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionModal
          onClose={() => setShowTransactionModal(false)}
          onSuccess={() => {
            setShowTransactionModal(false);
            window.dispatchEvent(new CustomEvent('transaction-changed'));
          }}
        />
      )}
    </div>
  );
}
