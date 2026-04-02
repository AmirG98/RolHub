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
  '/maps',
  // SEO routes - deben ser públicas para Google
  '/guias(.*)',
  '/sitemap.xml',
  '/robots.txt',
  '/privacy',
  '/terms',
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

  // Si no está autenticado con Clerk, verificar cookie de guest
  if (!userId) {
    const guestCookie = request.cookies.get('guest_user_id')?.value
    // Permitir acceso a /play/* y /api/session/turn si tiene cookie guest
    if (guestCookie && (pathname.startsWith('/play/') || pathname.startsWith('/api/session/turn') || pathname.startsWith('/api/voice') || pathname.startsWith('/api/images') || pathname.startsWith('/api/sfx'))) {
      return NextResponse.next()
    }

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
