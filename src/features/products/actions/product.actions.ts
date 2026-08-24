/**
 * Product Server Actions
 * Server-side functions that can be called from client components
 * Acts as API boundary between client and server
 */

'use server';

import ProductContainer from '../di/container';
import { ProductFilter, DiscountRule } from '../types/product.types';
import { revalidatePath } from 'next/cache';

/**
 * Get paginated products with optional filtering
 */
export async function getProductsAction(
  page: number = 1,
  limit: number = 10,
  filter?: ProductFilter
) {
  try {
    const service = ProductContainer.getService();
    const result = await service.getProducts({ page, limit }, filter);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    };
  }
}

/**
 * Get single product by ID
 */
export async function getProductByIdAction(id: string) {
  try {
    const service = ProductContainer.getService();
    const result = await service.getProductById(id);
    
    if (!result.success) {
      return { success: false, error: result.error?.message };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product'
    };
  }
}

/**
 * Create new product
 */
export async function createProductAction(data: {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
}) {
  try {
    const service = ProductContainer.getService();
    const result = await service.createProduct(data);
    
    if (!result.success) {
      return { success: false, error: result.error?.message };
    }
    
    revalidatePath('/products');
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product'
    };
  }
}

/**
 * Update existing product
 */
export async function updateProductAction(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    stock?: number;
    imageUrl?: string;
  }
) {
  try {
    const service = ProductContainer.getService();
    const result = await service.updateProduct(id, data);
    
    if (!result.success) {
      return { success: false, error: result.error?.message };
    }
    
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product'
    };
  }
}

/**
 * Delete product
 */
export async function deleteProductAction(id: string) {
  try {
    const service = ProductContainer.getService();
    const result = await service.deleteProduct(id);
    
    if (!result.success) {
      return { success: false, error: result.error?.message };
    }
    
    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product'
    };
  }
}

/**
 * Calculate discount for a product
 */
export async function calculateDiscountAction(
  productId: string,
  quantity: number,
  rule?: DiscountRule
) {
  try {
    const service = ProductContainer.getService();
    const productResult = await service.getProductById(productId);
    
    if (!productResult.success || !productResult.data) {
      return { success: false, error: 'Product not found' };
    }
    
    const discountedPrice = service.calculateDiscount(productResult.data, quantity, rule);
    
    return {
      success: true,
      data: {
        originalPrice: productResult.data.price * quantity,
        discountedPrice,
        savings: (productResult.data.price * quantity) - discountedPrice
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate discount'
    };
  }
}

/**
 * Check stock availability
 */
export async function checkStockAction(productId: string, quantity: number) {
  try {
    const service = ProductContainer.getService();
    const available = await service.checkStockAvailability(productId, quantity);
    
    return { success: true, data: { available } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check stock'
    };
  }
}

/**
 * Get products with calculated discounts
 */
export async function getProductsWithDiscountsAction(
  page: number = 1,
  limit: number = 10,
  filter?: ProductFilter,
  discountRule?: DiscountRule
) {
  try {
    const service = ProductContainer.getService();
    const result = await service.getProducts({ page, limit }, filter);
    
    // Apply discount calculations to each product
    const productsWithDiscounts = result.data.map((product: any) => {
      const discountedPrice = service.calculateDiscount(product, 1, discountRule);
      return {
        ...product,
        originalPrice: product.price,
        discountedPrice,
        discount: product.price - discountedPrice,
        discountPercentage: discountRule ? 
          ((product.price - discountedPrice) / product.price * 100).toFixed(0) : '0'
      };
    });
    
    return {
      success: true,
      data: {
        ...result,
        data: productsWithDiscounts
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    };
  }
}
