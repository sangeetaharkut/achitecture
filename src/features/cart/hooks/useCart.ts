/**
 * Cart Hooks
 * Client-side hooks for cart state management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCartAction,
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
  clearCartAction
} from '../actions/cart.actions';
import { Cart, AddToCartDTO } from '../types/cart.types';

export function useCart(userId: string) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await getCartAction(userId);
    
    if (result.success && result.data) {
      setCart(result.data.cart);
      setSummary(result.data.summary);
    } else {
      setError(result.error || 'Failed to fetch cart');
    }
    
    setLoading(false);
  }, [userId]);

  const addToCart = useCallback(async (data: AddToCartDTO) => {
    const result = await addToCartAction(userId, data);
    
    if (result.success) {
      await fetchCart(); // Refresh cart
      return { success: true };
    }
    
    return { success: false, error: result.error };
  }, [userId, fetchCart]);

  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    const result = await updateCartItemAction(cartItemId, quantity);
    
    if (result.success) {
      await fetchCart(); // Refresh cart
      return { success: true };
    }
    
    return { success: false, error: result.error };
  }, [fetchCart]);

  const removeItem = useCallback(async (cartItemId: string) => {
    const result = await removeFromCartAction(cartItemId);
    
    if (result.success) {
      await fetchCart(); // Refresh cart
      return { success: true };
    }
    
    return { success: false, error: result.error };
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    const result = await clearCartAction(userId);
    
    if (result.success) {
      await fetchCart(); // Refresh cart
      return { success: true };
    }
    
    return { success: false, error: result.error };
  }, [userId, fetchCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    summary,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refetch: fetchCart
  };
}
