/**
 * Product Detail Page with Internationalization
 * Shows individual product details with add to cart functionality
 */

import { getTranslations } from 'next-intl/server';
import I18nProductDetailClient from './I18nProductDetailClient';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'product' });
  
  return {
    title: t('title'),
    alternates: {
      languages: {
        'en': `/en/products`,
        'hi': `/hi/products`,
      }
    }
  };
}

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const { id } = await params;
  
  return <I18nProductDetailClient productId={id} />;
}
