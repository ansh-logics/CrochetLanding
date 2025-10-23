import { createServerClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    const supabase = createServerClient();
    
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const search = searchParams.get('search') || '';
        
        // Calculate offset for pagination
        const offset = (page - 1) * limit;
        
        // Build query
        let query = supabase
            .from('Products')
            .select(`
                id,
                Title,
                Description,
                Price,
                Colors,
                ImageURLs,
                created_at
            `)
            .order('created_at', { ascending: false });
        
        // Add search filter if provided
        if (search) {
            query = query.or(`Title.ilike.%${search}%,Description.ilike.%${search}%`);
        }
        
        // Add pagination
        query = query.range(offset, offset + limit - 1);
        
        const { data: products, error, count } = await query;
        
        if (error) {
            console.error('Supabase error:', error);
            return Response.json(
                { error: 'Failed to fetch products', details: error.message }, 
                { status: 500 }
            );
        }
        
        // Get total count for pagination info
        const { count: totalCount } = await supabase
            .from('Products')
            .select('*', { count: 'exact', head: true });
        
        const totalPages = Math.ceil((totalCount || 0) / limit);
        
        return Response.json({
            products: products || [],
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalCount || 0,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
        
    } catch (error) {
        console.error("Error fetching products:", error);
        return Response.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}
