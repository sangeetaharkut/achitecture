/**
 * Shopping Cart Page with Internationalization
 * Displays cart items with locale-aware pricing and translations
 */

'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useCart } from '@/features/cart/hooks/useCart';
import { formatPriceForLocale } from '@/lib/i18n-price-format';

export default function CartPage() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const userId = 'demo-user'; // In real app, get from auth
  
  const { cart, summary, loading, updateQuantity, removeItem, clearCart } = useCart(userId);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <svg 
            className="w-24 h-24 mx-auto text-gray-400 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          <h1 className="text-2xl font-bold mb-2">{t('empty')}</h1>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <Link 
            href="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        {cart.items.length > 0 && (
          <button
            onClick={() => clearCart()}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            {t('clear')}
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
              {/* Product Image */}
              <div className="relative w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                {item.product?.imageUrl ? (
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{item.product?.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {formatPriceForLocale(item.price, locale)} each
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 rounded border hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded border hover:bg-gray-100"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-auto text-red-600 hover:text-red-700 text-sm"
                  >
                    {t('remove')}
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="text-right">
                <p className="font-bold text-lg">
                  {formatPriceForLocale(item.subtotal, locale)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">{t('summary')}</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('subtotal')}</span>
                <span className="font-medium">
                  {formatPriceForLocale(summary?.subtotal || 0, locale)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">{t('tax')} (10%)</span>
                <span className="font-medium">
                  {formatPriceForLocale(summary?.tax || 0, locale)}
                </span>
              </div>
              
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>{t('total')}</span>
                <span>{formatPriceForLocale(summary?.total || 0, locale)}</span>
              </div>
            </div>

            <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {t('checkout')}
            </button>

            <Link 
              href="/products"
              className="block text-center mt-4 text-blue-600 hover:text-blue-700 text-sm"
            >
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
