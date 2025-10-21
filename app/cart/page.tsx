"use client";

import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
  const { cart, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#F5E6D3] pt-24">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto bg-[#8B4513]/10 rounded-full flex items-center justify-center mb-8">
              <svg className="w-12 h-12 text-[#8B4513]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H21M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#8B4513] mb-4">Your cart is empty</h1>
            <p className="text-[#A0522D] mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link 
              href="/catalog"
              className="inline-flex items-center gap-2 bg-[#8B4513] text-[#FFF8F0] px-8 py-3 rounded-full hover:bg-[#A0522D] transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#F5E6D3] pt-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-[#8B4513] mb-8">Shopping Cart</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.selectedColor}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#8B4513] text-lg">{item.name}</h3>
                      <p className="text-[#A0522D] text-sm">Color: {item.selectedColor}</p>
                      <p className="text-[#8B4513] font-bold text-lg">${item.price.toFixed(2)}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.selectedColor, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-white/80 border border-[#DEB887] flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <svg className="w-4 h-4 text-[#8B4513]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-lg font-medium text-[#8B4513] min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.selectedColor, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-white/80 border border-[#DEB887] flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <svg className="w-4 h-4 text-[#8B4513]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.productId, item.selectedColor)}
                      className="p-2 text-red-600 hover:text-red-700 transition-colors"
                      aria-label="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 sticky top-24"
              >
                <h2 className="text-xl font-bold text-[#8B4513] mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#A0522D]">
                    <span>Subtotal ({cartCount} items)</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#A0522D]">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <hr className="border-[#DEB887]" />
                  <div className="flex justify-between text-xl font-bold text-[#8B4513]">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button className="w-full bg-[#8B4513] text-[#FFF8F0] py-3 px-6 rounded-full hover:bg-[#A0522D] transition-all duration-300 font-medium shadow-lg hover:shadow-xl mb-4">
                  Proceed to Checkout
                </button>

                <button 
                  onClick={clearCart}
                  className="w-full bg-white/80 text-[#8B4513] py-2 px-4 rounded-full hover:bg-white transition-all duration-300 font-medium border-2 border-[#8B4513]"
                >
                  Clear Cart
                </button>

                <Link 
                  href="/catalog"
                  className="block w-full text-center text-[#8B4513] hover:text-[#A0522D] transition-colors mt-4"
                >
                  Continue Shopping
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
