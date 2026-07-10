// Obtención del email real del usuario desde Clerk.
//
// Bug que arregla: los sitios de creación de User usaban un placeholder
// (user_<clerkId>_<ts>@placeholder.local) sin consultar Clerk → la DB no
// tenía el email real, rompiendo búsquedas por email, ADMIN_EMAILS y
// (a futuro) la conciliación de billing.

import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return !!email && email.endsWith('@placeholder.local')
}

/** Email primario del usuario en Clerk, o null si no se puede obtener. */
export async function getClerkEmail(clerkUserId: string): Promise<string | null> {
  try {
    const client = await clerkClient()
    const u = await client.users.getUser(clerkUserId)
    const primary =
      u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId) ||
      u.emailAddresses[0]
    return primary?.emailAddress ?? null
  } catch (err: any) {
    console.warn(`[clerk-email] No se pudo obtener email de ${clerkUserId}: ${err?.message}`)
    return null
  }
}

/**
 * Self-heal lazy: si el User tiene email placeholder, lo actualiza con el
 * real de Clerk. Fire-and-forget — nunca bloquea ni lanza. Cura los usuarios
 * ya creados con placeholder la próxima vez que juegan.
 */
export function healPlaceholderEmail(user: { id: string; clerkId: string; email: string }): void {
  if (!isPlaceholderEmail(user.email)) return
  void (async () => {
    const real = await getClerkEmail(user.clerkId)
    if (!real) return
    try {
      await prisma.user.update({ where: { id: user.id }, data: { email: real } })
      console.log(`[clerk-email] Email placeholder curado para user ${user.id}`)
    } catch (err: any) {
      // email único ya en uso u otro conflicto — no romper nada
      console.warn(`[clerk-email] Heal falló para ${user.id}: ${err?.message}`)
    }
  })()
}
