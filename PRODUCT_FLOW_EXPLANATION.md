# Product Feature Flow Architecture 📊

## Overview
This document explains how **PLP (Product List Page)**, **PDP (Product Detail Page)**, and all supporting layers work together in the products feature.

---

## Architecture Layers (Bottom to Top)

### 1. **Types Layer** (`src/features/products/types/product.types.ts`)
Defines all TypeScript interfaces and data structures:
- `Product` - Core entity
- `ProductFilter` - Filter criteria (category, price, search)
- `DiscountRule` - Pricing strategies
- DTOs (CreateProductDTO, UpdateProductDTO)

---

### 2. **Repository Layer** (`src/features/products/repository/product.repository.ts`)
**Purpose:** Data Access Layer - Abstracts database queries

**Key Methods:**
- `findAll()` - Get paginated products with filters
- `findById(id)` - Get single product
- `create()`, `update()`, `delete()` - CRUD operations
- `findByCategory()` - Category filtering
- `updateStock()` - Inventory management

**How it works:**
```typescript
// Example: Repository queries with filters
const products = await repository.findAll(
  { page: 1, limit: 12 },
  { category: 'electronics', minPrice: 100 }
);
```

---

### 3. **Service Layer** (`src/features/products/services/product.service.ts`)
**Purpose:** Business Logic Layer

**Key Responsibilities:**
- ✅ Validates business rules (price > 0, stock >= 0)
- ✅ Implements discount calculations
- ✅ Handles stock availability checks
- ✅ Wraps repository calls with error handling

**Example Business Logic:**
```typescript
calculateDiscount(product, quantity, discountRule) {
  // Apply percentage or fixed discounts
  // Check minimum quantity requirements
}
```

---

### 4. **Dependency Injection** (`src/features/products/di/container.ts`)
**Purpose:** Manages singleton instances and dependency wiring

**How it works:**
```typescript
// Container creates and caches singleton instances
static getService(): IProductService {
  if (!this.serviceInstance) {
    const repository = this.getRepository();  // Get or create repository
    this.serviceInstance = new ProductService(repository);  // Inject dependency
  }
  return this.serviceInstance;
}
```

**Benefits:**
- 🔄 Singleton pattern - reuse same instances
- 🧪 Easy testing - can inject mock implementations
- 📦 Centralized dependency management

---

### 5. **Server Actions** (`src/features/products/actions/product.actions.ts`)
**Purpose:** Server-side functions that can be called from client components

**Key Actions:**
- `getProductsAction()` - Fetch paginated products
- `getProductByIdAction()` - Fetch single product
- `getProductsWithDiscountsAction()` - Fetch with discount calculations
- `checkStockAction()` - Verify stock availability
- `calculateDiscountAction()` - Calculate discount amounts

**Special Features:**
- 🔄 Retry logic with exponential backoff
- ⏱️ Rate limit handling (429 errors)
- 🌐 Fetches from DummyJSON API
- 💾 Next.js caching with `next: { revalidate: 3600 }`

**How it works:**
```typescript
export async function getProductsAction(
  page: number,
  limit: number,
  filter?: ProductFilter
) {
  // 1. Build query
  // 2. Call DummyJSON API with retry logic
  // 3. Transform response
  // 4. Return to client
}
```

---

### 6. **Hooks Layer** (`src/features/products/hooks/useProducts.ts`)
**Purpose:** Client-side state management and data fetching

**Available Hooks:**

#### `useProducts(page, limit, filter)`
Fetches paginated products list
```typescript
const { products, loading, error, refetch } = useProducts(1, 12);
```

#### `useProduct(id)`
Fetches single product details
```typescript
const { product, loading, error } = useProduct(productId);
```

#### `useProductsWithDiscounts(page, limit, filter, discountRule)`
Fetches products and applies discount calculations
```typescript
const { products, loading, error } = useProductsWithDiscounts(
  1, 12, filter, discountRule
);
```

---

## Data Flow: PLP (Product List Page)

### Page Path: `app/[locale]/products/page.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Server Component (page.tsx)                              │
│    - Defines discount rule                                  │
│    - Passes discount to client component                    │
│    - Renders I18nProductList component                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Client Component (I18nProductList.tsx)                   │
│    - 'use client' directive                                 │
│    - Manages local state: page, filter                      │
│    - Renders filter UI (search, category dropdown)          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Hook: useProductsWithDiscounts()                         │
│    - Called inside component                                │
│    - Subscribes to state changes (page, filter)             │
│    - On mount/dependency change: calls action               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Server Action: getProductsWithDiscountsAction()          │
│    - Runs on server                                         │
│    - Parameters: page, limit, filter, discountRule          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. DummyJSON API Call                                       │
│    - Builds URL with skip/limit                             │
│    - Optional category filter                               │
│    - Retry logic on 429/errors                              │
│    - Caching: 1 hour                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Transform & Apply Discounts                              │
│    - Map DummyJSON format to Product type                   │
│    - Apply discount calculations                            │
│    - Calculate final prices                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Return to Client                                         │
│    - State updated in hook                                  │
│    - Component re-renders with products                     │
│    - Shows product grid or loading/error state              │
└─────────────────────────────────────────────────────────────┘
```

### Code Example - PLP Flow:
```typescript
// page.tsx (Server Component)
export default function ProductsPage() {
  const discountRule: DiscountRule = {
    type: 'percentage',
    value: 10,
  };
  
  return (
    <I18nProductList 
      itemsPerPage={12} 
      discountRule={discountRule} 
    />
  );
}

// I18nProductList.tsx (Client Component)
'use client';
export function I18nProductList({ itemsPerPage, discountRule }) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState(undefined);
  
  // Hook calls server action
  const { products, loading, error } = useProductsWithDiscounts(
    page,
    itemsPerPage,
    filter,
    discountRule
  );
  
  // Effect in hook:
  // useEffect(() => {
  //   const result = await getProductsWithDiscountsAction(
  //     page, itemsPerPage, filter, discountRule
  //   );
  // }, [page, itemsPerPage, filter, discountRule]);
}
```

---

## Data Flow: PDP (Product Detail Page)

### Page Path: `app/[locale]/products/[id]/page.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Server Component (ProductDetailPage)                     │
│    - Async function                                         │
│    - Extracts product ID from params                        │
│    - Passes ID to client component                          │
│    - Generates metadata for SEO                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Client Component (I18nProductDetailClient)               │
│    - 'use client' directive                                 │
│    - Receives productId prop                                │
│    - Manages state: quantity, adding, message               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Hook: useProduct(productId)                              │
│    - Called on component mount                              │
│    - Triggers on productId change                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Server Action: getProductByIdAction(id)                  │
│    - Runs on server                                         │
│    - Fetches from DummyJSON: /products/{id}                 │
│    - Retry logic on failures                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. DummyJSON Single Product API                             │
│    - URL: https://dummyjson.com/products/{id}               │
│    - Returns full product details                           │
│    - Includes: name, price, description, images, rating    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Transform & Return                                       │
│    - Map DummyJSON to Product type                          │
│    - Return to hook                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Client State Update                                      │
│    - Hook updates state: product, loading=false             │
│    - Component re-renders                                   │
│    - Shows product details with images, description, price  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. User Interaction: Add to Cart                            │
│    - Click "Add to Cart" button                             │
│    - handleAddToCart() called                               │
│    - Calls addToCartAction (from cart feature)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Success Message                                          │
│    - Shows "Added to cart" notification                     │
│    - Auto-clears after 3 seconds                            │
└─────────────────────────────────────────────────────────────┘
```

### Code Example - PDP Flow:
```typescript
// ProductDetailPage (Server Component)
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'product' });
  return { title: t('title') };  // SEO metadata
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  return <I18nProductDetailClient productId={id} />;
}

// I18nProductDetailClient (Client Component)
'use client';
export default function I18nProductDetailClient({ productId }) {
  const locale = useLocale();
  const [quantity, setQuantity] = useState(1);
  
  // Hook fetches product data
  const { product, loading, error } = useProduct(productId);
  
  // When user clicks "Add to Cart"
  const handleAddToCart = async () => {
    const result = await addToCartAction('demo-user', {
      productId: product.id,
      quantity,
    });
    
    if (result.success) {
      setMessage('Added to cart!');  // Show success
      setTimeout(() => setMessage(''), 3000);  // Clear after 3s
    }
  };
  
  return (
    <div>
      {/* Show product details */}
      <h1>{product.name}</h1>
      <img src={product.imageUrl} />
      <p>{formatPriceForLocale(product.price, locale)}</p>
      <input 
        value={quantity} 
        onChange={(e) => setQuantity(Number(e.target.value))}
      />
      <button onClick={handleAddToCart}>Add to Cart</button>
      {message && <div>{message}</div>}
    </div>
  );
}
```

---

## How Services, DI, Actions & Hooks Work Together

### Call Chain Diagram:

```
┌────────────────────────────────────────────────────────────┐
│ CLIENT LAYER (Browser)                                     │
├────────────────────────────────────────────────────────────┤
│  Component (I18nProductList / I18nProductDetailClient)     │
│           │                                                │
│           ▼ (calls)                                        │
│  Hook (useProducts / useProduct)                           │
│           │                                                │
│           ▼ (calls)                                        │
└────────────────────────────────────────────────────────────┘
                     │
                     ▼ (Network boundary)
┌────────────────────────────────────────────────────────────┐
│ SERVER LAYER (Node.js)                                     │
├────────────────────────────────────────────────────────────┤
│  Server Action (getProductsAction)                         │
│           │                                                │
│           ▼ (calls)                                        │
│  API Call (fetch from DummyJSON)                           │
│           │                                                │
│           ▼ (returns)                                      │
│  Transform & Return to Client                             │
└────────────────────────────────────────────────────────────┘
                     │
                     ▼ (Network boundary)
┌────────────────────────────────────────────────────────────┐
│ CLIENT LAYER (Browser)                                     │
├────────────────────────────────────────────────────────────┤
│  Hook (updates state with results)                         │
│           │                                                │
│           ▼ (triggers re-render)                           │
│  Component (displays data)                                 │
└────────────────────────────────────────────────────────────┘
```

### Architecture Pattern: DI is NOT used in current flow

**Current Architecture:**
1. ✅ Server Actions call external APIs directly
2. ❌ Repository/Service layers NOT used in current implementation
3. ✅ Hooks handle client-side state management
4. ✅ Actions handle server-side API calls

**If DI was used (future enhancement):**
```typescript
// Server Action would call:
const service = ProductContainer.getService();
const products = await service.getProducts({ page, limit }, filter);

// Service would use Repository:
class ProductService {
  constructor(private repository: IProductRepository) {}
  async getProducts(params, filter) {
    return this.repository.findAll(params, filter);
  }
}

// Repository would query database:
class ProductRepository {
  async findAll(params, filter) {
    return this.prisma.product.findMany(...);
  }
}
```

**Why DI is prepared but not currently used:**
- Current data source: DummyJSON API (external, not database)
- DI pattern designed for database-backed applications
- Repository/Service layers are ready when switching to Prisma database

---

## Summary Table

| Layer | File | Purpose | Example |
|-------|------|---------|---------|
| **Page** | `app/[locale]/products/page.tsx` | Server-side page rendering | Passes discount rules |
| **Component** | `I18nProductList.tsx` | Client UI with filters | Renders product grid |
| **Hook** | `useProducts.ts` | Client state management | Manages loading/error states |
| **Action** | `product.actions.ts` | Server-side logic | Fetches from API with retry |
| **Service** | `product.service.ts` | Business logic | Discount calculations (prepared) |
| **Repository** | `product.repository.ts` | Data access | Database queries (prepared) |
| **DI Container** | `container.ts` | Dependency injection | Singleton management (prepared) |
| **Types** | `product.types.ts` | TypeScript interfaces | Product, Filter, DiscountRule |

---

## Key Takeaways

1. **PLP Flow:** Page → Component → Hook → Action → API → Transform → Display
2. **PDP Flow:** Page → Component → Hook → Action → API → Display
3. **Hooks** are the bridge between client state and server actions
4. **Server Actions** handle all network requests (no direct API calls from browser)
5. **DI/Service/Repository** layers are prepared but not yet active (waiting for DB)
6. **Internationalization** integrated at component level with `useLocale()` and `useTranslations()`
7. **Caching**: API responses cached for 1 hour on server
8. **Error Handling**: Retry logic with exponential backoff for rate limits

