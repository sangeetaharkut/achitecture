/**
 * Barrel Export - Cart Feature
 * Central export point maintaining module boundaries
 */

// Public API - only expose what consumers need
export type { ICartService } from './services/cart.service';
export type { ICartRepository } from './repository/cart.repository';
export { default as CartContainer } from './di/container';

// Re-export types for convenience
export type {
  Cart,
  CartItem,
  AddToCartDTO,
  UpdateCartItemDTO,
  CartSummary,
} from './types/cart.types';
