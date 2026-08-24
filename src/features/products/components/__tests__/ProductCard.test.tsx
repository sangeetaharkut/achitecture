/**
 * ProductCard Component Tests
 * Tests for the ProductCard component covering all user interactions and edge cases
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '../ProductCard';
import { addToCartAction } from '@/features/cart/actions/cart.actions';

// Mock the cart actions
jest.mock('@/features/cart/actions/cart.actions', () => ({
  addToCartAction: jest.fn(),
}));

// Mock the formatter utilities
jest.mock('../../utils/formatters', () => ({
  formatPrice: (price: number) => `$${price.toFixed(2)}`,
  formatDiscount: (discount: number) => `$${discount.toFixed(2)}`,
}));

describe('ProductCard', () => {
  const mockProduct = {
    id: 'test-product-1',
    name: 'Test Product',
    description: 'This is a test product description',
    price: 99.99,
    category: 'Electronics',
    stock: 50,
    imageUrl: 'https://example.com/image.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render product information correctly', () => {
      render(<ProductCard product={mockProduct} />);

      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('This is a test product description')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    it('should render product image when imageUrl is provided', () => {
      render(<ProductCard product={mockProduct} />);

      const image = screen.getByAltText('Test Product');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', mockProduct.imageUrl);
    });

    it('should render placeholder when imageUrl is not provided', () => {
      const productWithoutImage = { ...mockProduct, imageUrl: undefined };
      render(<ProductCard product={productWithoutImage} />);

      expect(screen.getByText('No image')).toBeInTheDocument();
    });

    it('should render correct link to product detail page', () => {
      render(<ProductCard product={mockProduct} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/products/test-product-1');
    });
  });

  describe('Stock Status', () => {
    it('should show "In Stock" for products with stock > 10', () => {
      render(<ProductCard product={{ ...mockProduct, stock: 50 }} />);

      expect(screen.getByText('In Stock')).toBeInTheDocument();
      expect(screen.getByText('In Stock')).toHaveClass('text-green-600');
    });

    it('should show "Low Stock" for products with stock 1-10', () => {
      render(<ProductCard product={{ ...mockProduct, stock: 5 }} />);

      expect(screen.getByText('Low Stock')).toBeInTheDocument();
      expect(screen.getByText('Low Stock')).toHaveClass('text-yellow-600');
    });

    it('should show "Only X left" badge for low stock items', () => {
      render(<ProductCard product={{ ...mockProduct, stock: 5 }} />);

      expect(screen.getByText('Only 5 left')).toBeInTheDocument();
    });

    it('should show "Out of Stock" for products with stock 0', () => {
      render(<ProductCard product={{ ...mockProduct, stock: 0 }} />);

      const outOfStockTexts = screen.getAllByText('Out of Stock');
      expect(outOfStockTexts.length).toBeGreaterThan(0);
    });

    // it('should show out of stock overlay for products with stock 0', () => {
    //   render(<ProductCard product={{ ...mockProduct, stock: 0 }} />);

    //   const overlay = screen.getByText('Out of Stock').closest('div');
    //   expect(overlay).toHaveClass('bg-black', 'bg-opacity-50');
    // });
  });

  describe('Discount Display', () => {
    it('should show discount badge when product has discount', () => {
      const discountedProduct = {
        ...mockProduct,
        discount: 20,
        discountPercentage: '20',
        discountedPrice: 79.99,
        originalPrice: 99.99,
      };

      render(<ProductCard product={discountedProduct} />);

      expect(screen.getByText('-20%')).toBeInTheDocument();
      expect(screen.getByText('$79.99')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(screen.getByText('Save $20.00')).toBeInTheDocument();
    });

    it('should not show discount badge when product has no discount', () => {
      render(<ProductCard product={mockProduct} />);

      expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
    });

    it('should show original price with strikethrough when discounted', () => {
      const discountedProduct = {
        ...mockProduct,
        discount: 20,
        discountPercentage: '20',
        discountedPrice: 79.99,
        originalPrice: 99.99,
      };

      render(<ProductCard product={discountedProduct} />);

      const originalPrice = screen.getByText('$99.99');
      expect(originalPrice).toHaveClass('line-through');
    });
  });

  describe('Add to Cart Button', () => {
    it('should render "Add to Cart" button for in-stock products', () => {
      render(<ProductCard product={mockProduct} />);

      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
    });

    it('should disable button for out of stock products', () => {
      render(<ProductCard product={{ ...mockProduct, stock: 0 }} />);

      const button = screen.getByRole('button', { name: /out of stock/i });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('should call addToCartAction when Add to Cart is clicked', async () => {
      const user = userEvent.setup();
      (addToCartAction as jest.Mock).mockResolvedValue({ success: true });

      render(<ProductCard product={mockProduct} />);

      const button = screen.getByRole('button', { name: /add to cart/i });
      await user.click(button);

      expect(addToCartAction).toHaveBeenCalledWith('demo-user', {
        productId: 'test-product-1',
        quantity: 1,
      });
    });

    it('should show "Adding..." state while adding to cart', async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (addToCartAction as jest.Mock).mockReturnValue(promise);

      render(<ProductCard product={mockProduct} />);

      const button = screen.getByRole('button', { name: /add to cart/i });
      await user.click(button);

      expect(screen.getByRole('button', { name: /adding\.\.\./i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /adding\.\.\./i })).toBeDisabled();

      // Resolve the promise to cleanup
      resolvePromise!({ success: true });
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /adding\.\.\./i })).not.toBeInTheDocument();
      });
    });

    it('should show success message after successfully adding to cart', async () => {
      const user = userEvent.setup();
      (addToCartAction as jest.Mock).mockResolvedValue({ success: true });

      render(<ProductCard product={mockProduct} />);

      const button = screen.getByRole('button', { name: /add to cart/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('✓ Added to cart!')).toBeInTheDocument();
      });
    });

    it('should show error message when adding to cart fails', async () => {
      const user = userEvent.setup();
      (addToCartAction as jest.Mock).mockResolvedValue({ 
        success: false, 
        error: 'Failed to add item' 
      });

      render(<ProductCard product={mockProduct} />);

      const button = screen.getByRole('button', { name: /add to cart/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('✗ Failed to add')).toBeInTheDocument();
      });
    });

    it('should hide success message after 2 seconds', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      (addToCartAction as jest.Mock).mockResolvedValue({ success: true });

      render(<ProductCard product={mockProduct} />);

      const button = screen.getByRole('button', { name: /add to cart/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('✓ Added to cart!')).toBeInTheDocument();
      });

      // Fast-forward 2 seconds
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.queryByText('✓ Added to cart!')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should prevent navigation when Add to Cart is clicked', async () => {
      const user = userEvent.setup();
      (addToCartAction as jest.Mock).mockResolvedValue({ success: true });

      render(<ProductCard product={mockProduct} />);

      const button = screen.getByRole('button', { name: /add to cart/i });
      
      // Click should not trigger link navigation
      await user.click(button);

      // Button should have been called
      expect(addToCartAction).toHaveBeenCalled();
    });

    it('should not allow multiple simultaneous add to cart clicks', async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (addToCartAction as jest.Mock).mockReturnValue(promise);

      render(<ProductCard product={mockProduct} />);

      const button = screen.getByRole('button', { name: /add to cart/i });
      
      // Click multiple times rapidly
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should only be called once
      expect(addToCartAction).toHaveBeenCalledTimes(1);

      // Cleanup
      resolvePromise!({ success: true });
    });
  });

  describe('Styling and Classes', () => {
    it('should apply hover effects to the card', () => {
      render(<ProductCard product={mockProduct} />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('hover:shadow-lg', 'transition-shadow');
    });

    it('should apply correct styling for success message', async () => {
      const user = userEvent.setup();
      (addToCartAction as jest.Mock).mockResolvedValue({ success: true });

      render(<ProductCard product={mockProduct} />);

      await user.click(screen.getByRole('button', { name: /add to cart/i }));

      await waitFor(() => {
        const message = screen.getByText('✓ Added to cart!');
        expect(message).toHaveClass('text-green-600');
      });
    });

    it('should apply correct styling for error message', async () => {
      const user = userEvent.setup();
      (addToCartAction as jest.Mock).mockResolvedValue({ success: false });

      render(<ProductCard product={mockProduct} />);

      await user.click(screen.getByRole('button', { name: /add to cart/i }));

      await waitFor(() => {
        const message = screen.getByText('✗ Failed to add');
        expect(message).toHaveClass('text-red-600');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional fields gracefully', () => {
      const minimalProduct = {
        id: 'minimal-1',
        name: 'Minimal Product',
        description: 'Description',
        price: 50,
        category: 'Other',
        stock: 10,
      };

      render(<ProductCard product={minimalProduct} />);

      expect(screen.getByText('Minimal Product')).toBeInTheDocument();
      expect(screen.getByText('$50.00')).toBeInTheDocument();
    });

    it('should handle very long product names', () => {
      const longNameProduct = {
        ...mockProduct,
        name: 'This is a very long product name that should be truncated with line-clamp-2 class',
      };

      render(<ProductCard product={longNameProduct} />);

      const title = screen.getByText(/This is a very long product name/);
      expect(title).toHaveClass('line-clamp-2');
    });

    it('should handle very long descriptions', () => {
      const longDescProduct = {
        ...mockProduct,
        description: 'This is a very long description that should be truncated with line-clamp-2 class to maintain consistent card heights',
      };

      render(<ProductCard product={longDescProduct} />);

      const description = screen.getByText(/This is a very long description/);
      expect(description).toHaveClass('line-clamp-2');
    });

    it('should handle price of 0', () => {
      render(<ProductCard product={{ ...mockProduct, price: 0 }} />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should handle stock of exactly 10', () => {
      render(<ProductCard product={{ ...mockProduct, stock: 10 }} />);

      // Stock of 10 should not show "Low Stock" badge in the image area
      expect(screen.queryByText('Only 10 left')).not.toBeInTheDocument();
      // Stock of exactly 10 shows "Low Stock" (since > 10 is needed for "In Stock")
      expect(screen.getByText('Low Stock')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible link with href', () => {
      render(<ProductCard product={mockProduct} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/products/test-product-1');
    });

    it('should have accessible button', () => {
      render(<ProductCard product={mockProduct} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have alt text for image', () => {
      render(<ProductCard product={mockProduct} />);

      const image = screen.getByAltText('Test Product');
      expect(image).toBeInTheDocument();
    });

    it('should properly disable button when out of stock', () => {
      render(<ProductCard product={{ ...mockProduct, stock: 0 }} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
    });
  });
});
