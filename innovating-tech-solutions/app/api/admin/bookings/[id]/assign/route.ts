import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { technicianId } = await request.json();
    const bookingId = params.id;

    if (!technicianId) {
      return NextResponse.json(
        { error: 'Technician ID is required' },
        { status: 400 }
      );
    }

    // Verify technician exists and is active
    const technician = await prisma.technician.findUnique({
      where: { id: technicianId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!technician) {
      return NextResponse.json(
        { error: 'Technician not found' },
        { status: 404 }
      );
    }

    if (!technician.active) {
      return NextResponse.json(
        { error: 'Technician is not active' },
        { status: 400 }
      );
    }

    // Update booking with technician assignment
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        technicianId,
        status: 'CONFIRMED',
      },
      include: {
        service: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        technician: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Create status history entry
    await prisma.bookingStatusHistory.create({
      data: {
        bookingId,
        status: 'CONFIRMED',
        notes: `Assigned to technician: ${technician.user.name}`,
      },
    });

    // Create notification for technician
    await prisma.notification.create({
      data: {
        userId: technician.userId,
        type: 'BOOKING_ASSIGNED',
        title: 'New Job Assigned',
        message: `You have been assigned to ${booking.service.name} on ${new Date(
          booking.scheduledDate
        ).toLocaleDateString()}`,
        link: `/technician/jobs/${bookingId}`,
      },
    });

    // TODO: Send email notification to technician
    // await sendEmail({
    //   to: technician.user.email,
    //   subject: 'New Job Assignment',
    //   ...
    // });

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('Error assigning technician:', error);
    return NextResponse.json(
      { error: 'Failed to assign technician' },
      { status: 500 }
    );
  }
}

