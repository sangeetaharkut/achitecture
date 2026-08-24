/**
 * Product Hooks
 * Client-side hooks for data fetching and state management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getProductsAction,
  getProductByIdAction,
  getProductsWithDiscountsAction,
  checkStockAction,
  calculateDiscountAction
} from '../actions/product.actions';
import { Product, ProductFilter, DiscountRule } from '../types/product.types';
import { PaginatedResponse } from '@/types/common.types';

export function useProducts(
  page: number = 1,
  limit: number = 10,
  filter?: ProductFilter
) {
  const [products, setProducts] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await getProductsAction(page, limit, filter);
    
    if (result.success && result.data) {
      setProducts(result.data);
    } else {
      setError(result.error || 'Failed to fetch products');
    }
    
    setLoading(false);
  }, [page, limit, filter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await getProductByIdAction(id);
    
    if (result.success && result.data) {
      setProduct(result.data);
    } else {
      setError(result.error || 'Failed to fetch product');
    }
    
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct
  };
}

export function useProductsWithDiscounts(
  page: number = 1,
  limit: number = 10,
  filter?: ProductFilter,
  discountRule?: DiscountRule
) {
  const [products, setProducts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await getProductsWithDiscountsAction(page, limit, filter, discountRule);
    
    if (result.success && result.data) {
      setProducts(result.data);
    } else {
      setError(result.error || 'Failed to fetch products');
    }
    
    setLoading(false);
  }, [page, limit, filter, discountRule]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
}

export function useStockCheck(productId: string, quantity: number) {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const checkStock = async () => {
      setLoading(true);
      setError(null);
      
      const result = await checkStockAction(productId, quantity);
      
      if (mounted) {
        if (result.success && result.data) {
          setAvailable(result.data.available);
        } else {
          setError(result.error || 'Failed to check stock');
        }
        setLoading(false);
      }
    };

    checkStock();
    
    return () => {
      mounted = false;
    };
  }, [productId, quantity]);

  return { available, loading, error };
}

export function useDiscountCalculator() {
  const [calculating, setCalculating] = useState(false);
  
  const calculateDiscount = useCallback(async (
    productId: string,
    quantity: number,
    rule?: DiscountRule
  ) => {
    setCalculating(true);
    
    const result = await calculateDiscountAction(productId, quantity, rule);
    
    setCalculating(false);
    
    return result;
  }, []);

  return {
    calculateDiscount,
    calculating
  };
}
