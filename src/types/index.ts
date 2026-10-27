export type FinanceType = 'personal' | 'business';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type AccountType = 'cash' | 'savings_bank' | 'current_bank' | 'upi_wallet' | 'credit_card' | 'other';
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'card' | 'other';
export type CategoryType = 'income' | 'expense';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  opening_balance: number;
  currency: string;
  finance_type: FinanceType;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed
  current_balance?: number;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  finance_type: FinanceType;
  icon?: string;
  color?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  type: TransactionType;
  amount: number;
  description: string;
  category_id?: string;
  account_id: string;
  to_account_id?: string;
  finance_type: FinanceType;
  payment_method?: PaymentMethod;
  notes?: string;
  reference_number?: string;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
  account?: Account;
  to_account?: Account;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  finance_type: FinanceType;
  created_at: string;
  updated_at: string;
  // Joined/Computed
  category?: Category;
  spent?: number;
  remaining?: number;
  percentage?: number;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  finance_type: FinanceType;
  notes?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  // Computed
  progress?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DashboardFilters {
  period: 'current_month' | 'previous_month' | 'current_year' | 'custom';
  financeType: FinanceType | 'all';
  dateRange?: DateRange;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsAmount: number;
  savingsRate: number;
}
