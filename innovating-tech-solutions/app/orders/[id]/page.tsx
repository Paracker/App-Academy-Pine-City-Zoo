'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, CheckCircle, Clock, Truck, Home } from 'lucide-react';

interface OrderStatusHistoryItem {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress: string | null;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      description: string | null;
    };
  }[];
  statusHistory: OrderStatusHistoryItem[];
}

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: Home,
  CANCELLED: Clock,
};

const statusColors: Record<string, string> = {
  PENDING: 'text-yellow-600 bg-yellow-100',
  CONFIRMED: 'text-blue-600 bg-blue-100',
  PROCESSING: 'text-purple-600 bg-purple-100',
  SHIPPED: 'text-indigo-600 bg-indigo-100',
  DELIVERED: 'text-green-600 bg-green-100',
  CANCELLED: 'text-red-600 bg-red-100',
};

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [params.id]);

  const fetchOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 font-semibold">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[order.status] || Clock;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order {order.orderNumber}</h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusColors[order.status]}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-semibold">{order.status}</span>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.statusHistory.map((history, index) => {
                const HistoryIcon = statusIcons[history.status] || Clock;
                return (
                  <div key={history.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${statusColors[history.status]}`}>
                        <HistoryIcon className="w-5 h-5" />
                      </div>
                      {index < order.statusHistory.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-300 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{history.status}</p>
                          {history.notes && (
                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(history.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">{item.product.name}</p>
                  {item.product.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.product.description}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">R{(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">R{item.price.toFixed(2)} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>R{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (15% VAT):</span>
              <span>R{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total:</span>
              <span>R{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment & Shipping Info */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-bold mb-4">Payment Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-semibold">{order.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <p className="text-gray-600">
              {order.shippingAddress || 'No shipping address provided'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

