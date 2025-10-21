"use client";

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#CD853F]/10 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gradient-to-br from-[#F5E6D3] to-[#CD853F]/20">
        <div className="w-full h-full bg-gray-300"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6">
        {/* Title */}
        <div className="h-6 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>

        {/* Colors */}
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
          ))}
          <div className="h-4 w-8 bg-gray-200 rounded ml-2"></div>
        </div>

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>

        {/* Price and Button */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-20 bg-gray-300 rounded"></div>
          <div className="h-10 w-24 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
