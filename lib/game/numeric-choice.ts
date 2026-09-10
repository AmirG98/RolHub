// "2", "2.", "option 2", "opción 2", "1 2" → elegir la acción sugerida N.
// Un guest real escribió "1 2" intentando elegir por número. Compartido por
// GameSession (registrados) y GuestGameSession para que no diverjan.

const NUMERIC_RE = /^\s*(?:option|opci[oó]n)?\s*([1-9])(?:\s*[.)])?(?:[\s,]+[1-9])*\s*$/i

/** ¿La última narración del DM presentó una lista numerada propia? */
function dmOfferedNumberedList(dmText: string | undefined): boolean {
  if (!dmText) return false
  return /(^|\n)\s*1[.)]\s+\S/.test(dmText) && /(^|\n)\s*2[.)]\s+\S/.test(dmText)
}

/**
 * Devuelve la acción sugerida elegida por número, o null si el input no es
 * una elección numérica válida o si es ambiguo (el DM ofreció su propia lista
 * numerada en la prosa: ahí "2" significa LA opción 2 del DM, no la nuestra).
 */
export function resolveNumericChoice(
  input: string,
  suggestions: readonly string[],
  lastDmText?: string
): string | null {
  const m = input.match(NUMERIC_RE)
  if (!m) return null
  if (dmOfferedNumberedList(lastDmText)) return null
  const picked = suggestions[parseInt(m[1], 10) - 1]
  return picked ?? null
}
