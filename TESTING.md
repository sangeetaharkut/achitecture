# Testing Guide

## 🧪 Testing Strategy

This architecture is designed for testability with each layer independently testable.

---

## Testing Layers

### 1. Repository Layer Tests

Test data access without a real database:

```typescript
// product.repository.test.ts
import { ProductRepository } from '../repository/product.repository';
import { PrismaClient } from '@prisma/client';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      }
    } as any;
    
    repository = new ProductRepository(mockPrisma);
  });

  it('should find all products', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', price: 10 },
      { id: '2', name: 'Product 2', price: 20 },
    ];
    
    mockPrisma.product.findMany.mockResolvedValue(mockProducts);
    mockPrisma.product.count.mockResolvedValue(2);

    const result = await repository.findAll({ page: 1, limit: 10 });

    expect(result.data).toEqual(mockProducts);
    expect(result.total).toBe(2);
  });

  it('should find product by id', async () => {
    const mockProduct = { id: '1', name: 'Product 1', price: 10 };
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

    const result = await repository.findById('1');

    expect(result).toEqual(mockProduct);
    expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: '1' }
    });
  });
});
```

### 2. Service Layer Tests

Test business logic without database:

```typescript
// product.service.test.ts
import { ProductService } from '../services/product.service';
import { IProductRepository } from '../repository/product.repository';

describe('ProductService', () => {
  let service: ProductService;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;
    
    service = new ProductService(mockRepository);
  });

  describe('calculateDiscount', () => {
    it('should apply percentage discount', () => {
      const product = { price: 100 } as any;
      const rule = { type: 'percentage' as const, value: 10 };

      const result = service.calculateDiscount(product, 2, rule);

      expect(result).toBe(180); // 200 - 10% = 180
    });

    it('should apply fixed discount', () => {
      const product = { price: 100 } as any;
      const rule = { type: 'fixed' as const, value: 15 };

      const result = service.calculateDiscount(product, 1, rule);

      expect(result).toBe(85); // 100 - 15 = 85
    });

    it('should not apply discount if minimum quantity not met', () => {
      const product = { price: 100 } as any;
      const rule = { type: 'percentage' as const, value: 10, minQuantity: 5 };

      const result = service.calculateDiscount(product, 3, rule);

      expect(result).toBe(300); // No discount
    });
  });

  describe('createProduct', () => {
    it('should reject negative price', async () => {
      const data = {
        name: 'Test',
        description: 'Test',
        price: -10,
        category: 'test',
        stock: 100
      };

      const result = await service.createProduct(data);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Price must be greater than 0');
    });

    it('should reject negative stock', async () => {
      const data = {
        name: 'Test',
        description: 'Test',
        price: 10,
        category: 'test',
        stock: -5
      };

      const result = await service.createProduct(data);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Stock cannot be negative');
    });
  });

  describe('checkStockAvailability', () => {
    it('should return true when stock is sufficient', async () => {
      const mockProduct = { id: '1', stock: 10 } as any;
      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.checkStockAvailability('1', 5);

      expect(result).toBe(true);
    });

    it('should return false when stock is insufficient', async () => {
      const mockProduct = { id: '1', stock: 3 } as any;
      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.checkStockAvailability('1', 5);

      expect(result).toBe(false);
    });
  });
});
```

### 3. Server Actions Tests

Test API boundary:

```typescript
// product.actions.test.ts
import { getProductsAction, createProductAction } from '../actions/product.actions';
import { ProductContainer } from '../di/container';

jest.mock('../di/container');

describe('Product Actions', () => {
  let mockService: any;

  beforeEach(() => {
    mockService = {
      getProducts: jest.fn(),
      createProduct: jest.fn(),
    };
    
    (ProductContainer.getService as jest.Mock).mockReturnValue(mockService);
  });

  it('should get products successfully', async () => {
    const mockResponse = {
      data: [{ id: '1', name: 'Product 1' }],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1
    };
    
    mockService.getProducts.mockResolvedValue(mockResponse);

    const result = await getProductsAction(1, 10);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse);
  });

  it('should handle errors', async () => {
    mockService.getProducts.mockRejectedValue(new Error('Database error'));

    const result = await getProductsAction(1, 10);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Database error');
  });
});
```

### 4. Component Tests

Test UI without server:

```typescript
// ProductList.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductList } from '../components/ProductList';
import * as hooks from '../hooks/useProducts';

jest.mock('../hooks/useProducts');

describe('ProductList', () => {
  it('should show loading state', () => {
    jest.spyOn(hooks, 'useProductsWithDiscounts').mockReturnValue({
      products: null,
      loading: true,
      error: null,
      refetch: jest.fn()
    });

    render(<ProductList />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render products', () => {
    const mockProducts = {
      data: [
        { id: '1', name: 'Product 1', price: 10 },
        { id: '2', name: 'Product 2', price: 20 },
      ],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1
    };

    jest.spyOn(hooks, 'useProductsWithDiscounts').mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    render(<ProductList />);

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('should show error state', () => {
    jest.spyOn(hooks, 'useProductsWithDiscounts').mockReturnValue({
      products: null,
      loading: false,
      error: 'Failed to load',
      refetch: jest.fn()
    });

    render(<ProductList />);

    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });
});
```

---

## Integration Tests

Test the complete flow:

```typescript
// integration.test.ts
import { ProductRepository } from '../repository/product.repository';
import { ProductService } from '../services/product.service';
import { PrismaClient } from '@prisma/client';

describe('Products Integration', () => {
  let prisma: PrismaClient;
  let repository: ProductRepository;
  let service: ProductService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new ProductRepository(prisma);
    service = new ProductService(repository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create and retrieve product', async () => {
    // Create
    const createResult = await service.createProduct({
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'test',
      stock: 10
    });

    expect(createResult.success).toBe(true);
    expect(createResult.data?.name).toBe('Test Product');

    // Retrieve
    const getResult = await service.getProductById(createResult.data!.id);

    expect(getResult.success).toBe(true);
    expect(getResult.data?.id).toBe(createResult.data!.id);

    // Clean up
    await service.deleteProduct(createResult.data!.id);
  });
});
```

---

## Running Tests

```bash
# Install dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test product.service.test.ts

# Run in watch mode
npm test -- --watch
```

---

## Test Coverage Goals

- **Repository Layer**: 100% (simple CRUD operations)
- **Service Layer**: 90%+ (focus on business logic)
- **Components**: 80%+ (UI interactions)
- **Integration**: Key user flows

---

## Benefits of Layered Testing

1. **Fast Tests**: Unit tests run without database
2. **Isolated Tests**: Each layer tested independently
3. **Easy Mocking**: Clear interfaces make mocking simple
4. **Maintainable**: Tests match code structure
5. **Confidence**: High coverage with meaningful tests
