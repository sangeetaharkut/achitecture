/**
 * Cart Server Actions
 * Server-side functions for cart operations
 */

'use server';

import CartContainer from '../di/container';
import { AddToCartDTO } from '../types/cart.types';
import { revalidatePath } from 'next/cache';

/**
 * Get user's cart
 */
export async function getCartAction(userId: string) {
  try {
    const service = CartContainer.getService();
    const result = await service.getCart(userId);
    
    if (!result.success) {
      return { success: false, error: result.error?.message };
    }
    
    // Calculate summary
    const summary = result.data ? service.calculateSummary(result.data) : null;
    
    return {
      success: true,
      data: {
        cart: result.data,
        summary
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch cart'
    };
  }
}

/**
 * Add item to cart
 */
export async function addToCartAction(userId: string, data: AddToCartDTO) {
  try {
    const service = CartContainer.getService();
    const result = await service.addToCart(userId, data);
    
    if (!result.success) {
      return { success: false, error: result.error?.message };
    }
    
    revalidatePath('/cart');
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add to cart'
    };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemAction(cartItemId: string, quantity: number) {
  try {
    const service = CartContainer.getService();
    const result = await service.updateQuantity(cartItemId, quantity);
    
    if (!result.success) {
      return { success: false, error: result.error?.message };
    }
    
    revalidatePath('/cart');
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update cart item'
    };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCartAction(cartItemId: string) {
  try {
    const service = CartContainer.getService();
    const result = await service.removeFromCart(cartItemId);
    
    if (!result.success) {
      return { success: false, error: result.error?.message };
    }
    
    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove item'
    };
  }
}

/**
 * Clear cart
 */
export async function clearCartAction(userId: string) {
  try {
    const service = CartContainer.getService();
    const result = await service.clearCart(userId);
    
    if (!result.success) {
      return { success: false, error: result.error?.message };
    }
    
    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear cart'
    };
  }
}
