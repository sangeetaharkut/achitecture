/**
 * Cart Repository
 * Data access layer - abstracts database operations for shopping cart
 * Implements Repository Pattern
 */

import { PrismaClient } from '@prisma/client';
import { Cart, CartItem, AddToCartDTO } from '../types/cart.types';

export interface ICartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  addItem(userId: string, data: AddToCartDTO): Promise<Cart>;
  updateItemQuantity(cartItemId: string, quantity: number): Promise<CartItem>;
  removeItem(cartItemId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  getCartItems(userId: string): Promise<CartItem[]>;
}

export class CartRepository implements ICartRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    return cart as Cart | null;
  }

  async addItem(userId: string, data: AddToCartDTO): Promise<Cart> {
    // First, ensure cart exists
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Get product for price
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if item already exists
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
      },
    });

    if (existingItem) {
      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + data.quantity,
          subtotal: (existingItem.quantity + data.quantity) * product.price,
        },
      });
    } else {
      // Create new item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          quantity: data.quantity,
          price: product.price,
          subtotal: product.price * data.quantity,
        },
      });
    }

    // Return updated cart
    return this.findByUserId(userId) as Promise<Cart>;
  }

  async updateItemQuantity(cartItemId: string, quantity: number): Promise<CartItem> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true },
    });

    if (!item) {
      throw new Error('Cart item not found');
    }

    const updatedItem = await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity,
        subtotal: quantity * item.price,
      },
      include: { product: true },
    });

    return updatedItem as CartItem;
  }

  async removeItem(cartItemId: string): Promise<void> {
    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    const cart = await this.findByUserId(userId);
    return cart?.items || [];
  }
}
