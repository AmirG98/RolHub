// Cliente HTTP del playtest: crea una sesión guest y juega turnos.
// Maneja el cookie jar manualmente (guest_user_id firmada HMAC que setea
// /api/session/guest-create vía Set-Cookie).

export interface TurnResponse {
  status: number
  latencyMs: number
  body: any // JSON parseado, o { _raw: string } si no era JSON
}

export interface GuestSession {
  sessionId: string
  campaignId: string
  characterId: string
  characterName: string
  cookie: string
}

const DEFAULT_TIMEOUT_MS = 60_000

// Header de bypass de rate limit (solo si el server tiene el mismo secreto).
// Permite al nightly correr desde una IP fija sin chocar con los caps de guest.
function playtestHeaders(): Record<string, string> {
  const token = process.env.PLAYTEST_BYPASS_TOKEN
  return token ? { 'x-playtest-token': token } : {}
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** Extrae la cookie guest_user_id del header Set-Cookie. */
function extractGuestCookie(res: Response): string | null {
  // Node 18+ / undici: getSetCookie() devuelve todas las Set-Cookie
  const setCookies: string[] =
    typeof (res.headers as any).getSetCookie === 'function'
      ? (res.headers as any).getSetCookie()
      : [res.headers.get('set-cookie') || ''].filter(Boolean)
  for (const c of setCookies) {
    const m = c.match(/guest_user_id=([^;]+)/)
    if (m) return `guest_user_id=${m[1]}`
  }
  return null
}

export async function createGuestSession(
  baseUrl: string,
  opts: { lore: string; archetypeId: string; characterName: string; locale?: 'es' | 'en' }
): Promise<{ session: GuestSession | null; raw: TurnResponse }> {
  const t0 = Date.now()
  let res: Response
  try {
    res = await fetchWithTimeout(`${baseUrl}/api/session/guest-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...playtestHeaders() },
      body: JSON.stringify({
        lore: opts.lore,
        archetypeId: opts.archetypeId,
        characterName: opts.characterName,
        locale: opts.locale ?? 'es',
      }),
    })
  } catch (err: any) {
    return {
      session: null,
      raw: { status: 0, latencyMs: Date.now() - t0, body: { _error: err?.message || 'network' } },
    }
  }

  const latencyMs = Date.now() - t0
  const text = await res.text()
  let body: any
  try {
    body = JSON.parse(text)
  } catch {
    body = { _raw: text.slice(0, 2000) }
  }

  const cookie = extractGuestCookie(res)
  if (!res.ok || !body?.sessionId || !cookie) {
    return { session: null, raw: { status: res.status, latencyMs, body } }
  }

  return {
    session: {
      sessionId: body.sessionId,
      campaignId: body.campaignId,
      characterId: body.characterId,
      characterName: opts.characterName,
      cookie,
    },
    raw: { status: res.status, latencyMs, body },
  }
}

export async function playTurn(
  baseUrl: string,
  session: GuestSession,
  payload: {
    action: string
    actionType?: 'do' | 'talk'
    diceRoll?: { formula: string; result: number; rolls: number[] }
    locale?: 'es' | 'en'
  }
): Promise<TurnResponse> {
  const t0 = Date.now()
  let res: Response
  try {
    res = await fetchWithTimeout(`${baseUrl}/api/session/turn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: session.cookie,
        ...playtestHeaders(),
      },
      body: JSON.stringify({
        sessionId: session.sessionId,
        campaignId: session.campaignId,
        action: payload.action,
        actionType: payload.actionType ?? 'do',
        diceRoll: payload.diceRoll,
        locale: payload.locale ?? 'es',
      }),
    })
  } catch (err: any) {
    return {
      status: 0,
      latencyMs: Date.now() - t0,
      body: { _error: err?.name === 'AbortError' ? 'timeout' : err?.message || 'network' },
    }
  }

  const latencyMs = Date.now() - t0
  const text = await res.text()
  let body: any
  try {
    body = JSON.parse(text)
  } catch {
    body = { _raw: text.slice(0, 2000) }
  }
  return { status: res.status, latencyMs, body }
}

/** Tirada local simulada para responder dice_requests del DM. */
export function rollDice(formula: string): { formula: string; result: number; rolls: number[] } {
  // Soporta NdX+M / NdX-M / NdX — suficiente para el playtest
  const m = formula.match(/(\d+)d(\d+)\s*([+-]\s*\d+)?/i)
  if (!m) return { formula, result: 10, rolls: [10] }
  const n = Math.min(parseInt(m[1], 10) || 1, 20)
  const sides = parseInt(m[2], 10) || 20
  const mod = m[3] ? parseInt(m[3].replace(/\s/g, ''), 10) : 0
  const rolls: number[] = []
  for (let i = 0; i < n; i++) rolls.push(1 + Math.floor(Math.random() * sides))
  return { formula, result: rolls.reduce((a, b) => a + b, 0) + mod, rolls }
}
