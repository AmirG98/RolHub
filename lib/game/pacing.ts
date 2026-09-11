/**
 * Ritmo narrativo y anti-bucle del DM.
 *
 * Motivación (dos clientes pagos, 2026-09-10/11): el DM re-narró la misma
 * escena durante horas (461 y 66 turnos, 4 y 5 cambios de escena), las
 * misiones nunca se cerraban porque el prompt no mostraba los ids de los
 * objetivos, y "algo se acerca" se repetía sin resolverse. El segundo canceló
 * con feedback "low quality".
 *
 * Todo lo de acá es puro (sin I/O) para poder testearlo sin el route.
 */
import type { Quest } from '@/lib/types/quest'

export type PacingLocale = 'es' | 'en'

/** Turnos seguidos en la misma escena a partir de los cuales se empuja a avanzar. */
export const SCENE_STALE_TURNS = 8
/** A partir de acá el cierre/cambio de escena es obligatorio. */
export const SCENE_HARD_TURNS = 10
/** Turnos totales a partir de los cuales el acto 1 ya debería haber terminado. */
export const ACT_1_MAX_TURNS = 15

/** Contador de turnos en la escena actual: se resetea al cambiar de escena. */
export function nextTurnsInScene(prev: unknown, sceneChanged: boolean): number {
  if (sceneChanged) return 0
  const n = typeof prev === 'number' && Number.isFinite(prev) && prev >= 0 ? Math.floor(prev) : 0
  return n + 1
}

export function turnsInSceneOf(worldState: { turns_in_scene?: unknown } | null | undefined): number {
  const v = worldState?.turns_in_scene
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0
}

/** Directiva de escena estancada según cuántos turnos lleva el jugador ahí. */
export function sceneStaleDirective(turnsInScene: number, locale: PacingLocale): string {
  if (turnsInScene >= SCENE_HARD_TURNS) {
    return locale === 'en'
      ? `🚨 SCENE LOCKED FOR ${turnsInScene} TURNS. This turn is the LAST one here: resolve the situation and move the player to a NEW location with "scene_change" (and "location_id" if known). No new threats in this place, no "something approaches" — it arrives or it is over.`
      : `🚨 ESCENA TRABADA HACE ${turnsInScene} TURNOS. Este turno es el ÚLTIMO acá: resolvé la situación y llevá al jugador a una ubicación NUEVA con "scene_change" (y "location_id" si lo conocés). Sin amenazas nuevas en este lugar, sin "algo se acerca" — llega o se termina.`
  }
  if (turnsInScene >= SCENE_STALE_TURNS) {
    return locale === 'en'
      ? `⚠️ ${turnsInScene} turns in this scene. Wrap it up: give the player a clear exit, resolve the pending threat, and steer toward "scene_change" within 1-2 turns.`
      : `⚠️ ${turnsInScene} turnos en esta escena. Cerrala: dale al jugador una salida clara, resolvé la amenaza pendiente y llevalo a "scene_change" en 1-2 turnos.`
  }
  if (turnsInScene >= 4) {
    return locale === 'en'
      ? `Been here ${turnsInScene} turns — consider advancing.`
      : `Lleva ${turnsInScene} turnos acá — considerá avanzar.`
  }
  return ''
}

/** Lo que el DM ofreció el turno anterior, para que no lo repita. */
export function lastSuggestionsDirective(actions: unknown, locale: PacingLocale): string {
  if (!Array.isArray(actions)) return ''
  const list = actions.filter((a): a is string => typeof a === 'string' && a.trim().length > 0).slice(0, 4)
  if (list.length === 0) return ''
  const joined = list.map((a) => `"${a.slice(0, 80)}"`).join('; ')
  return locale === 'en'
    ? `LAST TURN YOU OFFERED: ${joined}. Offer DIFFERENT actions now — the situation changed.`
    : `EL TURNO PASADO OFRECISTE: ${joined}. Ofrecé acciones DISTINTAS ahora — la situación cambió.`
}

/** Directiva de acto: el acto 1 no puede durar toda la partida. */
export function actDirective(act: unknown, totalTurns: number, locale: PacingLocale): string {
  const a = typeof act === 'number' ? act : 1
  if (a === 1 && totalTurns >= ACT_1_MAX_TURNS) {
    return locale === 'en'
      ? `Act 1 has lasted ${totalTurns} turns. Close the opening: resolve the first goal and set "act_advance": true when the player commits to the larger story.`
      : `El acto 1 lleva ${totalTurns} turnos. Cerrá la apertura: resolvé el primer objetivo y seteá "act_advance": true cuando el jugador se comprometa con la historia grande.`
  }
  return ''
}

/**
 * Lista de misiones para el prompt CON ids: sin ellos el DM no puede emitir
 * quest_complete_objective (los ids son cuid/timestamps que no puede adivinar).
 */
export function formatQuestsForPrompt(quests: Quest[], locale: PacingLocale): string {
  const active = quests.filter((q) => q.status === 'active')
  if (active.length === 0) return locale === 'en' ? '- No active quests' : '- Sin quests activas'
  const pendingLabel = locale === 'en' ? 'Pending' : 'Pendiente'
  return active
    .map((q) => {
      const pending = q.objectives.filter((o) => !o.completed)
      const lines = pending.map((o) => `    → ${pendingLabel} [objectiveId: ${o.id}]: ${o.description}`)
      const head = `- "${q.title}" [questId: ${q.id}] (${q.priority}): ${q.description.slice(0, 120)}`
      return lines.length > 0 ? `${head}\n${lines.join('\n')}` : head
    })
    .join('\n')
}

export interface ObjectiveCompletion {
  questId: string
  objectiveId: string
}

/** Aplica la finalización de un objetivo; cierra la quest si era el último. */
export function applyObjectiveCompletion(quests: Quest[], completion: ObjectiveCompletion): Quest[] {
  return quests.map((quest) => {
    if (quest.id !== completion.questId) return quest
    const objectives = quest.objectives.map((o) =>
      o.id === completion.objectiveId ? { ...o, completed: true } : o
    )
    const allCompleted = objectives.length > 0 && objectives.every((o) => o.completed)
    return { ...quest, objectives, status: allCompleted ? ('completed' as const) : quest.status }
  })
}

/** La quest que pasa a 'completed' con esta finalización, o null. */
export function questCompletedByObjective(
  quests: Quest[] | null | undefined,
  completion: ObjectiveCompletion | null | undefined
): Quest | null {
  if (!completion || !Array.isArray(quests)) return null
  const before = quests.find((q) => q.id === completion.questId)
  if (!before || before.status !== 'active') return null
  const after = applyObjectiveCompletion(quests, completion).find((q) => q.id === completion.questId)
  return after && after.status === 'completed' ? after : null
}

/** Reglas anti-bucle que van en el bloque de progresión narrativa. */
export function antiLoopRules(locale: PacingLocale): string {
  return locale === 'en'
    ? `- PENDING THREATS RESOLVE: anything you announced as approaching (footsteps, a horde, a figure, a voice) must ARRIVE or be RESOLVED within 2 turns. Never repeat an "it's getting closer" beat.
- RESOLVED ACTIONS STAY RESOLVED: if the player repeats something already done (loot the same drawers, climb the same stairs, take down the same enemy), do NOT re-narrate it — acknowledge it is done in one sentence and present something NEW.
- EVERY SCENE HAS AN EXIT: the player must always be able to leave. Offer at least one suggested action that moves the story to a different place or goal.
- QUEST PROGRESS IS ACKNOWLEDGED: when the player accomplishes a pending objective, mark it with "quest_complete_objective" (exact ids from the quest list) and say so in the narration. When a quest's last objective is done, celebrate it and give "xp_reward".
- ACTS ADVANCE: set "act_advance": true when a major goal resolves (main quest done, big reveal, point of no return). Never stay in act 1 forever.`
    : `- LAS AMENAZAS PENDIENTES SE RESUELVEN: todo lo que anunciaste como "se acerca" (pasos, una horda, una figura, una voz) debe LLEGAR o RESOLVERSE en 2 turnos. Nunca repitas el beat de "cada vez más cerca".
- LO RESUELTO QUEDA RESUELTO: si el jugador repite algo ya hecho (saquear los mismos cajones, subir la misma escalera, eliminar al mismo enemigo), NO lo re-narres — reconocé en una frase que ya está hecho y presentá algo NUEVO.
- TODA ESCENA TIENE SALIDA: el jugador siempre tiene que poder irse. Ofrecé al menos una acción sugerida que mueva la historia a otro lugar u objetivo.
- EL PROGRESO DE MISIONES SE RECONOCE: cuando el jugador cumple un objetivo pendiente, marcalo con "quest_complete_objective" (ids exactos de la lista de quests) y decilo en la narración. Cuando se cumple el último objetivo, celebralo y dá "xp_reward".
- LOS ACTOS AVANZAN: seteá "act_advance": true cuando se resuelve un objetivo mayor (misión principal cumplida, gran revelación, punto sin retorno). Nunca te quedes en el acto 1 para siempre.`
}

/** Con D&D 5e las peleas van al sistema táctico: no narrar combates enteros. */
export function engineCombatDirective(engine: string, locale: PacingLocale): string {
  if (engine !== 'DND_5E') return ''
  return locale === 'en'
    ? `- THIS CAMPAIGN USES D&D 5e: fights are resolved by the tactical system, not by narration. When the player engages one or more AWARE hostile enemies within reach, you MUST send "combat_trigger". One unaware enemy may be taken down in narration after a stealth roll; two or more, or any enemy that notices the player, is combat. Do NOT narrate whole fights as "silent takedowns".`
    : `- ESTA CAMPAÑA USA D&D 5e: las peleas se resuelven en el sistema táctico, no en la narración. Cuando el jugador enfrenta a uno o más enemigos hostiles ALERTA a su alcance, DEBÉS enviar "combat_trigger". Un enemigo desprevenido puede caer en la narración tras una tirada de sigilo; dos o más, o cualquiera que note al jugador, es combate. NO narres peleas enteras como "eliminaciones silenciosas".`
}
