# Architecture Documentation

## 📐 Feature-Based Architecture with Domain-Driven Design

This document explains the architectural decisions and patterns used in this Next.js project.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure Explained](#folder-structure-explained)
3. [Design Patterns](#design-patterns)
4. [Data Flow](#data-flow)
5. [Module Boundaries](#module-boundaries)
6. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

### Traditional vs Feature-Based Structure

#### ❌ Traditional File-Type Based (What we AVOID)
```
app/
  components/
    ProductCard.tsx
    CartItem.tsx
  services/
    productService.ts
    cartService.ts
  repositories/
    productRepository.ts
    cartRepository.ts
  types/
    product.ts
    cart.ts
```

**Problems:**
- Related code scattered across folders
- Hard to locate feature-specific code
- Tight coupling between features
- Difficult to scale with team size

#### ✅ Feature-Based (What we USE)
```
src/
  features/
    products/          # Everything product-related
      repository/
      services/
      di/
      index.ts
    cart/             # Everything cart-related
      repository/
      services/
      di/
      index.ts
```

**Benefits:**
- Related code co-located
- Clear feature boundaries
- Easy to locate and modify
- Scales with team and codebase

---

## Folder Structure Explained

### `/src/features/` - Feature Modules

Each feature is a self-contained module with:

```
products/
├── repository/              # Data Access Layer
│   └── product.repository.ts
│       - Interfaces with database
│       - CRUD operations
│       - No business logic
│
├── services/               # Business Logic Layer
│   └── product.service.ts
│       - Business rules
│       - Validation
│       - Orchestration
│
├── di/                     # Dependency Injection
│   └── container.ts
│       - Manages dependencies
│       - Provides instances
│       - Enables testing
│
└── index.ts               # Barrel Export
    - Public API
    - Controls what's exposed
    - Clean imports
```

### `/src/types/` - Domain Types

Centralized type definitions:

```typescript
// product.types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  // ... domain properties
}

export interface CreateProductDTO {
  // ... creation data
}
```

**Why Separate Types?**
- Shared across features
- Single source of truth
- Type safety throughout app
- Easy to maintain

### `/src/lib/` - Shared Utilities

Cross-cutting concerns:

```typescript
// prisma.ts - Database client singleton
export const prisma = new PrismaClient();
```

**Purpose:**
- Infrastructure code
- Shared utilities
- Third-party integrations

---

## Design Patterns

### 1. Repository Pattern

**Purpose:** Abstract data access from business logic

```typescript
// Interface defines contract
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  create(data: CreateProductDTO): Promise<Product>;
  // ...
}

// Implementation handles database
export class ProductRepository implements IProductRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }
}
```

**Benefits:**
- Service layer doesn't know about Prisma
- Easy to swap database
- Simple to mock for tests
- Centralized data access logic

### 2. Service Layer Pattern

**Purpose:** Encapsulate business logic

```typescript
export class ProductService {
  constructor(private repository: IProductRepository) {}
  
  async createProduct(data: CreateProductDTO): Promise<Result<Product>> {
    // Business validation
    if (data.price <= 0) {
      return { success: false, error: new Error('Invalid price') };
    }
    
    // Use repository
    const product = await this.repository.create(data);
    
    return { success: true, data: product };
  }
  
  // Business logic methods
  calculateDiscount(product: Product, quantity: number): number {
    // Discount rules here
  }
}
```

**Benefits:**
- Business rules in one place
- Reusable across API routes/pages
- Testable without database
- Clear separation of concerns

### 3. Dependency Injection Pattern

**Purpose:** Manage dependencies, enable testing

```typescript
class ProductContainer {
  private static serviceInstance: IProductService;
  
  static getService(): IProductService {
    if (!this.serviceInstance) {
      const repository = new ProductRepository(prisma);
      this.serviceInstance = new ProductService(repository);
    }
    return this.serviceInstance;
  }
  
  // For testing
  static setService(service: IProductService): void {
    this.serviceInstance = service;
  }
}
```

**Benefits:**
- Centralized instance management
- Easy to inject mocks for testing
- Loose coupling
- Singleton pattern for shared instances

### 4. Barrel Exports Pattern

**Purpose:** Control module boundaries

```typescript
// features/products/index.ts

// ✅ Export only public API
export { IProductService } from './services/product.service';
export { ProductContainer } from './di/container';

// ❌ Don't export internal implementations
// export { ProductRepository } from './repository/product.repository';
```

**Usage:**
```typescript
// ✅ Clean import from feature
import { ProductContainer } from '@/features/products';

// ❌ Don't import internal files
// import { ProductService } from '@/features/products/services/product.service';
```

**Benefits:**
- Clear public API
- Internal refactoring doesn't break consumers
- Prevents tight coupling
- Enforces encapsulation

---

## Data Flow

### Request Flow Diagram

```
API Route (app/api/products/route.ts)
    ↓
Container (DI)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (Prisma → PostgreSQL/SQLite)
```

### Example: Creating a Product

```typescript
// 1. API Route receives request
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // 2. Get service from DI container
  const productService = ProductContainer.getService();
  
  // 3. Service validates and processes
  const result = await productService.createProduct(body);
  
  // 4. Return response
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data, { status: 201 });
}

// Inside ProductService
async createProduct(data: CreateProductDTO): Promise<Result<Product>> {
  // Business validation
  if (data.price <= 0) {
    return { success: false, error: new Error('Invalid price') };
  }
  
  // 5. Repository handles database
  const product = await this.repository.create(data);
  
  return { success: true, data: product };
}

// Inside ProductRepository
async create(data: CreateProductDTO): Promise<Product> {
  // 6. Prisma interacts with database
  return this.prisma.product.create({ data });
}
```

---

## Module Boundaries

### Feature Isolation

Each feature is a bounded context:

```typescript
// ✅ GOOD: Features interact through public APIs
import { ProductContainer } from '@/features/products';
import { CartContainer } from '@/features/cart';

const productService = ProductContainer.getService();
const cartService = CartContainer.getService();

// Services can depend on each other via interfaces
export class CartService {
  constructor(
    private repository: ICartRepository,
    private productService: IProductService  // ← Dependency injection
  ) {}
}
```

```typescript
// ❌ BAD: Don't access internal implementation
import { ProductRepository } from '@/features/products/repository/product.repository';
// This breaks encapsulation!
```

### Communication Rules

1. **API Layer** → Uses Containers to get services
2. **Service Layer** → Uses repositories and other service interfaces
3. **Repository Layer** → Only interacts with database

---

## Testing Strategy

### Unit Testing Services

```typescript
import { ProductService } from '@/features/products/services/product.service';

describe('ProductService', () => {
  let service: ProductService;
  let mockRepository: jest.Mocked<IProductRepository>;
  
  beforeEach(() => {
    // Mock repository
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      // ...
    };
    
    // Inject mock
    service = new ProductService(mockRepository);
  });
  
  it('should validate price when creating product', async () => {
    const result = await service.createProduct({
      name: 'Test',
      price: -10,  // Invalid
      // ...
    });
    
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('price');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
```

### Integration Testing Repositories

```typescript
describe('ProductRepository', () => {
  let repository: ProductRepository;
  
  beforeEach(async () => {
    // Use test database
    repository = new ProductRepository(testPrisma);
    await cleanDatabase();
  });
  
  it('should create and retrieve product', async () => {
    const created = await repository.create({
      name: 'Test Product',
      price: 29.99,
      // ...
    });
    
    const found = await repository.findById(created.id);
    expect(found?.name).toBe('Test Product');
  });
});
```

### API Testing

```typescript
describe('POST /api/products', () => {
  it('should create product with valid data', async () => {
    const response = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Product',
        price: 49.99,
        // ...
      }),
    });
    
    expect(response.status).toBe(201);
    const product = await response.json();
    expect(product.name).toBe('New Product');
  });
});
```

---

## Best Practices

### DO ✅

1. **Keep features self-contained**
   - All related code in feature folder
   - Clear boundaries

2. **Use interfaces for dependencies**
   - Enables testing with mocks
   - Loose coupling

3. **Validate in service layer**
   - Business rules in services
   - Keep repositories simple

4. **Use Result types**
   - Explicit success/failure
   - Better error handling

5. **Export through barrels**
   - Clean public API
   - Easy refactoring

### DON'T ❌

1. **Don't put business logic in repositories**
   - Keep repositories focused on data access

2. **Don't access internal implementations**
   - Use public APIs only

3. **Don't bypass service layer**
   - Always use services, never repositories directly from API

4. **Don't create circular dependencies**
   - Features should have clear hierarchy

5. **Don't expose everything**
   - Only export what consumers need

---

## Migration Guide

### Adding a New Feature

1. **Create feature folder**
   ```
   src/features/orders/
   ```

2. **Define types**
   ```typescript
   // src/types/order.types.ts
   export interface Order { ... }
   ```

3. **Create repository**
   ```typescript
   // src/features/orders/repository/order.repository.ts
   export interface IOrderRepository { ... }
   export class OrderRepository implements IOrderRepository { ... }
   ```

4. **Create service**
   ```typescript
   // src/features/orders/services/order.service.ts
   export interface IOrderService { ... }
   export class OrderService implements IOrderService { ... }
   ```

5. **Setup DI container**
   ```typescript
   // src/features/orders/di/container.ts
   class OrderContainer { ... }
   ```

6. **Create barrel export**
   ```typescript
   // src/features/orders/index.ts
   export { IOrderService } from './services/order.service';
   export { OrderContainer } from './di/container';
   ```

7. **Create API routes**
   ```typescript
   // app/api/orders/route.ts
   import { OrderContainer } from '@/features/orders';
   ```

---

## Summary

This architecture provides:

✅ **Maintainability** - Easy to locate and modify code  
✅ **Testability** - Mock dependencies easily  
✅ **Scalability** - Add features without touching existing code  
✅ **Team Collaboration** - Clear ownership and boundaries  
✅ **Type Safety** - Full TypeScript support  
✅ **Separation of Concerns** - Each layer has clear responsibility
