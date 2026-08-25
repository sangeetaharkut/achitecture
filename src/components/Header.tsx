/**
 * Header Component with Internationalization
 * Shows navigation, cart count, and locale switcher
 */

'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCart } from '@/features/cart/hooks/useCart';
import { LocaleSwitcher } from './LocaleSwitcher';

export function Header() {
  const t = useTranslations('navigation');
  
  // In a real app, get userId from auth
  const userId = 'demo-user';
  const { cart, summary } = useCart(userId);

  const itemCount = summary?.itemCount || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-black">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold hover:text-blue-600 transition-colors shrink-0">
          Next.js DDD
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            {t('home')}
          </Link>
          <Link 
            href="/products" 
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            {t('products')}
          </Link>
          <a
            href="/api/products" 
            className="text-sm font-medium hover:text-blue-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('api')}
          </a>
        </nav>

        {/* Right side: Locale Switcher + Cart */}
        <div className="flex items-center gap-3">
          {/* Locale Switcher */}
          <LocaleSwitcher />

          {/* Cart */}
          <Link 
            href="/cart" 
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <svg 
              className="w-5 h-5" 
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
            <span className="text-sm font-medium">{t('cart')}</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
