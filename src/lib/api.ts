import { supabase, isSupabaseConfigured } from './supabase';
import type { Account, Transaction, Category, Budget, SavingsGoal, FinanceType, DashboardSummary } from '../types';
import {
  localGetAccounts,
  localSaveAccount,
  localUpdateAccount,
  localDeleteAccount,
  localGetCategories,
  localSaveCategory,
  localUpdateCategory,
  localDeleteCategory,
  localGetTransactions,
  localSaveTransaction,
  localUpdateTransaction,
  localDeleteTransaction,
  localGetBudgets,
  localSaveBudget,
  localUpdateBudget,
  localDeleteBudget,
  localGetSavingsGoals,
  localSaveSavingsGoal,
  localUpdateSavingsGoal,
  localDeleteSavingsGoal,
} from './localStorageStore';

// Helper to determine if we should fallback
async function canUseSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return Boolean(session?.user);
  } catch {
    return false;
  }
}

// ============================================================
// ACCOUNTS
// ============================================================

export async function getAccounts(): Promise<Account[]> {
  if (!(await canUseSupabase())) {
    return localGetAccounts();
  }
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Falling back to local accounts store:', err);
    return localGetAccounts();
  }
}

export async function getAccountsWithBalances(): Promise<Account[]> {
  const accounts = await getAccounts();
  const txs = await (await canUseSupabase() ? getTransactions({ pageSize: 1000 }).then(r => r.data) : localGetTransactions());
  
  const balances: Record<string, number> = {};
  accounts.forEach(acc => {
    balances[acc.id] = acc.type === 'credit_card' ? -Number(acc.opening_balance) : Number(acc.opening_balance);
  });

  txs.forEach(tx => {
    const amount = Number(tx.amount);
    if (tx.type === 'income') {
      balances[tx.account_id] = (balances[tx.account_id] || 0) + amount;
    } else if (tx.type === 'expense') {
      balances[tx.account_id] = (balances[tx.account_id] || 0) - amount;
    } else if (tx.type === 'transfer') {
      balances[tx.account_id] = (balances[tx.account_id] || 0) - amount;
      if (tx.to_account_id) {
        balances[tx.to_account_id] = (balances[tx.to_account_id] || 0) + amount;
      }
    }
  });

  return accounts.map(account => ({
    ...account,
    current_balance: balances[account.id] ?? account.opening_balance,
  }));
}

export async function createAccount(account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_balance'>): Promise<Account> {
  if (!(await canUseSupabase())) {
    return localSaveAccount(account);
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return localSaveAccount(account);

    const { data, error } = await supabase
      .from('accounts')
      .insert({ ...account, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    return localSaveAccount(account);
  }
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
  if (!(await canUseSupabase())) {
    return localUpdateAccount(id, updates);
  }
  try {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch {
    return localUpdateAccount(id, updates);
  }
}

export async function deleteAccount(id: string): Promise<void> {
  if (!(await canUseSupabase())) {
    localDeleteAccount(id);
    return;
  }
  try {
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  } catch {
    localDeleteAccount(id);
  }
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories(
  financeTypeOrFilter?: FinanceType | 'all' | { type?: 'income' | 'expense'; finance_type?: FinanceType | 'all' },
  type?: 'income' | 'expense'
): Promise<Category[]> {
  let financeType: FinanceType | 'all' | undefined;
  let categoryType: 'income' | 'expense' | undefined = type;

  if (typeof financeTypeOrFilter === 'object' && financeTypeOrFilter !== null) {
    financeType = financeTypeOrFilter.finance_type;
    categoryType = financeTypeOrFilter.type;
  } else {
    financeType = financeTypeOrFilter as (FinanceType | 'all' | undefined);
  }

  if (!(await canUseSupabase())) {
    return localGetCategories(financeType, categoryType);
  }
  try {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (financeType && financeType !== 'all') {
      query = query.eq('finance_type', financeType);
    }
    if (categoryType) {
      query = query.eq('type', categoryType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch {
    return localGetCategories(financeType, categoryType);
  }
}

export async function createCategory(category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Category> {
  if (!(await canUseSupabase())) {
    return localSaveCategory(category);
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return localSaveCategory(category);

    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch {
    return localSaveCategory(category);
  }
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  if (!(await canUseSupabase())) {
    return localUpdateCategory(id, updates);
  }
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch {
    return localUpdateCategory(id, updates);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  if (!(await canUseSupabase())) {
    localDeleteCategory(id);
    return;
  }
  try {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  } catch {
    localDeleteCategory(id);
  }
}

// ============================================================
// TRANSACTIONS
// ============================================================

interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: string;
  financeType?: FinanceType | 'all';
  categoryId?: string;
  accountId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getTransactions(filters: TransactionFilters = {}): Promise<{ data: Transaction[]; count: number }> {
  if (!(await canUseSupabase())) {
    let txs = localGetTransactions();
    if (filters.type && filters.type !== 'all') txs = txs.filter(t => t.type === filters.type);
    if (filters.financeType && filters.financeType !== 'all') txs = txs.filter(t => t.finance_type === filters.financeType);
    if (filters.categoryId) txs = txs.filter(t => t.category_id === filters.categoryId);
    if (filters.accountId) txs = txs.filter(t => t.account_id === filters.accountId || t.to_account_id === filters.accountId);
    if (filters.startDate) txs = txs.filter(t => t.date >= filters.startDate!);
    if (filters.endDate) txs = txs.filter(t => t.date <= filters.endDate!);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      txs = txs.filter(t => t.description.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q));
    }
    return { data: txs, count: txs.length };
  }

  try {
    const {
      startDate,
      endDate,
      type,
      financeType,
      categoryId,
      accountId,
      search,
      page = 1,
      pageSize = 20,
      sortBy = 'date',
      sortOrder = 'desc',
    } = filters;

    let query = supabase
      .from('transactions')
      .select('*, category:categories(*), account:accounts!transactions_account_id_fkey(*), to_account:accounts!transactions_to_account_id_fkey(*)', { count: 'exact' });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    if (type && type !== 'all') query = query.eq('type', type);
    if (financeType && financeType !== 'all') query = query.eq('finance_type', financeType);
    if (categoryId) query = query.eq('category_id', categoryId);
    if (accountId) query = query.or(`account_id.eq.${accountId},to_account_id.eq.${accountId}`);
    if (search) query = query.ilike('description', `%${search}%`);

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], count: count || 0 };
  } catch {
    return getTransactions({ ...filters, page: 1 }); // fallback local
  }
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'category' | 'account' | 'to_account'>): Promise<Transaction> {
  if (!(await canUseSupabase())) {
    return localSaveTransaction(transaction);
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return localSaveTransaction(transaction);

    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...transaction, user_id: user.id })
      .select('*, category:categories(*), account:accounts!transactions_account_id_fkey(*), to_account:accounts!transactions_to_account_id_fkey(*)')
      .single();

    if (error) throw error;
    return data;
  } catch {
    return localSaveTransaction(transaction);
  }
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
  if (!(await canUseSupabase())) {
    return localUpdateTransaction(id, updates);
  }
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*), account:accounts!transactions_account_id_fkey(*), to_account:accounts!transactions_to_account_id_fkey(*)')
      .single();

    if (error) throw error;
    return data;
  } catch {
    return localUpdateTransaction(id, updates);
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  if (!(await canUseSupabase())) {
    localDeleteTransaction(id);
    return;
  }
  try {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  } catch {
    localDeleteTransaction(id);
  }
}

// ============================================================
// BUDGETS
// ============================================================

export async function getBudgets(month?: number, year?: number, financeType?: FinanceType | 'all'): Promise<Budget[]> {
  if (!(await canUseSupabase())) {
    return localGetBudgets(month, year, financeType);
  }
  try {
    const now = new Date();
    const currentMonth = month || now.getMonth() + 1;
    const currentYear = year || now.getFullYear();

    let query = supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('month', currentMonth)
      .eq('year', currentYear);

    if (financeType && financeType !== 'all') {
      query = query.eq('finance_type', financeType);
    }

    const { data: budgets, error } = await query;
    if (error) throw error;
    return budgets || [];
  } catch {
    return localGetBudgets(month, year, financeType);
  }
}

export async function createBudget(budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'category' | 'spent' | 'remaining' | 'percentage'>): Promise<Budget> {
  if (!(await canUseSupabase())) {
    return localSaveBudget(budget);
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return localSaveBudget(budget);

    const { data, error } = await supabase
      .from('budgets')
      .insert({ ...budget, user_id: user.id })
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data;
  } catch {
    return localSaveBudget(budget);
  }
}

export async function updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
  if (!(await canUseSupabase())) {
    return localUpdateBudget(id, updates);
  }
  try {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data;
  } catch {
    return localUpdateBudget(id, updates);
  }
}

export async function deleteBudget(id: string): Promise<void> {
  if (!(await canUseSupabase())) {
    localDeleteBudget(id);
    return;
  }
  try {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) throw error;
  } catch {
    localDeleteBudget(id);
  }
}

// ============================================================
// SAVINGS GOALS
// ============================================================

export async function getSavingsGoals(financeType?: FinanceType | 'all'): Promise<SavingsGoal[]> {
  if (!(await canUseSupabase())) {
    return localGetSavingsGoals(financeType);
  }
  try {
    let query = supabase.from('savings_goals').select('*').order('created_at', { ascending: false });
    if (financeType && financeType !== 'all') {
      query = query.eq('finance_type', financeType);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(g => ({
      ...g,
      progress: Math.min(100, Math.round(((g.current_amount || 0) / (g.target_amount || 1)) * 100)),
    }));
  } catch {
    return localGetSavingsGoals(financeType);
  }
}

export async function createSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'progress'>): Promise<SavingsGoal> {
  if (!(await canUseSupabase())) {
    return localSaveSavingsGoal(goal);
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return localSaveSavingsGoal(goal);

    const { data, error } = await supabase
      .from('savings_goals')
      .insert({ ...goal, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch {
    return localSaveSavingsGoal(goal);
  }
}

export async function updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
  if (!(await canUseSupabase())) {
    return localUpdateSavingsGoal(id, updates);
  }
  try {
    const { data, error } = await supabase
      .from('savings_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch {
    return localUpdateSavingsGoal(id, updates);
  }
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  if (!(await canUseSupabase())) {
    localDeleteSavingsGoal(id);
    return;
  }
  try {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id);
    if (error) throw error;
  } catch {
    localDeleteSavingsGoal(id);
  }
}

// ============================================================
// DASHBOARD & ANALYTICS
// ============================================================

export async function getDashboardSummary(
  startDate: string,
  endDate: string,
  financeType: FinanceType | 'all' = 'all'
): Promise<DashboardSummary> {
  const txs = localGetTransactions().filter(t => {
    if (t.date < startDate || t.date > endDate) return false;
    if (financeType !== 'all' && t.finance_type !== financeType) return false;
    return true;
  });

  const accounts = localGetAccounts().filter(a => {
    if (financeType !== 'all' && a.finance_type !== financeType) return false;
    return true;
  });

  let totalIncome = 0;
  let totalExpenses = 0;

  txs.forEach(tx => {
    if (tx.type === 'income') totalIncome += Number(tx.amount);
    if (tx.type === 'expense') totalExpenses += Number(tx.amount);
  });

  const netCashFlow = totalIncome - totalExpenses;
  const savingsAmount = Math.max(0, netCashFlow);
  const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

  // Calculate total balance from all active accounts
  const accWithBal = await getAccountsWithBalances();
  const totalBalance = accWithBal
    .filter(a => financeType === 'all' || a.finance_type === financeType)
    .reduce((sum, a) => sum + Number(a.current_balance || 0), 0);

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    netCashFlow,
    savingsAmount,
    savingsRate: Math.round(savingsRate * 10) / 10,
  };
}

export async function getMonthlyTrends(year: number, financeType: FinanceType | 'all' = 'all') {
  const txs = localGetTransactions().filter(t => {
    if (financeType !== 'all' && t.finance_type !== financeType) return false;
    return t.date.startsWith(`${year}-`);
  });

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    name: new Date(year, i).toLocaleDateString('en-IN', { month: 'short' }),
    income: 0,
    expense: 0,
  }));

  txs.forEach(tx => {
    const d = new Date(tx.date);
    if (d.getFullYear() === year) {
      const m = d.getMonth();
      if (tx.type === 'income') months[m].income += Number(tx.amount);
      if (tx.type === 'expense') months[m].expense += Number(tx.amount);
    }
  });

  return months;
}

export async function getExpensesByCategory(
  startDate: string,
  endDate: string,
  financeType: FinanceType | 'all' = 'all'
) {
  const txs = localGetTransactions().filter(t => {
    if (t.type !== 'expense') return false;
    if (t.date < startDate || t.date > endDate) return false;
    if (financeType !== 'all' && t.finance_type !== financeType) return false;
    return true;
  });

  const categoryMap: Record<string, { name: string; amount: number; color: string }> = {};
  const colors = ['#D6AD60', '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#ef4444', '#22c55e', '#3b82f6'];
  let colorIdx = 0;

  txs.forEach(tx => {
    const catName = tx.category?.name || 'General Expense';
    const catId = tx.category_id || 'general';
    if (!categoryMap[catId]) {
      categoryMap[catId] = {
        name: catName,
        amount: 0,
        color: tx.category?.color || colors[colorIdx++ % colors.length],
      };
    }
    categoryMap[catId].amount += Number(tx.amount);
  });

  return Object.values(categoryMap).sort((a, b) => b.amount - a.amount);
}

export async function getRecentTransactions(limit: number = 5, financeType?: FinanceType | 'all') {
  let txs = localGetTransactions();
  if (financeType && financeType !== 'all') {
    txs = txs.filter(t => t.finance_type === financeType);
  }
  return txs.slice(0, limit);
}

export async function initializeUserData(): Promise<void> {
  // Local storage initializes on demand
}
