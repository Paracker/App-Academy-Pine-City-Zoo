import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, phone, bio, specialization, certifications } = body;

    // Validate required fields
    if (!name || !email || !password || !specialization || specialization.length === 0) {
      return NextResponse.json(
        { error: 'Name, email, password, and at least one specialization are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and technician in a transaction
    const technician = await prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'TECHNICIAN',
        },
      });

      // Create technician profile
      const newTechnician = await tx.technician.create({
        data: {
          userId: user.id,
          phone: phone || null,
          bio: bio || null,
          specialization,
          certifications: certifications || [],
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      return newTechnician;
    });

    return NextResponse.json(technician, { status: 201 });
  } catch (error: any) {
    console.error('Error creating technician:', error);
    return NextResponse.json(
      { error: 'Failed to create technician' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const technicians = await prisma.technician.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        skills: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(technicians);
  } catch (error: any) {
    console.error('Error fetching technicians:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technicians' },
      { status: 500 }
    );
  }
}

