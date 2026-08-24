/**
 * Products Page
 * Demonstrates the complete architecture: Repository → Service → Actions → Hooks → Components
 */

import { ProductList } from '@/features/products/components/ProductList';
import { DiscountRule } from '@/features/products/types/product.types';

export default function ProductsPage() {
  // Example discount rule - 10% off for orders
  const discountRule: DiscountRule = {
    type: 'percentage',
    value: 10,
    minQuantity: 1
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Products</h1>
        <p className="text-gray-600">
          Browse our collection - 10% discount on all items!
        </p>
      </div>

      {/* 
        The data flow:
        1. ProductList component uses useProductsWithDiscounts hook
        2. Hook calls getProductsWithDiscountsAction (server action)
        3. Action gets ProductService from container (DI)
        4. Service calls ProductRepository.findAll()
        5. Repository queries Prisma (database)
        6. Service applies business logic (calculateDiscount)
        7. Data flows back up to component
        8. ProductCard components render the UI
      */}
      <ProductList 
        itemsPerPage={12}
        discountRule={discountRule}
      />
    </div>
  );
}
