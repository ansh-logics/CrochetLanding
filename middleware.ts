import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the current user session
  const { data: { user }, error } = await supabase.auth.getUser();

  // Check if accessing admin routes without authentication
  if (request.nextUrl.pathname.startsWith('/admin') && (!user || error)) {
    return NextResponse.redirect(new URL('/adminLogin', request.url));
  }

  // Optional: Redirect authenticated users away from login page
  if (request.nextUrl.pathname === '/adminLogin' && user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/adminLogin']
};