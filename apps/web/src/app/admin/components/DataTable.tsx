'use client';

import { useState } from 'react';

type Column<T> = {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  emptyDescription?: string;
  getRowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
};

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  emptyMessage = 'No data found',
  emptyDescription = 'Try adjusting your search or filter to find what you\'re looking for.',
  getRowKey,
  onRowClick,
  isLoading = false,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    const comparison = String(aVal).localeCompare(String(bVal));
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-1)] animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-[var(--surface-3)]"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-[var(--surface-3)]"></div>
              <div className="h-3 w-1/4 rounded bg-[var(--surface-2)]"></div>
            </div>
            <div className="h-6 w-20 rounded-full bg-[var(--surface-3)]"></div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
        <svg
            className="w-10 h-10 text-[var(--foreground-subtle)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
              strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{emptyMessage}</h3>
        <p className="text-[var(--foreground-muted)] max-w-sm mx-auto">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6">
      <table className="table-modern w-full">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={`${column.className || ''} ${index === 0 ? 'pl-6' : ''} ${index === columns.length - 1 ? 'pr-6' : ''} ${column.sortable ? 'cursor-pointer select-none hover:text-white transition-colors' : ''}`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                {column.label}
                  {column.sortable && sortColumn === column.key && (
                    <svg
                      className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, rowIndex) => (
            <tr
              key={getRowKey(item)}
              className={`${onRowClick ? 'cursor-pointer' : ''} opacity-0 animate-fade-in`}
              style={{ animationDelay: `${rowIndex * 50}ms`, animationFillMode: 'forwards' }}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={column.key}
                  className={`${column.className || ''} ${colIndex === 0 ? 'pl-6' : ''} ${colIndex === columns.length - 1 ? 'pr-6' : ''}`}
                >
                  {column.render ? column.render(item) : String(item[column.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status, getStatusColor }: { status: string; getStatusColor?: (status: string) => string }) {
  const getDefaultStatusClass = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('active') || statusLower.includes('completed') || statusLower === 'paid') {
      return 'badge badge-success';
    }
    if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return 'badge badge-warning';
    }
    if (statusLower.includes('suspended') || statusLower.includes('cancelled') || statusLower === 'unpaid') {
      return 'badge badge-error';
    }
    return 'badge badge-neutral';
  };

  const statusClass = getStatusColor ? getStatusColor(status) : getDefaultStatusClass(status);
  
  // Use new badge classes if it starts with 'badge'
  if (statusClass.startsWith('badge')) {
    return (
      <span className={statusClass}>
        {status || 'Unknown'}
      </span>
    );
  }

  // Legacy support for old class format
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
      {status || 'Unknown'}
    </span>
  );
}

export function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return formatDate(dateString);
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount: string, currency: string = 'USD') {
  const num = parseFloat(amount || '0');
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(num);
}

export function getStatusColor(status: string) {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower.includes('active') || statusLower.includes('completed') || statusLower === 'paid') {
    return 'badge badge-success';
  }
  if (statusLower.includes('pending') || statusLower.includes('processing')) {
    return 'badge badge-warning';
  }
  if (statusLower.includes('suspended') || statusLower.includes('cancelled') || statusLower === 'unpaid') {
    return 'badge badge-error';
  }
  return 'badge badge-neutral';
}

// Pagination Component
type PaginationProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
      <p className="text-sm text-[var(--foreground-muted)]">
        Showing <span className="font-medium text-white">{startItem}</span> to{' '}
        <span className="font-medium text-white">{endItem}</span> of{' '}
        <span className="font-medium text-white">{totalItems.toLocaleString()}</span> results
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--foreground-muted)] hover:text-white hover:bg-[var(--surface-3)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--surface-2)] disabled:hover:text-[var(--foreground-muted)]"
        >
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </span>
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i;
            } else if (currentPage < 3) {
              pageNum = i;
            } else if (currentPage > totalPages - 4) {
              pageNum = totalPages - 5 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                className={`w-10 h-10 text-sm font-medium rounded-lg transition-all ${
                  currentPage === pageNum
                    ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20'
                    : 'bg-[var(--surface-2)] text-[var(--foreground-muted)] hover:text-white hover:bg-[var(--surface-3)]'
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || isLoading}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--foreground-muted)] hover:text-white hover:bg-[var(--surface-3)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--surface-2)] disabled:hover:text-[var(--foreground-muted)]"
        >
          <span className="flex items-center gap-1">
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

// Search Input Component
type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-subtle)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-12"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--surface-3)] text-[var(--foreground-subtle)] hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Select Component
type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
}: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field appearance-none pr-10 cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-subtle)] pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

// Page Header Component
type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{title}</h1>
        {description && (
          <p className="text-[var(--foreground-muted)] mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// Card Component
type CardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddingClass = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  return (
    <div className={`surface-card ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}

// Error Alert Component
type ErrorAlertProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorAlert({ title = 'Error', message, onRetry }: ErrorAlertProps) {
  return (
    <div className="p-4 rounded-xl bg-[var(--error-soft)] border border-[var(--error)]/30 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--error)]/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-[var(--error)]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--error)]">{title}</h3>
          <p className="text-sm text-[var(--error)]/80 mt-1">{message}</p>
          {onRetry && (
            <button onClick={onRetry} className="mt-2 text-sm font-medium text-[var(--error)] hover:underline">
              Try again →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
