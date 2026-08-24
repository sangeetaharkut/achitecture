# How to Run Tests

## Quick Start

### Run all tests once
```bash
npm test
```

### Run tests in watch mode (auto-reruns on file changes)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## What's Been Tested

The ProductCard component now has comprehensive test coverage with **40+ test cases** covering:

✅ **Rendering** - Product info, images, links  
✅ **Stock Status** - In stock, low stock, out of stock badges  
✅ **Discounts** - Discount badges, prices, savings  
✅ **Add to Cart** - Button clicks, loading states, success/error messages  
✅ **Edge Cases** - Missing data, long text, boundary values  
✅ **Accessibility** - ARIA roles, disabled states, alt text  

## Test Output

When you run `npm test`, you'll see:
```
PASS  src/features/products/components/__tests__/ProductCard.test.tsx
  ProductCard
    Rendering
      ✓ should render product information correctly
      ✓ should render product image when imageUrl is provided
      ...
    Stock Status
      ✓ should show "In Stock" for products with stock > 10
      ...
    Add to Cart Button
      ✓ should call addToCartAction when Add to Cart is clicked
      ...

Test Suites: 1 passed, 1 total
Tests:       40 passed, 40 total
```

## Coverage Report

Run `npm run test:coverage` to see:
```
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
ProductCard.tsx     |   95.12 |    91.67 |   100.0 |   95.00
```

Coverage reports are saved in `coverage/` directory.

## Files Created

- `jest.config.ts` - Jest configuration
- `jest.setup.ts` - Test setup and mocks
- `src/features/products/components/__tests__/ProductCard.test.tsx` - Test suite

## Troubleshooting

### Error: Cannot find module '@testing-library/react'
Run: `npm install`

### Tests timeout
The ProductCard tests use fake timers for timeout tests. This is handled automatically.

### Module path errors
Path aliases (@/...) are configured in jest.config.ts to match tsconfig.json.
