'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Wrench, ShoppingBag, Users, ArrowLeft } from 'lucide-react';

interface Stats {
  products: number;
  services: number;
  orders: number;
  bookings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    services: 0,
    orders: 0,
    bookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [products, services, orders, bookings] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/services').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/bookings').then(r => r.json()),
      ]);

      setStats({
        products: products.length || 0,
        services: services.length || 0,
        orders: orders.length || 0,
        bookings: bookings.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Products',
      value: stats.products,
      icon: <Package className="w-8 h-8" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Services',
      value: stats.services,
      icon: <Wrench className="w-8 h-8" />,
      color: 'bg-green-500',
    },
    {
      title: 'Orders',
      value: stats.orders,
      icon: <ShoppingBag className="w-8 h-8" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Bookings',
      value: stats.bookings,
      icon: <Users className="w-8 h-8" />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Link href="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Site</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} text-white p-3 rounded-lg`}>
                  {card.icon}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{loading ? '...' : card.value}</div>
                  <div className="text-gray-600 text-sm">{card.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-lg transition text-left">
              <Package className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="font-bold text-lg mb-2">Add Product</h3>
              <p className="text-gray-600 text-sm">Add new products to your catalog</p>
            </button>
            <button className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-lg transition text-left">
              <Wrench className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="font-bold text-lg mb-2">Manage Services</h3>
              <p className="text-gray-600 text-sm">Update service offerings and pricing</p>
            </button>
            <button className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-lg transition text-left">
              <ShoppingBag className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="font-bold text-lg mb-2">View Orders</h3>
              <p className="text-gray-600 text-sm">Manage customer orders and shipments</p>
            </button>
            <button className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-lg transition text-left">
              <Users className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="font-bold text-lg mb-2">View Bookings</h3>
              <p className="text-gray-600 text-sm">Manage service bookings and appointments</p>
            </button>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">🚀 Setup Instructions</h2>
          <div className="space-y-4 text-blue-900">
            <div>
              <h3 className="font-bold mb-2">1. Database Setup</h3>
              <p className="text-sm mb-2">Configure your PostgreSQL database and run migrations:</p>
              <code className="block bg-white p-3 rounded text-sm">
                npx prisma migrate dev --name init
              </code>
            </div>
            <div>
              <h3 className="font-bold mb-2">2. Environment Variables</h3>
              <p className="text-sm">Copy <code>.env.example</code> to <code>.env</code> and fill in your credentials</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">3. Seed Data (Optional)</h3>
              <p className="text-sm">Add initial products and services through the API or database</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

