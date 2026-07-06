import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma, withRetry } from '@/lib/db/prisma'
import { getSkillTree, whyCannotLearn } from '@/lib/game/skill-trees'
import { normalizeMilestones } from '@/lib/game/milestones'
import type { AbilityTemplate } from '@/lib/types/ability'

/**
 * POST /api/characters/[id]/skill-tree/learn  { nodeId }
 *
 * Aprende un nodo desbloqueable del árbol. SOLO usuarios registrados —
 * los guests reciben 403 { registerRequired: true } (el CTA de registro
 * vive en la UI; esto es defensa en profundidad).
 *
 * Al aprender:
 * 1. nodeId se agrega a Character.unlockedSkills
 * 2. El AbilityTemplate del nodo se agrega a Character.abilities (dedup por id)
 *    → el backfill del turn route lo materializa como AbilityRuntime
 * 3. Si el personaje tiene campaña activa, se patchea el worldState vivo para
 *    que la ability aparezca ya mismo (sin esperar re-backfill)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      // Guests (cookie) y anónimos: el árbol es feature de registrados
      return NextResponse.json(
        { error: 'Registrate para desbloquear el árbol de habilidades', registerRequired: true },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const body = await req.json().catch(() => ({}))
    const nodeId: unknown = body?.nodeId
    if (typeof nodeId !== 'string' || nodeId.length === 0) {
      return NextResponse.json({ error: 'nodeId requerido' }, { status: 400 })
    }

    const character = await prisma.character.findUnique({
      where: { id },
      include: { campaign: { select: { id: true, worldState: true, status: true } } },
    })
    if (!character) {
      return NextResponse.json({ error: 'Personaje no encontrado' }, { status: 404 })
    }
    if (character.userId !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const tree = getSkillTree(character.lore, character.archetype)
    if (!tree) {
      return NextResponse.json({ error: 'Este arquetipo aún no tiene árbol' }, { status: 404 })
    }

    // Validación server-side completa (milestones desde Prisma, source of truth)
    const milestones = normalizeMilestones(character.milestones)
    const learnedIds: string[] = Array.isArray(character.unlockedSkills)
      ? (character.unlockedSkills as string[])
      : []
    const rejection = whyCannotLearn(tree, nodeId, milestones, learnedIds, character.level)
    if (rejection) {
      return NextResponse.json({ error: 'No se puede aprender', reason: rejection }, { status: 400 })
    }

    const node = tree.nodes.find((n) => n.id === nodeId)!
    // El nodo ES un AbilityTemplate + metadata de árbol; guardamos solo el template
    const template: AbilityTemplate = {
      id: node.id,
      name: node.name,
      description: node.description,
      kind: node.kind,
      resource: node.resource,
      ...(node.maxUses !== undefined ? { maxUses: node.maxUses } : {}),
      ...(node.cooldownTurns !== undefined ? { cooldownTurns: node.cooldownTurns } : {}),
      ...(node.icon ? { icon: node.icon } : {}),
      ...(node.tags ? { tags: node.tags } : {}),
    }

    const currentAbilities: AbilityTemplate[] = Array.isArray(character.abilities)
      ? (character.abilities as unknown as AbilityTemplate[])
      : []
    const newAbilities = currentAbilities.some((a) => a?.id === template.id)
      ? currentAbilities
      : [...currentAbilities, template]

    const newLearned = [...learnedIds, nodeId]

    // Patch del worldState vivo (si hay campaña): la ability aparece YA
    let campaignUpdate: ReturnType<typeof prisma.campaign.update> | null = null
    if (character.campaign && character.campaign.status === 'ACTIVE') {
      const ws = (character.campaign.worldState as any) || {}
      const partySlot = ws.party?.[character.name]
      if (partySlot && Array.isArray(partySlot.abilities)) {
        if (!partySlot.abilities.some((a: any) => a?.id === template.id)) {
          const runtime = { ...template, usedToday: 0, cooldownRemaining: 0 }
          const newWs = {
            ...ws,
            party: {
              ...ws.party,
              [character.name]: {
                ...partySlot,
                abilities: [...partySlot.abilities, runtime],
              },
            },
          }
          campaignUpdate = prisma.campaign.update({
            where: { id: character.campaign.id },
            data: { worldState: newWs },
          })
        }
      }
    }

    await withRetry(() =>
      prisma.$transaction([
        prisma.character.update({
          where: { id: character.id },
          data: {
            unlockedSkills: newLearned,
            abilities: newAbilities as any,
          },
        }),
        ...(campaignUpdate ? [campaignUpdate] : []),
      ])
    )

    console.log(`[Skills] ${character.name} learned "${nodeId}" (${tree.loreId}/${tree.archetypeId})`)

    return NextResponse.json({
      success: true,
      learned: nodeId,
      ability: template,
      unlockedSkills: newLearned,
    })
  } catch (error) {
    console.error('[skill-tree/learn] error:', error)
    return NextResponse.json({ error: 'Error al aprender la habilidad' }, { status: 500 })
  }
}
