'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { DataTable, formatCurrency } from '../components/DataTable';

type Product = {
  id: string;
  name: string;
  type: string;
  gid: string;
  pricing: any;
  description?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 50;

  useEffect(() => {
    loadProducts();
  }, [page]);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limitstart: String(page * limit),
        limitnum: String(limit),
      });

      const data = await apiFetch<{ products: Product[]; totalresults: number }>(
        `/admin/whmcs/products?${params.toString()}`
      );
      setProducts(Array.isArray(data.products) ? data.products : []);
      setTotalResults(data.totalresults || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Product Name',
      render: (product: Product) => <span className="font-medium text-[#f0f6fc]">{product.name || 'N/A'}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (product: Product) => (
        <span className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs">{product.type || '—'}</span>
      ),
    },
    {
      key: 'gid',
      label: 'Group ID',
      render: (product: Product) => <span className="font-mono text-[#8b949e]">{product.gid || '—'}</span>,
    },
    {
      key: 'pricing',
      label: 'Pricing',
      render: (product: Product) => {
        if (!product.pricing) return '—';
        const pricing = typeof product.pricing === 'object' ? product.pricing : {};
        const monthly = pricing.monthly || pricing['1'] || 'N/A';
        return <span className="text-[#c9d1d9]">{typeof monthly === 'string' ? monthly : formatCurrency(String(monthly))}</span>;
      },
    },
    {
      key: 'description',
      label: 'Description',
      render: (product: Product) => (
        <span className="text-[#8b949e] text-sm line-clamp-2">{product.description || '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f0f6fc] mb-2">Products</h1>
        <p className="text-[#8b949e]">View all WHMCS products and services</p>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <button
          onClick={loadProducts}
          disabled={loading}
          className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[#c9d1d9] hover:bg-[#30363d] transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-red-400 font-medium">Error loading products</p>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="p-6">
          {loading && products.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#58a6ff] mb-4"></div>
              <p className="text-[#8b949e]">Loading products...</p>
            </div>
          ) : (
            <>
              <DataTable
                data={products}
                columns={columns}
                getRowKey={(product) => product.id}
                emptyMessage="No products found"
              />
              {totalResults > 0 && (
                <div className="mt-4 flex items-center justify-between border-t border-[#30363d] pt-4">
                  <div className="text-sm text-[#8b949e]">
                    Showing {Math.min(page * limit + 1, totalResults)} to {Math.min((page + 1) * limit, totalResults)} of {totalResults} products
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0 || loading}
                      className="px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] hover:bg-[#30363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={(page + 1) * limit >= totalResults || loading || totalResults === 0}
                      className="px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] hover:bg-[#30363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

