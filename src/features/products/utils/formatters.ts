/**
 * Product Utility Functions
 * Formatting and helper functions for products feature
 */

/**
 * Format price to currency string
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Format discount percentage
 */
export function formatDiscount(discount: number, price: number): string {
  const percentage = (discount / price) * 100;
  return `${percentage.toFixed(0)}%`;
}

/**
 * Calculate savings
 */
export function calculateSavings(originalPrice: number, discountedPrice: number): number {
  return originalPrice - discountedPrice;
}

/**
 * Format stock status
 */
export function getStockStatus(stock: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
  if (stock === 0) return 'out-of-stock';
  if (stock < 10) return 'low-stock';
  return 'in-stock';
}

/**
 * Get stock status label
 */
export function getStockStatusLabel(stock: number): string {
  const status = getStockStatus(stock);
  switch (status) {
    case 'in-stock':
      return 'In Stock';
    case 'low-stock':
      return `Only ${stock} left`;
    case 'out-of-stock':
      return 'Out of Stock';
  }
}

/**
 * Truncate description
 */
export function truncateDescription(description: string, maxLength: number = 100): string {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength).trim() + '...';
}

/**
 * Generate product slug
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse price from string
 */
export function parsePrice(priceString: string): number {
  const cleaned = priceString.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}
