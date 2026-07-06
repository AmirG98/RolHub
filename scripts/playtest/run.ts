/**
 * Orquestador del playtest.
 *
 * Uso:
 *   npx tsx scripts/playtest/run.ts --base-url http://localhost:3000 \
 *     --profiles normal --max-turns 14 --out-dir playtest-results
 *
 * Env requerida: ANTHROPIC_API_KEY (el "jugador" usa Haiku).
 * Exit code: 0 siempre que el playtest complete (los findings se reportan,
 * no son fallos del script). 1 solo si el playtest en sí no pudo correr.
 */
import fs from 'fs'
import { createGuestSession, playTurn, rollDice } from './client'
import { decideAction } from './agent'
import { getProfile } from './profiles'
import { checkTurn, type SessionTracker } from './invariants'
import { buildReport, writeReport } from './report'
import type { SessionResult, Finding } from './findings'
import { makeFingerprint } from './findings'

interface CliArgs {
  baseUrl: string
  profiles: string[]
  maxTurns: number
  outDir: string
  locale: 'es' | 'en'
}

function parseArgs(): CliArgs {
  const argv = process.argv.slice(2)
  const get = (flag: string, fallback: string): string => {
    const i = argv.indexOf(flag)
    return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
  }
  return {
    baseUrl: get('--base-url', 'http://localhost:3000').replace(/\/$/, ''),
    profiles: get('--profiles', 'normal').split(',').map((s) => s.trim()).filter(Boolean),
    maxTurns: Math.min(parseInt(get('--max-turns', '14'), 10) || 14, 14), // cap duro < GUEST_TURN_CAP
    outDir: get('--out-dir', 'playtest-results'),
    locale: (get('--locale', 'es') === 'en' ? 'en' : 'es'),
  }
}

async function playSession(args: CliArgs, profileId: string): Promise<SessionResult> {
  const profile = getProfile(profileId)
  const startedAt = new Date().toISOString()
  const findings: Finding[] = []

  console.log(`\n━━━ Perfil "${profileId}" · ${profile.lore}/${profile.archetypeId} ━━━`)

  // 1. Crear sesión guest
  const { session, raw } = await createGuestSession(args.baseUrl, {
    lore: profile.lore,
    archetypeId: profile.archetypeId,
    characterName: profile.characterName,
    locale: args.locale,
  })

  if (!session) {
    const isRateLimit = raw.status === 429
    findings.push({
      severity: isRateLimit ? 'P3' : 'P0',
      check: isRateLimit ? 'guest_create_rate_limited' : 'guest_create_failed',
      fingerprint: makeFingerprint('guest_create', `${profileId}:${raw.status}`),
      summary: `guest-create falló con HTTP ${raw.status}`,
      evidence: { turnIndex: 0, responseStatus: raw.status, responseBody: raw.body, latencyMs: raw.latencyMs },
      suspected_files: isRateLimit ? undefined : ['app/api/session/guest-create/route.ts'],
      autofixable: false,
      profile: profileId,
    })
    return {
      profile: profileId, sessionId: null, turnsPlayed: 0, findings,
      startedAt, finishedAt: new Date().toISOString(), aborted: true,
      abortReason: `guest-create HTTP ${raw.status}`,
    }
  }

  console.log(`  sesión: ${session.sessionId} (${raw.latencyMs}ms)`)

  const tracker: SessionTracker = {
    characterName: profile.characterName,
    locale: args.locale,
    profile: profileId,
    sessionId: session.sessionId,
    completedQuests: new Set(),
    lastHp: null,
  }

  // 2. Loop de turnos
  let narration = 'Comenzás tu aventura.'
  let suggestedActions: string[] = []
  let pendingDice: { formula: string } | null = null
  let turnsPlayed = 0
  let consecutiveFailures = 0

  for (let i = 1; i <= args.maxTurns; i++) {
    const decision = pendingDice
      ? { action: 'Tiro los dados', actionType: 'do' as const }
      : await decideAction(profile, narration, suggestedActions, i)

    const payload = {
      action: decision.action,
      actionType: decision.actionType,
      locale: args.locale,
      ...(pendingDice ? { diceRoll: rollDice(pendingDice.formula) } : {}),
    }

    const res = await playTurn(args.baseUrl, session, payload)
    turnsPlayed++

    const turnFindings = checkTurn(tracker, i, { action: payload.action, diceRoll: payload.diceRoll }, res)
    findings.push(...turnFindings)

    const statusIcon = res.status === 200 ? '✓' : '✗'
    console.log(
      `  [${i}/${args.maxTurns}] ${statusIcon} ${res.status} ${res.latencyMs}ms — "${decision.action.slice(0, 60)}"${
        turnFindings.length > 0 ? ` ⚠️ ${turnFindings.map((f) => f.check).join(',')}` : ''
      }`
    )

    if (res.status === 429) {
      return {
        profile: profileId, sessionId: session.sessionId, turnsPlayed, findings,
        startedAt, finishedAt: new Date().toISOString(), aborted: true,
        abortReason: 'rate limited (esperado por caps de guest)',
      }
    }

    if (res.status !== 200) {
      consecutiveFailures++
      if (consecutiveFailures >= 3) {
        return {
          profile: profileId, sessionId: session.sessionId, turnsPlayed, findings,
          startedAt, finishedAt: new Date().toISOString(), aborted: true,
          abortReason: '3 fallos consecutivos',
        }
      }
      continue
    }
    consecutiveFailures = 0

    // Preparar el próximo turno
    narration = typeof res.body?.narration === 'string' ? res.body.narration : narration
    suggestedActions = Array.isArray(res.body?.suggestedActions) ? res.body.suggestedActions : []
    pendingDice = res.body?.diceRequest?.formula ? { formula: res.body.diceRequest.formula } : null
  }

  return {
    profile: profileId, sessionId: session.sessionId, turnsPlayed, findings,
    startedAt, finishedAt: new Date().toISOString(), aborted: false,
  }
}

async function main() {
  const args = parseArgs()

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY no está definida — el jugador Haiku la necesita')
    process.exit(1)
  }

  console.log(`Playtest contra ${args.baseUrl} — perfiles: ${args.profiles.join(', ')} — máx ${args.maxTurns} turnos c/u`)
  const startedAt = new Date().toISOString()
  const sessions: SessionResult[] = []

  // Secuencial a propósito: una sesión por vez respeta rate limits y no
  // satura el DM de prod.
  for (const profileId of args.profiles) {
    try {
      sessions.push(await playSession(args, profileId))
    } catch (err: any) {
      console.error(`Perfil ${profileId} crasheó:`, err?.message)
      sessions.push({
        profile: profileId, sessionId: null, turnsPlayed: 0,
        findings: [{
          severity: 'P0', check: 'playtest_crash',
          fingerprint: makeFingerprint('playtest_crash', `${profileId}:${err?.message?.slice(0, 60)}`),
          summary: `El playtest crasheó: ${err?.message}`,
          evidence: { turnIndex: 0, detail: err?.stack?.slice(0, 1000) },
          autofixable: false, profile: profileId,
        }],
        startedAt, finishedAt: new Date().toISOString(), aborted: true, abortReason: 'crash',
      })
    }
  }

  const report = buildReport(args.baseUrl, startedAt, sessions)
  const { jsonPath, mdPath } = writeReport(report, args.outDir)

  console.log(`\n━━━ Resumen ━━━`)
  console.log(`Turnos: ${report.totals.turns} · Findings: ${report.totals.findings}`)
  console.log(`P0: ${report.totals.bySeverity.P0} · P1: ${report.totals.bySeverity.P1} · P2: ${report.totals.bySeverity.P2} · P3: ${report.totals.bySeverity.P3}`)
  console.log(`Reporte: ${jsonPath} / ${mdPath}`)

  // Outputs para GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    const actionable = report.sessions.flatMap((s) => s.findings)
      .filter((f) => f.severity === 'P0' || f.severity === 'P1')
    const autofixable = actionable.filter((f) => f.autofixable)
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `has_findings=${actionable.length > 0}\n` +
      `autofixable_count=${autofixable.length}\n`
    )
  }
}

main().catch((err) => {
  console.error('Playtest runner falló:', err)
  process.exit(1)
})
