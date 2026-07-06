/**
 * Crea GitHub Issues a partir del report.json del playtest, con deduplicación
 * por fingerprint. Pensado para correr dentro del workflow nightly.
 *
 * Uso: GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo \
 *        npx tsx scripts/playtest/file-issues.ts playtest-results/report.json
 *
 * Dedup: busca issues abiertos con label 'playtest' cuyo body contenga el
 * fingerprint. Si existe → comenta "+1 visto"; si no → crea uno nuevo.
 * Cap: MAX_NEW_ISSUES (default 5) issues nuevos por corrida.
 *
 * Emite en GITHUB_OUTPUT los fingerprints autofixables (para el job autofix).
 */
import fs from 'fs'
import type { PlaytestReport, Finding } from './findings'

const MAX_NEW_ISSUES = parseInt(process.env.MAX_NEW_ISSUES || '5', 10)

interface GhContext {
  token: string
  owner: string
  repo: string
}

async function gh(ctx: GhContext, path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${ctx.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub API ${res.status} en ${path}: ${text.slice(0, 300)}`)
  }
  return res.status === 204 ? null : res.json()
}

/** Busca un issue abierto que ya reporte este fingerprint. */
async function findExistingIssue(ctx: GhContext, fingerprint: string): Promise<number | null> {
  const q = encodeURIComponent(`repo:${ctx.owner}/${ctx.repo} is:issue is:open label:playtest "${fingerprint}" in:body`)
  const data = await gh(ctx, `/search/issues?q=${q}`)
  return data.total_count > 0 ? data.items[0].number : null
}

function severityLabel(f: Finding): string {
  return `severity:${f.severity.toLowerCase()}`
}

function issueBody(f: Finding, report: PlaytestReport): string {
  return [
    `**Detectado por el playtest automático** (${report.baseUrl})`,
    '',
    `- **Severidad:** ${f.severity}`,
    `- **Check:** \`${f.check}\``,
    `- **Perfil:** ${f.profile}`,
    `- **Fingerprint:** \`${f.fingerprint}\``,
    `- **Autofixable:** ${f.autofixable ? 'sí' : 'no'}`,
    f.suspected_files?.length ? `- **Archivos sospechosos:** ${f.suspected_files.map((x) => `\`${x}\``).join(', ')}` : '',
    '',
    '### Evidencia',
    '```json',
    JSON.stringify(f.evidence, null, 2).slice(0, 5000),
    '```',
    '',
    '<sub>Issue generado automáticamente. El fingerprint permite deduplicar en corridas futuras — no lo borres del body.</sub>',
  ].filter(Boolean).join('\n')
}

async function main() {
  const reportPath = process.argv[2]
  if (!reportPath) throw new Error('Falta el path al report.json')

  const token = process.env.GITHUB_TOKEN
  const repository = process.env.GITHUB_REPOSITORY // "owner/repo"
  if (!token || !repository) throw new Error('GITHUB_TOKEN y GITHUB_REPOSITORY requeridos')
  const [owner, repo] = repository.split('/')
  const ctx: GhContext = { token, owner, repo }

  const report: PlaytestReport = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))

  // Solo reportamos P0/P1 (accionables); dedup por fingerprint dentro de la corrida
  const actionable = report.sessions
    .flatMap((s) => s.findings)
    .filter((f) => f.severity === 'P0' || f.severity === 'P1')

  const seen = new Set<string>()
  const unique = actionable.filter((f) => {
    if (seen.has(f.fingerprint)) return false
    seen.add(f.fingerprint)
    return true
  })

  console.log(`${unique.length} findings únicos accionables (de ${actionable.length} totales)`)

  const autofixable: Array<{ fingerprint: string; issue: number }> = []
  let created = 0

  for (const f of unique) {
    const existing = await findExistingIssue(ctx, f.fingerprint)
    if (existing) {
      await gh(ctx, `/repos/${owner}/${repo}/issues/${existing}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: `🔁 Visto de nuevo en el playtest del ${report.startedAt}.` }),
      })
      console.log(`  #${existing} ya existía (${f.fingerprint}) → comentado`)
      if (f.autofixable) autofixable.push({ fingerprint: f.fingerprint, issue: existing })
      continue
    }

    if (created >= MAX_NEW_ISSUES) {
      console.log(`  Cap de ${MAX_NEW_ISSUES} issues nuevos alcanzado — ${f.fingerprint} solo en el artifact`)
      continue
    }

    const issue = await gh(ctx, `/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({
        title: `[playtest] ${f.check}: ${f.summary.slice(0, 100)}`,
        body: issueBody(f, report),
        labels: ['playtest', severityLabel(f), ...(f.autofixable ? ['autofixable'] : [])],
      }),
    })
    created++
    console.log(`  #${issue.number} creado (${f.fingerprint})`)
    if (f.autofixable) autofixable.push({ fingerprint: f.fingerprint, issue: issue.number })
  }

  console.log(`\nCreados: ${created} · Autofixables: ${autofixable.length}`)

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `autofixable=${JSON.stringify(autofixable)}\n` +
      `created_count=${created}\n`
    )
  }
}

main().catch((err) => {
  console.error('file-issues falló:', err)
  process.exit(1)
})
