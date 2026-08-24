/**
 * Products API Route
 * Example of using the feature-based architecture in Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import ProductContainer from '@/features/products/di/container';

// GET /api/products - List products with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse pagination params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Parse filter params
    const filter = {
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      searchTerm: searchParams.get('search') || undefined,
    };

    // Use dependency injection to get service
    const productService = ProductContainer.getService();
    
    const result = await productService.getProducts({ page, limit }, filter);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const productService = ProductContainer.getService();
    const result = await productService.createProduct(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
