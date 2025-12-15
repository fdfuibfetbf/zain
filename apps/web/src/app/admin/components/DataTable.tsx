'use client';

type Column<T> = {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  getRowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  emptyMessage = 'No data found',
  getRowKey,
  onRowClick,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-[#8b949e] mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-[#8b949e]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#30363d]">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`text-left py-3 px-4 text-sm font-semibold text-[#8b949e] ${column.className || ''}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={getRowKey(item)}
              className={`border-b border-[#21262d] transition-colors ${
                onRowClick ? 'hover:bg-[#161b22] cursor-pointer' : ''
              }`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td key={column.key} className={`py-3 px-4 text-sm text-[#c9d1d9] ${column.className || ''}`}>
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

export function StatusBadge({ status, getStatusColor }: { status: string; getStatusColor: (status: string) => string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
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
    return 'bg-green-500/10 text-green-400 border-green-500/20';
  }
  if (statusLower.includes('pending') || statusLower.includes('processing')) {
    return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  }
  if (statusLower.includes('suspended') || statusLower.includes('cancelled') || statusLower === 'unpaid') {
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  }
  return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
}

