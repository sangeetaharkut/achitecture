/**
 * Product Detail Page
 * Shows individual product details with add to cart functionality
 */

import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return <ProductDetailClient productId={id} />;
}
