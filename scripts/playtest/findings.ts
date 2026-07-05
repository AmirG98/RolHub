// Tipos de los hallazgos del playtest.

export type Severity = 'P0' | 'P1' | 'P2' | 'P3'

export interface Finding {
  severity: Severity
  /** id estable del check que disparó (ej: 'http_5xx', 'hp_negative') */
  check: string
  /** hash estable para dedup de issues entre corridas */
  fingerprint: string
  summary: string
  evidence: {
    turnIndex: number
    request?: unknown
    responseStatus?: number
    responseBody?: unknown
    latencyMs?: number
    detail?: string
  }
  /** archivos sospechosos para el job de autofix (solo checks mapeables) */
  suspected_files?: string[]
  autofixable: boolean
  profile: string
  sessionId?: string
}

export interface SessionResult {
  profile: string
  sessionId: string | null
  turnsPlayed: number
  findings: Finding[]
  startedAt: string
  finishedAt: string
  aborted: boolean
  abortReason?: string
}

export interface PlaytestReport {
  baseUrl: string
  startedAt: string
  finishedAt: string
  sessions: SessionResult[]
  totals: {
    turns: number
    findings: number
    bySeverity: Record<Severity, number>
  }
}

/** Fingerprint estable: check + contexto normalizado (sin ids ni timestamps). */
export function makeFingerprint(check: string, context: string): string {
  // hash djb2 — suficiente para dedup, sin dependencias
  let h = 5381
  const s = `${check}::${context}`
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i)
  }
  return `${check}-${(h >>> 0).toString(16)}`
}
