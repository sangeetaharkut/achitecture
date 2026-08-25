/**
 * Price Formatting Utility with Internationalization
 * Formats prices according to locale and currency
 */

export type CurrencyCode = 'USD' | 'INR';
export type LocaleCode = 'en' | 'hi' | 'en-US' | 'en-IN';

interface FormatPriceOptions {
  locale?: LocaleCode;
  currency?: CurrencyCode;
}

/**
 * Format price with locale-specific currency
 * @param price - The numeric price value
 * @param options - Formatting options (locale and currency)
 * @returns Formatted price string (e.g., "$155.00", "₹12,999.00")
 */
export function formatPrice(
  price: number,
  options: FormatPriceOptions = {}
): string {
  const { locale = 'en-US', currency = 'USD' } = options;

  // Map locale to appropriate currency if not specified
  const currencyForLocale = currency || (locale.includes('hi') || locale.includes('IN') ? 'INR' : 'USD');
  
  // Map locale codes for proper formatting
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'hi': 'en-IN', // Use en-IN for Hindi to get proper number formatting with Indian numbering system
    'en-US': 'en-US',
    'en-IN': 'en-IN'
  };

  const formattingLocale = localeMap[locale] || 'en-US';

  try {
    return new Intl.NumberFormat(formattingLocale, {
      style: 'currency',
      currency: currencyForLocale,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch (error) {
    // Fallback if formatting fails
    console.error('Price formatting error:', error);
    return `${currencyForLocale} ${price.toFixed(2)}`;
  }
}

/**
 * Convert price between currencies
 * @param price - Price in USD
 * @param targetCurrency - Target currency code
 * @returns Converted price
 */
export function convertCurrency(price: number, targetCurrency: CurrencyCode): number {
  // Simple conversion rates (in production, use real-time rates)
  const conversionRates: Record<CurrencyCode, number> = {
    USD: 1,
    INR: 83.5, // 1 USD = 83.5 INR (approximate)
  };

  return price * conversionRates[targetCurrency];
}

/**
 * Get currency code from locale
 * @param locale - Locale code
 * @returns Currency code
 */
export function getCurrencyFromLocale(locale: LocaleCode): CurrencyCode {
  if (locale === 'hi' || locale === 'en-IN') {
    return 'INR';
  }
  return 'USD';
}

/**
 * Format price with automatic locale detection from next-intl
 * @param price - The numeric price in USD (base currency)
 * @param currentLocale - Current locale from next-intl
 * @returns Formatted price string
 */
export function formatPriceForLocale(price: number, currentLocale: string): string {
  const locale = currentLocale as LocaleCode;
  const currency = getCurrencyFromLocale(locale);
  
  // Convert price to target currency
  const convertedPrice = currency === 'INR' ? convertCurrency(price, 'INR') : price;
  
  return formatPrice(convertedPrice, { locale, currency });
}
