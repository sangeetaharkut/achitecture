/**
 * Prisma Database Seed Script
 * Populates database with dummy product data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life',
    price: 129.99,
    category: 'electronics',
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
  },
  {
    name: 'Smart Watch Pro',
    description: 'Fitness tracker with heart rate monitor and GPS',
    price: 249.99,
    category: 'electronics',
    stock: 32,
  },
  {
    name: 'Laptop Stand Aluminum',
    description: 'Ergonomic adjustable laptop stand for better posture',
    price: 39.99,
    category: 'electronics',
    stock: 120,
  },
  {
    name: 'USB-C Hub 7-in-1',
    description: 'Multi-port USB-C adapter with HDMI, USB 3.0, and card reader',
    price: 49.99,
    category: 'electronics',
    stock: 85,
  },
  {
    name: 'Mechanical Keyboard RGB',
    description: 'Gaming keyboard with customizable RGB lighting and tactile switches',
    price: 89.99,
    category: 'electronics',
    stock: 28,
  },
  {
    name: 'Wireless Mouse Ergonomic',
    description: 'Rechargeable wireless mouse with ergonomic design',
    price: 34.99,
    category: 'electronics',
    stock: 95,
  },
  {
    name: 'Cotton T-Shirt Classic',
    description: '100% organic cotton t-shirt, available in multiple colors',
    price: 24.99,
    category: 'clothing',
    stock: 200,
  },
  {
    name: 'Denim Jeans Slim Fit',
    description: 'Premium denim jeans with stretch fabric for comfort',
    price: 59.99,
    category: 'clothing',
    stock: 78,
  },
  {
    name: 'Running Shoes Athletic',
    description: 'Lightweight running shoes with breathable mesh upper',
    price: 79.99,
    category: 'clothing',
    stock: 64,
  },
  {
    name: 'Hoodie Pullover Fleece',
    description: 'Cozy fleece hoodie perfect for casual wear',
    price: 44.99,
    category: 'clothing',
    stock: 112,
  },
  {
    name: 'Baseball Cap Cotton',
    description: 'Adjustable cotton baseball cap with embroidered logo',
    price: 19.99,
    category: 'clothing',
    stock: 156,
  },
  {
    name: 'Backpack Travel 40L',
    description: 'Durable travel backpack with laptop compartment',
    price: 69.99,
    category: 'clothing',
    stock: 43,
  },
  {
    name: 'The Midnight Library',
    description: 'Bestselling fiction novel about infinite possibilities',
    price: 16.99,
    category: 'books',
    stock: 87,
  },
  {
    name: 'Atomic Habits',
    description: 'Learn how to build good habits and break bad ones',
    price: 14.99,
    category: 'books',
    stock: 134,
  },
  {
    name: 'The Psychology of Money',
    description: 'Timeless lessons on wealth, greed, and happiness',
    price: 18.99,
    category: 'books',
    stock: 92,
  },
  {
    name: 'Project Hail Mary',
    description: 'Science fiction adventure from the author of The Martian',
    price: 15.99,
    category: 'books',
    stock: 68,
  },
  {
    name: 'Educated: A Memoir',
    description: 'Powerful memoir about education and family',
    price: 13.99,
    category: 'books',
    stock: 105,
  },
  {
    name: 'Coffee Table Book: Architecture',
    description: 'Stunning photography of modern architecture worldwide',
    price: 39.99,
    category: 'books',
    stock: 34,
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated 32oz water bottle keeps drinks cold for 24 hours',
    price: 29.99,
    category: 'home',
    stock: 142,
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Extra thick yoga mat with carrying strap',
    price: 34.99,
    category: 'home',
    stock: 76,
  },
  {
    name: 'LED Desk Lamp Adjustable',
    description: 'USB rechargeable desk lamp with touch controls',
    price: 27.99,
    category: 'home',
    stock: 98,
  },
  {
    name: 'Air Purifier HEPA Filter',
    description: 'Compact air purifier for rooms up to 300 sq ft',
    price: 89.99,
    category: 'home',
    stock: 42,
  },
  {
    name: 'Plant Pot Set Ceramic',
    description: 'Set of 3 ceramic plant pots with drainage holes',
    price: 24.99,
    category: 'home',
    stock: 87,
  },
  {
    name: 'Throw Blanket Cozy',
    description: 'Ultra-soft fleece throw blanket 50x60 inches',
    price: 32.99,
    category: 'home',
    stock: 115,
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing products (optional)
  await prisma.product.deleteMany();
  console.log('🗑️  Cleared existing products');

  // Insert dummy products
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`✅ Seeded ${products.length} products`);
  
  // Display some stats
  const count = await prisma.product.count();
  const categories = await prisma.product.groupBy({
    by: ['category'],
    _count: true,
  });

  console.log(`\n📊 Database Stats:`);
  console.log(`   Total products: ${count}`);
  console.log(`   Categories:`);
  categories.forEach(cat => {
    console.log(`     - ${cat.category}: ${cat._count} products`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
