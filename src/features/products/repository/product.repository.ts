/**
 * Product Repository
 * Data access layer - abstracts database operations for products
 * Implements Repository Pattern
 */

import { PrismaClient } from '@prisma/client';
import {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilter,
} from '../types/product.types';
import { PaginationParams, PaginatedResponse } from '@/types/common.types';

export interface IProductRepository {
  findAll(params: PaginationParams, filter?: ProductFilter): Promise<PaginatedResponse<Product>>;
  findById(id: string): Promise<Product | null>;
  create(data: CreateProductDTO): Promise<Product>;
  update(id: string, data: UpdateProductDTO): Promise<Product>;
  delete(id: string): Promise<void>;
  findByCategory(category: string): Promise<Product[]>;
  updateStock(id: string, quantity: number): Promise<Product>;
}

export class ProductRepository implements IProductRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(
    params: PaginationParams,
    filter?: ProductFilter
  ): Promise<PaginatedResponse<Product>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const where = {
      ...(filter?.category && { category: filter.category }),
      ...(filter?.minPrice && { price: { gte: filter.minPrice } }),
      ...(filter?.maxPrice && { price: { lte: filter.maxPrice } }),
      ...(filter?.searchTerm && {
        OR: [
          { name: { contains: filter.searchTerm, mode: 'insensitive' as const } },
          { description: { contains: filter.searchTerm, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: data as Product[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    return product as Product | null;
  }

  async create(data: CreateProductDTO): Promise<Product> {
    const product = await this.prisma.product.create({
      data,
    });
    return product as Product;
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    const product = await this.prisma.product.update({
      where: { id },
      data,
    });
    return product as Product;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async findByCategory(category: string): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { category },
    });
    return products as Product[];
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
    return product as Product;
  }
}
