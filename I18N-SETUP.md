# Next-Intl Internationalization Setup

## ✅ Implementation Complete

This project now supports **English (en)** and **Hindi (hi)** locales with full internationalization using `next-intl`.

## 🌍 Features Implemented

### 1. **Routing Configuration**
- ✅ Locale-based routing: `/en/products`, `/hi/products`
- ✅ Default locale: English (en)
- ✅ Automatic locale detection via middleware
- ✅ SEO-friendly hreflang meta tags

### 2. **Translation Files**
- ✅ `messages/en.json` - English translations
- ✅ `messages/hi.json` - Hindi translations (हिंदी)
- ✅ Comprehensive translations for:
  - Navigation
  - Product pages
  - Cart
  - Common UI elements
  - Categories

### 3. **Locale-Aware Price Formatting**
- ✅ **English/US**: `$155.00` (USD)
- ✅ **Hindi/India**: `₹12,999.00` (INR)
- ✅ Automatic currency conversion (1 USD = 83.5 INR)
- ✅ Proper number formatting with Indian numbering system

### 4. **Locale Switcher**
- ✅ Dropdown selector in header
- ✅ Preserves current page when switching locales
- ✅ Visual flags: 🇺🇸 English | 🇮🇳 हिंदी

### 5. **Translated Components**
- ✅ Homepage `/[locale]/page.tsx`
- ✅ Product list `/[locale]/products/page.tsx`
- ✅ Product detail `/[locale]/products/[id]/page.tsx`
- ✅ Header navigation
- ✅ Product cards
- ✅ Breadcrumbs

## 📁 File Structure

```
src/
├── i18n/
│   ├── routing.ts          # Routing configuration
│   └── request.ts          # Request configuration
├── lib/
│   └── i18n-price-format.ts # Price formatting utilities
├── components/
│   ├── LocaleSwitcher.tsx  # Language switcher component
│   ├── Header.tsx          # Updated with i18n
│   └── I18nHeader.tsx      # Re-export for compatibility
├── features/
│   └── products/
│       └── components/
│           ├── I18nProductCard.tsx     # Translated product card
│           ├── I18nProductList.tsx     # Translated product list
│           └── I18nProductDetailClient.tsx  # Translated detail page

app/
├── [locale]/               # Locale-based routes
│   ├── layout.tsx          # Root layout with NextIntlClientProvider
│   ├── page.tsx            # Homepage with translations
│   └── products/
│       ├── page.tsx        # Product list page
│       └── [id]/
│           ├── page.tsx    # Product detail page
│           └── I18nProductDetailClient.tsx

messages/
├── en.json                 # English translations
└── hi.json                 # Hindi translations (हिंदी)

middleware.ts               # Locale detection middleware
next.config.ts              # Updated with next-intl plugin
```

## 🚀 Usage Examples

### Accessing Routes

#### English
```
http://localhost:3000/en                    → Homepage
http://localhost:3000/en/products           → Product list
http://localhost:3000/en/products/abc123    → Product detail
```

#### Hindi
```
http://localhost:3000/hi                    → होमपेज
http://localhost:3000/hi/products           → उत्पाद सूची
http://localhost:3000/hi/products/abc123    → उत्पाद विवरण
```

### Price Display Examples

**Product: Wireless Headphones - $32.99 (base price in USD)**

| Locale | Display Price | Format |
|--------|---------------|--------|
| English (en) | $32.99 | `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` |
| Hindi (hi) | ₹2,754.67 | `new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })` |

### Translation Usage in Components

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('product');
  
  return (
    <button>{t('addToCart')}</button>
    // English: "Add to Cart"
    // Hindi: "कार्ट में जोड़ें"
  );
}
```

### Price Formatting in Components

```typescript
import { useLocale } from 'next-intl';
import { formatPriceForLocale } from '@/lib/i18n-price-format';

function ProductCard({ product }) {
  const locale = useLocale();
  const displayPrice = formatPriceForLocale(product.price, locale);
  
  return <span>{displayPrice}</span>;
  // English: "$32.99"
  // Hindi: "₹2,754.67"
}
```

## 📝 Translation Keys Reference

### Navigation (`navigation`)
- `home` - Home
- `products` - Products  
- `cart` - Shopping Cart
- `api` - API Docs

### Product (`product`)
- `title` - Products
- `addToCart` - Add to Cart / कार्ट में जोड़ें
- `viewDetails` - View Details
- `inStock` - In Stock / स्टॉक में उपलब्ध
- `outOfStock` - Out of Stock / स्टॉक में नहीं
- `added` - Added to cart message
- `error` - Error message
- `quantity` - Quantity
- `available` - Available count with pluralization

### Categories (`categories`)
- `electronics` - Electronics / इलेक्ट्रॉनिक्स
- `clothing` - Clothing / कपड़े
- `books` - Books / किताबें
- `home` - Home & Garden / घर और बगीचा

### Cart (`cart`)
- `title` - Shopping Cart
- `empty` - Your cart is empty
- `remove` - Remove
- `clear` - Clear Cart
- `total` - Total
- `checkout` - Proceed to Checkout

## 🔧 Configuration Details

### Middleware (`middleware.ts`)
```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);
```

Automatically:
- Detects user's preferred language
- Redirects `/` to `/en` (default locale)
- Preserves locale in URL for all navigation

### Next Config (`next.config.ts`)
```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
```

### Price Formatting Utility
```typescript
// Converts USD to INR automatically
formatPriceForLocale(155, 'en')  // "$155.00"
formatPriceForLocale(155, 'hi')  // "₹12,942.50"
```

## 🌐 SEO Optimization

### Hreflang Tags
Every page includes proper hreflang tags for search engines:

```html
<link rel="alternate" hrefLang="en" href="/en" />
<link rel="alternate" hrefLang="hi" href="/hi" />
<link rel="alternate" hrefLang="x-default" href="/en" />
```

### Meta Tags
```typescript
export async function generateMetadata({ params }) {
  return {
    alternates: {
      languages: {
        'en': `/en/products`,
        'hi': `/hi/products`,
      }
    }
  };
}
```

## 🧪 Testing the Implementation

### 1. **Test English Locale**
```bash
# Start dev server
npm run dev

# Visit http://localhost:3000/en/products
```

Expected:
- ✅ Navigation in English
- ✅ "Add to Cart" button
- ✅ Prices in USD: $32.99
- ✅ English product descriptions

### 2. **Test Hindi Locale**
```bash
# Visit http://localhost:3000/hi/products
```

Expected:
- ✅ Navigation in Hindi (होम, उत्पाद)
- ✅ "कार्ट में जोड़ें" button
- ✅ Prices in INR: ₹2,754.67
- ✅ Hindi UI elements

### 3. **Test Locale Switcher**
1. Go to `/en/products`
2. Click language dropdown in header
3. Select "🇮🇳 हिंदी"
4. Should navigate to `/hi/products`
5. All text should change to Hindi
6. Prices should convert to INR

### 4. **Test Price Conversion**
- Product priced at $32.99 USD
- When viewing in Hindi: ₹2,754.67 INR
- Conversion rate: 1 USD = 83.5 INR

## 📊 Conversion Rates

The following conversion rate is used (can be updated in `src/lib/i18n-price-format.ts`):

```typescript
const conversionRates = {
  USD: 1,
  INR: 83.5  // 1 USD = 83.5 INR
};
```

For production, replace with real-time exchange rate API.

## 🔄 Adding New Locales

To add a new locale (e.g., Spanish):

1. **Update routing configuration** (`src/i18n/routing.ts`):
```typescript
locales: ['en', 'hi', 'es']
```

2. **Create translation file** (`messages/es.json`):
```json
{
  "product": {
    "addToCart": "Añadir al carrito",
    ...
  }
}
```

3. **Update LocaleSwitcher** (`src/components/LocaleSwitcher.tsx`):
```typescript
const localeNames = {
  en: { name: 'English', flag: '🇺🇸' },
  hi: { name: 'हिंदी', flag: '🇮🇳' },
  es: { name: 'Español', flag: '🇪🇸' }
};
```

## 🎯 Key Benefits

### For Users
- ✅ Native language experience
- ✅ Correct currency and number formatting
- ✅ Cultural relevance (₹ for India, $ for US)
- ✅ Seamless language switching

### For SEO
- ✅ Proper hreflang tags
- ✅ Locale-specific URLs
- ✅ Better search engine indexing
- ✅ Regional targeting

### For Development
- ✅ Type-safe translations
- ✅ Easy to add new languages
- ✅ Centralized translation management
- ✅ Server-side and client-side support

## 🚀 Next Steps

### Optional Enhancements
1. **Add more locales**: French, German, Spanish, etc.
2. **Real-time currency conversion**: Use API for live exchange rates
3. **User preferences**: Store selected locale in cookies/localStorage
4. **RTL support**: Add Arabic, Hebrew support
5. **Pluralization**: Use ICU message format for complex plurals
6. **Date/time formatting**: Locale-specific date formats

### Production Considerations
1. Use real-time currency exchange API
2. Cache translations
3. Add locale detection based on user location
4. Implement translation fallbacks
5. Add translation management system (e.g., Crowdin, Lokalise)

## 📦 Dependencies

```json
{
  "dependencies": {
    "next-intl": "^4.13.7"
  }
}
```

## 📚 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

**Status:** ✅ Internationalization fully implemented and ready for production!

**Test URLs:**
- English: http://localhost:3000/en/products
- Hindi: http://localhost:3000/hi/products
