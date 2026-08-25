/**
 * Product Card Component with Internationalization
 * Pure presentation component for displaying a single product with locale-aware pricing
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { formatPriceForLocale } from '@/lib/i18n-price-format';
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

export function I18nProductCard({ product }: ProductCardProps) {
  const t = useTranslations('product');
  const locale = useLocale();
  const [adding, setAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');
  
  const hasDiscount = product.discount && product.discount > 0;

  // Format prices according to locale
  const displayPrice = hasDiscount && product.discountedPrice 
    ? formatPriceForLocale(product.discountedPrice, locale)
    : formatPriceForLocale(product.price, locale);
    
  const originalPrice = hasDiscount && product.originalPrice
    ? formatPriceForLocale(product.originalPrice, locale)
    : null;

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
      setAddedMessage(t('added'));
      setTimeout(() => setAddedMessage(''), 2000);
    } else {
      setAddedMessage(t('error'));
      setTimeout(() => setAddedMessage(''), 2000);
    }
    
    setAdding(false);
  };

  const getStockStatus = () => {
    if (product.stock === 0) return t('outOfStock');
    if (product.stock < 10) return t('lowStock');
    return t('inStock');
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
            {t('available', { count: product.stock })}
          </div>
        )}
        
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold">{t('outOfStock')}</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-gray-500 uppercase mb-1">{product.category}</p>
        
        {/* Name */}
        <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        {/* Price */}
        <div className="mb-3">
          {hasDiscount && originalPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-red-600">{displayPrice}</span>
              <span className="text-sm text-gray-500 line-through">{originalPrice}</span>
            </div>
          ) : (
            <span className="text-lg font-bold">{displayPrice}</span>
          )}
        </div>

        {/* Stock Status */}
        <p className={`text-sm mb-3 ${
          product.stock === 0 ? 'text-red-600' : 
          product.stock < 10 ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {getStockStatus()}
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || adding}
          className={`w-full py-2 px-4 rounded font-medium transition-colors ${
            product.stock === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : adding
              ? 'bg-blue-400 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {adding ? t('loading') : t('addToCart')}
        </button>

        {/* Success/Error Message */}
        {addedMessage && (
          <p className={`text-sm mt-2 text-center ${
            addedMessage.includes('✓') ? 'text-green-600' : 'text-red-600'
          }`}>
            {addedMessage}
          </p>
        )}
      </div>
    </Link>
  );
}
