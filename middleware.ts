import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
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

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/api/health',
  '/dados(.*)',
  '/hoja-personaje(.*)',
  '/design-system(.*)',
  '/onboarding(.*)',
])

// Chequear si las keys de Clerk son placeholder o inválidas
function hasValidClerkKeys() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return publishableKey &&
         publishableKey !== 'pk_test_placeholder' &&
         publishableKey.startsWith('pk_')
}

export default function middleware(request: NextRequest) {
  // Si no hay keys válidas de Clerk, manejar rutas manualmente
  if (!hasValidClerkKeys()) {
    const pathname = request.nextUrl.pathname

    // Permitir acceso a rutas públicas
    if (publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next()
    }

    // Redirigir rutas protegidas a home
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Si hay keys válidas, usar Clerk middleware normalmente
  return clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect()
    }
  })(request, {} as any)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
