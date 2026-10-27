import type { Account, Category, Transaction, Budget, SavingsGoal, FinanceType } from '../types';

const STORAGE_KEYS = {
  ACCOUNTS: 'finora_local_accounts',
  CATEGORIES: 'finora_local_categories',
  TRANSACTIONS: 'finora_local_transactions',
  BUDGETS: 'finora_local_budgets',
  SAVINGS_GOALS: 'finora_local_savings_goals',
};

// Seed default data
const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    user_id: 'guest-user-001',
    name: 'Cash in Hand',
    type: 'cash',
    opening_balance: 15000,
    currency: 'INR',
    finance_type: 'personal',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    user_id: 'guest-user-001',
    name: 'HDFC Savings Bank',
    type: 'savings_bank',
    opening_balance: 145000,
    currency: 'INR',
    finance_type: 'personal',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'acc-3',
    user_id: 'guest-user-001',
    name: 'ICICI Current Account',
    type: 'current_bank',
    opening_balance: 280000,
    currency: 'INR',
    finance_type: 'business',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'acc-4',
    user_id: 'guest-user-001',
    name: 'UPI / Paytm Wallet',
    type: 'upi_wallet',
    opening_balance: 8500,
    currency: 'INR',
    finance_type: 'personal',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', user_id: 'guest-user-001', name: 'Salary', type: 'income', finance_type: 'personal', color: '#10B981', is_default: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-2', user_id: 'guest-user-001', name: 'Freelancing', type: 'income', finance_type: 'personal', color: '#3B82F6', is_default: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-3', user_id: 'guest-user-001', name: 'Client Revenue', type: 'income', finance_type: 'business', color: '#8B5CF6', is_default: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-4', user_id: 'guest-user-001', name: 'Rent & Housing', type: 'expense', finance_type: 'personal', color: '#EF4444', is_default: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-5', user_id: 'guest-user-001', name: 'Groceries', type: 'expense', finance_type: 'personal', color: '#F59E0B', is_default: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-6', user_id: 'guest-user-001', name: 'Dining Out', type: 'expense', finance_type: 'personal', color: '#EC4899', is_default: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-7', user_id: 'guest-user-001', name: 'Utilities & Bills', type: 'expense', finance_type: 'personal', color: '#06B6D4', is_default: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-8', user_id: 'guest-user-001', name: 'Office Software & SaaS', type: 'expense', finance_type: 'business', color: '#6366F1', is_default: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-9', user_id: 'guest-user-001', name: 'Transportation', type: 'expense', finance_type: 'personal', color: '#14B8A6', is_default: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

function getTodayOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    user_id: 'guest-user-001',
    date: getTodayOffset(1),
    type: 'income',
    amount: 85000,
    description: 'Monthly Salary Credit',
    category_id: 'cat-1',
    account_id: 'acc-2',
    finance_type: 'personal',
    payment_method: 'bank_transfer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tx-2',
    user_id: 'guest-user-001',
    date: getTodayOffset(2),
    type: 'expense',
    amount: 22000,
    description: 'Apartment Rent',
    category_id: 'cat-4',
    account_id: 'acc-2',
    finance_type: 'personal',
    payment_method: 'bank_transfer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tx-3',
    user_id: 'guest-user-001',
    date: getTodayOffset(3),
    type: 'expense',
    amount: 4250,
    description: 'Weekly Supermarket Groceries',
    category_id: 'cat-5',
    account_id: 'acc-4',
    finance_type: 'personal',
    payment_method: 'upi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tx-4',
    user_id: 'guest-user-001',
    date: getTodayOffset(4),
    type: 'income',
    amount: 120000,
    description: 'Client Project Milestone Payment',
    category_id: 'cat-3',
    account_id: 'acc-3',
    finance_type: 'business',
    payment_method: 'bank_transfer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tx-5',
    user_id: 'guest-user-001',
    date: getTodayOffset(5),
    type: 'expense',
    amount: 8500,
    description: 'AWS Cloud & Development Hosting',
    category_id: 'cat-8',
    account_id: 'acc-3',
    finance_type: 'business',
    payment_method: 'card',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tx-6',
    user_id: 'guest-user-001',
    date: getTodayOffset(6),
    type: 'expense',
    amount: 1850,
    description: 'Dinner with Team',
    category_id: 'cat-6',
    account_id: 'acc-4',
    finance_type: 'personal',
    payment_method: 'upi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_BUDGETS: Budget[] = [
  {
    id: 'bud-1',
    user_id: 'guest-user-001',
    category_id: 'cat-5',
    amount: 15000,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    finance_type: 'personal',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'bud-2',
    user_id: 'guest-user-001',
    category_id: 'cat-6',
    amount: 8000,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    finance_type: 'personal',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'bud-3',
    user_id: 'guest-user-001',
    category_id: 'cat-8',
    amount: 20000,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    finance_type: 'business',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    user_id: 'guest-user-001',
    name: 'Emergency Fund',
    target_amount: 300000,
    current_amount: 185000,
    target_date: '2026-12-31',
    finance_type: 'personal',
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'goal-2',
    user_id: 'guest-user-001',
    name: 'New MacBook Pro M4',
    target_amount: 160000,
    current_amount: 110000,
    target_date: '2026-08-15',
    finance_type: 'business',
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getStored<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ================= ACCOUNTS =================
export function localGetAccounts(): Account[] {
  return getStored<Account[]>(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS).filter(a => a.is_active);
}

export function localSaveAccount(account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_balance'>): Account {
  const accounts = localGetAccounts();
  const newAccount: Account = {
    ...account,
    id: 'acc-' + Date.now(),
    user_id: 'guest-user-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  accounts.push(newAccount);
  setStored(STORAGE_KEYS.ACCOUNTS, accounts);
  return newAccount;
}

export function localUpdateAccount(id: string, updates: Partial<Account>): Account {
  const accounts = getStored<Account[]>(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
  const index = accounts.findIndex(a => a.id === id);
  if (index === -1) throw new Error('Account not found');
  accounts[index] = { ...accounts[index], ...updates, updated_at: new Date().toISOString() };
  setStored(STORAGE_KEYS.ACCOUNTS, accounts);
  return accounts[index];
}

export function localDeleteAccount(id: string): void {
  localUpdateAccount(id, { is_active: false });
}

// ================= CATEGORIES =================
export function localGetCategories(financeType?: FinanceType | 'all', type?: 'income' | 'expense'): Category[] {
  let categories = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES).filter(c => c.is_active);
  if (financeType && financeType !== 'all') {
    categories = categories.filter(c => c.finance_type === financeType);
  }
  if (type) {
    categories = categories.filter(c => c.type === type);
  }
  return categories;
}

export function localSaveCategory(category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Category {
  const categories = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  const newCat: Category = {
    ...category,
    id: 'cat-' + Date.now(),
    user_id: 'guest-user-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  categories.push(newCat);
  setStored(STORAGE_KEYS.CATEGORIES, categories);
  return newCat;
}

export function localUpdateCategory(id: string, updates: Partial<Category>): Category {
  const categories = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Category not found');
  categories[index] = { ...categories[index], ...updates, updated_at: new Date().toISOString() };
  setStored(STORAGE_KEYS.CATEGORIES, categories);
  return categories[index];
}

export function localDeleteCategory(id: string): void {
  localUpdateCategory(id, { is_active: false });
}

// ================= TRANSACTIONS =================
export function localGetTransactions(): Transaction[] {
  const txs = getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  const categories = localGetCategories();
  const accounts = localGetAccounts();

  return txs.map(tx => ({
    ...tx,
    category: categories.find(c => c.id === tx.category_id),
    account: accounts.find(a => a.id === tx.account_id),
    to_account: tx.to_account_id ? accounts.find(a => a.id === tx.to_account_id) : undefined,
  }));
}

export function localSaveTransaction(tx: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'category' | 'account' | 'to_account'>): Transaction {
  const txs = getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  const newTx: Transaction = {
    ...tx,
    id: 'tx-' + Date.now(),
    user_id: 'guest-user-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  txs.unshift(newTx);
  setStored(STORAGE_KEYS.TRANSACTIONS, txs);
  return newTx;
}

export function localUpdateTransaction(id: string, updates: Partial<Transaction>): Transaction {
  const txs = getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  const index = txs.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Transaction not found');
  txs[index] = { ...txs[index], ...updates, updated_at: new Date().toISOString() };
  setStored(STORAGE_KEYS.TRANSACTIONS, txs);
  return txs[index];
}

export function localDeleteTransaction(id: string): void {
  const txs = getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  const filtered = txs.filter(t => t.id !== id);
  setStored(STORAGE_KEYS.TRANSACTIONS, filtered);
}

// ================= BUDGETS =================
export function localGetBudgets(month?: number, year?: number, financeType?: FinanceType | 'all'): Budget[] {
  let budgets = getStored<Budget[]>(STORAGE_KEYS.BUDGETS, DEFAULT_BUDGETS);
  if (month) budgets = budgets.filter(b => b.month === month);
  if (year) budgets = budgets.filter(b => b.year === year);
  if (financeType && financeType !== 'all') budgets = budgets.filter(b => b.finance_type === financeType);

  const categories = localGetCategories();
  const txs = localGetTransactions();

  return budgets.map(b => {
    const spent = txs
      .filter(tx => tx.category_id === b.category_id && tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return {
      ...b,
      category: categories.find(c => c.id === b.category_id),
      spent,
      remaining: Math.max(0, b.amount - spent),
      percentage: Math.round((spent / (b.amount || 1)) * 100),
    };
  });
}

export function localSaveBudget(budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'category' | 'spent' | 'remaining' | 'percentage'>): Budget {
  const budgets = getStored<Budget[]>(STORAGE_KEYS.BUDGETS, DEFAULT_BUDGETS);
  const newBudget: Budget = {
    ...budget,
    id: 'bud-' + Date.now(),
    user_id: 'guest-user-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  budgets.push(newBudget);
  setStored(STORAGE_KEYS.BUDGETS, budgets);
  return newBudget;
}

export function localUpdateBudget(id: string, updates: Partial<Budget>): Budget {
  const budgets = getStored<Budget[]>(STORAGE_KEYS.BUDGETS, DEFAULT_BUDGETS);
  const index = budgets.findIndex(b => b.id === id);
  if (index === -1) throw new Error('Budget not found');
  budgets[index] = { ...budgets[index], ...updates, updated_at: new Date().toISOString() };
  setStored(STORAGE_KEYS.BUDGETS, budgets);
  return budgets[index];
}

export function localDeleteBudget(id: string): void {
  const budgets = getStored<Budget[]>(STORAGE_KEYS.BUDGETS, DEFAULT_BUDGETS);
  setStored(STORAGE_KEYS.BUDGETS, budgets.filter(b => b.id !== id));
}

// ================= SAVINGS GOALS =================
export function localGetSavingsGoals(financeType?: FinanceType | 'all'): SavingsGoal[] {
  let goals = getStored<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, DEFAULT_SAVINGS_GOALS);
  if (financeType && financeType !== 'all') goals = goals.filter(g => g.finance_type === financeType);
  return goals.map(g => ({
    ...g,
    progress: Math.min(100, Math.round(((g.current_amount || 0) / (g.target_amount || 1)) * 100)),
  }));
}

export function localSaveSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'progress'>): SavingsGoal {
  const goals = getStored<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, DEFAULT_SAVINGS_GOALS);
  const newGoal: SavingsGoal = {
    ...goal,
    id: 'goal-' + Date.now(),
    user_id: 'guest-user-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  goals.push(newGoal);
  setStored(STORAGE_KEYS.SAVINGS_GOALS, goals);
  return newGoal;
}

export function localUpdateSavingsGoal(id: string, updates: Partial<SavingsGoal>): SavingsGoal {
  const goals = getStored<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, DEFAULT_SAVINGS_GOALS);
  const index = goals.findIndex(g => g.id === id);
  if (index === -1) throw new Error('Goal not found');
  goals[index] = { ...goals[index], ...updates, updated_at: new Date().toISOString() };
  setStored(STORAGE_KEYS.SAVINGS_GOALS, goals);
  return goals[index];
}

export function localDeleteSavingsGoal(id: string): void {
  const goals = getStored<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, DEFAULT_SAVINGS_GOALS);
  setStored(STORAGE_KEYS.SAVINGS_GOALS, goals.filter(g => g.id !== id));
}
