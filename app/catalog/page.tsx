"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useProductsQuery } from "@/hooks/useProductsQuery";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import Pagination from "@/components/Pagination";

export default function Catalog() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const { data, isLoading: loading, error: queryError } = useProductsQuery(currentPage, 12, debouncedSearch);
  const products = data?.products || [];
  const pagination = data?.pagination || null;
  const error = queryError ? "Failed to load products" : null;

  // Debounced search handler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of products
    document.getElementById('products-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const handleProductClick = (productId: number) => {
    // Navigate to product detail page
    window.location.href = `/product/${productId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#F5E6D3]">
      {/* Header Section */}
      <div className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            className="font-tangerine text-6xl md:text-8xl font-bold text-[#8B4513] mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our Crochet Collection
          </motion.h1>
          <motion.p 
            className="text-[#A0522D] text-lg md:text-xl max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover our handcrafted treasures, each piece lovingly made with premium yarn and attention to detail
          </motion.p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-[#CD853F]/20">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-[#A0522D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-[#CD853F]/30 rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white/90 placeholder-[#A0522D]/60"
              />
            </div>

            {/* Results Info */}
            {pagination && (
              <div className="text-[#A0522D] text-sm">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} products
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products-section" className="max-w-7xl mx-auto px-4 pb-16">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">Error loading products: {error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <ProductGridSkeleton count={12} />
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ProductCard 
                  product={product} 
                  onClick={() => handleProductClick(product.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-[#8B4513]/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-[#8B4513]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-[#8B4513] mb-2">No products found</h3>
            <p className="text-[#A0522D] mb-6">
              {debouncedSearch 
                ? `No products match "${debouncedSearch}". Try a different search term.`
                : "No products are currently available."
              }
            </p>
            {debouncedSearch && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDebouncedSearch("");
                  setCurrentPage(1);
                }}
                className="px-6 py-3 bg-[#8B4513] text-[#FFF8F0] rounded-full hover:bg-[#A0522D] transition-colors duration-300 font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination 
            pagination={pagination} 
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}