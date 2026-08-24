# Quick Start Guide

## Setup Instructions

### 1. Verify Installation

Check that all dependencies are installed:
```bash
npm list prisma @prisma/client
```

### 2. Setup Prisma

Generate Prisma Client:
```bash
npx prisma generate
```

If you encounter certificate errors, you can:
- Use `npm config set strict-ssl false` temporarily
- Or download engines manually: `npx prisma generate --skip-download`

### 3. Setup Database

For SQLite (Development):
```bash
# Already configured in .env
npx prisma migrate dev --name init
```

For PostgreSQL (Production):
```bash
# Update .env with your database URL:
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

npx prisma migrate dev --name init
```

### 4. Verify Structure

Check that all feature files are created:
```bash
Get-ChildItem -Recurse src | Select-Object FullName
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## Testing the Architecture

### Test API Endpoints

#### Create a Product
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Test Product","description":"A test product","price":29.99,"category":"test","stock":100}'
```

#### List Products
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method GET
```

#### Get Product by ID
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products/[id]" -Method GET
```

#### Add to Cart
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/cart" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{"x-user-id"="demo-user"} `
  -Body '{"productId":"product-id","quantity":2}'
```

---

## Project Structure Overview

```
nextJS/achitecture/
│
├── src/                          # Source code
│   ├── features/                 # Feature modules
│   │   ├── products/             # Product feature
│   │   │   ├── repository/       # Data access
│   │   │   ├── services/         # Business logic
│   │   │   ├── di/               # Dependency injection
│   │   │   └── index.ts          # Public API
│   │   │
│   │   └── cart/                 # Cart feature
│   │       ├── repository/
│   │       ├── services/
│   │       ├── di/
│   │       └── index.ts
│   │
│   ├── types/                    # Type definitions
│   │   ├── product.types.ts
│   │   ├── cart.types.ts
│   │   ├── common.types.ts
│   │   └── index.ts
│   │
│   └── lib/                      # Shared utilities
│       └── prisma.ts             # Database client
│
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── products/
│   │   │   ├── route.ts          # GET/POST products
│   │   │   └── [id]/route.ts    # GET/PATCH/DELETE product
│   │   └── cart/
│   │       └── route.ts          # Cart operations
│   ├── layout.tsx
│   └── page.tsx
│
├── prisma/
│   └── schema.prisma             # Database schema
│
├── .env                          # Environment variables
├── .env.example                  # Example env file
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
├── README.md                     # Project overview
└── ARCHITECTURE.md               # Architecture docs
```

---

## Key Files Explained

### TypeScript Configuration (`tsconfig.json`)

Path aliases configured for clean imports:
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/features/*": ["./src/features/*"],
    "@/types": ["./src/types"],
    "@/lib/*": ["./src/lib/*"]
  }
}
```

### Prisma Schema (`prisma/schema.prisma`)

Defines database models:
- Product (products table)
- Cart (carts table)
- CartItem (cart_items table)

### Feature Module Structure

Each feature follows the same pattern:

1. **Repository** - Database operations
2. **Service** - Business logic
3. **Container** - Dependency injection
4. **Index** - Public API (barrel export)

---

## Common Tasks

### Adding a New Field to Product

1. Update Prisma schema:
```prisma
model Product {
  // ... existing fields
  brand String?  // New field
}
```

2. Update type:
```typescript
// src/types/product.types.ts
export interface Product {
  // ... existing fields
  brand?: string;  // New field
}
```

3. Run migration:
```bash
npx prisma migrate dev --name add_product_brand
```

### Creating a New Feature

Follow the pattern in `ARCHITECTURE.md` under "Migration Guide"

---

## Troubleshooting

### Prisma Generation Issues

If `npx prisma generate` fails:
```bash
# Option 1: Skip download and use existing
npx prisma generate --skip-download

# Option 2: Set environment variable
$env:PRISMA_SKIP_POSTINSTALL_GENERATE="true"
npm install
```

### Import Errors

If you see module resolution errors:
1. Restart TypeScript server (VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server")
2. Check `tsconfig.json` paths are correct
3. Verify files exist in expected locations

### Database Connection Issues

Check `.env` file:
```bash
# For SQLite
DATABASE_URL="file:./dev.db"

# For PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

---

## Next Steps

1. ✅ Review [ARCHITECTURE.md](ARCHITECTURE.md) for detailed patterns
2. ✅ Study the example features: products and cart
3. ✅ Create your own feature following the same pattern
4. ✅ Write tests for your services and repositories
5. ✅ Build your UI components in `app/` directory

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
