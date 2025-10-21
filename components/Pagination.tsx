"use client";
import { PaginationInfo } from '@/hooks/useProducts';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function Pagination({ pagination, onPageChange, loading = false }: PaginationProps) {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (startPage > 1) {
        pages.unshift('...');
        pages.unshift(1);
      }
      
      if (endPage < totalPages) {
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage || loading}
        className="px-4 py-2 rounded-lg border border-[#CD853F]/30 text-[#8B4513] hover:bg-[#F5E6D3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={loading || page === '...'}
            className={`w-10 h-10 rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-[#8B4513] text-[#FFF8F0]'
                : page === '...'
                ? 'cursor-default text-[#A0522D]'
                : 'border border-[#CD853F]/30 text-[#8B4513] hover:bg-[#F5E6D3]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || loading}
        className="px-4 py-2 rounded-lg border border-[#CD853F]/30 text-[#8B4513] hover:bg-[#F5E6D3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
