"use client";
import { useState } from 'react';
import { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const primaryImage = product.ImageURLs?.[0];
  const formattedPrice = typeof product.Price === 'number' ? product.Price.toFixed(2) : '0.00';

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#CD853F]/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="aspect-square bg-gradient-to-br from-[#F5E6D3] to-[#CD853F]/20 relative overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
          </div>
        )}
        
        {primaryImage && !imageError ? (
          <img
            src={primaryImage}
            alt={product.Title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-[#8B4513]/10 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-[#8B4513]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[#A0522D]/60 text-sm">No image available</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="font-semibold text-xl text-[#8B4513] mb-2 line-clamp-2">
          {product.Title}
        </h3>

        {/* Colors */}
        {product.Colors && product.Colors.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {product.Colors.slice(0, 3).map((color, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-[#F5E6D3] text-[#8B4513] rounded-full text-xs font-medium"
                >
                  {color}
                </span>
              ))}
              {product.Colors.length > 3 && (
                <span className="px-2 py-1 bg-[#CD853F]/20 text-[#8B4513] rounded-full text-xs font-medium">
                  +{product.Colors.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4 text-[#CD853F] fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
          <span className="text-sm text-[#A0522D] ml-2">(5.0)</span>
        </div>

        {/* Description */}
        <p className="text-[#A0522D] text-sm mb-4 line-clamp-2">
          {product.Description}
        </p>

        {/* Price and Button */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-[#8B4513]">
            ${formattedPrice}
          </span>
          <button className="px-4 py-2 bg-[#8B4513] text-[#FFF8F0] rounded-full text-sm font-medium hover:bg-[#A0522D] transition-colors shadow-md hover:shadow-lg">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
