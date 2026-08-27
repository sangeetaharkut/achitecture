/**
 * Product Server Actions
 * Server-side functions that call DummyJSON API
 */

'use server';

import { ProductFilter } from '../types/product.types';

const DUMMYJSON_API = 'https://dummyjson.com';

/**
 * Map DummyJSON product to our Product type
 */
function mapDummyJsonProduct(data: any) {
  return {
    id: data.id.toString(),
    name: data.title,
    description: data.description,
    price: data.price,
    category: data.category,
    stock: data.stock,
    imageUrl: data.thumbnail || data.images?.[0] || '',
    rating: data.rating,
    brand: data.brand,
  };
}

/**
 * Get paginated products from DummyJSON
 */
export async function getProductsAction(
  page: number = 1,
  limit: number = 10,
  filter?: ProductFilter
) {
  try {
    const skip = (page - 1) * limit;
    let url = `${DUMMYJSON_API}/products?limit=${limit}&skip=${skip}`;
    
    // Add category filter if provided
    if (filter?.category) {
      url = `${DUMMYJSON_API}/products/category/${filter.category}?limit=${limit}&skip=${skip}`;
    }
    
    console.log('[Server Action] Fetching from:', url);
    
    // For development, allow self-signed certificates
    if (process.env.NODE_ENV === 'development') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    
    const response = await fetch(url, { 
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('[Server Action] Response status:', response.status);
    
    if (!response.ok) {
      console.error(`Failed to fetch from ${url}: ${response.status}`);
      throw new Error(`HTTP ${response.status}: Failed to fetch products`);
    }
    
    const data = await response.json();
    console.log('[Server Action] Got', data.products?.length, 'products');
    
    return {
      success: true,
      data: {
        data: data.products.map(mapDummyJsonProduct),
        total: data.total,
        page,
        limit,
        pages: Math.ceil(data.total / limit),
      }
    };
  } catch (error) {
    console.error('getProductsAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    };
  }
}

/**
 * Get single product by ID from DummyJSON
 */
export async function getProductByIdAction(id: string) {
  try {
    const response = await fetch(`${DUMMYJSON_API}/products/${id}`, {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      return { success: false, error: 'Product not found' };
    }
    
    const data = await response.json();
    return { success: true, data: mapDummyJsonProduct(data) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product'
    };
  }
}

/**
 * Search products by query
 */
export async function searchProductsAction(query: string) {
  try {
    const response = await fetch(`${DUMMYJSON_API}/products/search?q=${encodeURIComponent(query)}`, {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      throw new Error('Failed to search products');
    }
    
    const data = await response.json();
    return {
      success: true,
      data: data.products.map(mapDummyJsonProduct)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search products'
    };
  }
}

/**
 * Get all categories
 */
export async function getCategoriesAction() {
  try {
    const response = await fetch(`${DUMMYJSON_API}/products/categories`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const categories = await response.json();
    return {
      success: true,
      data: categories
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories'
    };
  }
}

/**
 * Get products with discounts (simplified - applies discount client-side)
 */
export async function getProductsWithDiscountsAction(
  page: number = 1,
  limit: number = 10,
  filter?: ProductFilter,
  discountRule?: any
) {
  try {
    console.log('[Server Action] getProductsWithDiscountsAction called', { page, limit, filter, discountRule });
    const result = await getProductsAction(page, limit, filter);
    console.log('[Server Action] getProductsAction result:', { success: result.success, error: result.error, dataLength: result.data?.data?.length });
    
    if (!result.success) {
      return result;
    }
    
    // Apply discount calculations if rule provided
    const productsWithDiscounts = result.data.data.map((product: any) => {
      if (!discountRule) {
        return product;
      }
      
      const discount = discountRule.type === 'percentage' 
        ? (product.price * discountRule.value) / 100
        : discountRule.value;
      
      return {
        ...product,
        originalPrice: product.price,
        discountedPrice: Math.max(0, product.price - discount),
        discount,
        discountPercentage: discountRule.type === 'percentage' ? discountRule.value : 0
      };
    });
    
    return {
      success: true,
      data: {
        ...result.data,
        data: productsWithDiscounts
      }
    };
  } catch (error) {
    console.error('[Server Action] getProductsWithDiscountsAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    };
  }
}

/**
 * Stub functions for compatibility - not implemented for DummyJSON
 */
export async function checkStockAction(productId: string, quantity: number) {
  return { success: true, data: { available: true } };
}

export async function calculateDiscountAction(
  productId: string,
  quantity: number,
  rule?: any
) {
  const result = await getProductByIdAction(productId);
  if (!result.success || !result.data) {
    return { success: false, error: 'Product not found' };
  }
  
  const product = result.data;
  const discount = rule?.type === 'percentage' 
    ? (product.price * rule.value) / 100
    : rule?.value || 0;
  
  return {
    success: true,
    data: {
      originalPrice: product.price * quantity,
      discountedPrice: (product.price - discount) * quantity,
      savings: discount * quantity
    }
  };
}
