import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../lib/api';
import { Modal, ConfirmDialog, EmptyState, PageLoader, ErrorState, Toast } from '../components/ui/shared';
import type { Category, FinanceType, CategoryType } from '../types';
import { Plus, Edit, Trash2, Tags, Check } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: z.enum(['income', 'expense']),
  finance_type: z.enum(['personal', 'business']),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | undefined>();
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filterFinance, setFilterFinance] = useState<FinanceType | 'all'>('all');
  const [filterType, setFilterType] = useState<CategoryType | 'all'>('all');

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCategories(); }, []);

  async function handleDelete() {
    if (!deleteCat) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteCat.id);
      setToast({ message: 'Category removed successfully', type: 'success' });
      setDeleteCat(null);
      loadCategories();
    } catch {
      setToast({ message: 'Cannot remove category currently in use', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }

  const filtered = categories.filter(cat => {
    if (filterFinance !== 'all' && cat.finance_type !== filterFinance) return false;
    if (filterType !== 'all' && cat.type !== filterType) return false;
    return true;
  });

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={loadCategories} />;

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize and tag personal & business transactions</p>
        </div>
        <button
          onClick={() => { setEditCat(undefined); setShowModal(true); }}
          className="btn-primary text-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Add Category
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 flex-wrap">
        <div className="inline-flex bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
          {['all', 'personal', 'business'].map(f => (
            <button
              key={f}
              onClick={() => setFilterFinance(f as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                filterFinance === f ? 'bg-[var(--primary)] text-[var(--primary-text)] shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {f === 'all' ? 'All Portfolios' : f}
            </button>
          ))}
        </div>

        <div className="inline-flex bg-[var(--bg-muted)] p-1 rounded-lg border border-[var(--border-color)]">
          {['all', 'income', 'expense'].map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                filterType === f ? 'bg-[var(--primary)] text-[var(--primary-text)] shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {f === 'all' ? 'All Types' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Category Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Tags className="w-8 h-8" />}
          title="No Categories Matched"
          description="Create categories to bucket your expenses and income sources accurately."
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary btn-sm">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(cat => (
            <div key={cat.id} className="card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-2xs"
                    style={{ backgroundColor: cat.color || 'var(--primary)' }}
                  >
                    {cat.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-main)]">{cat.name}</p>
                    <div className="flex gap-1.5 mt-1">
                      <span className={cat.type === 'income' ? 'badge-income text-[10px]' : 'badge-expense text-[10px]'}>
                        {cat.type}
                      </span>
                      <span className={cat.finance_type === 'personal' ? 'badge-personal text-[10px]' : 'badge-business text-[10px]'}>
                        {cat.finance_type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditCat(cat); setShowModal(true); }}
                    className="p-1 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  {!cat.is_default && (
                    <button
                      onClick={() => setDeleteCat(cat)}
                      className="p-1 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CategoryModal
          category={editCat}
          onClose={() => { setShowModal(false); setEditCat(undefined); }}
          onSuccess={() => {
            setShowModal(false);
            setEditCat(undefined);
            loadCategories();
            setToast({ message: editCat ? 'Category updated' : 'Category created', type: 'success' });
          }}
        />
      )}

      {deleteCat && (
        <ConfirmDialog
          title="Delete Category"
          message={`Are you sure you want to remove the category "${deleteCat.name}"?`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteCat(null)}
          isLoading={isDeleting}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function CategoryModal({ category, onClose, onSuccess }: { category?: Category; onClose: () => void; onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const colorOptions = ['#2563EB', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444', '#64748B'];

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          type: category.type,
          finance_type: category.finance_type,
          color: category.color || '#2563EB',
        }
      : {
          name: '',
          type: 'expense',
          finance_type: 'personal',
          color: '#2563EB',
        },
  });

  const selectedColor = watch('color') || '#2563EB';

  async function onSubmit(data: CategoryFormData) {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        type: data.type as CategoryType,
        finance_type: data.finance_type as FinanceType,
        color: data.color || '#2563EB',
        is_default: false,
        is_active: true,
      };

      if (category) {
        await updateCategory(category.id, payload);
      } else {
        await createCategory(payload);
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      title={category ? 'Edit Category' : 'Create New Category'}
      subtitle="Define category properties for classification"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label-text">Category Name *</label>
          <input
            {...register('name')}
            className="input-field"
            placeholder="e.g. Subscriptions, Groceries, Cloud Server"
          />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="label-text">Category Type *</label>
            <select {...register('type')} className="select-field">
              <option value="expense">Expense (-)</option>
              <option value="income">Income (+)</option>
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
          <label className="label-text">Tag Color</label>
          <div className="flex items-center gap-2.5 pt-1">
            {colorOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('color', c)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                  selectedColor === c ? 'scale-110 ring-2 ring-offset-2 ring-[#2563EB]' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              >
                {selectedColor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E7EB]">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
