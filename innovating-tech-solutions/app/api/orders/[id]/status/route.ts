import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, notes } = body;

    // Update order status
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create status history entry
    await prisma.orderStatusHistory.create({
      data: {
        orderId: params.id,
        status,
        notes: notes || `Status updated to ${status}`,
      },
    });

    // Send status update email to customer
    if (order.user.email) {
      const emailContent = emailTemplates.orderStatusUpdate(
        order.orderNumber,
        status,
        notes
      );
      await sendEmail({
        to: order.user.email,
        ...emailContent,
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

