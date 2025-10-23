"use client";
import { useState, useEffect } from 'react';

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

interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Simple cache for individual products
const productCache = new Map<string, { data: Product; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedProduct = (id: string) => {
  const cached = productCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  productCache.delete(id);
  return null;
};

const setCachedProduct = (id: string, data: Product) => {
  productCache.set(id, { data, timestamp: Date.now() });
};

export function useProduct(id: string): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = async () => {
    // Check cache first
    const cachedProduct = getCachedProduct(id);
    if (cachedProduct) {
      setProduct(cachedProduct);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/get-product/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'force-cache',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      setCachedProduct(id, data.product);
      
      setProduct(data.product);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    // Clear cache for this product
    productCache.delete(id);
    loadProduct();
  };

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  return {
    product,
    loading,
    error,
    refresh,
  };
}
