import { withAuth } from "next-auth/middleware";

/**
 * Server-side gate on every /admin route and /api write endpoint
 * (gaurdrail.md §3/§6, plan.md §11) — a hidden route is not access control,
 * so this runs before any admin page or mutating API route can respond.
 *
 * Named `proxy.ts` per Next.js 16's renamed file convention (the former
 * `middleware.ts` name is deprecated as of this Next.js version).
 */
export default withAuth({
  pages: { signIn: "/admin/login" },
});

export const config = {
  matcher: ["/admin/:path*", "/api/projects/:path*", "/api/blogs/:path*", "/api/certificates/:path*", "/api/leads/:path*"],
};
