// Directiva para que el DM cierre el capítulo antes del paywall.
//
// Por qué: los primeros 4 jugadores que agotaron el trial de 25 turnos fueron
// cortados en mitad de una escena (uno en pleno golpe de combate) y ninguno
// pagó. El paywall tiene que llegar en un cierre natural, no como un muro.
// Se inyecta en los últimos turnos gratis: primero orienta la historia hacia
// una resolución; en el último turno cierra la escena con un gancho.

import { WIND_DOWN_TURNS } from '@/lib/plans/check-access'
export { WIND_DOWN_TURNS }

export function trialWindDownDirective(remainingAfterThisTurn: number | null, locale: 'es' | 'en'): string {
  if (remainingAfterThisTurn === null || remainingAfterThisTurn > WIND_DOWN_TURNS) return ''
  const en = locale === 'en'

  if (remainingAfterThisTurn === 0) {
    return en
      ? `\n=== FINAL FREE TURN ===
This is the player's LAST free turn before a paywall. Resolve their action fully and bring the current scene to a satisfying close — a safe moment, a chapter's end, a breath after the action. NOT an open cliffhanger and NOT a threat in progress.
End with ONE short sentence hinting at what awaits next (a hook to come back to, not a danger they must answer now).
Do NOT request a dice roll. Do NOT trigger combat. Do NOT change scene. suggested_actions should be calm next-chapter openers, not urgent choices.
=== END FINAL FREE TURN ===\n`
      : `\n=== ÚLTIMO TURNO GRATIS ===
Este es el ÚLTIMO turno gratis del jugador antes del paywall. Resolvé su acción por completo y cerrá la escena actual de forma satisfactoria — un momento seguro, el final de un capítulo, un respiro después de la acción. NADA de cliffhanger abierto ni amenaza en curso.
Terminá con UNA oración corta que insinúe lo que viene (un gancho para volver, no un peligro que deba responder ahora).
NO pidas tirada de dados. NO dispares combate. NO cambies de escena. Las suggested_actions deben ser aperturas tranquilas del próximo capítulo, no decisiones urgentes.
=== FIN ÚLTIMO TURNO GRATIS ===\n`
  }

  return en
    ? `\n=== TRIAL WIND-DOWN ===
The player has ${remainingAfterThisTurn} free turn(s) left after this one before a paywall. Steer the story toward a natural resolution of the CURRENT scene within that many turns.
Do NOT start new combat, new quests, new locations or new cliffhangers. Let what is already in motion pay off. Keep suggested_actions focused on resolving the present situation.
=== END TRIAL WIND-DOWN ===\n`
    : `\n=== CIERRE DE PRUEBA ===
Al jugador le quedan ${remainingAfterThisTurn} turno(s) gratis después de este antes del paywall. Orientá la historia hacia una resolución natural de la escena ACTUAL en esa cantidad de turnos.
NO inicies combates, quests, locaciones ni cliffhangers nuevos. Dejá que lo que ya está en marcha se resuelva. Las suggested_actions deben apuntar a resolver la situación presente.
=== FIN CIERRE DE PRUEBA ===\n`
}
