import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items, paymentMethod, shippingAddress, notes } = body;

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.15; // 15% VAT
    const total = subtotal + tax;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber: generateOrderNumber(),
        status: 'PENDING',
        paymentMethod,
        paymentStatus: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING',
        subtotal,
        tax,
        total,
        shippingAddress,
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        statusHistory: {
          create: {
            status: 'PENDING',
            notes: 'Order created',
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update stock and create stock history for each item
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      await prisma.stockHistory.create({
        data: {
          productId: item.id,
          quantity: -item.quantity,
          reason: 'Order',
          reference: order.id,
        },
      });

      // Check for low stock
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (product && product.stock <= product.lowStockThreshold) {
        // Send low stock alert (to admin email)
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        if (adminEmail) {
          const emailContent = emailTemplates.lowStockAlert(
            product.name,
            product.stock,
            product.lowStockThreshold
          );
          await sendEmail({
            to: adminEmail,
            ...emailContent,
          });
        }
      }
    }

    // Send order confirmation email
    if (order.user.email) {
      const emailContent = emailTemplates.orderConfirmation(
        order.orderNumber,
        order.total,
        order.items
      );
      await sendEmail({
        to: order.user.email,
        ...emailContent,
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const where = userId ? { userId } : {};

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
