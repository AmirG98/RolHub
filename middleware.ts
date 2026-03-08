import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/health',
  '/dados',
  '/hoja-personaje',
  '/design-system',
  '/onboarding',
]

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Por ahora, permitir acceso a todas las rutas públicas sin Clerk
  // TODO: Integrar Clerk cuando tengamos keys reales
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Redirigir rutas protegidas a home
  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
