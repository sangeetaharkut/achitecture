/**
 * Products Page with Internationalization
 * Shows product list with locale-aware pricing
 */

import { useTranslations } from 'next-intl';
import { I18nProductList } from '@/features/products/components/I18nProductList';
import { DiscountRule } from '@/features/products/types/product.types';

export default function ProductsPage() {
  const t = useTranslations('product');

  // Example discount rule: 10% off all products
  const discountRule: DiscountRule = {
    type: 'percentage',
    value: 10,
    description: '10% off all products!',
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-600">
          Browse our collection with 10% discount!
        </p>
      </div>

      <I18nProductList itemsPerPage={12} discountRule={discountRule} />
    </div>
  );
}
