import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { verifyGuestCookie } from '@/lib/guest/cookie'
import { getSkillTree, computeNodeStatuses } from '@/lib/game/skill-trees'
import { normalizeMilestones } from '@/lib/game/milestones'

/**
 * GET /api/characters/[id]/skill-tree
 *
 * Devuelve el árbol del arquetipo del personaje + estado de cada nodo.
 * - Usuario registrado (dueño): árbol completo con statuses.
 * - Guest (dueño): teaser — nombre del árbol + nodos tier 1 (solo nombres),
 *   con registerRequired para el CTA de registro.
 * - Sin árbol para ese lore/arquetipo: { available: false }.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Auth: Clerk O cookie guest firmada
    const { userId: clerkUserId } = await auth()
    let authUserId: string | null = null
    let isGuest = false

    if (clerkUserId) {
      const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
      authUserId = user?.id ?? null
    } else {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      const guestUserId = verifyGuestCookie(cookieStore.get('guest_user_id')?.value)
      if (guestUserId) {
        authUserId = guestUserId
        isGuest = true
      }
    }

    if (!authUserId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const character = await prisma.character.findUnique({ where: { id } })
    if (!character) {
      return NextResponse.json({ error: 'Personaje no encontrado' }, { status: 404 })
    }
    if (character.userId !== authUserId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const tree = getSkillTree(character.lore, character.archetype)
    if (!tree) {
      return NextResponse.json({ available: false, tree: null })
    }

    // Guests: teaser con tier 1 (nombres, sin condiciones ni aprendizaje)
    if (isGuest) {
      return NextResponse.json({
        available: true,
        teaser: true,
        registerRequired: true,
        tree: {
          loreId: tree.loreId,
          archetypeId: tree.archetypeId,
          name: tree.name,
          totalNodes: tree.nodes.length,
          tier1: tree.nodes
            .filter((n) => n.tier === 1)
            .map((n) => ({ id: n.id, name: n.name, icon: n.icon, kind: n.kind })),
        },
      })
    }

    const milestones = normalizeMilestones(character.milestones)
    const learnedIds: string[] = Array.isArray(character.unlockedSkills)
      ? (character.unlockedSkills as string[])
      : []
    const statuses = computeNodeStatuses(tree, milestones, learnedIds, character.level)

    return NextResponse.json({
      available: true,
      teaser: false,
      tree: { loreId: tree.loreId, archetypeId: tree.archetypeId, name: tree.name },
      milestones,
      characterLevel: character.level,
      nodes: statuses.map((s) => ({
        ...s.node,
        status: s.status,
        conditionMet: s.conditionMet,
        missingRequires: s.missingRequires,
      })),
    })
  } catch (error) {
    console.error('[skill-tree] GET error:', error)
    return NextResponse.json({ error: 'Error al cargar el árbol' }, { status: 500 })
  }
}
