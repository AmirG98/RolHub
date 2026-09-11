/**
 * Meta Conversions API (server-side Purchase).
 *
 * Por qué: el pixel del browser no mide compras cuando el comprador tiene
 * bloqueador (gamers 18-35: muy común) — 3 pagos reales, 0 medidos. Este
 * módulo manda el evento desde el webhook de Polar, que SIEMPRE llega.
 *
 * Deduplicación: el browser (GTM) y el servidor mandan el mismo `event_id`
 * (id de la suscripción de Polar); Meta descarta el duplicado. Para que
 * funcione, el tag de GTM tiene que pasar `{eventID: subscription_id}`.
 *
 * Atribución: fbc (click id del anuncio) y fbp viajan como metadata del
 * checkout de Polar y vuelven en la orden; sin ellos Meta solo puede matchear
 * por email hasheado.
 *
 * Config (Vercel): META_CAPI_ACCESS_TOKEN (obligatorio para enviar),
 * META_PIXEL_ID (opcional, default el pixel de rol-hub.com),
 * META_CAPI_TEST_EVENT_CODE (opcional, para ver los eventos en "Test events").
 * Nunca lanza: un fallo de Meta no puede romper el webhook de pagos.
 */
import { createHash } from 'crypto'

export const DEFAULT_META_PIXEL_ID = '1598440582009867'
const GRAPH_VERSION = 'v21.0'
const TIMEOUT_MS = 8000

export function isMetaCapiConfigured(): boolean {
  return Boolean(process.env.META_CAPI_ACCESS_TOKEN)
}

export function metaPixelId(): string {
  return process.env.META_PIXEL_ID || DEFAULT_META_PIXEL_ID
}

/** SHA-256 hex de un valor normalizado (minúsculas, sin espacios), como pide Meta. */
export function hashUserData(value: string | null | undefined): string | undefined {
  const v = (value ?? '').trim().toLowerCase()
  if (!v) return undefined
  return createHash('sha256').update(v).digest('hex')
}

export interface PurchaseEventInput {
  /** Id estable para deduplicar con el evento del browser (id de suscripción) */
  eventId: string
  /** 'Purchase' con cobro real; 'StartTrial' si la orden fue de 0 (trial) */
  eventName?: 'Purchase' | 'StartTrial'
  /** Unix seconds; default ahora */
  eventTime?: number
  value: number
  currency: string
  email?: string | null
  /** Nuestro user.id (se hashea) */
  externalId?: string | null
  /** Cookies/headers capturados al crear el checkout */
  fbc?: string | null
  fbp?: string | null
  clientIp?: string | null
  clientUserAgent?: string | null
  eventSourceUrl?: string
}

export interface MetaCapiResult {
  ok: boolean
  skipped?: 'not_configured' | 'invalid_input'
  status?: number
  eventsReceived?: number
  error?: string
}

interface MetaUserData {
  em?: string[]
  external_id?: string[]
  fbc?: string
  fbp?: string
  client_ip_address?: string
  client_user_agent?: string
}

/** Arma el payload sin enviarlo (testeable). */
export function buildPurchasePayload(input: PurchaseEventInput): Record<string, unknown> {
  const userData: MetaUserData = {}
  const em = hashUserData(input.email)
  if (em) userData.em = [em]
  const ext = hashUserData(input.externalId)
  if (ext) userData.external_id = [ext]
  if (input.fbc) userData.fbc = input.fbc
  if (input.fbp) userData.fbp = input.fbp
  if (input.clientIp) userData.client_ip_address = input.clientIp
  if (input.clientUserAgent) userData.client_user_agent = input.clientUserAgent

  const event: Record<string, unknown> = {
    event_name: input.eventName ?? 'Purchase',
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: 'website',
    event_source_url: input.eventSourceUrl ?? 'https://rol-hub.com/checkout/success',
    user_data: userData,
    custom_data: { value: input.value, currency: input.currency.toUpperCase() },
  }
  const payload: Record<string, unknown> = { data: [event] }
  if (process.env.META_CAPI_TEST_EVENT_CODE) payload.test_event_code = process.env.META_CAPI_TEST_EVENT_CODE
  return payload
}

/** Envía el evento a Meta. Nunca lanza. */
export async function sendMetaPurchaseEvent(
  input: PurchaseEventInput,
  fetchImpl: typeof fetch = fetch
): Promise<MetaCapiResult> {
  const token = process.env.META_CAPI_ACCESS_TOKEN
  if (!token) return { ok: false, skipped: 'not_configured' }
  if (!input.eventId || !Number.isFinite(input.value) || !input.currency) {
    return { ok: false, skipped: 'invalid_input' }
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${metaPixelId()}/events`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...buildPurchasePayload(input), access_token: token }),
      signal: controller.signal,
    })
    const body = (await res.json().catch(() => ({}))) as { events_received?: number; error?: { message?: string } }
    if (!res.ok) {
      const error = body.error?.message || `HTTP ${res.status}`
      console.error(`[Meta CAPI] ${input.eventName ?? 'Purchase'} ${input.eventId} rechazado: ${error}`)
      return { ok: false, status: res.status, error }
    }
    console.log(`[Meta CAPI] ${input.eventName ?? 'Purchase'} ${input.eventId} enviado (events_received=${body.events_received ?? '?'})`)
    return { ok: true, status: res.status, eventsReceived: body.events_received }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error(`[Meta CAPI] ${input.eventName ?? 'Purchase'} ${input.eventId} falló: ${error}`)
    return { ok: false, error }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Datos de atribución que capturamos al crear el checkout y viajan como
 * metadata de Polar (strings ≤ 500 chars). Vuelven en order.metadata.
 */
export interface AttributionMetadata {
  fbc?: string
  fbp?: string
  client_ip?: string
  client_ua?: string
}

export function attributionMetadataFromRequest(req: {
  headers: { get(name: string): string | null }
  cookies: { get(name: string): { value: string } | undefined }
}): AttributionMetadata {
  const out: AttributionMetadata = {}
  const fbc = req.cookies.get('_fbc')?.value
  const fbp = req.cookies.get('_fbp')?.value
  if (fbc) out.fbc = fbc.slice(0, 500)
  if (fbp) out.fbp = fbp.slice(0, 500)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || ''
  if (ip) out.client_ip = ip.slice(0, 100)
  const ua = req.headers.get('user-agent') || ''
  if (ua) out.client_ua = ua.slice(0, 300)
  return out
}

/** Lee la metadata de atribución tal como vuelve de Polar (valores desconocidos → ignorados). */
export function attributionFromPolarMetadata(metadata: unknown): AttributionMetadata {
  const out: AttributionMetadata = {}
  if (!metadata || typeof metadata !== 'object') return out
  const m = metadata as Record<string, unknown>
  for (const k of ['fbc', 'fbp', 'client_ip', 'client_ua'] as const) {
    const v = m[k]
    if (typeof v === 'string' && v.length > 0) out[k] = v
  }
  return out
}
