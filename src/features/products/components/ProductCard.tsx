/**
 * Product Card Component
 * Pure presentation component for displaying a single product
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { formatPrice, formatDiscount } from '../utils/formatters';
import { addToCartAction } from '@/features/cart/actions/cart.actions';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discountedPrice?: number;
    discount?: number;
    discountPercentage?: string;
    category: string;
    stock: number;
    imageUrl?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');
  
  const hasDiscount = product.discount && product.discount > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    if (product.stock === 0 || adding) return;
    
    setAdding(true);
    setAddedMessage('');
    
    // In a real app, get userId from auth
    const userId = 'demo-user';
    
    const result = await addToCartAction(userId, {
      productId: product.id,
      quantity: 1,
    });
    
    if (result.success) {
      setAddedMessage('✓ Added to cart!');
      setTimeout(() => setAddedMessage(''), 2000);
    } else {
      setAddedMessage('✗ Failed to add');
      setTimeout(() => setAddedMessage(''), 2000);
    }
    
    setAdding(false);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
            -{product.discountPercentage}%
          </div>
        )}
        
        {/* Stock Badge */}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 bg-yellow-600 text-white px-2 py-1 rounded text-xs">
            Only {product.stock} left
          </div>
        )}
        
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="text-xs text-gray-500 uppercase mb-1">
          {product.category}
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-lg font-bold text-red-600">
                {formatPrice(product.discountedPrice!)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice || product.price)}
              </span>
              <span className="text-xs text-green-600 font-semibold">
                Save {formatPrice(product.discount!)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-2">
          {product.stock > 10 ? (
            <span className="text-xs text-green-600">In Stock</span>
          ) : product.stock > 0 ? (
            <span className="text-xs text-yellow-600">Low Stock</span>
          ) : (
            <span className="text-xs text-red-600">Out of Stock</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || adding}
          className={`mt-3 w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            product.stock === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : adding
              ? 'bg-blue-400 text-white cursor-wait'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
        
        {/* Added Message */}
        {addedMessage && (
          <p className={`text-xs mt-1 text-center ${
            addedMessage.includes('✓') ? 'text-green-600' : 'text-red-600'
          }`}>
            {addedMessage}
          </p>
        )}
      </div>
    </Link>
  );
}
