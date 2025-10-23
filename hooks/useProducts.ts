"use client";
import { useState, useEffect, useCallback } from 'react';

export interface Product {
  id: number;
  Title: string;
  Description: string;
  Price: number;
  Colors: string[];
  ImageURLs: string[];
  ImagePublicIds?: string[];
  created_at: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  loadProducts: (page?: number, search?: string) => void;
  refresh: () => void;
}

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCached = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export function useProducts(initialPage = 1, limit = 12): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentSearch, setCurrentSearch] = useState('');

  const loadProducts = useCallback(async (page = currentPage, search = currentSearch) => {
    const cacheKey = `products-${page}-${limit}-${search}`;
    
    // Check cache first
    const cachedData = getCached(cacheKey);
    if (cachedData && page === currentPage && search === currentSearch) {
      setProducts(cachedData.products);
      setPagination(cachedData.pagination);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/get-products?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'force-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      setCache(cacheKey, data);
      
      setProducts(data.products);
      setPagination(data.pagination);
      setCurrentPage(page);
      setCurrentSearch(search);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSearch, limit]);

  const refresh = useCallback(() => {
    // Clear cache for current query
    const cacheKey = `products-${currentPage}-${limit}-${currentSearch}`;
    cache.delete(cacheKey);
    loadProducts(currentPage, currentSearch);
  }, [currentPage, currentSearch, limit, loadProducts]);

  useEffect(() => {
    loadProducts(initialPage, '');
  }, []);

  return {
    products,
    loading,
    error,
    pagination,
    loadProducts,
    refresh,
  };
}
