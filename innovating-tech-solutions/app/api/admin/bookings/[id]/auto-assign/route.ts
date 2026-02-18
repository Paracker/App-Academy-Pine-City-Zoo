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

    const bookingId = params.id;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.technicianId) {
      return NextResponse.json(
        { error: 'Booking already has a technician assigned' },
        { status: 400 }
      );
    }

    // Get the day of week for the booking
    const bookingDate = new Date(booking.scheduledDate);
    const dayOfWeek = bookingDate.getDay();

    // Find available technicians
    // 1. Active technicians
    // 2. With matching specialization (based on service name)
    // 3. Available on the booking day
    // 4. Not overbooked on that day
    const technicians = await prisma.technician.findMany({
      where: {
        active: true,
        specialization: {
          hasSome: [booking.service.name], // Match service name with specialization
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        availability: {
          where: {
            dayOfWeek,
            available: true,
          },
        },
        bookings: {
          where: {
            scheduledDate: {
              gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
              lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
            },
            status: {
              in: ['CONFIRMED', 'IN_PROGRESS'],
            },
          },
        },
      },
    });

    // Filter technicians who are available on this day
    const availableTechnicians = technicians.filter(
      (tech) => tech.availability.length > 0
    );

    if (availableTechnicians.length === 0) {
      return NextResponse.json(
        { error: 'No available technicians found for this service and time' },
        { status: 404 }
      );
    }

    // Score technicians based on:
    // 1. Number of bookings on that day (lower is better)
    // 2. Overall rating (higher is better)
    // 3. Total jobs completed (higher is better for experience)
    const scoredTechnicians = availableTechnicians.map((tech) => {
      const bookingsOnDay = tech.bookings.length;
      const workloadScore = Math.max(0, 10 - bookingsOnDay * 2); // Penalize overbooked technicians
      const ratingScore = tech.rating * 2; // Rating out of 5, multiply by 2 for weight
      const experienceScore = Math.min(tech.totalJobs / 10, 5); // Cap at 5 points

      const totalScore = workloadScore + ratingScore + experienceScore;

      return {
        ...tech,
        score: totalScore,
        bookingsOnDay,
      };
    });

    // Sort by score (highest first)
    scoredTechnicians.sort((a, b) => b.score - a.score);

    // Select the best technician
    const bestTechnician = scoredTechnicians[0];

    // Assign the technician
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        technicianId: bestTechnician.id,
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
        notes: `Auto-assigned to technician: ${bestTechnician.user.name} (Score: ${bestTechnician.score.toFixed(
          1
        )})`,
      },
    });

    // Create notification for technician
    await prisma.notification.create({
      data: {
        userId: bestTechnician.userId,
        type: 'BOOKING_ASSIGNED',
        title: 'New Job Assigned',
        message: `You have been auto-assigned to ${booking.service.name} on ${new Date(
          booking.scheduledDate
        ).toLocaleDateString()}`,
        link: `/technician/jobs/${bookingId}`,
      },
    });

    return NextResponse.json({
      booking: updatedBooking,
      assignmentDetails: {
        technicianName: bestTechnician.user.name,
        score: bestTechnician.score,
        bookingsOnDay: bestTechnician.bookingsOnDay,
        rating: bestTechnician.rating,
        totalJobs: bestTechnician.totalJobs,
      },
    });
  } catch (error: any) {
    console.error('Error auto-assigning technician:', error);
    return NextResponse.json(
      { error: 'Failed to auto-assign technician' },
      { status: 500 }
    );
  }
}

