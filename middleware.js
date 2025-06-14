import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Rutas que requieren autenticación
const isProtectedRoute = createRouteMatcher([
  '/chat/(.*)',
  '/dashboard(.*)',
  '/admin(.*)',
]);

// Rutas públicas (no requieren autenticación)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing(.*)',
  '/payment/(.*)',
  '/api/webhooks/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Si es una ruta protegida y no es pública, requerir autenticación
  if (isProtectedRoute(req) && !isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
