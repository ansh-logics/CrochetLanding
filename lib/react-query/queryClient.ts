import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
            gcTime: 1000 * 60 * 10, // Cache persists for 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false, // Don't refetch on window focus to reduce server load
            refetchOnMount: true, // Refetch when component mounts if data is stale
            retry: 1, // Retry failed requests once
        },
    },
});
