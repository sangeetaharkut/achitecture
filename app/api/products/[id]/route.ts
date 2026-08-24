/**
 * Product Detail API Route
 * Example of using the feature-based architecture for specific product operations
 */

import { NextRequest, NextResponse } from 'next/server';
import ProductContainer from '@/features/products/di/container';

// GET /api/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productService = ProductContainer.getService();
    const result = await productService.getProductById(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const productService = ProductContainer.getService();
    const result = await productService.updateProduct(id, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productService = ProductContainer.getService();
    const result = await productService.deleteProduct(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
