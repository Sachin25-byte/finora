import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getSavingsGoals, createSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from '../lib/api';
import { formatCurrency, formatDate, formatDateInput } from '../lib/utils';
import { Modal, ConfirmDialog, EmptyState, PageLoader, ErrorState, Toast } from '../components/ui/shared';
import type { SavingsGoal, FinanceType } from '../types';
import { Plus, Edit, Trash2, PiggyBank, Target, Calendar, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';

const savingsSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  target_amount: z.string().min(1, 'Target amount is required').refine(val => parseFloat(val) > 0, 'Must be positive'),
  current_amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'Must be valid'),
  target_date: z.string().optional(),
  finance_type: z.enum(['personal', 'business']),
  notes: z.string().optional(),
});

type SavingsFormData = z.infer<typeof savingsSchema>;

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState<SavingsGoal | undefined>();
  const [deleteGoal, setDeleteGoal] = useState<SavingsGoal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [financeFilter, setFinanceFilter] = useState<FinanceType | 'all'>('all');

  async function loadGoals() {
    setLoading(true);
    try {
      const data = await getSavingsGoals(financeFilter);
      setGoals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadGoals(); }, [financeFilter]);

  async function handleDelete() {
    if (!deleteGoal) return;
    setIsDeleting(true);
    try {
      await deleteSavingsGoal(deleteGoal.id);
      setToast({ message: 'Savings goal deleted', type: 'success' });
      setDeleteGoal(null);
      loadGoals();
    } catch {
      setToast({ message: 'Failed to delete goal', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={loadGoals} />;

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Set financial targets, vacation funds, and emergency reserves</p>
        </div>
        <button
          onClick={() => { setEditGoal(undefined); setShowModal(true); }}
          className="btn-primary text-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Create Savings Goal
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card border-l-4 border-l-[#2563EB]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Accumulated Savings</p>
          <p className="text-2xl font-bold tracking-tight text-[#16A34A] mt-1">{formatCurrency(totalSaved)}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">{overallProgress}% of target completed</p>
        </div>
        <div className="card border-l-4 border-l-indigo-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Target Milestone</p>
          <p className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-1">{formatCurrency(totalTarget)}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">{goals.length} active target goals</p>
        </div>
        <div className="card border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Remaining Gap</p>
          <p className="text-2xl font-bold tracking-tight text-amber-500 mt-1">
            {formatCurrency(Math.max(0, totalTarget - totalSaved))}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Needed to achieve all goals</p>
        </div>
      </div>

      {/* Filter Tabs & Helper */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex bg-[var(--bg-muted)] p-1 rounded-lg border border-[var(--border-color)]">
          {['all', 'personal', 'business'].map(f => (
            <button
              key={f}
              onClick={() => setFinanceFilter(f as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                financeFilter === f ? 'bg-[var(--primary)] text-[var(--primary-text)] shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {f === 'all' ? 'All Goals' : f}
            </button>
          ))}
        </div>

        <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3.5 py-1.5 shadow-2xs flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
          Savings goals are independent tracking targets that don't double-count account balances.
        </p>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="w-8 h-8" />}
          title="No Goals Created"
          description="Create your first savings goal to track milestones like Emergency Funds or Equipments."
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary btn-sm">
              <Plus className="w-4 h-4" /> Add Savings Goal
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => {
            const progress = goal.progress || 0;
            const isCompleted = goal.is_completed || progress >= 100;

            return (
              <div key={goal.id} className={`card-hover ${isCompleted ? 'border-emerald-300 bg-emerald-50/20' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isCompleted ? 'bg-emerald-100 text-[#16A34A]' : 'bg-blue-50 text-[#2563EB]'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : <Target className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-main)]">{goal.name}</h3>
                      <span className={goal.finance_type === 'personal' ? 'badge-personal mt-1' : 'badge-business mt-1'}>
                        {goal.finance_type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditGoal(goal); setShowModal(true); }}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-muted)] rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteGoal(goal)}
                      className="p-1 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-3 border-t border-[var(--border-color)]">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-base font-bold text-[var(--text-main)]">{formatCurrency(goal.current_amount)}</span>
                    <span className="text-[var(--text-muted)]">of {formatCurrency(goal.target_amount)}</span>
                  </div>

                  <div className="progress-bar h-2 bg-[var(--border-color)]">
                    <div
                      className={`progress-fill ${isCompleted ? 'bg-[#16A34A]' : 'bg-[var(--primary)]'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className={`font-semibold ${isCompleted ? 'text-[#16A34A]' : 'text-[#2563EB]'}`}>
                      {progress.toFixed(0)}% achieved
                    </span>
                    {goal.target_date && (
                      <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#94A3B8]" /> {formatDate(goal.target_date)}
                      </span>
                    )}
                  </div>
                </div>

                {goal.notes && (
                  <p className="text-[11px] text-[#94A3B8] mt-3 p-1.5 rounded bg-slate-50 truncate">
                    {goal.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <SavingsModal
          goal={editGoal}
          onClose={() => { setShowModal(false); setEditGoal(undefined); }}
          onSuccess={() => {
            setShowModal(false);
            setEditGoal(undefined);
            loadGoals();
            setToast({ message: editGoal ? 'Goal updated' : 'Goal created', type: 'success' });
          }}
        />
      )}

      {deleteGoal && (
        <ConfirmDialog
          title="Delete Savings Goal"
          message={`Are you sure you want to remove the goal "${deleteGoal.name}"?`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteGoal(null)}
          isLoading={isDeleting}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function SavingsModal({ goal, onClose, onSuccess }: { goal?: SavingsGoal; onClose: () => void; onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SavingsFormData>({
    resolver: zodResolver(savingsSchema),
    defaultValues: goal
      ? {
          name: goal.name,
          target_amount: String(goal.target_amount),
          current_amount: String(goal.current_amount),
          target_date: goal.target_date ? formatDateInput(new Date(goal.target_date)) : '',
          finance_type: goal.finance_type,
          notes: goal.notes || '',
        }
      : {
          name: '',
          target_amount: '',
          current_amount: '0',
          target_date: '',
          finance_type: 'personal',
          notes: '',
        },
  });

  async function onSubmit(data: SavingsFormData) {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        target_amount: parseFloat(data.target_amount),
        current_amount: parseFloat(data.current_amount || '0'),
        target_date: data.target_date || undefined,
        finance_type: data.finance_type as FinanceType,
        notes: data.notes || undefined,
        is_completed: parseFloat(data.current_amount || '0') >= parseFloat(data.target_amount),
      };

      if (goal) {
        await updateSavingsGoal(goal.id, payload);
      } else {
        await createSavingsGoal(payload);
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      title={goal ? 'Edit Savings Target' : 'Create Savings Goal'}
      subtitle="Define target amount and timeline"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label-text">Goal Title *</label>
          <input
            {...register('name')}
            className="input-field"
            placeholder="e.g. Emergency Fund, Laptop Upgrade, Vacation"
          />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="label-text">Target Amount (₹) *</label>
            <input
              {...register('target_amount')}
              type="number"
              step="1"
              className="input-field font-semibold"
              placeholder="e.g. 100000"
            />
            {errors.target_amount && <p className="error-text">{errors.target_amount.message}</p>}
          </div>

          <div>
            <label className="label-text">Current Savings (₹)</label>
            <input
              {...register('current_amount')}
              type="number"
              step="1"
              className="input-field font-semibold"
              placeholder="0"
            />
            {errors.current_amount && <p className="error-text">{errors.current_amount.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="label-text">Target Completion Date</label>
            <input
              {...register('target_date')}
              type="date"
              className="input-field"
            />
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
          <label className="label-text">Notes</label>
          <input
            {...register('notes')}
            className="input-field"
            placeholder="Optional purpose notes"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E7EB]">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : goal ? 'Update Goal' : 'Save Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
