'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH_ON_DELIVERY'>('CARD');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const tax = total * 0.15; // 15% VAT
  const grandTotal = total + tax;

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setLoading(true);
    try {
      // For demo purposes, using a mock user ID
      // In production, this would come from authentication
      const userId = 'demo-user-id';

      // Create order first
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          paymentMethod,
          shippingAddress: 'Alberton, Gauteng', // Would be from a form in production
        }),
      });

      if (!orderResponse.ok) {
        alert('Failed to create order. Please try again.');
        setLoading(false);
        return;
      }

      const order = await orderResponse.json();

      // If payment method is card, redirect to Stripe
      if (paymentMethod === 'CARD') {
        const checkoutResponse = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: items.map(item => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            orderId: order.id,
            userId,
          }),
        });

        if (checkoutResponse.ok) {
          const { url } = await checkoutResponse.json();
          // Redirect to Stripe checkout
          window.location.href = url;
        } else {
          alert('Failed to initialize payment. Please try again.');
        }
      } else {
        // Cash on delivery - just confirm
        clearCart();
        alert(`Order ${order.orderNumber} placed successfully! Total: R${grandTotal.toFixed(2)}\n\nPayment method: Cash on Delivery`);
        router.push('/');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/shop" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Continue Shopping</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <Link href="/shop" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-6 flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      '📦'
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <p className="text-primary-600 font-semibold text-lg">
                      R{item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-200 rounded-l-lg transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-200 rounded-r-lg transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 sticky top-4">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">R{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT (15%)</span>
                    <span className="font-semibold">R{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">R{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3">Payment Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition">
                      <input
                        type="radio"
                        name="payment"
                        value="CARD"
                        checked={paymentMethod === 'CARD'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'CARD')}
                        className="w-4 h-4"
                      />
                      <span>💳 Card Payment (Stripe)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition">
                      <input
                        type="radio"
                        name="payment"
                        value="CASH_ON_DELIVERY"
                        checked={paymentMethod === 'CASH_ON_DELIVERY'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'CASH_ON_DELIVERY')}
                        className="w-4 h-4"
                      />
                      <span>💵 Cash on Delivery</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-4 rounded-lg hover:bg-primary-700 transition font-semibold text-lg disabled:bg-gray-400"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
