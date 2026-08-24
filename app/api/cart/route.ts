/**
 * Cart API Route
 * Example of using the feature-based architecture for cart operations
 */

import { NextRequest, NextResponse } from 'next/server';
import CartContainer from '@/features/cart/di/container';

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    // In a real app, get userId from session/auth
    const userId = request.headers.get('x-user-id') || 'demo-user';
    
    const cartService = CartContainer.getService();
    const result = await cartService.getCart(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message },
        { status: 404 }
      );
    }

    // Calculate summary
    const summary = cartService.calculateSummary(result.data!);

    return NextResponse.json({
      cart: result.data,
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const body = await request.json();
    
    const cartService = CartContainer.getService();
    const result = await cartService.addToCart(userId, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    
    const cartService = CartContainer.getService();
    const result = await cartService.clearCart(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
