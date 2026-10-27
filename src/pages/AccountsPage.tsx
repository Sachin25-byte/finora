import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAccountsWithBalances, createAccount, updateAccount, deleteAccount } from '../lib/api';
import { formatCurrency, getAccountTypeLabel } from '../lib/utils';
import { Modal, ConfirmDialog, EmptyState, PageLoader, ErrorState, Toast } from '../components/ui/shared';
import type { Account, AccountType, FinanceType } from '../types';
import { Plus, Edit, Trash2, Wallet, CreditCard, Building, Smartphone, Banknote, MoreHorizontal, ArrowRight, ShieldCheck } from 'lucide-react';

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(['cash', 'savings_bank', 'current_bank', 'upi_wallet', 'credit_card', 'other']),
  opening_balance: z.string().min(1, 'Opening balance is required').refine(val => !isNaN(parseFloat(val)), 'Must be a valid number'),
  finance_type: z.enum(['personal', 'business']),
  notes: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

const accountIcons: Record<AccountType, React.ReactNode> = {
  cash: <Banknote className="w-5 h-5 text-emerald-600" />,
  savings_bank: <Building className="w-5 h-5 text-[#2563EB]" />,
  current_bank: <Building className="w-5 h-5 text-indigo-600" />,
  upi_wallet: <Smartphone className="w-5 h-5 text-sky-600" />,
  credit_card: <CreditCard className="w-5 h-5 text-purple-600" />,
  other: <MoreHorizontal className="w-5 h-5 text-[#64748B]" />,
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | undefined>();
  const [deleteAcc, setDeleteAcc] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  async function loadAccounts() {
    setLoading(true);
    setError('');
    try {
      const data = await getAccountsWithBalances();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    const handler = () => loadAccounts();
    window.addEventListener('transaction-changed', handler);
    return () => window.removeEventListener('transaction-changed', handler);
  }, []);

  async function handleDelete() {
    if (!deleteAcc) return;
    setIsDeleting(true);
    try {
      await deleteAccount(deleteAcc.id);
      setToast({ message: 'Account deactivated successfully', type: 'success' });
      setDeleteAcc(null);
      loadAccounts();
    } catch {
      setToast({ message: 'Cannot deactivate account with active dependencies', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance ?? 0), 0);
  const personalAccounts = accounts.filter(a => a.finance_type === 'personal');
  const businessAccounts = accounts.filter(a => a.finance_type === 'business');

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={loadAccounts} />;

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Accounts & Wallets</h1>
          <p className="page-subtitle">Track net worth, bank vaults, UPI balances, and credit liabilities</p>
        </div>
        <button
          onClick={() => { setEditAccount(undefined); setShowModal(true); }}
          className="btn-primary text-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Add Account
        </button>
      </div>

      {/* Aggregate Balance Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card border-l-4 border-l-[var(--primary)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Total Liquidity</p>
          <p className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-1">{formatCurrency(totalBalance)}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">{accounts.length} total active accounts</p>
        </div>
        <div className="card border-l-4 border-l-sky-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Personal Wealth</p>
          <p className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-1">
            {formatCurrency(personalAccounts.reduce((s, a) => s + (a.current_balance ?? 0), 0))}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">{personalAccounts.length} personal accounts</p>
        </div>
        <div className="card border-l-4 border-l-indigo-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Business Treasury</p>
          <p className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-1">
            {formatCurrency(businessAccounts.reduce((s, a) => s + (a.current_balance ?? 0), 0))}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">{businessAccounts.length} business accounts</p>
        </div>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          icon={<Wallet className="w-8 h-8" />}
          title="No Accounts Configured"
          description="Add your bank accounts, cash wallets, or UPI IDs to track real-time balances."
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary btn-sm">
              <Plus className="w-4 h-4" /> Add Account
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Personal Accounts */}
          {personalAccounts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="badge-personal">Personal</span>
                  <span className="text-xs text-[#64748B] font-semibold">
                    {formatCurrency(personalAccounts.reduce((s, a) => s + (a.current_balance ?? 0), 0))}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalAccounts.map(acc => (
                  <AccountCard
                    key={acc.id}
                    account={acc}
                    onEdit={() => { setEditAccount(acc); setShowModal(true); }}
                    onDelete={() => setDeleteAcc(acc)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Business Accounts */}
          {businessAccounts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="badge-business">Business</span>
                  <span className="text-xs text-[#64748B] font-semibold">
                    {formatCurrency(businessAccounts.reduce((s, a) => s + (a.current_balance ?? 0), 0))}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {businessAccounts.map(acc => (
                  <AccountCard
                    key={acc.id}
                    account={acc}
                    onEdit={() => { setEditAccount(acc); setShowModal(true); }}
                    onDelete={() => setDeleteAcc(acc)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Create/Edit Modal */}
      {showModal && (
        <AccountModal
          account={editAccount}
          onClose={() => { setShowModal(false); setEditAccount(undefined); }}
          onSuccess={() => {
            setShowModal(false);
            setEditAccount(undefined);
            loadAccounts();
            setToast({ message: editAccount ? 'Account updated' : 'Account created', type: 'success' });
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteAcc && (
        <ConfirmDialog
          title="Deactivate Account"
          message={`Are you sure you want to deactivate "${deleteAcc.name}"? It will be marked inactive and hidden from active selections.`}
          confirmLabel="Deactivate"
          onConfirm={handleDelete}
          onCancel={() => setDeleteAcc(null)}
          isLoading={isDeleting}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function AccountCard({ account, onEdit, onDelete }: { account: Account; onEdit: () => void; onDelete: () => void }) {
  const balance = account.current_balance ?? 0;
  const isNegative = balance < 0;

  return (
    <div className="card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--primary-light)] border border-[var(--primary)]/20 shadow-2xs text-[var(--primary)]">
            {accountIcons[account.type]}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-main)]">{account.name}</h3>
            <p className="text-xs text-[var(--text-muted)] capitalize">{getAccountTypeLabel(account.type)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-muted)] rounded-md transition-colors"
            title="Edit"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
            title="Deactivate"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--border-color)] flex items-baseline justify-between">
        <span className="text-xs text-[var(--text-muted)] font-medium">Available Balance</span>
        <p className={`text-lg font-bold tracking-tight ${isNegative ? 'text-[#DC2626]' : 'text-[var(--text-main)]'}`}>
          {formatCurrency(balance)}
        </p>
      </div>

      {account.notes && (
        <p className="text-[11px] text-[var(--text-muted)] mt-2 truncate bg-[var(--bg-muted)] p-1.5 rounded">
          {account.notes}
        </p>
      )}
    </div>
  );
}

function AccountModal({ account, onClose, onSuccess }: { account?: Account; onClose: () => void; onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: account
      ? {
          name: account.name,
          type: account.type,
          opening_balance: String(account.opening_balance),
          finance_type: account.finance_type,
          notes: account.notes || '',
        }
      : {
          name: '',
          type: 'savings_bank',
          opening_balance: '0',
          finance_type: 'personal',
          notes: '',
        },
  });

  async function onSubmit(data: AccountFormData) {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        type: data.type as AccountType,
        opening_balance: parseFloat(data.opening_balance),
        currency: 'INR',
        finance_type: data.finance_type as FinanceType,
        notes: data.notes || undefined,
        is_active: true,
      };

      if (account) {
        await updateAccount(account.id, payload);
      } else {
        await createAccount(payload);
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving account:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      title={account ? 'Edit Account Details' : 'Add New Financial Account'}
      subtitle="Connect a cash pool, bank account, or wallet"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label-text">Account Name *</label>
          <input
            {...register('name')}
            className="input-field"
            placeholder="e.g. HDFC Salary Account, Cash Box, Razorpay"
          />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="label-text">Account Category *</label>
            <select {...register('type')} className="select-field">
              <option value="savings_bank">Savings Bank Account</option>
              <option value="current_bank">Current Bank Account</option>
              <option value="upi_wallet">UPI / Digital Wallet</option>
              <option value="cash">Cash in Hand</option>
              <option value="credit_card">Credit Card (Liability)</option>
              <option value="other">Other Investment / Vault</option>
            </select>
          </div>
          <div>
            <label className="label-text">Portfolio *</label>
            <select {...register('finance_type')} className="select-field">
              <option value="personal">Personal Finance</option>
              <option value="business">Business Operations</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label-text">Opening / Initial Balance (₹ INR) *</label>
          <input
            {...register('opening_balance')}
            type="number"
            step="0.01"
            className="input-field font-semibold"
            placeholder="0.00"
          />
          {errors.opening_balance && <p className="error-text">{errors.opening_balance.message}</p>}
        </div>

        <div>
          <label className="label-text">Notes / Account # (Optional)</label>
          <input
            {...register('notes')}
            className="input-field"
            placeholder="e.g. Last 4 digits: 4892"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E7EB]">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : account ? 'Update Account' : 'Save Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
