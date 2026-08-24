/**
 * Dependency Injection Container - Products Feature
 * Manages dependencies and provides singleton instances
 */

import { prisma } from '@/lib/prisma';
import { ProductRepository, IProductRepository } from '../repository/product.repository';
import { ProductService, IProductService } from '../services/product.service';

class ProductContainer {
  private static repositoryInstance: IProductRepository;
  private static serviceInstance: IProductService;

  static getRepository(): IProductRepository {
    if (!this.repositoryInstance) {
      this.repositoryInstance = new ProductRepository(prisma);
    }
    return this.repositoryInstance;
  }

  static getService(): IProductService {
    if (!this.serviceInstance) {
      const repository = this.getRepository();
      this.serviceInstance = new ProductService(repository);
    }
    return this.serviceInstance;
  }

  // For testing - allows injecting mocks
  static setRepository(repository: IProductRepository): void {
    this.repositoryInstance = repository;
  }

  static setService(service: IProductService): void {
    this.serviceInstance = service;
  }

  // Reset instances (useful for testing)
  static reset(): void {
    this.repositoryInstance = null!;
    this.serviceInstance = null!;
  }
}

export default ProductContainer;
