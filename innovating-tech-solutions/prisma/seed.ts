import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  // Note: Technician tables will be available after migration
  // await prisma.bookingStatusHistory.deleteMany();
  // await prisma.technicianAvailability.deleteMany();
  // await prisma.technicianSkill.deleteMany();
  // await prisma.technician.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.stockHistory.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@innovatingtech.co.za',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      name: 'John Doe',
      password: hashedPassword,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
    },
  });

  console.log('✅ Created 3 users');

  // Create Categories
  console.log('📁 Creating categories...');
  const phoneAccessories = await prisma.category.create({
    data: {
      name: 'Phone Accessories',
      slug: 'phone-accessories',
      description: 'Accessories for mobile phones',
    },
  });

  const phoneRepairParts = await prisma.category.create({
    data: {
      name: 'Phone Repair Parts',
      slug: 'phone-repair-parts',
      description: 'Parts for phone repairs',
    },
  });

  const computerAccessories = await prisma.category.create({
    data: {
      name: 'Computer Accessories',
      slug: 'computer-accessories',
      description: 'Accessories for computers',
    },
  });

  const securityEquipment = await prisma.category.create({
    data: {
      name: 'Security Equipment',
      slug: 'security-equipment',
      description: 'CCTV and security equipment',
    },
  });

  console.log('✅ Created 4 categories');

  // Create Products
  console.log('📦 Creating products...');
  
  // Phone Accessories
  await prisma.product.create({
    data: {
      name: 'Tempered Glass Screen Protector',
      slug: 'tempered-glass-screen-protector',
      description: 'Premium 9H hardness tempered glass screen protector. Protects your phone screen from scratches and drops.',
      price: 89.99,
      stock: 150,
      lowStockThreshold: 20,
      categoryId: phoneAccessories.id,
      images: ['/images/products/screen-protector.jpg'],
    },
  });

  await prisma.product.create({
    data: {
      name: 'Fast Charging Cable USB-C',
      slug: 'fast-charging-cable-usb-c',
      description: '2-meter USB-C fast charging cable. Supports up to 60W charging. Durable braided design.',
      price: 129.99,
      stock: 200,
      lowStockThreshold: 30,
      categoryId: phoneAccessories.id,
      images: ['/images/products/usb-c-cable.jpg'],
    },
  });

  await prisma.product.create({
    data: {
      name: 'Wireless Charging Pad',
      slug: 'wireless-charging-pad',
      description: '15W fast wireless charging pad. Compatible with all Qi-enabled devices. LED indicator.',
      price: 299.99,
      stock: 75,
      lowStockThreshold: 15,
      categoryId: phoneAccessories.id,
      images: ['/images/products/wireless-charger.jpg'],
    },
  });

  await prisma.product.create({
    data: {
      name: 'Phone Case - Shockproof',
      slug: 'phone-case-shockproof',
      description: 'Military-grade shockproof phone case. Available in multiple colors. Raised edges for screen protection.',
      price: 199.99,
      stock: 120,
      lowStockThreshold: 25,
      categoryId: phoneAccessories.id,
      images: ['/images/products/phone-case.jpg'],
    },
  });

  // Phone Repair Parts
  await prisma.product.create({
    data: {
      name: 'iPhone 12 LCD Screen',
      slug: 'iphone-12-lcd-screen',
      description: 'Original quality LCD screen replacement for iPhone 12. Includes digitizer and tools.',
      price: 1299.99,
      stock: 25,
      lowStockThreshold: 5,
      categoryId: phoneRepairParts.id,
      images: ['/images/products/iphone-lcd.jpg'],
    },
  });

  await prisma.product.create({
    data: {
      name: 'Samsung Galaxy S21 Battery',
      slug: 'samsung-galaxy-s21-battery',
      description: 'High-capacity replacement battery for Samsung Galaxy S21. 4000mAh. Includes installation tools.',
      price: 449.99,
      stock: 40,
      lowStockThreshold: 10,
      categoryId: phoneRepairParts.id,
      images: ['/images/products/samsung-battery.jpg'],
    },
  });

  await prisma.product.create({
    data: {
      name: 'Universal Charging Port Flex Cable',
      slug: 'universal-charging-port-flex-cable',
      description: 'Replacement charging port flex cable. Compatible with multiple phone models.',
      price: 179.99,
      stock: 60,
      lowStockThreshold: 15,
      categoryId: phoneRepairParts.id,
      images: ['/images/products/charging-port.jpg'],
    },
  });

  // Computer Accessories
  await prisma.product.create({
    data: {
      name: 'Wireless Mouse',
      slug: 'wireless-mouse',
      description: 'Ergonomic wireless mouse with adjustable DPI. 2.4GHz connection. Long battery life.',
      price: 249.99,
      stock: 90,
      lowStockThreshold: 20,
      categoryId: computerAccessories.id,
      images: ['/images/products/wireless-mouse.jpg'],
    },
  });

  await prisma.product.create({
    data: {
      name: 'Mechanical Keyboard RGB',
      slug: 'mechanical-keyboard-rgb',
      description: 'RGB backlit mechanical keyboard. Blue switches. Anti-ghosting. Perfect for gaming and typing.',
      price: 899.99,
      stock: 45,
      lowStockThreshold: 10,
      categoryId: computerAccessories.id,
      images: ['/images/products/keyboard.jpg'],
    },
  });

  await prisma.product.create({
    data: {
      name: 'USB Hub 7-Port',
      slug: 'usb-hub-7-port',
      description: '7-port USB 3.0 hub with individual power switches. High-speed data transfer.',
      price: 349.99,
      stock: 65,
      lowStockThreshold: 15,
      categoryId: computerAccessories.id,
      images: ['/images/products/usb-hub.jpg'],
    },
  });

  // Security Equipment
  await prisma.product.create({
    data: {
      name: 'HD CCTV Camera 1080p',
      slug: 'hd-cctv-camera-1080p',
      description: '1080p HD CCTV camera with night vision. Weatherproof. 30m IR range.',
      price: 1499.99,
      stock: 30,
      lowStockThreshold: 8,
      categoryId: securityEquipment.id,
      images: ['/images/products/cctv-camera.jpg'],
    },
  });

  await prisma.product.create({
    data: {
      name: 'DVR 8-Channel System',
      slug: 'dvr-8-channel-system',
      description: '8-channel DVR system. Supports up to 8 cameras. 1TB HDD included. Remote viewing via app.',
      price: 3999.99,
      stock: 15,
      lowStockThreshold: 5,
      categoryId: securityEquipment.id,
      images: ['/images/products/dvr-system.jpg'],
    },
  });

  await prisma.product.create({
    data: {
      name: 'CCTV Cable 100m Roll',
      slug: 'cctv-cable-100m-roll',
      description: '100-meter roll of CCTV cable. High-quality copper. Suitable for outdoor installation.',
      price: 899.99,
      stock: 50,
      lowStockThreshold: 10,
      categoryId: securityEquipment.id,
      images: ['/images/products/cctv-cable.jpg'],
    },
  });

  console.log('✅ Created 13 products');

  // Create Services
  console.log('🔧 Creating services...');
  
  await prisma.service.create({
    data: {
      name: 'Cellphone Screen Repair',
      slug: 'cellphone-screen-repair',
      description: 'Professional screen replacement for all phone models. We use original quality parts. Same-day service available.',
      basePrice: 599.99,
      duration: 60,
      callOut: false,
      active: true,
    },
  });

  await prisma.service.create({
    data: {
      name: 'Cellphone Battery Replacement',
      slug: 'cellphone-battery-replacement',
      description: 'Replace your old battery with a new high-capacity one. Extends phone life significantly.',
      basePrice: 399.99,
      duration: 45,
      callOut: false,
      active: true,
    },
  });

  await prisma.service.create({
    data: {
      name: 'Computer Maintenance & Cleaning',
      slug: 'computer-maintenance-cleaning',
      description: 'Complete computer maintenance service. Includes cleaning, virus removal, software updates, and optimization.',
      basePrice: 499.99,
      duration: 120,
      callOut: false,
      active: true,
    },
  });

  await prisma.service.create({
    data: {
      name: 'CCTV Camera Installation',
      slug: 'cctv-camera-installation',
      description: 'Professional CCTV camera installation. Includes mounting, wiring, and system configuration. We install up to 8 cameras.',
      basePrice: 2499.99,
      duration: 240,
      callOut: true,
      active: true,
    },
  });

  await prisma.service.create({
    data: {
      name: 'Website Development',
      slug: 'website-development',
      description: 'Custom website development for your business. Responsive design, SEO optimized, and mobile-friendly.',
      basePrice: 4999.99,
      duration: 480,
      callOut: false,
      active: true,
    },
  });

  await prisma.service.create({
    data: {
      name: 'Website Security & Maintenance',
      slug: 'website-security-maintenance',
      description: 'Monthly website security monitoring and maintenance. Includes SSL, backups, updates, and security scans.',
      basePrice: 799.99,
      duration: 60,
      callOut: false,
      active: true,
    },
  });

  await prisma.service.create({
    data: {
      name: 'Mobile Repair Call-Out Service',
      slug: 'mobile-repair-call-out-service',
      description: 'We come to you! On-site phone and computer repair service. Available anywhere in your area.',
      basePrice: 299.99,
      duration: 90,
      callOut: true,
      active: true,
    },
  });

  console.log('✅ Created 7 services');

  // Create Sample Orders
  console.log('🛍️ Creating sample orders...');
  
  const order1 = await prisma.order.create({
    data: {
      userId: customer1.id,
      orderNumber: 'ORD-2024-001',
      status: 'DELIVERED',
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      subtotal: 519.98,
      tax: 77.99,
      total: 597.97,
      shippingAddress: '123 Main Street, Johannesburg, 2000',
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { slug: 'tempered-glass-screen-protector' } }))!.id,
            quantity: 2,
            price: 89.99,
          },
          {
            productId: (await prisma.product.findFirst({ where: { slug: 'fast-charging-cable-usb-c' } }))!.id,
            quantity: 1,
            price: 129.99,
          },
          {
            productId: (await prisma.product.findFirst({ where: { slug: 'phone-case-shockproof' } }))!.id,
            quantity: 1,
            price: 199.99,
          },
        ],
      },
    },
  });

  // Create order status history for order1
  await prisma.orderStatusHistory.createMany({
    data: [
      {
        orderId: order1.id,
        status: 'PENDING',
        notes: 'Order created',
        createdAt: new Date('2024-02-10T10:00:00Z'),
      },
      {
        orderId: order1.id,
        status: 'CONFIRMED',
        notes: 'Payment confirmed',
        createdAt: new Date('2024-02-10T10:30:00Z'),
      },
      {
        orderId: order1.id,
        status: 'PROCESSING',
        notes: 'Order is being prepared',
        createdAt: new Date('2024-02-10T14:00:00Z'),
      },
      {
        orderId: order1.id,
        status: 'SHIPPED',
        notes: 'Order shipped via courier',
        createdAt: new Date('2024-02-11T09:00:00Z'),
      },
      {
        orderId: order1.id,
        status: 'DELIVERED',
        notes: 'Order delivered successfully',
        createdAt: new Date('2024-02-12T15:30:00Z'),
      },
    ],
  });

  const order2 = await prisma.order.create({
    data: {
      userId: customer2.id,
      orderNumber: 'ORD-2024-002',
      status: 'PROCESSING',
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      subtotal: 1749.98,
      tax: 262.49,
      total: 2012.47,
      shippingAddress: '456 Oak Avenue, Pretoria, 0001',
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { slug: 'wireless-charging-pad' } }))!.id,
            quantity: 1,
            price: 299.99,
          },
          {
            productId: (await prisma.product.findFirst({ where: { slug: 'iphone-12-lcd-screen' } }))!.id,
            quantity: 1,
            price: 1299.99,
          },
        ],
      },
    },
  });

  await prisma.orderStatusHistory.createMany({
    data: [
      {
        orderId: order2.id,
        status: 'PENDING',
        notes: 'Order created',
        createdAt: new Date('2024-02-15T11:00:00Z'),
      },
      {
        orderId: order2.id,
        status: 'CONFIRMED',
        notes: 'Payment confirmed',
        createdAt: new Date('2024-02-15T11:45:00Z'),
      },
      {
        orderId: order2.id,
        status: 'PROCESSING',
        notes: 'Order is being prepared',
        createdAt: new Date('2024-02-15T16:00:00Z'),
      },
    ],
  });

  const order3 = await prisma.order.create({
    data: {
      userId: customer1.id,
      orderNumber: 'ORD-2024-003',
      status: 'PENDING',
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      subtotal: 899.99,
      tax: 134.99,
      total: 1034.98,
      shippingAddress: '789 Pine Road, Cape Town, 8001',
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { slug: 'mechanical-keyboard-rgb' } }))!.id,
            quantity: 1,
            price: 899.99,
          },
        ],
      },
    },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId: order3.id,
      status: 'PENDING',
      notes: 'Order created',
    },
  });

  console.log('✅ Created 3 sample orders with status history');

  // Create Sample Bookings
  console.log('📅 Creating sample bookings...');
  
  await prisma.booking.create({
    data: {
      userId: customer1.id,
      serviceId: (await prisma.service.findFirst({ where: { slug: 'cellphone-screen-repair' } }))!.id,
      status: 'CONFIRMED',
      scheduledDate: new Date('2024-02-20T10:00:00Z'),
      location: '123 Main Street, Johannesburg',
      notes: 'iPhone 13 screen cracked',
      totalPrice: 599.99,
    },
  });

  await prisma.booking.create({
    data: {
      userId: customer2.id,
      serviceId: (await prisma.service.findFirst({ where: { slug: 'cctv-camera-installation' } }))!.id,
      status: 'PENDING',
      scheduledDate: new Date('2024-02-25T09:00:00Z'),
      location: '456 Oak Avenue, Pretoria',
      notes: 'Need 4 cameras installed around the property',
      totalPrice: 2499.99,
    },
  });

  await prisma.booking.create({
    data: {
      userId: customer1.id,
      serviceId: (await prisma.service.findFirst({ where: { slug: 'computer-maintenance-cleaning' } }))!.id,
      status: 'COMPLETED',
      scheduledDate: new Date('2024-02-05T14:00:00Z'),
      location: '123 Main Street, Johannesburg',
      notes: 'Laptop running slow, needs cleaning',
      totalPrice: 499.99,
    },
  });

  console.log('✅ Created 3 sample bookings');

  // Create Sample Reviews
  console.log('⭐ Creating sample reviews...');
  
  const screenProtector = await prisma.product.findFirst({ where: { slug: 'tempered-glass-screen-protector' } });
  const usbCable = await prisma.product.findFirst({ where: { slug: 'fast-charging-cable-usb-c' } });
  const phoneCase = await prisma.product.findFirst({ where: { slug: 'phone-case-shockproof' } });

  if (screenProtector) {
    await prisma.review.create({
      data: {
        userId: customer1.id,
        productId: screenProtector.id,
        rating: 5,
        comment: 'Excellent quality! Fits perfectly and very easy to install. Highly recommended!',
      },
    });
  }

  if (usbCable) {
    await prisma.review.create({
      data: {
        userId: customer2.id,
        productId: usbCable.id,
        rating: 4,
        comment: 'Good cable, charges fast. The braided design is durable. Would buy again.',
      },
    });
  }

  if (phoneCase) {
    await prisma.review.create({
      data: {
        userId: customer1.id,
        productId: phoneCase.id,
        rating: 5,
        comment: 'Best phone case I\'ve ever had! Dropped my phone twice and no damage at all.',
      },
    });
  }

  console.log('✅ Created 3 sample reviews');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log('   - 3 users created');
  console.log('   - 4 categories created');
  console.log('   - 13 products created');
  console.log('   - 7 services created');
  console.log('   - 3 orders created with status history');
  console.log('   - 3 bookings created');
  console.log('   - 3 reviews created');
  console.log('\n🔐 Test Credentials:');
  console.log('   Admin: admin@innovatingtech.co.za / password123');
  console.log('   Customer 1: customer@example.com / password123');
  console.log('   Customer 2: jane@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
