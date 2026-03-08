import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/api/health',
  '/dados(.*)',
  '/hoja-personaje(.*)',
  '/design-system(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Si no hay configuración de Clerk, permitir acceso a rutas públicas
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_placeholder') {
    if (isPublicRoute(request)) {
      return NextResponse.next()
    }
    // Redirigir a home si intentan acceder a rutas protegidas sin Clerk configurado
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Comportamiento normal con Clerk configurado
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
