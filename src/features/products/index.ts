/**
 * Barrel Export - Products Feature
 * Central export point maintaining module boundaries
 */

// Public API - only expose what consumers need
export type { IProductService } from './services/product.service';
export type { IProductRepository } from './repository/product.repository';
export { default as ProductContainer } from './di/container';

// Re-export types for convenience
export type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilter,
  DiscountRule,
} from './types/product.types';
