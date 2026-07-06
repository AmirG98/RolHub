// Invariantes determinísticas sobre la respuesta del turn API y el estado
// acumulado de la sesión. Solo lo determinístico genera findings con
// severidad — nada de juicios subjetivos sobre calidad narrativa.

import type { Finding, Severity } from './findings'
import { makeFingerprint } from './findings'
import type { TurnResponse } from './client'

export interface SessionTracker {
  characterName: string
  locale: 'es' | 'en'
  profile: string
  sessionId: string
  /** quests completadas vistas hasta ahora (para detectar resurrecciones) */
  completedQuests: Set<string>
  /** último HP conocido "x/y" */
  lastHp: string | null
}

function finding(
  tracker: SessionTracker,
  turnIndex: number,
  severity: Severity,
  check: string,
  summary: string,
  extra: Partial<Finding['evidence']> = {},
  suspected_files: string[] = [],
  autofixable = false
): Finding {
  return {
    severity,
    check,
    fingerprint: makeFingerprint(check, `${tracker.profile}:${summary.slice(0, 80)}`),
    summary,
    evidence: { turnIndex, ...extra },
    suspected_files: suspected_files.length > 0 ? suspected_files : undefined,
    autofixable,
    profile: tracker.profile,
    sessionId: tracker.sessionId,
  }
}

const ES_STOPWORDS = /\b(el|la|los|las|de|del|que|y|una?|con|por|para|está|sos|tenés)\b/gi
const EN_STOPWORDS = /\b(the|of|and|you|your|to|in|is|are|with|that|from)\b/gi

/** Chequea una respuesta de turno. Devuelve los findings de este turno. */
export function checkTurn(
  tracker: SessionTracker,
  turnIndex: number,
  request: unknown,
  res: TurnResponse
): Finding[] {
  const findings: Finding[] = []
  const ev = {
    request,
    responseStatus: res.status,
    responseBody: truncateBody(res.body),
    latencyMs: res.latencyMs,
  }

  // ── Infraestructura ──────────────────────────────────────────────
  if (res.status === 0) {
    findings.push(
      finding(tracker, turnIndex, 'P0', 'network_or_timeout',
        `Turno sin respuesta (${res.body?._error || 'network'})`, ev)
    )
    return findings // sin body no hay más que chequear
  }
  if (res.status >= 500) {
    findings.push(
      finding(tracker, turnIndex, 'P0', 'http_5xx',
        `HTTP ${res.status} en /api/session/turn: ${JSON.stringify(res.body?.error || res.body).slice(0, 200)}`,
        ev, ['app/api/session/turn/route.ts'])
    )
    return findings
  }
  if (res.body?._raw !== undefined) {
    findings.push(
      finding(tracker, turnIndex, 'P0', 'non_json_response',
        'La respuesta del turn API no es JSON', ev, ['app/api/session/turn/route.ts'])
    )
    return findings
  }
  if (res.status === 429) {
    // Rate limit esperado — no es bug, pero cortamos la sesión
    return findings
  }
  if (res.status >= 400) {
    findings.push(
      finding(tracker, turnIndex, 'P1', 'http_4xx_unexpected',
        `HTTP ${res.status} inesperado en un turno válido: ${JSON.stringify(res.body?.error || '').slice(0, 200)}`, ev)
    )
    return findings
  }
  if (res.latencyMs > 45_000) {
    findings.push(
      finding(tracker, turnIndex, 'P2', 'latency_slow',
        `Turno tardó ${(res.latencyMs / 1000).toFixed(1)}s (>45s)`, ev)
    )
  }

  const body = res.body

  // ── Contrato de la respuesta ─────────────────────────────────────
  const narration: string = typeof body?.narration === 'string' ? body.narration : ''

  // JSON crudo filtrado en la narración (bug de parseo truncado). Determinístico.
  if (/"narration"\s*:|","character_name"|","hp_change"/.test(narration)) {
    findings.push(
      finding(tracker, turnIndex, 'P0', 'raw_json_in_narration',
        'La narración contiene JSON crudo — el parseo de la respuesta del DM falló',
        ev, ['app/api/session/turn/route.ts', 'lib/claude/parse-dm-response.ts'], true)
    )
  }

  if (narration.trim().length < 40) {
    findings.push(
      finding(tracker, turnIndex, 'P1', 'narration_too_short',
        `Narración vacía o demasiado corta (${narration.trim().length} chars)`,
        ev, ['app/api/session/turn/route.ts'])
    )
  }
  const suggested = body?.suggestedActions
  if (!Array.isArray(suggested) || suggested.length === 0) {
    findings.push(
      finding(tracker, turnIndex, 'P2', 'no_suggested_actions',
        'Respuesta exitosa sin suggested_actions', ev)
    )
  }

  // Idioma incorrecto (heurística de stopwords, margen 2x para evitar falsos positivos)
  if (narration.length > 200) {
    const esCount = (narration.match(ES_STOPWORDS) || []).length
    const enCount = (narration.match(EN_STOPWORDS) || []).length
    if (tracker.locale === 'es' && enCount > esCount * 2 && enCount > 10) {
      findings.push(
        finding(tracker, turnIndex, 'P2', 'wrong_language',
          `Narración en inglés con locale=es (stopwords en=${enCount} es=${esCount})`, ev)
      )
    }
    if (tracker.locale === 'en' && esCount > enCount * 2 && esCount > 10) {
      findings.push(
        finding(tracker, turnIndex, 'P2', 'wrong_language',
          `Narración en español con locale=en (stopwords es=${esCount} en=${enCount})`, ev)
      )
    }
  }

  // xp fuera de rango
  if (typeof body?.xpReward === 'number' && (body.xpReward < 0 || body.xpReward > 100)) {
    findings.push(
      finding(tracker, turnIndex, 'P2', 'xp_out_of_range',
        `xpReward fuera de rango: ${body.xpReward}`, ev, ['app/api/session/turn/route.ts'])
    )
  }

  // ── World state ──────────────────────────────────────────────────
  const partyUpdate = body?.worldStateUpdates?.party?.[tracker.characterName]

  // HP inválido
  const hp: string | undefined = partyUpdate?.hp
  if (typeof hp === 'string' && /^\-?\d+\s*\/\s*\-?\d+$/.test(hp.trim())) {
    const [cur, max] = hp.split('/').map((n) => parseInt(n.trim(), 10))
    const died = body?.zeroHpEvent?.type === 'death'
    if (cur < 0 && !died) {
      findings.push(
        finding(tracker, turnIndex, 'P1', 'hp_negative',
          `HP negativo sin evento de muerte: ${hp}`, ev,
          ['app/api/session/turn/route.ts'], true)
      )
    }
    if (cur > max) {
      findings.push(
        finding(tracker, turnIndex, 'P1', 'hp_above_max',
          `HP actual supera el máximo: ${hp}`, ev,
          ['app/api/session/turn/route.ts'], true)
      )
    }
    tracker.lastHp = hp
  }

  // Items no-string en inventory (bug conocido: objetos LocalizedString crudos)
  const inventory = partyUpdate?.inventory
  if (Array.isArray(inventory)) {
    const nonString = inventory.filter((i: unknown) => typeof i !== 'string')
    if (nonString.length > 0) {
      findings.push(
        finding(tracker, turnIndex, 'P1', 'inventory_item_not_string',
          `Inventory con ${nonString.length} item(s) no-string: ${JSON.stringify(nonString[0]).slice(0, 120)}`,
          ev, ['app/api/session/turn/route.ts', 'components/game/InventoryPanel.tsx'], true)
      )
    }
  }

  // Quests no-string (bug conocido #31: quest como objeto rompe React)
  const activeQuests = body?.worldStateUpdates?.active_quests
  if (Array.isArray(activeQuests)) {
    const nonString = activeQuests.filter((q: unknown) => typeof q !== 'string')
    if (nonString.length > 0) {
      findings.push(
        finding(tracker, turnIndex, 'P1', 'quest_not_string',
          `active_quests con entradas no-string: ${JSON.stringify(nonString[0]).slice(0, 120)}`,
          ev, ['app/api/session/turn/route.ts'], true)
      )
    }
    // Quest completada que resucita
    for (const q of activeQuests) {
      if (typeof q === 'string' && tracker.completedQuests.has(q.toLowerCase())) {
        findings.push(
          finding(tracker, turnIndex, 'P1', 'quest_resurrected',
            `Quest completada reapareció activa: "${q}"`, ev,
            ['app/api/session/turn/route.ts'])
        )
      }
    }
  }
  const completed = body?.worldStateUpdates?.completed_quests
  if (Array.isArray(completed)) {
    for (const q of completed) {
      if (typeof q === 'string') tracker.completedQuests.add(q.toLowerCase())
    }
  }

  return findings
}

function truncateBody(body: unknown): unknown {
  try {
    const s = JSON.stringify(body)
    if (s.length <= 3000) return body
    return { _truncated: s.slice(0, 3000) }
  } catch {
    return { _unserializable: true }
  }
}
