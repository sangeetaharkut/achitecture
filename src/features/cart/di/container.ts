/**
 * Dependency Injection Container - Cart Feature
 * Manages dependencies and provides singleton instances
 */

import { prisma } from '@/lib/prisma';
import { CartRepository, ICartRepository } from '../repository/cart.repository';
import { CartService, ICartService } from '../services/cart.service';
import ProductContainer from '@/features/products/di/container';

class CartContainer {
  private static repositoryInstance: ICartRepository;
  private static serviceInstance: ICartService;

  static getRepository(): ICartRepository {
    if (!this.repositoryInstance) {
      this.repositoryInstance = new CartRepository(prisma);
    }
    return this.repositoryInstance;
  }

  static getService(): ICartService {
    if (!this.serviceInstance) {
      const repository = this.getRepository();
      const productService = ProductContainer.getService();
      this.serviceInstance = new CartService(repository, productService);
    }
    return this.serviceInstance;
  }

  // For testing - allows injecting mocks
  static setRepository(repository: ICartRepository): void {
    this.repositoryInstance = repository;
  }

  static setService(service: ICartService): void {
    this.serviceInstance = service;
  }

  // Reset instances (useful for testing)
  static reset(): void {
    this.repositoryInstance = null!;
    this.serviceInstance = null!;
  }
}

export default CartContainer;
