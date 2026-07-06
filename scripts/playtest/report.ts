// Genera el reporte del playtest en JSON (para máquinas: workflow, dedup)
// y markdown (para humanos: artifact, issues).

import fs from 'fs'
import path from 'path'
import type { PlaytestReport, SessionResult, Finding, Severity } from './findings'

export function buildReport(
  baseUrl: string,
  startedAt: string,
  sessions: SessionResult[]
): PlaytestReport {
  const allFindings = sessions.flatMap((s) => s.findings)
  const bySeverity: Record<Severity, number> = { P0: 0, P1: 0, P2: 0, P3: 0 }
  for (const f of allFindings) bySeverity[f.severity]++
  return {
    baseUrl,
    startedAt,
    finishedAt: new Date().toISOString(),
    sessions,
    totals: {
      turns: sessions.reduce((a, s) => a + s.turnsPlayed, 0),
      findings: allFindings.length,
      bySeverity,
    },
  }
}

export function writeReport(report: PlaytestReport, outDir: string): { jsonPath: string; mdPath: string } {
  fs.mkdirSync(outDir, { recursive: true })
  const jsonPath = path.join(outDir, 'report.json')
  const mdPath = path.join(outDir, 'report.md')
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  fs.writeFileSync(mdPath, toMarkdown(report))
  return { jsonPath, mdPath }
}

function toMarkdown(report: PlaytestReport): string {
  const lines: string[] = []
  lines.push(`# Playtest Report`)
  lines.push('')
  lines.push(`- **Target:** ${report.baseUrl}`)
  lines.push(`- **Corrida:** ${report.startedAt} → ${report.finishedAt}`)
  lines.push(`- **Turnos jugados:** ${report.totals.turns}`)
  lines.push(
    `- **Findings:** ${report.totals.findings} (P0: ${report.totals.bySeverity.P0}, P1: ${report.totals.bySeverity.P1}, P2: ${report.totals.bySeverity.P2}, P3: ${report.totals.bySeverity.P3})`
  )
  lines.push('')

  for (const session of report.sessions) {
    lines.push(`## Perfil: ${session.profile}`)
    lines.push(
      `- Sesión: ${session.sessionId || 'NO CREADA'} · Turnos: ${session.turnsPlayed}${session.aborted ? ` · ⚠️ Abortada: ${session.abortReason}` : ''}`
    )
    if (session.findings.length === 0) {
      lines.push(`- ✅ Sin hallazgos`)
    }
    for (const f of session.findings) {
      lines.push('')
      lines.push(`### [${f.severity}] ${f.check} — ${f.summary}`)
      lines.push(`- Fingerprint: \`${f.fingerprint}\``)
      lines.push(`- Turno: ${f.evidence.turnIndex} · Status: ${f.evidence.responseStatus ?? '—'} · Latencia: ${f.evidence.latencyMs ?? '—'}ms`)
      if (f.suspected_files?.length) {
        lines.push(`- Archivos sospechosos: ${f.suspected_files.join(', ')}`)
      }
      lines.push(`- Autofixable: ${f.autofixable ? 'sí' : 'no'}`)
      lines.push('')
      lines.push('<details><summary>Evidencia</summary>')
      lines.push('')
      lines.push('```json')
      lines.push(JSON.stringify({ request: f.evidence.request, response: f.evidence.responseBody }, null, 2).slice(0, 4000))
      lines.push('```')
      lines.push('')
      lines.push('</details>')
    }
    lines.push('')
  }
  return lines.join('\n')
}
