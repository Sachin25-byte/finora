import React, { useState, useEffect } from 'react';
import { getMonthlyTrends, getExpensesByCategory, getAccounts } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { PageLoader, EmptyState } from '../components/ui/shared';
import { BarChart3, TrendingUp, Calendar, PieChart as PieIcon, Wallet, ShieldCheck, Download } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [financeType, setFinanceType] = useState<'all' | 'personal' | 'business'>('all');

  useEffect(() => {
    loadReports();
  }, [financeType]);

  async function loadReports() {
    try {
      setLoading(true);
      const year = new Date().getFullYear();
      const [trends, categories, allAccounts] = await Promise.all([
        getMonthlyTrends(year, financeType),
        getExpensesByCategory(`${year}-01-01`, `${year}-12-31`, financeType),
        getAccounts(),
      ]);
      setMonthlyTrends(trends || []);
      setCategoryData(categories || []);
      const filteredAccounts = financeType === 'all' 
        ? allAccounts 
        : (allAccounts || []).filter(a => a.finance_type === financeType);
      setAccounts(filteredAccounts);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444', '#64748B'];

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#2563EB]" /> Financial Analytics & Reports
          </h1>
          <p className="page-subtitle">Deep dive into revenue trends, cash flow velocity, and asset distribution</p>
        </div>

        <div className="inline-flex bg-[var(--bg-muted)] p-1 rounded-lg border border-[var(--border-color)]">
          {(['all', 'personal', 'business'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFinanceType(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                financeType === t
                  ? 'bg-[var(--primary)] text-[var(--primary-text)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {t === 'all' ? 'Consolidated' : t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Comparison */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[var(--primary)]" /> Income vs Expense Trajectory ({new Date().getFullYear()})
                </h2>
                <p className="text-xs text-[var(--text-muted)]">Compare monthly inflows versus outflows</p>
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

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                  />
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
                    formatter={(val: any) => [formatCurrency(Number(val) || 0), '']}
                  />
                  <Legend verticalAlign="top" align="right" />
                  <Bar dataKey="income" name="Income" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expense" name="Expense" fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="card">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[var(--primary)]" /> Expense Category Distribution
                </h2>
                <p className="text-xs text-[var(--text-muted)]">Top spending allocations</p>
              </div>
            </div>

            {categoryData.length === 0 ? (
              <EmptyState
                icon={<PieIcon className="w-6 h-6" />}
                title="No Expense Data"
                description="Record transactions to generate category reports."
              />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                      formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Spent']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Account Breakdown */}
          <div className="card">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[var(--primary)]" /> Account Balance Reserves
                </h2>
                <p className="text-xs text-[var(--text-muted)]">Liquidity stored across vaults and wallets</p>
              </div>
            </div>

            {accounts.length === 0 ? (
              <EmptyState
                icon={<Wallet className="w-6 h-6" />}
                title="No Active Accounts"
                description="Add bank accounts or cash vaults to see live distribution."
              />
            ) : (
              <div className="space-y-2.5">
                {accounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-muted)] border border-[var(--border-color)]">
                    <div>
                      <p className="text-xs font-bold text-[var(--text-main)]">{acc.name}</p>
                      <p className="text-[11px] text-[var(--text-muted)] capitalize">{acc.type.replace('_', ' ')} • {acc.finance_type}</p>
                    </div>
                    <span className={`text-xs font-bold ${Number(acc.current_balance || 0) >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      {formatCurrency(acc.current_balance ?? acc.opening_balance ?? 0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
