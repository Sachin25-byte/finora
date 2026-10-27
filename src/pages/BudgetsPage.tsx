import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getBudgets, createBudget, updateBudget, deleteBudget, getCategories } from '../lib/api';
import { formatCurrency, getMonthName } from '../lib/utils';
import { Modal, ConfirmDialog, EmptyState, PageLoader, ErrorState, Toast } from '../components/ui/shared';
import type { Budget, Category, FinanceType } from '../types';
import { Plus, Edit, Trash2, Target, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

const budgetSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  amount: z.string().min(1, 'Budget amount is required').refine(val => parseFloat(val) > 0, 'Must be positive'),
  finance_type: z.enum(['personal', 'business']),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export default function BudgetsPage() {
  const now = new Date();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [financeFilter, setFinanceFilter] = useState<FinanceType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | undefined>();
  const [deleteBdg, setDeleteBdg] = useState<Budget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  async function loadBudgets() {
    setLoading(true);
    try {
      const data = await getBudgets(month, year, financeFilter);
      setBudgets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBudgets(); }, [month, year, financeFilter]);

  useEffect(() => {
    const handler = () => loadBudgets();
    window.addEventListener('transaction-changed', handler);
    return () => window.removeEventListener('transaction-changed', handler);
  }, [month, year, financeFilter]);

  function navigateMonth(dir: number) {
    let m = month + dir;
    let y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setMonth(m);
    setYear(y);
  }

  async function handleDelete() {
    if (!deleteBdg) return;
    setIsDeleting(true);
    try {
      await deleteBudget(deleteBdg.id);
      setToast({ message: 'Budget deleted', type: 'success' });
      setDeleteBdg(null);
      loadBudgets();
    } catch {
      setToast({ message: 'Failed to delete budget', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }

  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={loadBudgets} />;

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Monthly Budgets</h1>
          <p className="page-subtitle">Track category limits, prevent overspending, and manage cash flow</p>
        </div>
        <button
          onClick={() => { setEditBudget(undefined); setShowModal(true); }}
          className="btn-primary text-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Set New Budget
        </button>
      </div>

      {/* Month Navigator & Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-card)] p-3.5 rounded-xl border border-[var(--border-color)] shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-muted)] rounded-lg transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-[var(--text-main)] min-w-[130px] text-center">
            {getMonthName(month)} {year}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-muted)] rounded-lg transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Portfolio Tabs */}
        <div className="inline-flex bg-[var(--bg-muted)] p-1 rounded-lg border border-[var(--border-color)]">
          {['all', 'personal', 'business'].map(f => (
            <button
              key={f}
              onClick={() => setFinanceFilter(f as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                financeFilter === f ? 'bg-[var(--primary)] text-[var(--primary-text)] shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {f === 'all' ? 'All Budgets' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card border-l-4 border-l-[var(--primary)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Total Budgeted</p>
          <p className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-1">{formatCurrency(totalBudget)}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">{budgets.length} active budget targets</p>
        </div>
        <div className="card border-l-4 border-l-rose-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Total Spent</p>
          <p className="text-2xl font-bold tracking-tight text-[#DC2626] mt-1">{formatCurrency(totalSpent)}</p>
          <p className="text-[11px] text-[#64748B] mt-1.5">{overallPct}% of total budget used</p>
        </div>
        <div className="card border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Remaining Cushion</p>
          <p className="text-2xl font-bold tracking-tight text-[#16A34A] mt-1">
            {formatCurrency(Math.max(0, totalBudget - totalSpent))}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">Available before overshooting</p>
        </div>
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          icon={<Target className="w-8 h-8" />}
          title="No Budgets for this Month"
          description={`Set monthly spending targets for ${getMonthName(month)} ${year} to stay in control.`}
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary btn-sm">
              <Plus className="w-4 h-4" /> Set Up Budget
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(budget => {
            const pct = Math.min(budget.percentage || 0, 100);
            const isWarning = (budget.percentage || 0) >= 80 && (budget.percentage || 0) < 100;
            const isOver = (budget.percentage || 0) >= 100;

            return (
              <div key={budget.id} className="card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-main)]">{budget.category?.name || 'Category'}</h3>
                    <div className="mt-1">
                      <span className={budget.finance_type === 'personal' ? 'badge-personal' : 'badge-business'}>
                        {budget.finance_type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditBudget(budget); setShowModal(true); }}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-muted)] rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteBdg(budget)}
                      className="p-1 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-3 border-t border-[var(--border-color)]">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-base font-bold text-[var(--text-main)]">{formatCurrency(budget.spent || 0)}</span>
                    <span className="text-[var(--text-muted)]">of {formatCurrency(budget.amount)}</span>
                  </div>

                  <div className="progress-bar h-2 bg-[var(--border-color)]">
                    <div
                      className={`progress-fill ${
                        isOver ? 'bg-[#DC2626]' : isWarning ? 'bg-amber-500' : 'bg-[var(--primary)]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className={`font-semibold ${isOver ? 'text-[#DC2626]' : isWarning ? 'text-amber-700' : 'text-[#64748B]'}`}>
                      {Math.round(budget.percentage || 0)}% consumed
                    </span>
                    <span className={`font-semibold ${(budget.remaining || 0) < 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                      {(budget.remaining || 0) >= 0 ? `${formatCurrency(budget.remaining || 0)} remaining` : `${formatCurrency(Math.abs(budget.remaining || 0))} over`}
                    </span>
                  </div>

                  {isWarning && !isOver && (
                    <div className="flex items-center gap-1 text-amber-700 text-[11px] font-medium bg-amber-50 p-1.5 rounded border border-amber-200 mt-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> Approaching monthly limit
                    </div>
                  )}
                  {isOver && (
                    <div className="flex items-center gap-1 text-red-700 text-[11px] font-medium bg-red-50 p-1.5 rounded border border-red-200 mt-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> Monthly limit exceeded
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <BudgetModal
          budget={editBudget}
          month={month}
          year={year}
          onClose={() => { setShowModal(false); setEditBudget(undefined); }}
          onSuccess={() => {
            setShowModal(false);
            setEditBudget(undefined);
            loadBudgets();
            setToast({ message: editBudget ? 'Budget updated' : 'Budget created', type: 'success' });
          }}
        />
      )}

      {deleteBdg && (
        <ConfirmDialog
          title="Delete Budget Target"
          message={`Are you sure you want to delete the budget for ${deleteBdg.category?.name}?`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteBdg(null)}
          isLoading={isDeleting}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function BudgetModal({ budget, month, year, onClose, onSuccess }: { budget?: Budget; month: number; year: number; onClose: () => void; onSuccess: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget
      ? { category_id: budget.category_id, amount: String(budget.amount), finance_type: budget.finance_type }
      : { category_id: '', amount: '', finance_type: 'personal' },
  });

  const watchFinanceType = watch('finance_type');

  useEffect(() => {
    getCategories({ type: 'expense', finance_type: watchFinanceType as FinanceType }).then(setCategories);
  }, [watchFinanceType]);

  async function onSubmit(data: BudgetFormData) {
    setIsSubmitting(true);
    try {
      const payload = {
        category_id: data.category_id,
        amount: parseFloat(data.amount),
        finance_type: data.finance_type as FinanceType,
        month,
        year,
      };

      if (budget) {
        await updateBudget(budget.id, payload);
      } else {
        await createBudget(payload);
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving budget:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      title={budget ? 'Edit Budget Target' : 'Create Monthly Budget'}
      subtitle={`Set spending target for ${getMonthName(month)} ${year}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label-text">Portfolio *</label>
          <select {...register('finance_type')} className="select-field">
            <option value="personal">Personal Finance</option>
            <option value="business">Business Operations</option>
          </select>
        </div>

        <div>
          <label className="label-text">Expense Category *</label>
          <select {...register('category_id')} className="select-field">
            <option value="">Select Expense Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.category_id && <p className="error-text">{errors.category_id.message}</p>}
        </div>

        <div>
          <label className="label-text">Monthly Target Limit (₹ INR) *</label>
          <input
            {...register('amount')}
            type="number"
            step="1"
            className="input-field font-semibold"
            placeholder="e.g. 15000"
          />
          {errors.amount && <p className="error-text">{errors.amount.message}</p>}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E7EB]">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : budget ? 'Update Budget' : 'Save Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
