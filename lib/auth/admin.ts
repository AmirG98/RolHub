import { auth, clerkClient } from '@clerk/nextjs/server'

/**
 * Autorización de admin centralizada.
 *
 * Los emails admin viven en la env var ADMIN_EMAILS (separados por coma),
 * NO en el código: el repo es público y cambiar admins no debería
 * requerir deploy de código.
 *
 * Ejemplo: ADMIN_EMAILS=vos@ejemplo.com,socio@ejemplo.com
 */

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export type AdminCheckResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; status: 401 | 403; error: string }

/**
 * Verifica que la request venga de un admin autenticado.
 * Uso en routes:
 *   const admin = await requireAdmin()
 *   if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status })
 */
export async function requireAdmin(): Promise<AdminCheckResult> {
  const { userId } = await auth()
  if (!userId) {
    return { ok: false, status: 401, error: 'No autorizado' }
  }

  const adminEmails = getAdminEmails()
  if (adminEmails.length === 0) {
    console.error('[admin] ADMIN_EMAILS no está configurado — acceso admin deshabilitado')
    return { ok: false, status: 403, error: 'Admin no configurado' }
  }

  const client = await clerkClient()
  const clerkUser = await client.users.getUser(userId)
  const userEmail = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase() || ''

  if (!adminEmails.includes(userEmail)) {
    return { ok: false, status: 403, error: 'No tienes permisos de admin' }
  }

  return { ok: true, userId, email: userEmail }
}
