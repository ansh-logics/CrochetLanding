'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

interface ProductsResponse {
    products: Product[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

// Fetch all products with React Query
export function useProductsQuery(page = 1, limit = 12, search = '') {
    return useQuery({
        queryKey: ['products', page, limit, search],
        queryFn: async (): Promise<ProductsResponse> => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            
            if (search) {
                params.append('search', search);
            }

            const response = await fetch(`/api/get-products?${params}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            
            const data = await response.json();
            return data;
        },
        staleTime: 0, // Always fetch fresh data
        gcTime: 1000 * 60 * 5, // 5 minutes - cache persists
        refetchOnMount: true, // Always refetch on mount
        refetchOnWindowFocus: true, // Refetch when window regains focus
    });
}

// Delete product with optimistic update
export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (productId: number) => {
            const response = await fetch(`/api/delete-product/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete product');
            }

            return response.json();
        },
        // Optimistic update - remove product immediately from UI
        onMutate: async (productId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['products'] });

            // Snapshot the previous value
            const previousData = queryClient.getQueriesData({ queryKey: ['products'] });

            // Optimistically update all product queries
            queryClient.setQueriesData({ queryKey: ['products'] }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    products: old.products?.filter((p: Product) => p.id !== productId) || [],
                };
            });

            // Return context with the snapshot
            return { previousData };
        },
        // If mutation fails, rollback to previous state
        onError: (err, productId, context) => {
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        // Always refetch after error or success
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Add product
export function useAddProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (productData: any) => {
            const response = await fetch('/api/add-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add product');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate and refetch products
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Update product
export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            const response = await fetch(`/api/update-product/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update product');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}
