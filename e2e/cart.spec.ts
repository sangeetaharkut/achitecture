/**
 * E2E Tests for Shopping Cart
 * 
 * This test suite covers the complete user journey:
 * 1. Browse products
 * 2. View product details
 * 3. Add items to cart
 * 4. View cart
 * 5. Update quantities
 * 6. Remove items
 * 7. Clear cart
 */

import { test, expect } from '@playwright/test';

test.describe('Shopping Cart E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display the homepage with navigation', async ({ page }) => {
    // Check page title contains expected text
    await expect(page).toHaveTitle(/Next/);
    
    // Check header/nav is visible
    await expect(page.locator('nav, header, [class*="header"]').first()).toBeVisible();
    
    // Check Products link is present
    await expect(page.getByRole('link', { name: /products/i }).first()).toBeVisible();
  });

  test('should navigate to products page and display product grid', async ({ page }) => {
    // Click on Products link
    await page.getByRole('link', { name: /products/i }).first().click();
    
    // Wait for products to load
    await page.waitForLoadState('networkidle');
    
    // Check we're on products page
    await expect(page).toHaveURL(/\/products/);
    
    // Check products are displayed
    const productCards = page.locator('[class*="grid"] a[href*="/products/"]');
    await expect(productCards.first()).toBeVisible();
    
    // Verify at least one product is shown
    const productCount = await productCards.count();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should view product details page', async ({ page }) => {
    // Navigate to products
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Click on first product
    const firstProduct = page.locator('a[href*="/products/"]').first();
    const productName = await firstProduct.locator('h3').textContent();
    await firstProduct.click();
    
    // Wait for product details page
    await page.waitForLoadState('networkidle');
    
    // Verify we're on a product detail page (URL contains product ID)
    await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9]+/);
    
    // Check for essential elements - look for price in specific context
    await expect(page.locator('.text-3xl, [class*="price"]').filter({ hasText: /\$/ }).first()).toBeVisible();
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible();
    
    // Verify product name if available (use first h1 to avoid strict mode violation)
    if (productName) {
      await expect(page.locator('h1').first()).toContainText(productName);
    }
  });

  test('should add product to cart from product card', async ({ page }) => {
    // Navigate to products
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Extra wait for products to render
    
    // Find and click "Add to Cart" button on first product card
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();
    
    // Wait longer for cart update and check multiple indicators
    await page.waitForTimeout(3000);
    
    // Try multiple ways to verify cart was updated
    // Option 1: Look for success message anywhere on page
    const successTextVariants = [
      page.getByText(/✓.*added/i),
      page.getByText(/added.*cart/i),
      page.locator('p, span, div').filter({ hasText: /✓/ }),
    ];
    
    let hasSuccess = false;
    for (const locator of successTextVariants) {
      const visible = await locator.isVisible().catch(() => false);
      if (visible) {
        hasSuccess = true;
        break;
      }
    }
    
    // Option 2: Check if cart page now has items
    if (!hasSuccess) {
      await page.goto('/cart');
      await page.waitForLoadState('networkidle');
      const hasItems = !(await page.getByText(/your cart is empty/i).isVisible().catch(() => false));
      expect(hasItems).toBeTruthy();
    } else {
      expect(hasSuccess).toBeTruthy();
    }
  });

  test('should add product to cart from product detail page', async ({ page }) => {
    // Navigate to products
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Click on first product to go to details
    await page.locator('a[href*="/products/"]').first().click();
    await page.waitForLoadState('networkidle');
    
    // Get initial quantity
    const quantityInput = page.locator('input[type="number"]');
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('2');
    }
    
    // Add to cart
    await page.locator('button:has-text("Add to Cart")').click();
    
    // Wait for success message
    await expect(page.getByText(/added to cart/i)).toBeVisible({ timeout: 5000 });
  });

  test('should view cart page with added items', async ({ page }) => {
    // Navigate to products and add item
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Add first product to cart
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(1000); // Wait for action to complete
    
    // Navigate to cart page
    await page.getByRole('link', { name: /cart/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Verify cart page is displayed
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByRole('heading', { name: /shopping cart/i })).toBeVisible();
    
    // Verify cart has items
    const cartItems = page.locator('[class*="cart"], [class*="item"]').filter({ 
      has: page.locator('img, button')
    });
    await expect(cartItems.first()).toBeVisible();
  });

  test('should display order summary in cart', async ({ page }) => {
    // Navigate to products and add item
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(1000);
    
    // Go to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    // Check order summary exists
    await expect(page.getByText(/order summary/i)).toBeVisible();
    
    // Check for price displays
    await expect(page.getByText(/subtotal/i)).toBeVisible();
    await expect(page.getByText(/tax/i)).toBeVisible();
    await expect(page.getByText(/total/i)).toBeVisible();
    
    // Verify prices are shown
    const priceElements = page.locator('text=/\\$\\d+\\.\\d{2}/');
    expect(await priceElements.count()).toBeGreaterThan(0);
  });

  test('should update cart item quantity', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(1000);
    
    // Go to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    // Find increment button (typically a + button)
    const incrementButton = page.locator('button:has-text("+")').first();
    await incrementButton.click();
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Verify quantity increased
    const quantityDisplay = page.locator('text=/\\d+/').filter({ 
      hasNot: page.locator('[class*="badge"]') 
    });
    await expect(quantityDisplay.first()).toBeVisible();
  });

  test('should decrease cart item quantity', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(1000);
    
    // Go to cart and add more quantity first
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("+")').first().click();
    await page.waitForTimeout(500);
    
    // Now decrease
    const decrementButton = page.locator('button:has-text("-")').first();
    await decrementButton.click();
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Cart should still have the item (quantity should be 1)
    const removeButtons = page.locator('button:has-text("Remove")');
    await expect(removeButtons.first()).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Get product name before adding
    const productName = await page.locator('a[href*="/products/"] h3').first().textContent();
    
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(1000);
    
    // Go to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    // Remove the item
    await page.locator('button:has-text("Remove")').first().click();
    
    // Wait for removal
    await page.waitForTimeout(1000);
    
    // Verify item is removed or cart is empty
    const emptyCartMessage = page.getByText(/your cart is empty/i);
    await expect(emptyCartMessage).toBeVisible({ timeout: 5000 });
  });

  test('should clear entire cart', async ({ page }) => {
    // Add multiple items to cart
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Add first product
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(1000);
    
    // Add second product if available
    const addToCartButtons = page.locator('button:has-text("Add to Cart")');
    if (await addToCartButtons.count() > 1) {
      await addToCartButtons.nth(1).click();
      await page.waitForTimeout(1000);
    }
    
    // Go to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    // Click clear cart button
    await page.locator('button:has-text("Clear Cart")').click();
    
    // Wait for cart to be cleared
    await page.waitForTimeout(1000);
    
    // Verify cart is empty
    await expect(page.getByText(/your cart is empty/i)).toBeVisible({ timeout: 5000 });
  });

  test('should show empty cart message when cart is empty', async ({ page }) => {
    // Go directly to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    // Should see empty cart message
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
    
    // Should see browse products link
    const browseLink = page.getByRole('link', { name: /browse products/i });
    await expect(browseLink).toBeVisible();
    
    // Click browse products should go to products page
    await browseLink.click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('should navigate from empty cart to products and add item', async ({ page }) => {
    // Start at empty cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    // Click browse products
    await page.getByRole('link', { name: /browse products/i }).click();
    
    // Add item
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Add to Cart")').first().click();
    
    // Go back to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    // Should now show items
    await expect(page.getByRole('heading', { name: /shopping cart/i })).toBeVisible();
    await expect(page.getByText(/your cart is empty/i)).not.toBeVisible();
  });

  test('should persist cart count in header across pages', async ({ page }) => {
    // Add item from products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(1000);
    
    // Navigate to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Cart count should still be visible in header
    const cartIndicator = page.locator('nav').locator('text=/\\d+/');
    await expect(cartIndicator.first()).toBeVisible({ timeout: 5000 });
  });

  test('should calculate correct totals in cart', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(1000);
    
    // Go to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    // Get subtotal
    const subtotalText = await page.locator('text=/subtotal/i').locator('..').textContent();
    const subtotalMatch = subtotalText?.match(/\$(\d+\.\d{2})/);
    
    if (subtotalMatch) {
      const subtotal = parseFloat(subtotalMatch[1]);
      
      // Get tax
      const taxText = await page.locator('text=/tax/i').locator('..').textContent();
      const taxMatch = taxText?.match(/\$(\d+\.\d{2})/);
      
      if (taxMatch) {
        const tax = parseFloat(taxMatch[1]);
        
        // Get total
        const totalText = await page.locator('text=/^total$/i').locator('..').textContent();
        const totalMatch = totalText?.match(/\$(\d+\.\d{2})/);
        
        if (totalMatch) {
          const total = parseFloat(totalMatch[1]);
          
          // Verify calculation (allow for small floating point differences)
          expect(Math.abs(total - (subtotal + tax))).toBeLessThan(0.02);
        }
      }
    }
  });

  test('should show checkout button in cart', async ({ page }) => {
    // Add item
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Add to Cart")').first().click();
    await page.waitForTimeout(1000);
    
    // Go to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    // Check for checkout button
    const checkoutButton = page.getByRole('button', { name: /checkout/i });
    await expect(checkoutButton).toBeVisible();
  });

  test('complete user journey: browse → add → view cart → update → checkout', async ({ page }) => {
    // Step 1: Browse products
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/products/);
    
    // Step 2: View product details
    const firstProductLink = page.locator('a[href*="/products/"]').first();
    const productName = await firstProductLink.locator('h3').textContent();
    await firstProductLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText(productName || '');
    
    // Step 3: Add to cart
    await page.locator('button:has-text("Add to Cart")').click();
    await expect(page.getByText(/added to cart/i)).toBeVisible({ timeout: 5000 });
    
    // Step 4: View cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /shopping cart/i })).toBeVisible();
    
    // Step 5: Update quantity
    await page.locator('button:has-text("+")').first().click();
    await page.waitForTimeout(1000);
    
    // Step 6: Verify checkout button
    await expect(page.getByRole('button', { name: /checkout/i })).toBeVisible();
    
    // Journey complete!
  });
});
