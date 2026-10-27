import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Toast } from '../ui/shared';
import { createTransaction, updateTransaction, getAccounts, getCategories } from '../../lib/api';
import { formatDateInput } from '../../lib/utils';
import type { Transaction, Account, Category, TransactionType, FinanceType, PaymentMethod } from '../../types';
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, Check, Sparkles, QrCode } from 'lucide-react';
import QRScannerModal from './QRScannerModal';

const transactionSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.string().min(1, 'Amount is required').refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'Amount must be a positive number'),
  description: z.string().min(1, 'Description is required').max(200),
  category_id: z.string().optional(),
  account_id: z.string().min(1, 'Account is required'),
  to_account_id: z.string().optional(),
  finance_type: z.enum(['personal', 'business']),
  payment_method: z.enum(['cash', 'upi', 'bank_transfer', 'card', 'other']).optional(),
  notes: z.string().optional(),
  reference_number: z.string().optional(),
}).refine(data => {
  if (data.type === 'transfer' && !data.to_account_id) {
    return false;
  }
  return true;
}, {
  message: 'Destination account is required for transfers',
  path: ['to_account_id'],
}).refine(data => {
  if (data.type === 'transfer' && data.account_id === data.to_account_id) {
    return false;
  }
  return true;
}, {
  message: 'Source and destination accounts must be different',
  path: ['to_account_id'],
}).refine(data => {
  if (data.type !== 'transfer' && !data.category_id) {
    return false;
  }
  return true;
}, {
  message: 'Category is required',
  path: ['category_id'],
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  onClose: () => void;
  onSuccess: () => void;
  editTransaction?: Transaction;
}

export default function TransactionModal({ onClose, onSuccess, editTransaction }: TransactionModalProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: editTransaction
      ? {
          date: editTransaction.date,
          type: editTransaction.type,
          amount: String(editTransaction.amount),
          description: editTransaction.description,
          category_id: editTransaction.category_id || '',
          account_id: editTransaction.account_id,
          to_account_id: editTransaction.to_account_id || '',
          finance_type: editTransaction.finance_type,
          payment_method: editTransaction.payment_method || undefined,
          notes: editTransaction.notes || '',
          reference_number: editTransaction.reference_number || '',
        }
      : {
          date: formatDateInput(new Date()),
          type: 'expense' as const,
          amount: '',
          description: '',
          category_id: '',
          account_id: '',
          to_account_id: '',
          finance_type: 'personal' as const,
          payment_method: 'upi' as const,
          notes: '',
          reference_number: '',
        },
  });

  const watchType = watch('type');
  const watchFinanceType = watch('finance_type');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [accs, cats] = await Promise.all([
        getAccounts(),
        getCategories(),
      ]);
      setAccounts(accs);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  }

  const filteredCategories = categories.filter(cat => {
    if (watchType === 'transfer') return false;
    const typeMatch = watchType === 'income' ? cat.type === 'income' : cat.type === 'expense';
    const financeMatch = cat.finance_type === watchFinanceType;
    return typeMatch && financeMatch;
  });

  async function onSubmit(data: TransactionFormData) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const txData = {
        date: data.date,
        type: data.type as TransactionType,
        amount: parseFloat(data.amount),
        description: data.description,
        category_id: data.type === 'transfer' ? undefined : (data.category_id || undefined),
        account_id: data.account_id,
        to_account_id: data.type === 'transfer' ? data.to_account_id : undefined,
        finance_type: data.finance_type as FinanceType,
        payment_method: (data.payment_method || undefined) as PaymentMethod | undefined,
        notes: data.notes || undefined,
        reference_number: data.reference_number || undefined,
      };

      if (editTransaction) {
        await updateTransaction(editTransaction.id, txData);
        setToast({ message: 'Transaction updated successfully', type: 'success' });
      } else {
        await createTransaction(txData);
        setToast({ message: 'Transaction added successfully', type: 'success' });
      }

      setTimeout(() => {
        onSuccess();
      }, 400);
    } catch (error) {
      console.error('Error saving transaction:', error);
      setToast({ message: 'Failed to save transaction. Please check entries.', type: 'error' });
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Modal
        title={editTransaction ? 'Edit Transaction' : 'Record New Transaction'}
        subtitle="Manage cash flow with real-time balance calculations"
        onClose={onClose}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Transaction Type Segmented Control */}
          <div>
            <label className="label-text">Transaction Type</label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setValue('type', 'expense');
                  setValue('category_id', '');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  watchType === 'expense'
                    ? 'bg-white text-[#DC2626] shadow-xs border border-red-200'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" /> Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('type', 'income');
                  setValue('category_id', '');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  watchType === 'income'
                    ? 'bg-white text-[#16A34A] shadow-xs border border-emerald-200'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" /> Income
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('type', 'transfer');
                  setValue('category_id', '');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  watchType === 'transfer'
                    ? 'bg-white text-amber-700 shadow-xs border border-amber-200'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" /> Transfer
              </button>
            </div>
          </div>

          {/* Finance Classification (Personal vs Business) */}
          <div>
            <label className="label-text">Portfolio Classification</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setValue('finance_type', 'personal');
                  setValue('category_id', '');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                  watchFinanceType === 'personal'
                    ? 'bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary)]/30 shadow-2xs'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Personal Finance
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('finance_type', 'business');
                  setValue('category_id', '');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                  watchFinanceType === 'business'
                    ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30 shadow-2xs'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Business Finance
              </button>
            </div>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label-text mb-0">Amount (₹ INR) *</label>
                <button
                  type="button"
                  onClick={() => setShowQRScanner(true)}
                  className="text-[11px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  <QrCode className="w-3 h-3" /> Scan UPI QR
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">
                  ₹
                </span>
                <input
                  {...register('amount')}
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="input-field pl-8 font-semibold text-base"
                />
              </div>
              {errors.amount && <p className="error-text">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="label-text">Transaction Date *</label>
              <input
                {...register('date')}
                type="date"
                className="input-field"
              />
              {errors.date && <p className="error-text">{errors.date.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label-text">Description *</label>
            <input
              {...register('description')}
              type="text"
              placeholder="e.g. Client Payment, Groceries, Cloud Server..."
              className="input-field"
            />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>

          {/* Account Selection */}
          <div className={watchType === 'transfer' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5' : ''}>
            <div>
              <label className="label-text">{watchType === 'transfer' ? 'From Account *' : 'Account *'}</label>
              <select {...register('account_id')} className="select-field">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.finance_type})
                  </option>
                ))}
              </select>
              {errors.account_id && <p className="error-text">{errors.account_id.message}</p>}
            </div>

            {watchType === 'transfer' && (
              <div>
                <label className="label-text">To Destination Account *</label>
                <select {...register('to_account_id')} className="select-field">
                  <option value="">Select Destination</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.finance_type})
                    </option>
                  ))}
                </select>
                {errors.to_account_id && <p className="error-text">{errors.to_account_id.message}</p>}
              </div>
            )}
          </div>

          {/* Category selection (not needed for transfers) */}
          {watchType !== 'transfer' && (
            <div>
              <label className="label-text">Category *</label>
              <select {...register('category_id')} className="select-field">
                <option value="">Select Category</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="error-text">{errors.category_id.message}</p>}
            </div>
          )}

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="label-text">Payment Method</label>
              <select {...register('payment_method')} className="select-field">
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="bank_transfer">Net Banking / IMPS / NEFT</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash</option>
                <option value="other">Other Method</option>
              </select>
            </div>

            <div>
              <label className="label-text">Reference / UTR # (Optional)</label>
              <input
                {...register('reference_number')}
                type="text"
                placeholder="e.g. UTR12345678"
                className="input-field"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label-text">Notes (Optional)</label>
            <input
              {...register('notes')}
              type="text"
              placeholder="Additional memo or invoice details"
              className="input-field"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-color)]">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : editTransaction ? 'Update Record' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* UPI QR Scanner Modal */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanResult={(data) => {
          setValue('amount', data.amount);
          setValue('description', data.description);
          setValue('payment_method', 'upi' as any);
          setValue('type', 'expense');
          setToast({ message: `QR scanned: ₹${data.amount} for ${data.payee}`, type: 'success' });
        }}
      />
    </>
  );
}
