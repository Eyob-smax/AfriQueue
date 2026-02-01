import { createServerClient } from "@supabase/ssr";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextResponse, type NextRequest } from "next/server";


export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(): { name: string, value: string, options: any }[] {
          return request.cookies.getAll().map((cookie: RequestCookie) => ({
            name: cookie.name,
            value: cookie.value,
            options: cookie.options,
          }));
        },
        setAll(cookiesToSet: { name: string, value: string, options: any }[]) {
          cookiesToSet.forEach(({ name, value, options }: { name: string, value: string, options: any }) =>
            response.cookies.set(name as string, value as string, options as any)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
