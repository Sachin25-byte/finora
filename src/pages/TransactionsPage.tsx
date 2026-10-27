import React, { useState, useEffect, useCallback } from 'react';
import { getTransactions, deleteTransaction } from '../lib/api';
import { formatCurrency, formatDate, getPaymentMethodLabel, exportToCSV, formatDateInput, getStartOfMonth, getEndOfMonth } from '../lib/utils';
import { ConfirmDialog, EmptyState, PageLoader, ErrorState, Toast } from '../components/ui/shared';
import TransactionModal from '../components/transactions/TransactionModal';
import type { Transaction, FinanceType } from '../types';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  Calendar,
  Layers,
  QrCode,
} from 'lucide-react';
import QRScannerModal from '../components/transactions/QRScannerModal';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>();
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [financeFilter, setFinanceFilter] = useState<FinanceType | 'all'>('all');
  const [startDate, setStartDate] = useState(formatDateInput(getStartOfMonth()));
  const [endDate, setEndDate] = useState(formatDateInput(getEndOfMonth()));
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const pageSize = 12;

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getTransactions({
        startDate,
        endDate,
        type: typeFilter || undefined,
        financeType: financeFilter,
        search: search || undefined,
        page,
        pageSize,
        sortBy,
        sortOrder,
      });
      setTransactions(result.data);
      setTotalCount(result.count);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, financeFilter, startDate, endDate, page, sortBy, sortOrder]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    const handler = () => loadTransactions();
    window.addEventListener('transaction-changed', handler);
    return () => window.removeEventListener('transaction-changed', handler);
  }, [loadTransactions]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, financeFilter, startDate, endDate]);

  async function handleDelete() {
    if (!deleteTx) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(deleteTx.id);
      setToast({ message: 'Transaction deleted successfully', type: 'success' });
      setDeleteTx(null);
      loadTransactions();
      window.dispatchEvent(new CustomEvent('transaction-changed'));
    } catch {
      setToast({ message: 'Failed to delete transaction', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }

  function handleExport() {
    const exportData = transactions.map(tx => ({
      Date: tx.date,
      Type: tx.type,
      Description: tx.description,
      Amount: tx.amount,
      Category: (tx.category as any)?.name || '',
      Account: (tx.account as any)?.name || '',
      DestinationAccount: (tx.to_account as any)?.name || '',
      FinanceType: tx.finance_type,
      PaymentMethod: tx.payment_method || '',
      ReferenceNumber: tx.reference_number || '',
      Notes: tx.notes || '',
    }));
    exportToCSV(exportData, `Finora_Transactions_${startDate}_to_${endDate}`);
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  function handleSort(field: string) {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Showing {totalCount} verified records with live balances</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowQRScanner(true)}
            className="btn-secondary text-xs"
          >
            <QrCode className="w-4 h-4 text-[var(--primary)]" /> Scan QR
          </button>
          <button onClick={handleExport} className="btn-secondary text-xs">
            <Download className="w-4 h-4 text-[var(--text-muted)]" /> Export CSV
          </button>
          <button
            onClick={() => { setEditTx(undefined); setShowModal(true); }}
            className="btn-primary text-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Modern Filter Card */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search description, memo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="select-field"
            >
              <option value="">All Flow Types</option>
              <option value="income">Income (+)</option>
              <option value="expense">Expense (-)</option>
              <option value="transfer">Account Transfer</option>
            </select>
          </div>
          <div>
            <select
              value={financeFilter}
              onChange={e => setFinanceFilter(e.target.value as any)}
              className="select-field"
            >
              <option value="all">All Portfolios</option>
              <option value="personal">Personal Finance</option>
              <option value="business">Business Finance</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="input-field text-xs px-2"
              title="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="input-field text-xs px-2"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {/* Main Transactions Table */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={loadTransactions} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight className="w-8 h-8" />}
          title="No Transactions Found"
          description="There are no transactions recorded matching your selected filters."
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary btn-sm">
              <Plus className="w-4 h-4" /> Add Transaction
            </button>
          }
        />
      ) : (
        <div className="card p-0 overflow-hidden shadow-xs border-[#E5E7EB]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="table-header cursor-pointer select-none" onClick={() => handleSort('date')}>
                    Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Description</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Account</th>
                  <th className="table-header cursor-pointer text-right select-none" onClick={() => handleSort('amount')}>
                    Amount (₹) {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="table-header">Portfolio</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-cell whitespace-nowrap text-xs text-[#64748B]">
                      {formatDate(tx.date)}
                    </td>
                    <td className="table-cell">
                      <span className={
                        tx.type === 'income' ? 'badge-income' :
                        tx.type === 'expense' ? 'badge-expense' : 'badge-transfer'
                      }>
                        {tx.type}
                      </span>
                    </td>
                    <td className="table-cell font-medium text-[var(--text-main)] max-w-[220px] truncate">
                      {tx.description}
                    </td>
                    <td className="table-cell text-xs text-[var(--text-muted)]">
                      {(tx.category as any)?.name || '—'}
                    </td>
                    <td className="table-cell text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {(tx.account as any)?.name || 'Account'}
                      {tx.type === 'transfer' && (tx.to_account as any)?.name && (
                        <span className="text-[var(--primary)] font-medium"> → {(tx.to_account as any).name}</span>
                      )}
                    </td>
                    <td className={`table-cell text-right font-bold text-xs whitespace-nowrap ${
                      tx.type === 'income' ? 'text-[#16A34A]' :
                      tx.type === 'expense' ? 'text-[#DC2626]' : 'text-amber-500'
                    }`}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="table-cell">
                      <span className={tx.finance_type === 'personal' ? 'badge-personal' : 'badge-business'}>
                        {tx.finance_type}
                      </span>
                    </td>
                    <td className="table-cell text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditTx(tx); setShowModal(true); }}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-muted)] rounded-lg transition-colors"
                          title="Edit Transaction"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTx(tx)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] border-t border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-muted)]">
                Showing <strong className="text-[var(--text-main)]">{((page - 1) * pageSize) + 1}</strong> to{' '}
                <strong className="text-[var(--text-main)]">{Math.min(page * pageSize, totalCount)}</strong> of{' '}
                <strong className="text-[var(--text-main)]">{totalCount}</strong> records
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary btn-sm p-1.5 disabled:opacity-40"
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-semibold text-[var(--text-main)] px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary btn-sm p-1.5 disabled:opacity-40"
                  title="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          editTransaction={editTx}
          onClose={() => { setShowModal(false); setEditTx(undefined); }}
          onSuccess={() => {
            setShowModal(false);
            setEditTx(undefined);
            loadTransactions();
            window.dispatchEvent(new CustomEvent('transaction-changed'));
          }}
        />
      )}

      {/* Confirm Delete Dialog */}
      {deleteTx && (
        <ConfirmDialog
          title="Delete Transaction Record"
          message={`Are you sure you want to delete "${deleteTx.description}" (${formatCurrency(deleteTx.amount)})? This will automatically recalculate your balances and cannot be undone.`}
          confirmLabel="Delete Record"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTx(null)}
          isLoading={isDeleting}
        />
      )}

      {/* Toast Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanResult={(data) => {
          setEditTx({
            id: '',
            date: formatDateInput(new Date()),
            type: 'expense',
            amount: parseFloat(data.amount) || 100,
            description: data.description,
            category_id: '',
            account_id: '',
            finance_type: 'personal',
            payment_method: 'upi',
            user_id: '',
            created_at: new Date().toISOString(),
          } as any);
          setShowModal(true);
        }}
      />
    </div>
  );
}
