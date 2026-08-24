# Architecture Visual Guide

## 🎨 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                         (Browser/Client)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ ProductList  │  │ ProductCard  │  │   CartView   │         │
│  │  Component   │  │  Component   │  │   Component  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                 │                  │                  │
└─────────┼─────────────────┼──────────────────┼──────────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        HOOKS LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ useProducts  │  │useDiscounts  │  │   useCart    │         │
│  │    Hook      │  │    Hook      │  │     Hook     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                 │                  │                  │
└─────────┼─────────────────┼──────────────────┼──────────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER ACTIONS LAYER                         │
│                     (API Boundary)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │getProducts   │  │calculateDis  │  │  addToCart   │         │
│  │   Action     │  │ countAction  │  │    Action    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                 │                  │                  │
└─────────┼─────────────────┼──────────────────┼──────────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DEPENDENCY INJECTION                           │
│                       (Container)                               │
│  ┌────────────────────────────────────────────────────┐        │
│  │          ProductContainer.getService()             │        │
│  │          CartContainer.getService()                │        │
│  └────────────────────────────────────────────────────┘        │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                               │
│                   (Business Logic)                              │
│  ┌────────────────────────────────────────────────────┐        │
│  │  ProductService                                    │        │
│  │  • calculateDiscount()                             │        │
│  │  • checkStockAvailability()                        │        │
│  │  • validatePrice()                                 │        │
│  │  • getProductsWithDiscounts()                      │        │
│  └────────────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────────────┐        │
│  │  CartService                                       │        │
│  │  • calculateSummary()                              │        │
│  │  • validateCartItem()                              │        │
│  │  • applyTaxRules()                                 │        │
│  └────────────────────────────────────────────────────┘        │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER                             │
│                   (Data Access)                                 │
│  ┌────────────────────────────────────────────────────┐        │
│  │  ProductRepository                                 │        │
│  │  • findAll()                                       │        │
│  │  • findById()                                      │        │
│  │  • create()                                        │        │
│  │  • update()                                        │        │
│  │  • delete()                                        │        │
│  └────────────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────────────┐        │
│  │  CartRepository                                    │        │
│  │  • findByUserId()                                  │        │
│  │  • addItem()                                       │        │
│  │  • removeItem()                                    │        │
│  └────────────────────────────────────────────────────┘        │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PRISMA CLIENT                               │
│                   (ORM Layer)                                   │
│  ┌────────────────────────────────────────────────────┐        │
│  │  prisma.product.findMany()                         │        │
│  │  prisma.cart.create()                              │        │
│  │  prisma.cartItem.update()                          │        │
│  └────────────────────────────────────────────────────┘        │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE                                     │
│              (PostgreSQL / SQLite)                              │
│  ┌────────────────────────────────────────────────────┐        │
│  │  Tables: products, carts, cart_items               │        │
│  │  Schema managed by Prisma migrations              │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Example: Get Products with Discounts

```
1. User visits /products page
   │
   ▼
2. ProductList component renders
   │
   ▼
3. useProductsWithDiscounts() hook called
   │
   ▼
4. Hook calls getProductsWithDiscountsAction()
   │  (Client → Server boundary)
   ▼
5. Action calls ProductContainer.getService()
   │  (Dependency Injection)
   ▼
6. Container creates/returns ProductService
   │  with injected ProductRepository
   ▼
7. service.getProducts() called
   │
   ▼
8. Service calls repository.findAll()
   │
   ▼
9. Repository calls prisma.product.findMany()
   │
   ▼
10. Prisma queries PostgreSQL database
    │
    ▼
11. Data returns: Database → Prisma → Repository
    │
    ▼
12. Service applies business logic:
    • calculateDiscount() for each product
    • Validates stock levels
    • Adds computed fields
    │
    ▼
13. Enriched data returns through action
    │
    ▼
14. Hook receives data, updates state
    │
    ▼
15. Component re-renders with data
    │
    ▼
16. ProductCard components display products
    │
    ▼
17. User sees products with discounts! ✨
```

---

## 📁 Feature Module Structure

```
src/features/products/
│
├── repository/               # 🗄️ DATA ACCESS LAYER
│   └── product.repository.ts
│       ├── IProductRepository (interface)
│       ├── ProductRepository (implementation)
│       └── Methods:
│           • findAll(params, filter)
│           • findById(id)
│           • create(data)
│           • update(id, data)
│           • delete(id)
│
├── services/                 # 💼 BUSINESS LOGIC LAYER
│   └── product.service.ts
│       ├── IProductService (interface)
│       ├── ProductService (implementation)
│       └── Methods:
│           • getProducts(params, filter)
│           • createProduct(data)
│           • calculateDiscount(product, qty, rule)
│           • checkStockAvailability(id, qty)
│
├── actions/                  # 🌐 API BOUNDARY LAYER
│   └── product.actions.ts
│       └── Server Actions:
│           • getProductsAction()
│           • createProductAction()
│           • getProductsWithDiscountsAction()
│
├── hooks/                    # ⚛️ CLIENT STATE LAYER
│   └── useProducts.ts
│       └── Custom Hooks:
│           • useProducts(page, limit, filter)
│           • useProduct(id)
│           • useProductsWithDiscounts()
│           • useStockCheck(id, qty)
│
├── components/               # 🎨 PRESENTATION LAYER
│   ├── ProductList.tsx
│   │   └── Displays grid of products with filters
│   └── ProductCard.tsx
│       └── Individual product display
│
├── utils/                    # 🛠️ UTILITIES
│   └── formatters.ts
│       └── Helper Functions:
│           • formatPrice(price)
│           • formatDiscount(discount)
│           • getStockStatus(stock)
│
├── di/                       # 💉 DEPENDENCY INJECTION
│   └── container.ts
│       └── ProductContainer:
│           • getRepository()
│           • getService()
│           • Manages singleton instances
│
└── index.ts                  # 📦 BARREL EXPORT
    └── Public API:
        • Export interfaces
        • Export container
        • Hide implementation details
```

---

## 🎯 Layer Responsibilities

### 1️⃣ Repository Layer
- **What:** Database operations
- **Why:** Abstract data source
- **Example:** `repository.findAll()`
- **Tests:** Mock Prisma Client
- **Dependencies:** Prisma only

### 2️⃣ Service Layer
- **What:** Business logic
- **Why:** Centralize business rules
- **Example:** `calculateDiscount(product, qty, rule)`
- **Tests:** Mock repository
- **Dependencies:** Repository interfaces

### 3️⃣ Actions Layer
- **What:** Server-side API
- **Why:** Next.js server actions
- **Example:** `'use server'` functions
- **Tests:** Mock service
- **Dependencies:** Service via DI

### 4️⃣ Hooks Layer
- **What:** Client state management
- **Why:** React data fetching
- **Example:** `useState`, `useEffect`
- **Tests:** Mock actions
- **Dependencies:** Server actions

### 5️⃣ Components Layer
- **What:** UI presentation
- **Why:** Render interface
- **Example:** JSX components
- **Tests:** Mock hooks
- **Dependencies:** Hooks only

---

## 🧩 Dependencies Flow

```
Components  ──depends on→  Hooks
    ↑
    └─────────────────────────┐
                              │
Hooks       ──depends on→  Actions
    ↑                         │
    └─────────────────────────┤
                              │
Actions     ──depends on→  Services (via DI)
    ↑                         │
    └─────────────────────────┤
                              │
Services    ──depends on→  Repositories
    ↑                         │
    └─────────────────────────┤
                              │
Repositories ──depends on→  Prisma Client
    ↑                         │
    └─────────────────────────┤
                              │
Prisma      ──depends on→  Database
```

**Key Principle:** Each layer only depends on the layer directly below it!

---

## ✅ Architecture Checklist

- ✅ **Separation of Concerns** - Each layer has single responsibility
- ✅ **Dependency Inversion** - Depend on interfaces, not implementations
- ✅ **Single Responsibility** - Each class has one reason to change
- ✅ **Open/Closed** - Open for extension, closed for modification
- ✅ **Interface Segregation** - Clients depend on minimal interfaces
- ✅ **Testability** - Each layer independently testable
- ✅ **Modularity** - Features are self-contained modules
- ✅ **Scalability** - Easy to add new features
- ✅ **Maintainability** - Easy to locate and modify code

---

## 🚀 This Architecture Enables

1. **Parallel Development** - Multiple teams work on different features
2. **Easy Testing** - Mock dependencies, test in isolation
3. **Code Reuse** - Services used in multiple contexts
4. **Clear Ownership** - Each feature has clear boundaries
5. **Gradual Migration** - Refactor one feature at a time
6. **Type Safety** - TypeScript interfaces throughout
7. **Clean Code** - Each file has single purpose
8. **Documentation** - Structure is self-documenting

---

**Result:** Enterprise-grade, production-ready architecture! 🎉
