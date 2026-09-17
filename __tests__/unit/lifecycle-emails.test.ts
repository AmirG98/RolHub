// @vitest-environment node
/**
 * Emails de seguimiento: segmentación, plantillas, token de baja y cron.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { pickTemplate, detectLocale, isRealEmail, type UserSnapshot } from '@/lib/email/segments'
import { renderEmail, extractHook } from '@/lib/email/templates'
import { unsubscribeToken, verifyUnsubscribeToken } from '@/lib/email/unsubscribe-token'

const NOW = new Date('2026-09-15T15:00:00Z')
const h = (n: number) => new Date(NOW.getTime() - n * 3600000)
const base = (over: Partial<UserSnapshot> = {}): UserSnapshot => ({
  plan: 'FREE', totalTurns: 0, createdAt: h(48), lastActiveAt: h(48), stripeCustomerId: null, stripeSubscriptionId: null,
  emailOptOut: false, email: 'player@example.com', sent: [], ...over,
})

describe('pickTemplate', () => {
  it('≤3 turnos → welcome_back; 4-24 → come_back; ≥25 → paywall_followup', () => {
    expect(pickTemplate(base({ totalTurns: 0 }), NOW)).toBe('welcome_back')
    expect(pickTemplate(base({ totalTurns: 3 }), NOW)).toBe('welcome_back')
    expect(pickTemplate(base({ totalTurns: 12 }), NOW)).toBe('come_back')
    expect(pickTemplate(base({ totalTurns: 25 }), NOW)).toBe('paywall_followup')
  })
  it('respeta la espera mínima por plantilla', () => {
    expect(pickTemplate(base({ totalTurns: 0, lastActiveAt: h(1) }), NOW)).toBeNull()
    expect(pickTemplate(base({ totalTurns: 12, lastActiveAt: h(10) }), NOW)).toBeNull()
    expect(pickTemplate(base({ totalTurns: 12, lastActiveAt: h(21) }), NOW)).toBe('come_back')
    expect(pickTemplate(base({ totalTurns: 25, lastActiveAt: h(2) }), NOW)).toBeNull()
  })
  it('no escribe a: opt-out, mails placeholder, >14 días, suscriptos, con checkout, ya enviados', () => {
    expect(pickTemplate(base({ emailOptOut: true }), NOW)).toBeNull()
    expect(pickTemplate(base({ email: 'x@placeholder.local' }), NOW)).toBeNull()
    expect(pickTemplate(base({ createdAt: h(24 * 15), lastActiveAt: h(24 * 15) }), NOW)).toBeNull()
    expect(pickTemplate(base({ stripeSubscriptionId: 'sub' }), NOW)).toBeNull()
    expect(pickTemplate(base({ stripeCustomerId: 'cus' }), NOW)).toBeNull()
    expect(pickTemplate(base({ plan: 'PRO' }), NOW)).toBeNull()
    expect(pickTemplate(base({ totalTurns: 25, sent: ['paywall_followup'] }), NOW)).toBeNull()
  })
  it('isRealEmail / detectLocale', () => {
    expect(isRealEmail('a@b.co')).toBe(true)
    expect(isRealEmail('guest_x@placeholder.local')).toBe(false)
    expect(isRealEmail('nope')).toBe(false)
    expect(detectLocale('La niebla se disipa sobre el puerto y el guardia te mira con desconfianza.')).toBe('es')
    expect(detectLocale('The fog lifts over the harbor and the guard eyes you with suspicion.')).toBe('en')
    expect(detectLocale(null)).toBe('en')
  })
})

describe('renderEmail', () => {
  const ctx = { locale: 'en' as const, characterName: 'Tyr', worldName: 'Adventure in Zombie Apocalypse', scene: "Garner's Sporting Goods", hook: 'The car alarm keeps screaming to the north.', playUrl: 'https://rol-hub.com/play/s1', pricingUrl: 'https://rol-hub.com/pricing', unsubscribeUrl: 'https://rol-hub.com/api/email/unsubscribe?u=1&t=x' }
  it('cada plantilla tiene subject, CTA correcto y link de baja, en ambos idiomas', () => {
    for (const locale of ['en', 'es'] as const) {
      const wb = renderEmail('welcome_back', { ...ctx, locale }); expect(wb.html).toContain(ctx.playUrl); expect(wb.html).toContain(ctx.unsubscribeUrl); expect(wb.text).toContain(ctx.unsubscribeUrl)
      const cb = renderEmail('come_back', { ...ctx, locale }); expect(cb.html).toContain(ctx.playUrl); expect(cb.html).toContain('Tyr'); expect(cb.html).toContain('car alarm')
      const pf = renderEmail('paywall_followup', { ...ctx, locale }); expect(pf.html).toContain(ctx.pricingUrl); expect(pf.html).toContain('8.99')
      // El trial de 3 días es el argumento más fuerte: tiene que estar en el asunto y en el cuerpo
      expect(pf.subject).toMatch(locale === 'en' ? /3 days free/ : /3 días gratis/)
      expect(pf.html).toMatch(locale === 'en' ? /3 days free/ : /3 días gratis/)
      expect(pf.text).toMatch(locale === 'en' ? /3 days free/ : /3 días gratis/)
      expect(wb.subject.length).toBeGreaterThan(10)
    }
    expect(renderEmail('come_back', { ...ctx, locale: 'es' }).subject).toContain('sigue parado')
  })
  it('escapa HTML en datos del usuario y tolera contexto vacío', () => {
    const r = renderEmail('welcome_back', { ...ctx, characterName: '<img src=x>', worldName: null, scene: null, hook: null })
    expect(r.html).not.toContain('<img src=x>')
    expect(r.html).toContain('&lt;img')
    expect(r.html).toContain('the world you chose')
  })
  it('extractHook toma la última oración útil y recorta', () => {
    expect(extractHook('You step in. **Reva** raises her hatchet. The car alarm keeps screaming to the north.')).toBe('The car alarm keeps screaming to the north.')
    expect(extractHook('Short. ' + 'x'.repeat(300) + '.')?.length).toBeLessThanOrEqual(160)
    expect(extractHook(null)).toBeNull()
    expect(extractHook('Ok.')).toBeNull()
  })
})

describe('unsubscribe token', () => {
  it('firma y verifica; rechaza tokens ajenos o alterados; null sin secreto', () => {
    process.env.EMAIL_UNSUBSCRIBE_SECRET = 'secret-1'
    const t = unsubscribeToken('usr_1')!
    expect(verifyUnsubscribeToken('usr_1', t)).toBe(true)
    expect(verifyUnsubscribeToken('usr_2', t)).toBe(false)
    expect(verifyUnsubscribeToken('usr_1', t.slice(0, -1) + 'A')).toBe(false)
    expect(verifyUnsubscribeToken('usr_1', '')).toBe(false)
    delete process.env.EMAIL_UNSUBSCRIBE_SECRET; delete process.env.CRON_SECRET
    expect(unsubscribeToken('usr_1')).toBeNull()
  })
})

describe('sendEmail', () => {
  it('sin API key → skipped; con cliente → manda con List-Unsubscribe', async () => {
    // el módulo está mockeado más abajo para el cron: acá va el real
    const { sendEmail } = await vi.importActual<typeof import('@/lib/email/send')>('@/lib/email/send')
    delete process.env.RESEND_API_KEY
    expect(await sendEmail('a@b.co', { subject: 's', html: '<p>h</p>', text: 't' }, 'https://u')).toEqual({ ok: false, skipped: 'not_configured' })
    const send = vi.fn().mockResolvedValue({ data: { id: 'em_1' }, error: null })
    const r = await sendEmail('a@b.co', { subject: 's', html: '<p>h</p>', text: 't' }, 'https://u', { emails: { send } })
    expect(r).toEqual({ ok: true, id: 'em_1' })
    expect(send.mock.calls[0][0]).toMatchObject({ to: 'a@b.co', subject: 's', headers: { 'List-Unsubscribe': '<https://u>' } })
    const fail = vi.fn().mockResolvedValue({ data: null, error: { message: 'domain not verified' } })
    expect(await sendEmail('a@b.co', { subject: 's', html: '', text: '' }, 'https://u', { emails: { send: fail } })).toEqual({ ok: false, error: 'domain not verified' })
  })
})

// ---- cron route ----
const mockFindMany = vi.fn(); const mockLogCreate = vi.fn(); const mockUpdateMany = vi.fn()
vi.mock('@/lib/db/prisma', () => ({ prisma: { user: { findMany: (...a: unknown[]) => mockFindMany(...a), updateMany: (...a: unknown[]) => mockUpdateMany(...a) }, emailLog: { create: (...a: unknown[]) => mockLogCreate(...a) } } }))
const mockSend = vi.fn()
vi.mock('@/lib/email/send', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/email/send')>()
  return { ...actual, isEmailConfigured: () => true, sendEmail: (...a: unknown[]) => mockSend(...a) }
})
import { GET as cronGET } from '@/app/api/cron/lifecycle-emails/route'
import { GET as unsubGET } from '@/app/api/email/unsubscribe/route'
import { NextRequest } from 'next/server'

// El cron usa Date.now() real: las filas se construyen relativas al reloj real
const hh = (n: number) => new Date(Date.now() - n * 3600000)
const userRow = (id: string, over: Record<string, unknown> = {}) => ({
  id, email: `${id}@example.com`, plan: 'FREE', totalTurns: 25, createdAt: hh(30), lastActiveAt: hh(30), stripeCustomerId: null, stripeSubscriptionId: null, emailOptOut: false,
  emailLogs: [], characters: [{ name: 'Tyr' }],
  campaigns: [{ name: 'Adventure in Zombie Apocalypse', lore: 'ZOMBIES', worldState: { current_scene: 'Base Camp' }, sessions: [{ id: 'sess_' + id, turns: [{ content: 'The gate creaks. Something moves in the dark beyond the fence.' }] }] }],
  ...over,
})
const req = (qs = '', auth = 'Bearer cron-secret') => new NextRequest('http://localhost/api/cron/lifecycle-emails' + qs, { headers: auth ? { authorization: auth } : {} })

beforeEach(() => { vi.clearAllMocks(); process.env.CRON_SECRET = 'cron-secret'; mockSend.mockResolvedValue({ ok: true, id: 'em_x' }); mockLogCreate.mockResolvedValue({}) })

describe('GET /api/cron/lifecycle-emails', () => {
  it('sin CRON_SECRET correcto → 401', async () => {
    expect((await cronGET(req('', 'Bearer nope'))).status).toBe(401)
  })
  it('dry run: planifica sin enviar ni registrar, mails enmascarados', async () => {
    mockFindMany.mockResolvedValue([userRow('u1'), userRow('u2', { totalTurns: 10, lastActiveAt: hh(25) }), userRow('u3', { totalTurns: 2, lastActiveAt: hh(1) })])
    const body = await (await cronGET(req('?dry=1'))).json()
    expect(body.dry).toBe(true)
    expect(body.candidates).toBe(2)
    expect(body.byTemplate).toEqual({ paywall_followup: 1, come_back: 1 })
    expect(body.plan[0].to).toBe('u1***@example.com')
    expect(mockSend).not.toHaveBeenCalled(); expect(mockLogCreate).not.toHaveBeenCalled()
  })
  it('envío real: manda con el link de la partida, registra en EmailLog, y no repite lo ya enviado', async () => {
    mockFindMany.mockResolvedValue([userRow('u1'), userRow('u2', { emailLogs: [{ template: 'paywall_followup' }] })])
    const body = await (await cronGET(req())).json()
    expect(body.sent).toBe(1)
    expect(mockSend).toHaveBeenCalledTimes(1)
    const [to, rendered] = mockSend.mock.calls[0]
    expect(to).toBe('u1@example.com')
    expect(rendered.html).toContain('/pricing?utm_source=email&utm_campaign=paywall_followup')
    expect(rendered.html).toContain('/api/email/unsubscribe?u=u1&t=')
    expect(mockLogCreate).toHaveBeenCalledWith({ data: { userId: 'u1', template: 'paywall_followup', providerId: 'em_x' } })
  })
  it('un fallo del proveedor no registra el log (se reintenta mañana)', async () => {
    mockFindMany.mockResolvedValue([userRow('u1')])
    mockSend.mockResolvedValue({ ok: false, error: 'boom' })
    const body = await (await cronGET(req())).json()
    expect(body.sent).toBe(0); expect(body.failed).toEqual([{ userId: 'u1', template: 'paywall_followup', error: 'boom' }])
    expect(mockLogCreate).not.toHaveBeenCalled()
  })
})

describe('GET /api/email/unsubscribe', () => {
  it('token válido → opt-out; inválido → 400 sin tocar la DB', async () => {
    process.env.EMAIL_UNSUBSCRIBE_SECRET = 'secret-1'
    const t = unsubscribeToken('usr_1')!
    mockUpdateMany.mockResolvedValue({ count: 1 })
    const ok = await unsubGET(new NextRequest(`http://localhost/api/email/unsubscribe?u=usr_1&t=${t}`))
    expect(ok.status).toBe(200); expect(mockUpdateMany).toHaveBeenCalledWith({ where: { id: 'usr_1' }, data: { emailOptOut: true } })
    const bad = await unsubGET(new NextRequest('http://localhost/api/email/unsubscribe?u=usr_1&t=wrong'))
    expect(bad.status).toBe(400); expect(mockUpdateMany).toHaveBeenCalledTimes(1)
  })
})

describe('ventana de edad configurable (?maxAgeDays)', () => {
  const old = base({ totalTurns: 25, createdAt: h(24 * 20), lastActiveAt: h(24 * 20) })
  it('por defecto excluye a los de más de 14 días', () => {
    expect(pickTemplate(old, NOW)).toBeNull()
  })
  it('con una ventana ampliada los incluye', () => {
    expect(pickTemplate(old, NOW, 30)).toBe('paywall_followup')
  })
  it('nunca pasa del tope duro de 45 días', () => {
    const ancient = base({ totalTurns: 25, createdAt: h(24 * 60), lastActiveAt: h(24 * 60) })
    expect(pickTemplate(ancient, NOW, 999)).toBeNull()
  })
})

describe('middleware: el link de baja tiene que ser público', () => {
  const src = fs.readFileSync(path.resolve(__dirname, '../../middleware.ts'), 'utf8')
  it('/api/email/unsubscribe está en las rutas públicas', () => {
    // Sin esto, el link del mail devuelve 401 a quien no tiene sesión de
    // Clerk (todos, al clickear desde su bandeja) y nadie puede darse de baja
    expect(src).toContain("'/api/email/unsubscribe'")
  })
  it('/api/email/preview también (valida CRON_SECRET adentro)', () => {
    expect(src).toContain("'/api/email/preview'")
  })
})

describe('calentamiento del dominio: tope diario y prioridad', () => {
  const mk = (id: string, turns: number) => userRow(id, { totalTurns: turns, lastActiveAt: hh(25) })
  it('?cap=2 manda solo 2 y prioriza paywall_followup sobre los demás', async () => {
    // 2 que no jugaron, 2 a mitad, 2 en el paywall — con cap=2 tienen que
    // salir los 2 del paywall (segmento más valioso), no los primeros por fecha
    mockFindMany.mockResolvedValue([mk('w1', 1), mk('w2', 2), mk('c1', 10), mk('c2', 12), mk('p1', 25), mk('p2', 30)])
    const body = await (await cronGET(req('?cap=2'))).json()
    expect(body.dailyCap).toBe(2)
    expect(body.sent).toBe(2)
    expect(mockSend).toHaveBeenCalledTimes(2)
    const subjects = mockSend.mock.calls.map((c) => c[1].subject)
    for (const s of subjects) expect(s).toMatch(/3 days free|3 días gratis/)
  })
  it('sin cap explícito usa el default conservador de 5', async () => {
    mockFindMany.mockResolvedValue(Array.from({ length: 12 }, (_, i) => mk('u' + i, 25)))
    const body = await (await cronGET(req('?dry=1'))).json()
    expect(body.dailyCap).toBe(5)
    expect(body.candidates).toBe(5)
  })
})

describe('cadencia: los mails salen espaciados, no en ráfaga', () => {
  const mk = (id: string) => userRow(id, { totalTurns: 25, lastActiveAt: hh(25) })
  it('con delayMs=0 no espacia (para tests y envíos puntuales)', async () => {
    mockFindMany.mockResolvedValue([mk('a'), mk('b'), mk('c')])
    const body = await (await cronGET(req('?cap=3&delayMs=0'))).json()
    expect(body.delayMs).toBe(0)
    expect(body.sent).toBe(3)
  })
  it('el tope efectivo se recorta por el timeout de la función', async () => {
    // Con 60s de pausa y ~255s de presupuesto, no caben 20 mails
    mockFindMany.mockResolvedValue(Array.from({ length: 20 }, (_, i) => mk('u' + i)))
    const body = await (await cronGET(req('?dry=1&cap=20&delayMs=60000'))).json()
    expect(body.dailyCap).toBe(20)
    expect(body.effectiveCap).toBeLessThan(20)
    expect(body.effectiveCap).toBeGreaterThan(0)
    expect(body.candidates).toBe(body.effectiveCap)
  })
  it('espacia de verdad entre envíos', async () => {
    vi.useFakeTimers()
    try {
      mockFindMany.mockResolvedValue([mk('a'), mk('b')])
      const p = cronGET(req('?cap=2&delayMs=20000'))
      await vi.waitFor(() => expect(mockSend).toHaveBeenCalledTimes(1))
      expect(mockSend).toHaveBeenCalledTimes(1) // el 2º espera la pausa
      await vi.advanceTimersByTimeAsync(20000)
      const body = await (await p).json()
      expect(body.sent).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })
})
