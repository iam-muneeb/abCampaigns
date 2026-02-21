// proxy.ts (Formerly middleware.ts)
import { withAuth } from "next-auth/middleware";

const authMiddleware = withAuth({
  pages: {
    signIn: "/login",
  },
});

// Next.js 16 requires the exported function to be explicitly named "proxy"
export const proxy = authMiddleware;

export const config = {
  matcher: ["/((?!login|reset-password|api|_next/static|_next/image|logo/logo.png|favicon.ico).*)"],
};