import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, serviceId, scheduledDate, location, address, notes } = body;

    // Get service to calculate price
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId,
        scheduledDate: new Date(scheduledDate),
        location,
        address,
        notes,
        totalPrice: service.basePrice,
        status: 'PENDING',
      },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Send booking confirmation email
    if (booking.user.email) {
      const emailContent = emailTemplates.bookingConfirmation(
        booking.service.name,
        booking.scheduledDate,
        booking.location || 'N/A',
        booking.totalPrice
      );
      await sendEmail({
        to: booking.user.email,
        ...emailContent,
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const where = userId ? { userId } : {};

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
