import { createServerClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = createServerClient();
    
    try {
        const productId = params.id;
        
        if (!productId) {
            return Response.json(
                { error: 'Product ID is required' }, 
                { status: 400 }
            );
        }

        // Fetch the product by ID
        const { data: product, error } = await supabase
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
            .eq('id', productId)
            .single();
        
        if (error) {
            console.error('Supabase error:', error);
            return Response.json(
                { error: 'Failed to fetch product', details: error.message }, 
                { status: 500 }
            );
        }

        if (!product) {
            return Response.json(
                { error: 'Product not found' }, 
                { status: 404 }
            );
        }
        
        return Response.json({
            product
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
        
    } catch (error) {
        console.error("Error fetching product:", error);
        return Response.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}
