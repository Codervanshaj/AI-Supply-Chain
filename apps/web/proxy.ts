import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const isProtectedRoute = createRouteMatcher([
  "/",
  "/forecasting(.*)",
  "/inventory(.*)",
  "/suppliers(.*)",
  "/logistics(.*)",
  "/maintenance(.*)",
  "/reports(.*)",
  "/assistant(.*)",
  "/admin(.*)",
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!hasClerk) {
    return NextResponse.next();
  }

  return clerkHandler(request, event);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/"],
};

