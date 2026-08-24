/**
 * Product Service
 * Business logic layer - handles product operations with business rules
 * Implements Service Layer Pattern
 */

import {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilter,
  DiscountRule,
} from '../types/product.types';
import { PaginationParams, PaginatedResponse, Result } from '@/types/common.types';
import { IProductRepository } from '../repository/product.repository';

export interface IProductService {
  getProducts(params: PaginationParams, filter?: ProductFilter): Promise<PaginatedResponse<Product>>;
  getProductById(id: string): Promise<Result<Product>>;
  createProduct(data: CreateProductDTO): Promise<Result<Product>>;
  updateProduct(id: string, data: UpdateProductDTO): Promise<Result<Product>>;
  deleteProduct(id: string): Promise<Result<void>>;
  calculateDiscount(product: Product, quantity: number, rule?: DiscountRule): number;
  checkStockAvailability(productId: string, quantity: number): Promise<boolean>;
}

export class ProductService implements IProductService {
  constructor(private repository: IProductRepository) {}

  async getProducts(
    params: PaginationParams,
    filter?: ProductFilter
  ): Promise<PaginatedResponse<Product>> {
    return this.repository.findAll(params, filter);
  }

  async getProductById(id: string): Promise<Result<Product>> {
    try {
      const product = await this.repository.findById(id);
      
      if (!product) {
        return {
          success: false,
          error: new Error('Product not found'),
        };
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async createProduct(data: CreateProductDTO): Promise<Result<Product>> {
    try {
      // Business validation
      if (data.price <= 0) {
        return {
          success: false,
          error: new Error('Price must be greater than 0'),
        };
      }

      if (data.stock < 0) {
        return {
          success: false,
          error: new Error('Stock cannot be negative'),
        };
      }

      const product = await this.repository.create(data);
      
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Result<Product>> {
    try {
      // Business validation
      if (data.price !== undefined && data.price <= 0) {
        return {
          success: false,
          error: new Error('Price must be greater than 0'),
        };
      }

      if (data.stock !== undefined && data.stock < 0) {
        return {
          success: false,
          error: new Error('Stock cannot be negative'),
        };
      }

      const product = await this.repository.update(id, data);
      
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async deleteProduct(id: string): Promise<Result<void>> {
    try {
      await this.repository.delete(id);
      
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
   * Calculate discount based on rules
   * Business logic for pricing strategies
   */
  calculateDiscount(product: Product, quantity: number, rule?: DiscountRule): number {
    if (!rule) return product.price * quantity;

    const basePrice = product.price * quantity;

    // Check minimum quantity requirement
    if (rule.minQuantity && quantity < rule.minQuantity) {
      return basePrice;
    }

    if (rule.type === 'percentage') {
      const discount = (basePrice * rule.value) / 100;
      return basePrice - discount;
    }

    if (rule.type === 'fixed') {
      return Math.max(0, basePrice - rule.value);
    }

    return basePrice;
  }

  /**
   * Check if sufficient stock is available
   */
  async checkStockAvailability(productId: string, quantity: number): Promise<boolean> {
    const result = await this.getProductById(productId);
    
    if (!result.success || !result.data) {
      return false;
    }

    return result.data.stock >= quantity;
  }
}
