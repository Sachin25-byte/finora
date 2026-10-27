import React, { useState, useEffect, useCallback } from 'react';
import {
  getDashboardSummary,
  getMonthlyTrends,
  getExpensesByCategory,
  getRecentTransactions,
  getBudgets,
  getAccounts,
} from '../lib/api';
import { formatCurrency, formatDate, getStartOfMonth, getEndOfMonth, getStartOfYear, getEndOfYear, getPreviousMonth, formatDateInput } from '../lib/utils';
import { StatCard, PageLoader, ErrorState, EmptyState } from '../components/ui/shared';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ArrowLeftRight,
  Plus,
  Briefcase,
  User,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { Transaction, DashboardFilters, FinanceType, DashboardSummary, Account } from '../types';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'current_month',
    financeType: 'all',
  });

  const getDateRange = useCallback(() => {
    const now = new Date();
    switch (filters.period) {
      case 'current_month':
        return { start: getStartOfMonth(now), end: getEndOfMonth(now) };
      case 'previous_month':
        return getPreviousMonth(now);
      case 'current_year':
        return { start: getStartOfYear(now), end: getEndOfYear(now) };
      case 'custom':
        return filters.dateRange || { start: getStartOfMonth(now), end: getEndOfMonth(now) };
      default:
        return { start: getStartOfMonth(now), end: getEndOfMonth(now) };
    }
  }, [filters]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { start, end } = getDateRange();
      const startStr = formatDateInput(start);
      const endStr = formatDateInput(end);
      const finType = filters.financeType as FinanceType | 'all';
      const now = new Date();

      const [summaryData, trends, expenses, recent, budgetData, accountData] = await Promise.all([
        getDashboardSummary(startStr, endStr, finType),
        getMonthlyTrends(now.getFullYear(), finType),
        getExpensesByCategory(startStr, endStr, finType),
        getRecentTransactions(6, finType),
        getBudgets(now.getMonth() + 1, now.getFullYear(), finType),
        getAccounts(),
      ]);

      setSummary(summaryData);
      setMonthlyData(trends);
      setCategoryData(expenses);
      setRecentTransactions(recent);
      setBudgets(budgetData);
      setAccounts(accountData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [filters, getDateRange]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const handler = () => loadDashboard();
    window.addEventListener('transaction-changed', handler);
    return () => window.removeEventListener('transaction-changed', handler);
  }, [loadDashboard]);

  const triggerAddTransaction = () => {
    const btn = document.querySelector('header button.btn-primary') as HTMLButtonElement;
    if (btn) btn.click();
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={loadDashboard} />;
  if (!summary) return null;

  // Modern Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-3 shadow-lg text-xs backdrop-blur-md">
          <p className="font-bold text-[var(--text-main)] mb-1.5">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 font-medium" style={{ color: p.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </span>
              <span className="font-bold text-[var(--text-main)]">{formatCurrency(p.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const DONUT_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444', '#64748B'];

  // Personal vs Business summary calculations
  const personalAccounts = accounts.filter(a => a.finance_type === 'personal');
  const businessAccounts = accounts.filter(a => a.finance_type === 'business');

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Dashboard Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[var(--bg-card)] p-3.5 sm:p-4 rounded-xl border border-[var(--border-color)] shadow-xs transition-colors">
        <div>
          <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight">Overview & Metrics</h2>
          <p className="text-xs text-[var(--text-muted)]">Real-time personal and business finances formatted in INR</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Period Filter Tabs */}
          <div className="inline-flex bg-[var(--bg-muted)] p-1 rounded-lg border border-[var(--border-color)]">
            {[
              { key: 'current_month', label: 'This Month' },
              { key: 'previous_month', label: 'Last Month' },
              { key: 'current_year', label: 'This Year' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setFilters(f => ({ ...f, period: item.key as any }))}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  filters.period === item.key
                    ? 'bg-[var(--primary)] text-[var(--primary-text)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Finance Type Switcher */}
          <div className="inline-flex bg-[var(--bg-muted)] p-1 rounded-lg border border-[var(--border-color)]">
            {[
              { key: 'all', label: 'All Finances' },
              { key: 'personal', label: 'Personal' },
              { key: 'business', label: 'Business' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setFilters(f => ({ ...f, financeType: item.key as any }))}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  filters.financeType === item.key
                    ? 'bg-[var(--primary)] text-[var(--primary-text)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6 Key Financial KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        <StatCard
          title="Total Balance"
          value={formatCurrency(summary.totalBalance)}
          icon={<Wallet className="w-5 h-5" />}
          iconBg="bg-[var(--primary-light)]"
          iconColor="text-[var(--primary)]"
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(summary.totalIncome)}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={<TrendingDown className="w-5 h-5" />}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-500"
        />
        <StatCard
          title="Net Cash Flow"
          value={formatCurrency(summary.netCashFlow)}
          icon={<Activity className="w-5 h-5" />}
          iconBg={summary.netCashFlow >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}
          iconColor={summary.netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}
        />
        <StatCard
          title="Savings"
          value={formatCurrency(summary.savingsAmount)}
          icon={<PiggyBank className="w-5 h-5" />}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-500"
        />
        <StatCard
          title="Savings Rate"
          value={`${summary.savingsRate}%`}
          icon={<ArrowUpRight className="w-5 h-5" />}
          iconBg="bg-sky-500/10"
          iconColor="text-sky-500"
        />
      </div>

      {/* Personal vs Business Financial Breakdown Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Breakdown */}
        <div className="card p-4 flex items-center justify-between border-l-4 border-l-[var(--primary)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Personal Portfolio</p>
              <p className="text-base font-bold text-[var(--text-main)]">{personalAccounts.length} Active Accounts</p>
            </div>
          </div>
          <span className="badge-personal text-xs px-2.5 py-1">
            Personal Mode
          </span>
        </div>

        {/* Business Breakdown */}
        <div className="card p-4 flex items-center justify-between border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Business Operations</p>
              <p className="text-base font-bold text-[var(--text-main)]">{businessAccounts.length} Business Accounts</p>
            </div>
          </div>
          <span className="badge-business text-xs px-2.5 py-1">
            Business Mode
          </span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income vs Expenses Bar Chart */}
        <div className="card lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#2563EB]" /> Income vs Expenses ({new Date().getFullYear()})
              </h3>
              <p className="text-xs text-[#64748B]">Monthly revenue and burn comparison</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-[#16A34A]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#16A34A]" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-[#DC2626]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626]" /> Expenses
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Income" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expense" name="Expenses" fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown Donut Chart */}
        <div className="card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[var(--primary)]" /> Expense Categories
              </h3>
              <p className="text-xs text-[var(--text-muted)]">Breakdown of spending by category</p>
            </div>
          </div>

          {categoryData.length > 0 ? (
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="48%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="name"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      color: 'var(--text-main)',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: 'var(--text-main)' }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Spent']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-[var(--text-muted)] font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<PieIcon className="w-6 h-6" />}
              title="No Expense Data"
              description="No expenses recorded for this period yet."
              action={
                <button onClick={triggerAddTransaction} className="btn-primary btn-sm">
                  <Plus className="w-3.5 h-3.5" /> Add Expense
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & Monthly Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions List */}
        {/* Recent Transactions List */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">Recent Transactions</h3>
              <p className="text-xs text-[var(--text-muted)]">Latest activity in your accounts</p>
            </div>
            <button
              onClick={() => window.location.href = '/transactions'}
              className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-[var(--border-color)]">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between hover:bg-[var(--bg-muted)] px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : tx.type === 'expense'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : tx.type === 'expense' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-main)] truncate">{tx.description}</p>
                      <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                        <span>{formatDate(tx.date)}</span>
                        <span className="opacity-40">•</span>
                        <span className="capitalize">{(tx.category as any)?.name || tx.type}</span>
                        <span className="opacity-40">•</span>
                        <span className="capitalize">{tx.finance_type}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p
                      className={`text-xs font-bold ${
                        tx.type === 'income'
                          ? 'text-[#16A34A]'
                          : tx.type === 'expense'
                          ? 'text-[#DC2626]'
                          : 'text-amber-500'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                      {formatCurrency(tx.amount)}
                    </p>
                    <span className="text-[10px] text-[var(--text-muted)] capitalize">
                      {tx.payment_method?.replace('_', ' ') || 'Direct'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ArrowLeftRight className="w-6 h-6" />}
              title="No Transactions Found"
              description="Record your first income or expense transaction to see real analytics."
              action={
                <button onClick={triggerAddTransaction} className="btn-primary btn-sm">
                  <Plus className="w-3.5 h-3.5" /> Add Transaction
                </button>
              }
            />
          )}
        </div>

        {/* Monthly Budget Progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">Monthly Budget Tracking</h3>
              <p className="text-xs text-[var(--text-muted)]">Real-time category spending limits</p>
            </div>
            <button
              onClick={() => window.location.href = '/budgets'}
              className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.slice(0, 5).map((budget) => {
                const pct = Math.min(budget.percentage || 0, 100);
                const isWarning = pct >= 80 && pct < 100;
                const isOver = pct >= 100;

                return (
                  <div key={budget.id} className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-muted)]">
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <span className="font-semibold text-[var(--text-main)]">{budget.category?.name || 'Category'}</span>
                      <span className="font-medium text-[var(--text-muted)]">
                        <strong className="text-[var(--text-main)]">{formatCurrency(budget.spent || 0)}</strong> of {formatCurrency(budget.amount)}
                      </span>
                    </div>

                    <div className="progress-bar h-2 bg-[var(--border-color)]">
                      <div
                        className={`progress-fill ${
                          isOver ? 'bg-[#DC2626]' : isWarning ? 'bg-amber-500' : 'bg-[var(--primary)]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className={`font-semibold ${isOver ? 'text-[#DC2626]' : isWarning ? 'text-amber-600' : 'text-[#64748B]'}`}>
                        {Math.round(budget.percentage || 0)}% utilized
                      </span>
                      {isOver ? (
                        <span className="text-[#DC2626] font-medium">Over by {formatCurrency(Math.abs(budget.remaining || 0))}</span>
                      ) : (
                        <span className="text-[#16A34A] font-medium">{formatCurrency(budget.remaining || 0)} remaining</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<PiggyBank className="w-6 h-6" />}
              title="No Monthly Budgets"
              description="Set up category budgets to track spending limits automatically."
              action={
                <button onClick={() => window.location.href = '/budgets'} className="btn-secondary btn-sm">
                  Set Up Budget
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
