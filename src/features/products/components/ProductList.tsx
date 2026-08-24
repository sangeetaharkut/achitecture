/**
 * Product List Component
 * Presentation component that uses hooks for data fetching
 */

'use client';

import { useState } from 'react';
import { useProductsWithDiscounts } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { ProductFilter, DiscountRule } from '../types/product.types';

interface ProductListProps {
  initialPage?: number;
  itemsPerPage?: number;
  initialFilter?: ProductFilter;
  discountRule?: DiscountRule;
}

export function ProductList({
  initialPage = 1,
  itemsPerPage = 12,
  initialFilter,
  discountRule
}: ProductListProps) {
  const [page, setPage] = useState(initialPage);
  const [filter, setFilter] = useState<ProductFilter | undefined>(initialFilter);

  const { products, loading, error } = useProductsWithDiscounts(
    page,
    itemsPerPage,
    filter,
    discountRule
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!products || products.data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No products found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Controls */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search products..."
          className="flex-1 px-4 py-2 border rounded"
          onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
        />
        <select
          className="px-4 py-2 border rounded"
          onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.data.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {products.page} of {products.totalPages}
        </span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= products.totalPages}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
