"use client";

import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function FloatingCartIcon() {
  const { cartCount } = useCart();

  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Link href="/cart">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative w-16 h-16 bg-[#8B4513] rounded-full shadow-xl flex items-center justify-center cursor-pointer border-4 border-[#CD853F]/20"
            >
              <svg className="w-7 h-7 text-[#FFF8F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H21M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-[#CD853F] text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
