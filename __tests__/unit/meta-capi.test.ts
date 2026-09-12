// @vitest-environment node
/**
 * Meta Conversions API: 3 compras reales, 0 medidas por el pixel del browser
 * (bloqueadores). El servidor manda Purchase desde el webhook de Polar.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  buildPurchasePayload, sendMetaPurchaseEvent, hashUserData, isMetaCapiConfigured, metaPixelId,
  attributionFromPolarMetadata, attributionMetadataFromRequest, DEFAULT_META_PIXEL_ID, classifyPolarOrder,
} from '@/lib/meta/conversions-api'

const ORIGINAL = { ...process.env }
beforeEach(() => { process.env.META_CAPI_ACCESS_TOKEN = 'tok_test'; delete process.env.META_PIXEL_ID; delete process.env.META_CAPI_TEST_EVENT_CODE })
afterEach(() => { process.env = { ...ORIGINAL } })

describe('hashUserData', () => {
  it('normaliza (trim + minúsculas) y hashea SHA-256', () => {
    expect(hashUserData('  Amir@Example.com ')).toBe(hashUserData('amir@example.com'))
    expect(hashUserData('amir@example.com')).toMatch(/^[a-f0-9]{64}$/)
    expect(hashUserData('')).toBeUndefined()
    expect(hashUserData(null)).toBeUndefined()
  })
})

describe('buildPurchasePayload', () => {
  it('arma un Purchase con event_id, valor, moneda y user_data hasheado', () => {
    const p = buildPurchasePayload({ eventId: 'sub_1', value: 8.99, currency: 'usd', email: 'a@b.com', externalId: 'usr_1', fbc: 'fb.1.x', fbp: 'fb.1.y', clientIp: '1.2.3.4', clientUserAgent: 'UA' }) as { data: Array<Record<string, unknown>>; test_event_code?: string }
    const ev = p.data[0]
    expect(ev.event_name).toBe('Purchase')
    expect(ev.event_id).toBe('sub_1')
    expect(ev.action_source).toBe('website')
    expect(ev.custom_data).toEqual({ value: 8.99, currency: 'USD' })
    const ud = ev.user_data as Record<string, unknown>
    expect(ud.em).toEqual([hashUserData('a@b.com')])
    expect(ud.external_id).toEqual([hashUserData('usr_1')])
    expect(ud).toMatchObject({ fbc: 'fb.1.x', fbp: 'fb.1.y', client_ip_address: '1.2.3.4', client_user_agent: 'UA' })
    expect(JSON.stringify(p)).not.toContain('a@b.com') // nunca PII en claro
    expect(p.test_event_code).toBeUndefined()
  })
  it('sin email/atribución no manda campos vacíos; StartTrial cuando se pide', () => {
    const p = buildPurchasePayload({ eventId: 'sub_2', eventName: 'StartTrial', value: 0, currency: 'USD' }) as { data: Array<Record<string, unknown>> }
    expect(p.data[0].event_name).toBe('StartTrial')
    expect(Object.keys(p.data[0].user_data as object)).toEqual([])
  })
  it('agrega test_event_code si está configurado', () => {
    process.env.META_CAPI_TEST_EVENT_CODE = 'TEST123'
    expect((buildPurchasePayload({ eventId: 'x', value: 1, currency: 'usd' }) as { test_event_code?: string }).test_event_code).toBe('TEST123')
  })
})

describe('sendMetaPurchaseEvent', () => {
  it('sin token → skipped, sin fetch', async () => {
    delete process.env.META_CAPI_ACCESS_TOKEN
    const f = vi.fn()
    expect(isMetaCapiConfigured()).toBe(false)
    expect(await sendMetaPurchaseEvent({ eventId: 'x', value: 1, currency: 'usd' }, f as unknown as typeof fetch)).toEqual({ ok: false, skipped: 'not_configured' })
    expect(f).not.toHaveBeenCalled()
  })
  it('POSTea al pixel con el token en el body y devuelve events_received', async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ events_received: 1 }) })
    const r = await sendMetaPurchaseEvent({ eventId: 'sub_1', value: 8.99, currency: 'usd' }, f as unknown as typeof fetch)
    expect(r).toEqual({ ok: true, status: 200, eventsReceived: 1 })
    const [url, init] = f.mock.calls[0]
    expect(url).toBe(`https://graph.facebook.com/v21.0/${DEFAULT_META_PIXEL_ID}/events`)
    expect(JSON.parse(init.body).access_token).toBe('tok_test')
    expect(metaPixelId()).toBe(DEFAULT_META_PIXEL_ID)
  })
  it('respeta META_PIXEL_ID', async () => {
    process.env.META_PIXEL_ID = '999'
    const f = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
    await sendMetaPurchaseEvent({ eventId: 'sub_1', value: 1, currency: 'usd' }, f as unknown as typeof fetch)
    expect(f.mock.calls[0][0]).toContain('/999/events')
  })
  it('error de Meta → ok:false con mensaje, nunca lanza', async () => {
    const f = vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: { message: 'Invalid parameter' } }) })
    expect(await sendMetaPurchaseEvent({ eventId: 'sub_1', value: 1, currency: 'usd' }, f as unknown as typeof fetch)).toEqual({ ok: false, status: 400, error: 'Invalid parameter' })
    const g = vi.fn().mockRejectedValue(new Error('network down'))
    expect(await sendMetaPurchaseEvent({ eventId: 'sub_1', value: 1, currency: 'usd' }, g as unknown as typeof fetch)).toEqual({ ok: false, error: 'network down' })
  })
  it('input inválido → skipped', async () => {
    const f = vi.fn()
    expect(await sendMetaPurchaseEvent({ eventId: '', value: 1, currency: 'usd' }, f as unknown as typeof fetch)).toEqual({ ok: false, skipped: 'invalid_input' })
    expect(await sendMetaPurchaseEvent({ eventId: 'x', value: NaN, currency: 'usd' }, f as unknown as typeof fetch)).toEqual({ ok: false, skipped: 'invalid_input' })
  })
})

describe('atribución (checkout → Polar metadata → webhook)', () => {
  it('captura _fbc/_fbp, ip y user-agent del request del checkout', () => {
    const req = {
      headers: { get: (n: string) => ({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1', 'user-agent': 'Mozilla/5.0' } as Record<string, string>)[n] ?? null },
      cookies: { get: (n: string) => ({ _fbc: { value: 'fb.1.123.abc' }, _fbp: { value: 'fb.1.456.def' } } as Record<string, { value: string }>)[n] },
    }
    expect(attributionMetadataFromRequest(req)).toEqual({ fbc: 'fb.1.123.abc', fbp: 'fb.1.456.def', client_ip: '9.9.9.9', client_ua: 'Mozilla/5.0' })
  })
  it('sin cookies ni headers → objeto vacío (no manda claves vacías a Polar)', () => {
    expect(attributionMetadataFromRequest({ headers: { get: () => null }, cookies: { get: () => undefined } })).toEqual({})
  })
  it('lee la metadata que vuelve de Polar ignorando basura', () => {
    expect(attributionFromPolarMetadata({ user_id: 'u', fbc: 'fb.1.x', fbp: 7, client_ip: '', client_ua: 'UA' })).toEqual({ fbc: 'fb.1.x', client_ua: 'UA' })
    expect(attributionFromPolarMetadata(null)).toEqual({})
  })
})

describe('classifyPolarOrder (producto con trial gratis)', () => {
  const trialEnd = '2026-09-12T20:30:00Z'
  it('primera orden con monto → Purchase; con $0 → StartTrial', () => {
    expect(classifyPolarOrder({ billingReason: 'subscription_create', totalAmount: 899 })).toEqual({ kind: 'purchase', value: 8.99 })
    expect(classifyPolarOrder({ billingReason: 'purchase', totalAmount: 500 })).toEqual({ kind: 'purchase', value: 5 })
    expect(classifyPolarOrder({ billingReason: 'subscription_create', totalAmount: 0 })).toEqual({ kind: 'start_trial', value: 0 })
    expect(classifyPolarOrder({ totalAmount: 899 })).toEqual({ kind: 'purchase', value: 8.99 })
  })
  it('el primer cobro tras el trial (cycle con periodStart ≈ trialEnd) → Purchase', () => {
    expect(classifyPolarOrder({ billingReason: 'subscription_cycle', totalAmount: 899, subscription: { trialEnd, currentPeriodStart: '2026-09-12T20:30:05Z' } })).toEqual({ kind: 'purchase', value: 8.99 })
    expect(classifyPolarOrder({ billingReason: 'subscription_cycle', totalAmount: 899, subscription: { trialEnd: new Date(trialEnd), currentPeriodStart: new Date('2026-09-13T08:00:00Z') } })).toEqual({ kind: 'purchase', value: 8.99 })
  })
  it('renovaciones normales → skip', () => {
    expect(classifyPolarOrder({ billingReason: 'subscription_cycle', totalAmount: 899, subscription: { trialEnd, currentPeriodStart: '2026-10-12T20:30:00Z' } })).toEqual({ kind: 'skip', reason: 'renewal' })
    expect(classifyPolarOrder({ billingReason: 'subscription_cycle', totalAmount: 899, subscription: { trialEnd: null, currentPeriodStart: '2026-10-12T20:30:00Z' } })).toEqual({ kind: 'skip', reason: 'renewal' })
    expect(classifyPolarOrder({ billingReason: 'subscription_cycle', totalAmount: 899 })).toEqual({ kind: 'skip', reason: 'renewal' })
    expect(classifyPolarOrder({ billingReason: 'subscription_update', totalAmount: 100 })).toEqual({ kind: 'skip', reason: 'subscription_update' })
  })
})
