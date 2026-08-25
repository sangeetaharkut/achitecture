/**
 * Product Detail Client Component with Internationalization
 * Client-side interactive product details with locale-aware pricing
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useProduct } from '@/features/products/hooks/useProducts';
import { formatPriceForLocale } from '@/lib/i18n-price-format';
import { addToCartAction } from '@/features/cart/actions/cart.actions';

interface ProductDetailClientProps {
  productId: string;
}

export default function I18nProductDetailClient({ productId }: ProductDetailClientProps) {
  const t = useTranslations('product');
  const tBreadcrumb = useTranslations('product.breadcrumb');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  
  const { product, loading, error } = useProduct(productId);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddToCart = async () => {
    if (!product || adding) return;
    
    setAdding(true);
    setMessage('');
    
    const userId = 'demo-user';
    
    const result = await addToCartAction(userId, {
      productId: product.id,
      quantity,
    });
    
    if (result.success) {
      setMessage(t('added'));
      setQuantity(1);
    } else {
      setMessage(result.error || t('error'));
    }
    
    setAdding(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 aspect-square rounded-lg" />
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 rounded w-3/4" />
              <div className="bg-gray-200 h-4 rounded w-1/4" />
              <div className="bg-gray-200 h-20 rounded" />
              <div className="bg-gray-200 h-10 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('noProducts')}</h1>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            ← {t('breadcrumb.products')}
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = formatPriceForLocale(product.price, locale);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm">
        <Link href="/" className="text-blue-600 hover:underline">{tBreadcrumb('home')}</Link>
        {' / '}
        <Link href="/products" className="text-blue-600 hover:underline">{tBreadcrumb('products')}</Link>
        {' / '}
        <span className="text-gray-600">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full uppercase">
              {product.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="mb-6">
            <p className="text-3xl font-bold text-blue-600">
              {displayPrice}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">{t('description')}</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Stock Info */}
          <div className="mb-6">
            {product.stock > 10 ? (
              <p className="text-green-600 font-medium">✓ {t('inStock')} ({product.stock} {t('available', { count: product.stock })})</p>
            ) : product.stock > 0 ? (
              <p className="text-yellow-600 font-medium">⚠ {t('lowStock')} - {t('available', { count: product.stock })}</p>
            ) : (
              <p className="text-red-600 font-medium">✗ {t('outOfStock')}</p>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('quantity')}</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border hover:bg-gray-100 font-medium"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-20 h-10 text-center border rounded-lg"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-lg border hover:bg-gray-100 font-medium"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`w-full py-3 px-6 rounded-lg font-medium text-lg transition-colors ${
                  adding
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {adding ? tCommon('loading') : t('addToCart')}
              </button>

              {message && (
                <p className={`text-center font-medium ${
                  message.includes('✓') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {message}
                </p>
              )}
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t space-y-2 text-sm text-gray-600">
            <p>• Free shipping on orders over {locale === 'hi' ? '₹4,000' : '$50'}</p>
            <p>• 30-day return policy</p>
            <p>• Secure checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
