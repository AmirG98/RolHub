import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/api/health',
  '/dados',
  '/hoja-personaje',
  '/design-system',
  '/onboarding',
  // Guest routes - permiten jugar sin cuenta
  '/guest(.*)',
  '/play-guest(.*)',
  '/api/session/guest(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()
  const pathname = request.nextUrl.pathname

  // Si es ruta pública, permitir acceso
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  // Si no está autenticado, redirigir a login
  if (!userId) {
    const signInUrl = new URL('/login', request.url)
    signInUrl.searchParams.set('redirect_url', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Usuario autenticado, permitir acceso
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
