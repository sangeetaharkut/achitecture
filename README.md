# Next.js Feature-Based Architecture with DDD

A modern Next.js 16 project implementing Domain-Driven Design (DDD) principles with feature-based folder structure.

## 🏗️ Architecture Overview

This project demonstrates:

- **Feature-Based Folder Structure** - Organized by business features, not file types
- **Domain-Driven Design (DDD)** - Clear domain models and business logic separation
- **Repository Pattern** - Database abstraction layer
- **Service Layer** - Business logic isolated from data access
- **Dependency Injection** - Loosely coupled, testable code
- **Barrel Exports** - Clean module boundaries and public APIs

## 📁 Project Structure

```
src/
├── features/                    # Feature modules
│   ├── products/               # Product feature
│   │   ├── repository/         # Data access layer
│   │   │   └── product.repository.ts
│   │   ├── services/           # Business logic layer
│   │   │   └── product.service.ts
│   │   ├── di/                 # Dependency injection
│   │   │   └── container.ts
│   │   └── index.ts            # Barrel export
│   │
│   └── cart/                   # Cart feature
│       ├── repository/
│       │   └── cart.repository.ts
│       ├── services/
│       │   └── cart.service.ts
│       ├── di/
│       │   └── container.ts
│       └── index.ts
│
├── types/                      # Domain types & interfaces
│   ├── product.types.ts
│   ├── cart.types.ts
│   ├── common.types.ts
│   └── index.ts
│
└── lib/                        # Shared utilities
    └── prisma.ts               # Database client

app/                            # Next.js app directory
├── api/                        # API routes
│   ├── products/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── cart/
│       └── route.ts
└── page.tsx

prisma/
└── schema.prisma              # Database schema
```

## 🎯 Key Patterns

### 1. Repository Pattern
Abstracts database operations:
```typescript
// Clean separation: Service doesn't know about Prisma
const product = await repository.findById(id);
```

### 2. Service Layer
Contains business logic:
```typescript
// Business rules in one place
calculateDiscount(product, quantity, rule)
checkStockAvailability(productId, quantity)
```

### 3. Dependency Injection
Manages dependencies:
```typescript
// Get service with all dependencies injected
const productService = ProductContainer.getService();
```

### 4. Barrel Exports
Clean public API:
```typescript
// Import from feature module, not internal files
import { ProductContainer } from '@/features/products';
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Create .env file
cp .env.example .env

# Update DATABASE_URL in .env
# For development, you can use SQLite:
DATABASE_URL="file:./dev.db"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

### Products
- `GET /api/products` - List products (with pagination & filters)
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product by ID
- `PATCH /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart` - Clear cart

## 🧪 Example Usage

### Creating a Product
```typescript
const productService = ProductContainer.getService();

const result = await productService.createProduct({
  name: "Premium Widget",
  description: "High-quality widget",
  price: 29.99,
  category: "widgets",
  stock: 100
});

if (result.success) {
  console.log("Product created:", result.data);
}
```

### Adding to Cart
```typescript
const cartService = CartContainer.getService();

const result = await cartService.addToCart("user-123", {
  productId: "product-id",
  quantity: 2
});

if (result.success) {
  const summary = cartService.calculateSummary(result.data);
  console.log("Cart total:", summary.total);
}
```

## 🎨 Benefits

### Maintainability
- Features are self-contained and easy to locate
- Clear separation of concerns
- Easy to understand code flow

### Testability
- Mock repositories for unit tests
- Test business logic without database
- Dependency injection enables easy mocking

### Scalability
- Add new features without touching existing code
- Module boundaries prevent tight coupling
- Easy to refactor individual features

### Team Collaboration
- Multiple developers can work on different features
- Clear ownership and responsibilities
- Reduced merge conflicts

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)

## 🛠️ Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **Tailwind CSS 4** - Styling
- **PostgreSQL/SQLite** - Database

## 🧪 Testing

### Unit Tests (Jest + React Testing Library)

```bash
# Run all unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Example:** 32 comprehensive tests for ProductCard component covering:
- Rendering and display
- Stock status indicators
- Discount calculations
- Add to cart functionality
- Loading and error states
- Accessibility

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Interactive UI mode (recommended)
npm run test:e2e:ui

# Watch tests run in browser
npm run test:e2e:headed

# Debug mode with step-through
npm run test:e2e:debug

# View HTML report
npm run playwright:report
```

**Coverage:** 18 comprehensive E2E tests including:
- Homepage navigation
- Product browsing and filtering
- Product detail pages
- Add to cart from card and detail page
- Cart management (update quantities, remove items)
- Order summary calculations
- Complete user journey

See [TESTING.md](TESTING.md) for detailed testing guide.

##  CI/CD - Automated Testing on Every PR

This project runs **Playwright E2E tests automatically** on every Pull Request using GitHub Actions.

### What Runs Automatically

✅ All 18 E2E tests  
✅ Database setup and seeding  
✅ Production build validation  
✅ Test reports uploaded as artifacts

### Setup (One-time)

1. Push code to GitHub:
```bash
git add .
git commit -m "Add CI/CD workflow"
git push origin main
```

2. Create a Pull Request - tests run automatically!

### Viewing Test Results

- Go to your PR → **Checks** tab
- See ✅ or ❌ status for "Playwright Tests"
- Download artifacts for detailed reports on failure

### Local Testing Before Push

```bash
# Quick check
npm run test:e2e

# Full suite with UI
npm run test:e2e:ui
```

See [CI-CD-GUIDE.md](CI-CD-GUIDE.md) for complete CI/CD documentation.
