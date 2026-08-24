# Playwright E2E Testing Guide

## 🎭 Overview

Playwright is a powerful end-to-end testing framework that allows you to test your application in real browsers. This project includes comprehensive E2E tests for the shopping cart functionality.

## ✅ Setup Complete

All dependencies and configuration files have been set up:
- ✅ `@playwright/test` installed
- ✅ `playwright.config.ts` configured
- ✅ `e2e/cart.spec.ts` created with 18 comprehensive tests

## 🚀 How to Run Tests

### Run All Tests
```bash
npx playwright test
```

### Run Tests in UI Mode (Recommended for Demo)
```bash
npx playwright test --ui
```
This opens an interactive UI where you can:
- See all tests
- Run tests one by one
- Watch tests execute in real-time
- Debug failures

### Run Tests in Headed Mode (See the Browser)
```bash
npx playwright test --headed
```

### Run Specific Test File
```bash
npx playwright test e2e/cart.spec.ts
```

### Run Single Test by Name
```bash
npx playwright test -g "should add product to cart"
```

### Run Tests in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug Mode (Step Through Tests)
```bash
npx playwright test --debug
```

## 📊 View Test Results

### Open HTML Report (After Tests Run)
```bash
npx playwright show-report
```

### Generate Report Manually
```bash
npx playwright test --reporter=html
```

## 🎯 Test Coverage

### Shopping Cart E2E Tests (18 Tests)

#### 1. **Navigation & UI Tests**
- ✅ Display homepage with navigation
- ✅ Navigate to products page and display product grid
- ✅ View product details page

#### 2. **Add to Cart Tests**
- ✅ Add product to cart from product card
- ✅ Add product to cart from product detail page with quantity
- ✅ Show success message after adding

#### 3. **Cart Page Tests**
- ✅ View cart page with added items
- ✅ Display order summary (subtotal, tax, total)
- ✅ Show empty cart message when cart is empty

#### 4. **Cart Operations Tests**
- ✅ Update cart item quantity (increase)
- ✅ Decrease cart item quantity
- ✅ Remove item from cart
- ✅ Clear entire cart

#### 5. **Navigation Flow Tests**
- ✅ Navigate from empty cart to products
- ✅ Persist cart count in header across pages

#### 6. **Calculation Tests**
- ✅ Calculate correct totals (subtotal + tax = total)
- ✅ Show checkout button

#### 7. **Complete User Journey**
- ✅ Browse → View Details → Add to Cart → View Cart → Update → Checkout

## 🎬 Demo Guide for Learners

### Setup for Demo
```bash
# 1. Start dev server (in one terminal)
npm run dev

# 2. Open Playwright UI (in another terminal)
npx playwright test --ui
```

### Demo Flow

#### Part 1: Show the UI
1. Open Playwright UI: `npx playwright test --ui`
2. Show the test list on the left
3. Point out the different test categories
4. Show browser selector (Chromium, Firefox, WebKit)

#### Part 2: Run Simple Test
1. Click on "should display the homepage with navigation"
2. Click ▶️ Play button
3. Show the browser opening automatically
4. Show the test steps executing
5. Show green checkmark on success

#### Part 3: Run Complex Test
1. Select "complete user journey: browse → add → view cart..."
2. Run with headed mode to see browser
3. Walk through each step as it executes:
   - Navigate to products
   - Click product
   - Add to cart
   - View cart
   - Update quantity
   - See checkout button

#### Part 4: Show Test Code
1. Open `e2e/cart.spec.ts`
2. Explain test structure:
   ```typescript
   test('test name', async ({ page }) => {
     // Arrange
     await page.goto('/products');
     
     // Act
     await page.click('button:has-text("Add to Cart")');
     
     // Assert
     await expect(page.getByText('Added to cart')).toBeVisible();
   });
   ```

#### Part 5: Debug a Test
1. Run a test with `--debug` flag
2. Show Playwright Inspector
3. Step through test line by line
4. Show element picker
5. Show console logs

#### Part 6: Show Reports
1. After tests complete, show: `npx playwright show-report`
2. Show test results dashboard
3. Show individual test details
4. Show screenshots on failure
5. Show traces for debugging

## 📝 Writing New Tests

### Basic Test Structure
```typescript
test('test description', async ({ page }) => {
  // Navigate
  await page.goto('/your-page');
  
  // Interact
  await page.click('button');
  await page.fill('input', 'text');
  
  // Assert
  await expect(page.getByText('Expected')).toBeVisible();
});
```

### Common Actions
```typescript
// Navigation
await page.goto('/path');
await page.goBack();
await page.reload();

// Clicks
await page.click('button');
await page.locator('button').click();

// Fill forms
await page.fill('input[name="email"]', 'test@example.com');
await page.selectOption('select', 'option-value');

// Wait for elements
await page.waitForSelector('div.loaded');
await page.waitForLoadState('networkidle');

// Get text content
const text = await page.textContent('h1');
const html = await page.innerHTML('div');
```

### Common Assertions
```typescript
// Visibility
await expect(page.getByText('Hello')).toBeVisible();
await expect(page.locator('.hidden')).not.toBeVisible();

// Text content
await expect(page.locator('h1')).toContainText('Welcome');
await expect(page.locator('h1')).toHaveText('Welcome');

// Attributes
await expect(page.locator('a')).toHaveAttribute('href', '/link');

// Count
await expect(page.locator('.item')).toHaveCount(5);

// URL
await expect(page).toHaveURL('/expected-path');
```

## 🔧 Configuration

### playwright.config.ts

Key settings:
```typescript
{
  testDir: './e2e',           // Test files location
  baseURL: 'http://localhost:3000',  // Your app URL
  
  projects: [
    { name: 'chromium' },     // Chrome/Edge
    { name: 'firefox' },      // Firefox
    { name: 'webkit' },       // Safari
    { name: 'Mobile Chrome' }, // Mobile testing
  ],
  
  webServer: {
    command: 'npm run dev',   // Auto-start dev server
    url: 'http://localhost:3000',
  },
}
```

## 🐛 Debugging Tips

### 1. Use UI Mode
```bash
npx playwright test --ui
```
Best for understanding what's happening.

### 2. Use Debug Mode
```bash
npx playwright test --debug
```
Step through tests line by line.

### 3. Slow Down Tests
```typescript
test.use({ launchOptions: { slowMo: 1000 } });
```

### 4. Take Screenshots
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### 5. Console Logs
```typescript
page.on('console', msg => console.log(msg.text()));
```

### 6. View Trace
When test fails, click on trace in report to see:
- Screenshots at each step
- Network requests
- Console logs
- DOM snapshots

## 📱 Mobile Testing

Tests are configured to run on mobile devices:
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🎓 Key Concepts for Learners

### 1. Page Object Model (POM)
Organize selectors and actions:
```typescript
class CartPage {
  constructor(private page: Page) {}
  
  async addToCart() {
    await this.page.click('button:has-text("Add to Cart")');
  }
  
  async getItemCount() {
    return await this.page.locator('.cart-item').count();
  }
}
```

### 2. Fixtures
Share setup between tests:
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});
```

### 3. Auto-waiting
Playwright automatically waits for elements:
```typescript
await page.click('button'); // Waits until button is visible and clickable
```

### 4. Assertions
Use expect with auto-retry:
```typescript
await expect(page.locator('.loading')).toBeVisible({ timeout: 5000 });
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright API](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)

## 🎯 Next Steps

1. **Run the tests**: `npx playwright test --ui`
2. **Explore test results**: `npx playwright show-report`
3. **Write more tests**: Add tests in `e2e/` folder
4. **Try mobile testing**: `npx playwright test --project="Mobile Chrome"`
5. **Debug a test**: `npx playwright test --debug`

---

**Ready to demo!** 🚀

Run `npx playwright test --ui` and show learners how real browser testing works!
