# DETAILED STEP-BY-STEP EXECUTION FLOW 🔄

## Scenario: User loads PLP and filters by category

Let me trace exactly what happens when you navigate to `/en/products` and then filter by "electronics".

---

## STEP 1️⃣ : Page Load - Server Component Renders

**File:** `app/[locale]/products/page.tsx`

```typescript
// Line 1-10
export default function ProductsPage() {
  const t = useTranslations('product');

  // Define discount rule on server
  const discountRule: DiscountRule = {
    type: 'percentage',
    value: 10,
    description: '10% off all products!',
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-600">Browse our collection with 10% discount!</p>
      </div>

      {/* Render client component and pass discount rule */}
      <I18nProductList 
        itemsPerPage={12} 
        discountRule={discountRule}  // ⬅️ Passed as prop to client component
      />
    </div>
  );
}
```

**What happens here:**
- Server evaluates the page
- Creates a `discountRule` object (10% off)
- Passes this as a **prop** to the client component

---

## STEP 2️⃣ : Client Component Receives Props

**File:** `src/features/products/components/I18nProductList.tsx`

```typescript
// Line 20-35 (Component receives props)
export function I18nProductList({
  initialPage = 1,        // Default: 1
  itemsPerPage = 12,      // Received: 12
  initialFilter,          // Received: undefined (initially)
  discountRule            // ⬅️ Received from server: { type: 'percentage', value: 10 }
}: ProductListProps) {
  const t = useTranslations('product');
  const tCategories = useTranslations('categories');
  const tCommon = useTranslations('common');
  
  // Create local state for pagination and filters
  const [page, setPage] = useState(initialPage);           // State: page = 1
  const [filter, setFilter] = useState<ProductFilter | undefined>(initialFilter); // State: filter = undefined
  
  // ✨ HERE'S THE KEY CALL TO THE HOOK ✨
  const { products, loading, error } = useProductsWithDiscounts(
    page,           // Pass: 1
    itemsPerPage,   // Pass: 12
    filter,         // Pass: undefined
    discountRule    // Pass: { type: 'percentage', value: 10 }
  );
  // Line 37-47: Hook call returns { products, loading, error }
  
  console.log('Component render with state:', { page, filter, loading });
  
  if (loading) {
    return <LoadingSkeletons />; // Show skeleton loaders while loading
  }
  
  if (error) {
    return <ErrorMessage error={error} />; // Show error if failed
  }
  
  return (
    <div>
      {/* Filter UI */}
      <input
        onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
        // ⬅️ When user types in search, this updates filter state
        // This triggers Step 3 AGAIN with new filter value
      />
      
      <select
        onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
        // ⬅️ When user selects category (electronics), this updates filter to:
        // { category: 'electronics', searchTerm: undefined }
        // This triggers Step 3 AGAIN with new filter value
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
      </select>
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.data.map((product) => (
          <I18nProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

**Timeline at this point:**
- Component mounts
- `page = 1`, `filter = undefined`, `discountRule = { type: 'percentage', value: 10 }`
- Calls hook with these values ⬇️

---

## STEP 3️⃣ : Hook is Called (useEffect runs on mount)

**File:** `src/features/products/hooks/useProducts.ts`

```typescript
// Line 69-100 (useProductsWithDiscounts hook)
export function useProductsWithDiscounts(
  page: number = 1,                    // Receives: 1
  limit: number = 10,                  // Receives: 12
  filter?: ProductFilter,              // Receives: undefined
  discountRule?: DiscountRule           // Receives: { type: 'percentage', value: 10 }
) {
  // Initialize state
  const [products, setProducts] = useState<any>(null);     // State: null
  const [loading, setLoading] = useState(true);            // State: true ✅ Component shows skeleton
  const [error, setError] = useState<string | null>(null); // State: null

  // ⬇️ This function will call the Server Action
  const fetchProducts = useCallback(async () => {
    setLoading(true);   // Set loading = true
    setError(null);     // Clear any previous errors
    
    console.log('Hook calling server action with:', { page, limit, filter, discountRule });
    
    // 🚀 CALL SERVER ACTION HERE 🚀
    const result = await getProductsWithDiscountsAction(
      page,           // Sends: 1
      limit,          // Sends: 12
      filter,         // Sends: undefined
      discountRule    // Sends: { type: 'percentage', value: 10 }
    );
    // ⬅️ Waits for server response...
    
    console.log('Server action returned:', result);
    
    if (result.success && result.data) {
      setProducts(result.data);  // Update state with products
      // State: products = { data: [...12 products], total: 100, ... }
    } else {
      setError(result.error || 'Failed to fetch products');  // Set error message
    }
    
    setLoading(false);  // Set loading = false ✅ Component re-renders with data
    
  }, [page, limit, filter, discountRule]);

  // ⬇️ This runs when component mounts OR when dependencies change
  useEffect(() => {
    fetchProducts();  // Call fetchProducts function
  }, [fetchProducts]);  // Dependencies: [page, limit, filter, discountRule]
  // When ANY of these change, useEffect runs again and calls fetchProducts

  // ⬇️ Hook returns these values to component
  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
}
```

**What happens here:**
1. Hook initializes with state: `products=null, loading=true, error=null`
2. Component receives this state and shows **skeleton loaders** because `loading=true`
3. `useEffect` runs → calls `fetchProducts()`
4. `fetchProducts()` calls **server action** ⬇️

---

## STEP 4️⃣ : Server Action Executes (On Server!)

**File:** `src/features/products/actions/product.actions.ts`

```typescript
// Line 170-200 (getProductsWithDiscountsAction)
export async function getProductsWithDiscountsAction(
  page: number = 1,                    // Receives: 1
  limit: number = 10,                  // Receives: 12
  filter?: ProductFilter,              // Receives: undefined (initially)
  discountRule?: DiscountRule           // Receives: { type: 'percentage', value: 10 }
) {
  try {
    console.log('[Server Action START]', { page, limit, filter, discountRule });
    
    // Step 4a: Call getProductsAction to fetch raw products
    const productsResult = await getProductsAction(page, limit, filter);
    // This is a SEPARATE server action that fetches from API
    
    if (!productsResult.success || !productsResult.data) {
      return { success: false, error: 'Failed to fetch products' };
    }

    // Step 4b: Calculate discounts on each product
    const productsWithDiscounts = productsResult.data.data.map((product: any) => {
      let discountAmount = 0;
      let discountedPrice = product.price;

      // Apply discount if rule provided
      if (discountRule) {
        if (discountRule.type === 'percentage') {
          discountAmount = (product.price * discountRule.value) / 100;
          // For product with price 100, 10% discount = 10
        } else if (discountRule.type === 'fixed') {
          discountAmount = discountRule.value;
        }
        discountedPrice = product.price - discountAmount;
      }

      // Return product with discount info
      return {
        ...product,
        originalPrice: product.price,
        discountedPrice: discountedPrice > 0 ? discountedPrice : 0,
        discount: discountAmount,
        discountPercentage: discountRule?.type === 'percentage' 
          ? `${discountRule.value}%` 
          : `$${discountAmount}`,
      };
    });

    console.log('[Server Action SUCCESS] Returning', productsWithDiscounts.length, 'products');

    return {
      success: true,
      data: {
        data: productsWithDiscounts,
        pagination: {
          page: productsResult.data.page,
          totalPages: productsResult.data.pages,
          total: productsResult.data.total,
          limit
        }
      }
    };
  } catch (error) {
    console.error('[Server Action ERROR]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

**What this server action does:**
1. Calls `getProductsAction()` to fetch raw products from DummyJSON API
2. Iterates through each product and calculates discount
3. Returns enriched products with `originalPrice`, `discountedPrice`, `discount`, `discountPercentage`

---

## STEP 4a️⃣ : First Server Action Fetches from API

**File:** `src/features/products/actions/product.actions.ts`

```typescript
// Line 50-110 (getProductsAction)
export async function getProductsAction(
  page: number = 1,        // Receives: 1
  limit: number = 10,      // Receives: 12
  filter?: ProductFilter   // Receives: undefined (first time)
) {
  try {
    const skip = (page - 1) * limit;  // Calculate: (1-1)*12 = 0
    
    // Build API URL
    let url = `${DUMMYJSON_API}/products?limit=${limit}&skip=${skip}`;
    // URL: https://dummyjson.com/products?limit=12&skip=0
    
    // If category filter provided, change URL
    if (filter?.category) {
      url = `${DUMMYJSON_API}/products/category/${filter.category}?limit=${limit}&skip=${skip}`;
      // If filter.category = 'electronics'
      // URL becomes: https://dummyjson.com/products/category/electronics?limit=12&skip=0
    }
    
    console.log('[Server Action] Fetching from:', url);

    // Make API call with retry logic
    const response = await fetchWithRetry(url, { 
      next: { revalidate: 3600 },  // Cache for 1 hour
      headers: {
        'Content-Type': 'application/json',
      }
    });
    // ⬅️ This is where network call happens to DummyJSON API

    console.log('[Server Action] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch products`);
    }

    const data = await response.json();
    // Response looks like:
    // {
    //   products: [
    //     { id: 1, title: 'Product 1', price: 100, ... },
    //     { id: 2, title: 'Product 2', price: 200, ... },
    //     ...
    //   ],
    //   total: 100,
    //   skip: 0,
    //   limit: 12
    // }
    
    console.log('[Server Action] Got', data.products?.length, 'products');

    // Transform DummyJSON format to our format
    return {
      success: true,
      data: {
        data: data.products.map(mapDummyJsonProduct),  // Transform each product
        total: data.total,
        page,
        limit,
        pages: Math.ceil(data.total / limit),
      }
    };
  } catch (error) {
    console.error('getProductsAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    };
  }
}

// Helper function to transform API response
function mapDummyJsonProduct(data: any) {
  return {
    id: data.id.toString(),
    name: data.title,
    description: data.description,
    price: data.price,
    category: data.category,
    stock: data.stock,
    imageUrl: data.thumbnail || data.images?.[0] || '',
    rating: data.rating,
    brand: data.brand,
  };
}
```

**Fetch with retry logic:**
```typescript
// Line 13-35 (fetchWithRetry function)
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 0): Promise<Response> {
  try {
    const response = await fetch(url, options);
    // First attempt to fetch

    if (response.status === 429) {  // Rate limited?
      if (retries < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(2, retries);  // 1000 * 2^0 = 1000ms (first retry)
        console.log(`[Rate Limited] Retry ${retries + 1}/${MAX_RETRIES} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));  // Wait
        return fetchWithRetry(url, options, retries + 1);  // Retry with increased retries count
      }
    }

    return response;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, retries);  // Exponential backoff: 1s, 2s, 4s
      console.log(`[Fetch Error] Retry ${retries + 1}/${MAX_RETRIES} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries + 1);
    }
    throw error;
  }
}
```

**Timeline of API call:**
1. **Attempt 1:** Fetch from DummyJSON API
2. If error or 429 status → wait 1 second → **Attempt 2**
3. If still fails → wait 2 seconds → **Attempt 3**
4. If still fails → wait 4 seconds → throw error

---

## STEP 5️⃣ : Response Returns to Hook

Flow returns back up the chain:

```
API Response (from DummyJSON)
         ↓
getProductsAction() transforms it
         ↓
getProductsWithDiscountsAction() applies discounts
         ↓
Hook receives result
         ↓
Hook updates state with setProducts()
Hook sets loading=false
         ↓
Component re-renders ✨
```

**At this point in the hook:**

```typescript
// Back in useProductsWithDiscounts (Line 69-100)
const result = await getProductsWithDiscountsAction(...);
// Result looks like:
// {
//   success: true,
//   data: {
//     data: [
//       {
//         id: '1',
//         name: 'Product 1',
//         price: 100,
//         originalPrice: 100,
//         discountedPrice: 90,    // ⬅️ 10% discount applied
//         discount: 10,
//         discountPercentage: '10%',
//         ...
//       },
//       // 11 more products
//     ],
//     pagination: {
//       page: 1,
//       totalPages: 9,
//       total: 100,
//       limit: 12
//     }
//   }
// }

if (result.success && result.data) {
  setProducts(result.data);  // ⬅️ Update state
  // Hook state now: products = { data: [...], pagination: {...} }
  // Component will re-render with this data
} else {
  setError(result.error || 'Failed to fetch products');
}

setLoading(false);  // ⬅️ Set loading = false
// Hook state now: loading = false
// Component will no longer show skeleton loaders
```

---

## STEP 6️⃣ : Component Re-renders with Data

**Back in component:** `src/features/products/components/I18nProductList.tsx`

```typescript
// Line 37-47
const { products, loading, error } = useProductsWithDiscounts(
  page,       // 1
  itemsPerPage, // 12
  filter,     // undefined (for now)
  discountRule  // { type: 'percentage', value: 10 }
);
// Now hook returns:
// {
//   products: { data: [...12 products with discounts], pagination: {...} },
//   loading: false,
//   error: null
// }

if (loading) {
  return <LoadingSkeletons />;  // ⬅️ Skipped now because loading = false
}

if (error) {
  return <ErrorMessage error={error} />;  // ⬅️ Skipped because error = null
}

// ⬅️ This code RUNS now:
return (
  <div>
    {/* Filter Controls */}
    <input
      type="text"
      placeholder="Search..."
      onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
    />
    
    <select
      onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
    >
      <option value="">All Categories</option>
      <option value="electronics">Electronics</option>
      <option value="clothing">Clothing</option>
    </select>

    {/* Product Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.data.map((product: any) => (
        <I18nProductCard key={product.id} product={product} />
        // ⬅️ Renders each product card
      ))}
    </div>

    {/* Pagination */}
    {products.pagination && products.pagination.totalPages > 1 && (
      <div className="mt-8 flex justify-center gap-2">
        <button
          onClick={() => setPage(page - 1)}  // ⬅️ Click here triggers STEP 3 again!
          disabled={page === 1}
        >
          Previous
        </button>
        
        <span>Page {products.pagination.page} of {products.pagination.totalPages}</span>
        
        <button
          onClick={() => setPage(page + 1)}  // ⬅️ Click here triggers STEP 3 again!
        >
          Next
        </button>
      </div>
    )}
  </div>
);
```

**At this point:**
- ✅ 12 products displayed in a grid
- ✅ Each product shows with discount price
- ✅ Filter controls visible
- ✅ Pagination buttons visible

---

## STEP 7️⃣ : User Selects Category Filter (KEY: Dependency Change)

User clicks dropdown and selects "electronics":

```typescript
// In component (Line 82-91):
<select
  onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
  // ⬅️ This onChange fires!
>
  <option value="">All Categories</option>
  <option value="electronics">Electronics</option>
</select>

// What happens:
// OLD state: filter = undefined
// NEW state: filter = { category: 'electronics', searchTerm: undefined }
// setFilter() called with new value
// ⬅️ Component re-renders
```

**This triggers dependency change in hook:**

```typescript
// Back in useProductsWithDiscounts hook (Line 69-100)
const fetchProducts = useCallback(async () => {
  // This function definition changes because filter changed
}, [page, limit, filter, discountRule]);
// ⬅️ 'filter' is in dependencies array

useEffect(() => {
  fetchProducts();  // ⬅️ This runs AGAIN because fetchProducts changed
}, [fetchProducts]);
// ⬅️ 'fetchProducts' is in dependencies array
```

**This calls the hook AGAIN with new values:**

```typescript
const { products, loading, error } = useProductsWithDiscounts(
  page: 1,                      // Same: 1
  itemsPerPage: 12,            // Same: 12
  filter: {                     // ⬅️ CHANGED!
    category: 'electronics',
    searchTerm: undefined
  },
  discountRule: { ... }        // Same
);
```

---

## STEP 8️⃣ : Second API Call with Filter

**Back in server action with NEW parameters:**

```typescript
// getProductsAction is called again with:
// page: 1, limit: 12, filter: { category: 'electronics' }

const skip = (page - 1) * limit;  // 0

let url = `${DUMMYJSON_API}/products?limit=${limit}&skip=${skip}`;
// Initial: https://dummyjson.com/products?limit=12&skip=0

if (filter?.category) {  // ⬅️ TRUE now!
  url = `${DUMMYJSON_API}/products/category/${filter.category}?limit=${limit}&skip=${skip}`;
  // ⬅️ NEW URL: https://dummyjson.com/products/category/electronics?limit=12&skip=0
}

const response = await fetchWithRetry(url, { ... });
// ⬅️ Fetches from DIFFERENT API endpoint (category-filtered)
```

**API returns only electronics products, then:**

1. `getProductsAction()` returns electronics products
2. `getProductsWithDiscountsAction()` applies 10% discount to each
3. Hook receives new data
4. **Hook sets `loading=true`, clears data, then `loading=false`**
5. Component shows **skeleton loaders** briefly
6. Component **re-renders with only electronics products**

---

## Complete Execution Timeline

```
╔════════════════════════════════════════════════════════════════════╗
║ USER LOADS /en/products                                           ║
╚════════════════════════════════════════════════════════════════════╝
                          ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 1: Server Component (page.tsx) Runs                       │
│ - Creates discountRule: 10% off                                │
│ - Renders I18nProductList with discountRule prop               │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 2: Client Component (I18nProductList.tsx) Mounts          │
│ - Receives discountRule prop                                   │
│ - Creates local state: page=1, filter=undefined                │
│ - Shows skeleton loaders (loading=true)                        │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 3: Hook (useProductsWithDiscounts) Initializes            │
│ - State: products=null, loading=true, error=null               │
│ - useEffect runs                                               │
│ - Calls fetchProducts()                                        │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 4: Server Action (getProductsWithDiscountsAction) Called  │
│ - Parameters: page=1, limit=12, filter=undefined,              │
│              discountRule={type:'percentage', value:10}         │
│ - Calls getProductsAction() internally                         │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 4a: Inner Server Action (getProductsAction)               │
│ - URL: https://dummyjson.com/products?limit=12&skip=0          │
│ - Calls fetchWithRetry() (with retry logic)                    │
│ - Network request to DummyJSON                                 │
│ - Receives: { products: [...], total: 100, ... }               │
│ - Transforms DummyJSON format → Our Product type               │
│ - Returns transformed products                                 │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 5: Back to getProductsWithDiscountsAction                 │
│ - Iterates through 12 products                                 │
│ - Calculates discount for each: price * 0.90                   │
│ - Adds: originalPrice, discountedPrice, discount, %            │
│ - Returns enriched products with discount info                 │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 6: Hook Receives Response                                 │
│ - setProducts(result.data)                                     │
│ - setLoading(false)                                            │
│ - Hook state updated                                           │
│ - Component re-renders                                         │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 7: Component Displays Products                            │
│ - No more skeleton loaders (loading=false)                     │
│ - Shows 12 products with discounted prices                     │
│ - Shows filter controls (search, category dropdown)            │
│ - Shows pagination buttons                                     │
└────────────────────────────────────────────────────────────────┘
                          ↓
╔════════════════════════════════════════════════════════════════════╗
║ USER SELECTS "electronics" IN CATEGORY DROPDOWN                   ║
╚════════════════════════════════════════════════════════════════════╝
                          ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 8: onChange Handler Fires                                 │
│ - setFilter({ category: 'electronics' })                       │
│ - Component re-renders                                         │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 9: Dependency Change in Hook                              │
│ - 'filter' is in dependency array                              │
│ - useEffect runs AGAIN                                         │
│ - Calls fetchProducts() AGAIN with NEW filter                  │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 10: Second API Call                                       │
│ - New URL: /products/category/electronics?limit=12&skip=0      │
│ - Fetches electronics products only                            │
│ - Applies 10% discount again                                   │
│ - Returns different products                                   │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 11: Component Updates with Filtered Results               │
│ - Shows 12 electronics products                                │
│ - Each with 10% discount applied                               │
│ - Filter dropdown shows "electronics" selected                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Data Structure Flow

```
┌─ BEFORE API CALL ─────────────────────────────────────────────┐
│ Hook State:                                                    │
│ {                                                              │
│   products: null,                                              │
│   loading: true,      ⬅️ Shows skeleton loaders                │
│   error: null                                                  │
│ }                                                              │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌─ API RESPONSE ────────────────────────────────────────────────┐
│ From DummyJSON:                                                │
│ {                                                              │
│   products: [                                                  │
│     {                                                          │
│       id: 1,                                                   │
│       title: 'iPhone',                                         │
│       description: '...',                                      │
│       price: 999,                                              │
│       category: 'electronics',                                 │
│       stock: 50,                                               │
│       thumbnail: 'https://...',                                │
│       ...                                                      │
│     },                                                         │
│     // 11 more products                                        │
│   ],                                                           │
│   total: 100,                                                  │
│   skip: 0,                                                     │
│   limit: 12                                                    │
│ }                                                              │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌─ AFTER TRANSFORMATION ────────────────────────────────────────┐
│ getProductsAction returns:                                     │
│ {                                                              │
│   success: true,                                               │
│   data: {                                                      │
│     data: [                                                    │
│       {                                                        │
│         id: '1',         ⬅️ Transformed from DummyJSON         │
│         name: 'iPhone',  ⬅️ Renamed from 'title'               │
│         price: 999,                                            │
│         category: 'electronics',                               │
│         stock: 50,                                             │
│         imageUrl: 'https://...',  ⬅️ from 'thumbnail'          │
│         ...                                                    │
│       },                                                       │
│       // 11 more                                               │
│     ],                                                         │
│     total: 100,                                                │
│     page: 1,                                                   │
│     limit: 12,                                                 │
│     pages: 9                                                   │
│   }                                                            │
│ }                                                              │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌─ AFTER DISCOUNT CALCULATION ──────────────────────────────────┐
│ getProductsWithDiscountsAction returns:                        │
│ {                                                              │
│   success: true,                                               │
│   data: {                                                      │
│     data: [                                                    │
│       {                                                        │
│         id: '1',                                               │
│         name: 'iPhone',                                        │
│         price: 999,              ⬅️ Original price             │
│         originalPrice: 999,      ⬅️ Added                      │
│         discountedPrice: 899.1,  ⬅️ 10% off = 999 * 0.9        │
│         discount: 99.9,          ⬅️ Discount amount            │
│         discountPercentage: '10%', ⬅️ Discount text            │
│         category: 'electronics',                               │
│         imageUrl: 'https://...',                               │
│         ...                                                    │
│       },                                                       │
│       // 11 more                                               │
│     ],                                                         │
│     pagination: {                                              │
│       page: 1,                                                 │
│       totalPages: 9,                                           │
│       total: 100,                                              │
│       limit: 12                                                │
│     }                                                          │
│   }                                                            │
│ }                                                              │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌─ HOOK STATE UPDATED ──────────────────────────────────────────┐
│ setProducts(result.data):                                      │
│ {                                                              │
│   products: {          ⬅️ Updated from null                    │
│     data: [...12 with discounts],                              │
│     pagination: {...}                                         │
│   },                                                           │
│   loading: false,      ⬅️ Updated from true                    │
│   error: null                                                  │
│ }                                                              │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌─ COMPONENT RENDERS WITH ──────────────────────────────────────┐
│ Hook returns:                                                  │
│ {                                                              │
│   products: {data: [...], pagination: {...}},                 │
│   loading: false       ⬅️ Component shows products, not skeletons
│   error: null                                                  │
│ }                                                              │
│                                                                │
│ Component renders:                                             │
│ - 12 product cards in grid                                     │
│ - Each shows: image, name, originalPrice (strikethrough),      │
│              discountedPrice (bold), discountPercentage (badge)│
│ - Filter controls                                              │
│ - Pagination: "Page 1 of 9"                                    │
└────────────────────────────────────────────────────────────────┘
```

---

## Key Concepts Explained

### 1. **Why setFilter triggers a new API call:**

```typescript
// In component:
setFilter({ category: 'electronics' })  // State updated

// In hook dependency array:
const fetchProducts = useCallback(async () => {
  // ...
}, [page, limit, filter, discountRule]);  // ⬅️ filter is HERE

useEffect(() => {
  fetchProducts();
}, [fetchProducts]);  // ⬅️ When filter changes, fetchProducts changes, useEffect runs
```

**The chain:**
- `filter` changes → `fetchProducts` function reference changes → `useEffect` dependency triggers → `fetchProducts()` called again

### 2. **Why products show skeleton loaders while loading:**

```typescript
// First render
const { products, loading, error } = useProductsWithDiscounts(...);
// loading = true

if (loading) {
  return <LoadingSkeletons />;  // ⬅️ User sees skeletons
}

// After API call completes
// setLoading(false) called
// Component re-renders with same hook call
// loading = false now
// Skips the if(loading) and renders actual products
```

### 3. **Why component receives discountRule as prop:**

```typescript
// Server component calculates once:
const discountRule = { type: 'percentage', value: 10 };

// Passed to client component:
<I18nProductList discountRule={discountRule} />

// Client component can use immediately without API call:
// - Passes to hook
// - Hook passes to server action
// - Server action applies it to every product
// - No separate API call needed for discount rules
```

### 4. **Network boundary explanation:**

```
┌─ CLIENT (Browser) ─────────────────────┐
│                                        │
│  Component → Hook                      │  React code
│                                        │
└────────────────────────────────────────┘
                ↓ (Network)
        await serverAction()
                ↓ (Network boundary)
┌─ SERVER (Node.js) ────────────────────┐
│                                        │
│  Server Action → API Call              │  Server code
│  (DummyJSON)                           │  Runs on backend
│                                        │
└────────────────────────────────────────┘
                ↓ (Network)
         Response returned
                ↓ (Network)
┌─ CLIENT (Browser) ─────────────────────┐
│                                        │
│  Hook receives response                │  React code
│  Component re-renders                  │
│                                        │
└────────────────────────────────────────┘
```

---

## Summary of Function Calls

| # | Function | File | Called By | Runs On | Purpose |
|---|----------|------|-----------|---------|---------|
| 1 | Page component | page.tsx | Browser | Server | Creates discount rule |
| 2 | I18nProductList | I18nProductList.tsx | Server | Client | Main component with filters |
| 3 | useProductsWithDiscounts | useProducts.ts | Component | Client | Manages product state |
| 4 | getProductsWithDiscountsAction | product.actions.ts | Hook | Server | Applies discounts |
| 4a | getProductsAction | product.actions.ts | Server action | Server | Fetches products |
| 4a.1 | fetchWithRetry | product.actions.ts | getProductsAction | Server | API call with retry |
| 5 | mapDummyJsonProduct | product.actions.ts | getProductsAction | Server | Transforms API response |
| 6 | setProducts | useProducts.ts | Server action callback | Client | Updates hook state |
| 7 | Component render | I18nProductList.tsx | Hook state change | Client | Displays products |

