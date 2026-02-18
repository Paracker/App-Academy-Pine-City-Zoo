import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default async function TechnicianDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'TECHNICIAN') {
    redirect('/auth/signin');
  }

  // Get technician profile
  const technician = await prisma.technician.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      bookings: {
        include: {
          service: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          scheduledDate: 'asc',
        },
      },
    },
  });

  if (!technician) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Technician profile not found. Please contact an administrator.
        </div>
      </div>
    );
  }

  const pendingBookings = technician.bookings.filter((b) => b.status === 'PENDING');
  const confirmedBookings = technician.bookings.filter((b) => b.status === 'CONFIRMED');
  const inProgressBookings = technician.bookings.filter((b) => b.status === 'IN_PROGRESS');
  const completedBookings = technician.bookings.filter((b) => b.status === 'COMPLETED');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Technician Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {session.user.name}!</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm">Pending</div>
              <div className="text-3xl font-bold mt-2">{pendingBookings.length}</div>
            </div>
            <AlertCircle className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm">Confirmed</div>
              <div className="text-3xl font-bold mt-2">{confirmedBookings.length}</div>
            </div>
            <Calendar className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm">In Progress</div>
              <div className="text-3xl font-bold mt-2">{inProgressBookings.length}</div>
            </div>
            <Clock className="w-10 h-10 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm">Completed</div>
              <div className="text-3xl font-bold mt-2">{completedBookings.length}</div>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600">Rating</div>
            <div className="text-2xl font-bold text-yellow-500">
              ⭐ {technician.rating.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Jobs</div>
            <div className="text-2xl font-bold">{technician.totalJobs}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Specializations</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {technician.specialization.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Jobs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Assigned Jobs</h2>
        </div>
        
        {technician.bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium">No jobs assigned yet</p>
            <p className="text-sm mt-2">Check back later for new assignments</p>
          </div>
        ) : (
          <div className="divide-y">
            {technician.bookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{booking.service.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Customer: {booking.user.name || booking.user.email}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(booking.scheduledDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {booking.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {booking.location}
                    </div>
                  )}
                </div>

                {booking.address && (
                  <div className="mt-3 text-sm text-gray-600">
                    <strong>Address:</strong> {booking.address}
                  </div>
                )}

                {booking.notes && (
                  <div className="mt-3 text-sm text-gray-600">
                    <strong>Notes:</strong> {booking.notes}
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <Link
                    href={`/technician/jobs/${booking.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    View Details
                  </Link>
                  {booking.status === 'CONFIRMED' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
                      Start Job
                    </button>
                  )}
                  {booking.status === 'IN_PROGRESS' && (
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
                      Complete Job
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

