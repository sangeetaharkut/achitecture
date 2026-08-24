/**
 * Cart Service
 * Business logic layer - handles cart operations with business rules
 * Implements Service Layer Pattern
 */

import { Cart, CartItem, AddToCartDTO, CartSummary } from '../types/cart.types';
import { Result } from '@/types/common.types';
import { ICartRepository } from '../repository/cart.repository';
import { IProductService } from '@/features/products';

export interface ICartService {
  getCart(userId: string): Promise<Result<Cart>>;
  addToCart(userId: string, data: AddToCartDTO): Promise<Result<Cart>>;
  updateQuantity(cartItemId: string, quantity: number): Promise<Result<CartItem>>;
  removeFromCart(cartItemId: string): Promise<Result<void>>;
  clearCart(userId: string): Promise<Result<void>>;
  calculateSummary(cart: Cart): CartSummary;
}

export class CartService implements ICartService {
  private readonly TAX_RATE = 0.1; // 10% tax

  constructor(
    private repository: ICartRepository,
    private productService: IProductService
  ) {}

  async getCart(userId: string): Promise<Result<Cart>> {
    try {
      const cart = await this.repository.findByUserId(userId);
      
      if (!cart) {
        return {
          success: false,
          error: new Error('Cart not found'),
        };
      }

      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async addToCart(userId: string, data: AddToCartDTO): Promise<Result<Cart>> {
    try {
      // Business validation - check stock availability
      const hasStock = await this.productService.checkStockAvailability(
        data.productId,
        data.quantity
      );

      if (!hasStock) {
        return {
          success: false,
          error: new Error('Insufficient stock available'),
        };
      }

      // Business rule - minimum quantity is 1
      if (data.quantity < 1) {
        return {
          success: false,
          error: new Error('Quantity must be at least 1'),
        };
      }

      const cart = await this.repository.addItem(userId, data);

      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async updateQuantity(cartItemId: string, quantity: number): Promise<Result<CartItem>> {
    try {
      // Business rule - quantity must be positive
      if (quantity < 1) {
        return {
          success: false,
          error: new Error('Quantity must be at least 1'),
        };
      }

      const item = await this.repository.updateItemQuantity(cartItemId, quantity);

      return {
        success: true,
        data: item,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async removeFromCart(cartItemId: string): Promise<Result<void>> {
    try {
      await this.repository.removeItem(cartItemId);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async clearCart(userId: string): Promise<Result<void>> {
    try {
      await this.repository.clearCart(userId);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Calculate cart summary with business rules
   * Applies tax calculations and totals
   */
  calculateSummary(cart: Cart): CartSummary {
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * this.TAX_RATE;
    const total = subtotal + tax;

    return {
      itemCount,
      subtotal,
      tax,
      total,
    };
  }
}
