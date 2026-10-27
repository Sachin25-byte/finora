import React from 'react';
import { X, AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react';

// ============================================================
// MODAL
// ============================================================
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  subtitle?: string;
}

export function Modal({ title, subtitle, onClose, children, maxWidth = 'max-w-lg' }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${maxWidth} fade-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)]">{title}</h2>
            {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-muted)] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// CONFIRM DIALOG
// ============================================================
interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content max-w-md fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${
              variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">{title}</h3>
              <p className="mt-1.5 text-xs text-[var(--text-muted)] leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2.5">
            <button onClick={onCancel} className="btn-secondary text-xs" disabled={isLoading}>
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`${variant === 'danger' ? 'btn-danger' : 'btn-primary'} text-xs`}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LOADING SPINNER
// ============================================================
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2.5',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className="flex items-center justify-center py-6">
      <div className={`spinner ${sizeClasses[size]}`} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[360px]">
      <div className="text-center">
        <div className="spinner mx-auto mb-3" />
        <p className="text-[#64748B] text-xs font-medium">Fetching financial data...</p>
      </div>
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-[var(--bg-card)] border border-dashed border-[var(--border-color)]">
      <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] mb-3.5 shadow-2xs">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-[var(--text-main)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-5 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}

// ============================================================
// ERROR STATE
// ============================================================
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl bg-[var(--bg-card)] border border-red-500/20">
      <div className="w-11 h-11 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-3 border border-red-500/20">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-[var(--text-main)] mb-1">Unable to Load Data</h3>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs">
          Try Again
        </button>
      )}
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  iconBg?: string;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  iconBg = 'bg-[var(--primary-light)]',
  iconColor = 'text-[var(--primary)]',
  className = '',
}: StatCardProps) {
  return (
    <div className={`card p-4 overflow-hidden relative ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] truncate" title={title}>
          {title}
        </p>
        <div className={`w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 border border-[var(--border-color)] shadow-2xs`}>
          {icon}
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-[22px] font-extrabold tracking-tight text-[var(--text-main)] truncate" title={value}>
          {value}
        </p>
      </div>
      {trend && (
        <div className="mt-2.5 pt-2 border-t border-[var(--border-color)] flex items-center gap-1.5">
          <span className={`text-[11px] font-bold ${trend.positive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {trend.value}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] opacity-75">vs last month</span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TOAST / NOTIFICATION
// ============================================================
export function Toast({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-white border-emerald-200 text-emerald-900 shadow-lg shadow-emerald-500/5',
    error: 'bg-white border-red-200 text-red-900 shadow-lg shadow-red-500/5',
    info: 'bg-white border-blue-200 text-blue-900 shadow-lg shadow-blue-500/5',
  };

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
    error: <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />,
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-xl border ${styles[type]} fade-in flex items-center gap-3 max-w-sm`}>
      {icons[type]}
      <span className="text-xs font-semibold leading-snug flex-1">{message}</span>
      <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors p-1">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
