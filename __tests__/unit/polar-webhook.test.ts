// @vitest-environment node
/**
 * Tests del webhook de Polar: mapeo de eventos → cambios de plan.
 * La verificación de firma la hace validateEvent del SDK (mockeado acá);
 * testeamos nuestra lógica de reconciliación de usuario y updates de plan.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

process.env.POLAR_WEBHOOK_SECRET = 'test_secret'

// Mock del SDK de webhooks: validateEvent devuelve lo que le pasamos por header
let mockEvent: any = null
vi.mock('@polar-sh/sdk/webhooks', () => ({
  validateEvent: (body: string) => {
    if (mockEvent === 'INVALID') {
      const e = new Error('invalid') as any
      e.name = 'WebhookVerificationError'
      throw Object.assign(e, { __proto__: WebhookVerificationErrorMock.prototype })
    }
    return JSON.parse(body)
  },
  WebhookVerificationError: class WebhookVerificationErrorMock extends Error {},
}))
class WebhookVerificationErrorMock extends Error {}

const mockUpdate = vi.fn()
const mockFindUnique = vi.fn()
const mockFindFirst = vi.fn()
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      update: (...a: unknown[]) => mockUpdate(...a),
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
      findFirst: (...a: unknown[]) => mockFindFirst(...a),
    },
  },
}))

const mockSendMeta = vi.fn()
vi.mock('@/lib/meta/conversions-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/meta/conversions-api')>()
  return { ...actual, sendMetaPurchaseEvent: (...a: unknown[]) => mockSendMeta(...a) }
})

import { POST } from '@/app/api/webhooks/polar/route'

const USER = { id: 'usr_1', clerkId: 'user_abc', stripeCustomerId: null, stripeSubscriptionId: null }

function makeReq(event: any): Request {
  return new Request('http://localhost/api/webhooks/polar', {
    method: 'POST',
    headers: { 'webhook-signature': 'sig', 'webhook-id': 'id', 'webhook-timestamp': '1' },
    body: JSON.stringify(event),
  })
}

function subEvent(type: string, status: string, extra: Record<string, unknown> = {}) {
  return {
    type,
    data: {
      id: 'sub_1',
      status,
      customerId: 'polar_cust_1',
      customer: { externalId: USER.id },
      metadata: { user_id: USER.id },
      ...extra,
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSendMeta.mockResolvedValue({ ok: true })
  mockEvent = null
  mockFindUnique.mockResolvedValue(USER)
  mockFindFirst.mockResolvedValue(USER)
})

describe('mapeo de eventos Polar → plan', () => {
  it('subscription.active → PRO', async () => {
    const res = await POST(makeReq(subEvent('subscription.active', 'active')) as any)
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: USER.id },
      data: expect.objectContaining({ plan: 'PRO', planExpiresAt: null, stripeSubscriptionId: 'sub_1' }),
    }))
  })

  it('subscription.created activo → PRO', async () => {
    await POST(makeReq(subEvent('subscription.created', 'active')) as any)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ plan: 'PRO' }),
    }))
  })

  it('order.paid sin subscription embebida → PRO, y NO guarda el id de la ORDEN como suscripción', async () => {
    await POST(makeReq({ type: 'order.paid', data: { id: 'ord_1', customerId: 'c1', customer: { externalId: USER.id } } }) as any)
    const data = mockUpdate.mock.calls[0][0].data
    expect(data.plan).toBe('PRO')
    expect(data.stripeSubscriptionId).toBeUndefined()
  })

  it('order.paid con subscription embebida → deriva expiry e id de la suscripción', async () => {
    await POST(makeReq({
      type: 'order.paid',
      data: {
        id: 'ord_2', customerId: 'c1', customer: { externalId: USER.id }, subscriptionId: 'sub_9',
        subscription: { id: 'sub_9', status: 'active', cancelAtPeriodEnd: true, currentPeriodEnd: '2030-01-01T00:00:00Z' },
      },
    }) as any)
    const data = mockUpdate.mock.calls[0][0].data
    expect(data.plan).toBe('PRO')
    expect(data.stripeSubscriptionId).toBe('sub_9')
    expect(new Date(data.planExpiresAt).toISOString()).toBe('2030-01-01T00:00:00.000Z')
  })

  it('subscription.updated activa con cancelAtPeriodEnd → PRO con vencimiento (no pisa el expiry)', async () => {
    await POST(makeReq(subEvent('subscription.updated', 'active', {
      cancelAtPeriodEnd: true,
      currentPeriodEnd: '2030-01-01T00:00:00Z',
    })) as any)
    const data = mockUpdate.mock.calls[0][0].data
    expect(data.plan).toBe('PRO')
    expect(new Date(data.planExpiresAt).toISOString()).toBe('2030-01-01T00:00:00.000Z')
  })

  it('past_due NO cambia el plan', async () => {
    await POST(makeReq(subEvent('subscription.updated', 'past_due')) as any)
    expect(mockUpdate.mock.calls[0][0].data.plan).toBeUndefined()
  })

  it('subscription.canceled con endsAt futuro → mantiene PRO', async () => {
    const future = new Date(Date.now() + 30 * 864e5).toISOString()
    await POST(makeReq(subEvent('subscription.canceled', 'canceled', { endsAt: future })) as any)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ plan: 'PRO' }),
    }))
  })

  it('subscription.canceled con endsAt pasado → FREE', async () => {
    const past = new Date(Date.now() - 864e5).toISOString()
    await POST(makeReq(subEvent('subscription.canceled', 'canceled', { endsAt: past })) as any)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ plan: 'FREE', planExpiresAt: null, stripeSubscriptionId: null }),
    }))
  })

  it('subscription.revoked → FREE', async () => {
    await POST(makeReq(subEvent('subscription.revoked', 'revoked')) as any)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ plan: 'FREE', stripeSubscriptionId: null }),
    }))
  })
})

describe('reconciliación de usuario', () => {
  it('resuelve por externalId (customer.externalId)', async () => {
    await POST(makeReq(subEvent('subscription.active', 'active')) as any)
    expect(mockFindUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: USER.id } }))
  })

  it('usuario no encontrado → 200 sin update', async () => {
    mockFindUnique.mockResolvedValue(null)
    mockFindFirst.mockResolvedValue(null)
    const res = await POST(makeReq(subEvent('subscription.active', 'active')) as any)
    expect(res.status).toBe(200)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('sin externalId ni metadata → resuelve por customerId de Polar', async () => {
    mockFindUnique.mockResolvedValue(null)
    const ev = { type: 'subscription.active', data: { id: 's1', status: 'active', customerId: 'polar_cust_1' } }
    await POST(makeReq(ev) as any)
    expect(mockFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { stripeCustomerId: 'polar_cust_1' },
    }))
  })
})

describe('Meta Conversions API desde el webhook', () => {
  it('order.paid de la primera orden → Purchase con event_id = suscripción, monto y atribución', async () => {
    await POST(makeReq({
      type: 'order.paid',
      data: {
        id: 'ord_1', customerId: 'c1', customer: { externalId: USER.id, email: 'buyer@x.com' },
        subscriptionId: 'sub_9', billingReason: 'subscription_create', totalAmount: 899, currency: 'usd',
        createdAt: '2026-09-11T14:47:19.000Z',
        metadata: { user_id: USER.id, fbc: 'fb.1.1.abc', fbp: 'fb.1.2.def', client_ip: '1.1.1.1', client_ua: 'UA' },
      },
    }) as any)
    expect(mockSendMeta).toHaveBeenCalledTimes(1)
    expect(mockSendMeta.mock.calls[0][0]).toMatchObject({
      eventId: 'sub_9', eventName: 'Purchase', value: 8.99, currency: 'usd', email: 'buyer@x.com', externalId: USER.id,
      fbc: 'fb.1.1.abc', fbp: 'fb.1.2.def', clientIp: '1.1.1.1', clientUserAgent: 'UA',
      eventTime: Math.floor(new Date('2026-09-11T14:47:19.000Z').getTime() / 1000),
    })
  })

  it('renovación (subscription_cycle) NO manda Purchase', async () => {
    await POST(makeReq({ type: 'order.paid', data: { id: 'ord_2', customerId: 'c1', customer: { externalId: USER.id }, subscriptionId: 'sub_9', billingReason: 'subscription_cycle', totalAmount: 899, currency: 'usd' } }) as any)
    expect(mockSendMeta).not.toHaveBeenCalled()
  })

  it('orden de 0 (trial) → StartTrial, no Purchase', async () => {
    await POST(makeReq({ type: 'order.paid', data: { id: 'ord_3', customerId: 'c1', customer: { externalId: USER.id }, subscriptionId: 'sub_10', billingReason: 'subscription_create', totalAmount: 0, currency: 'usd' } }) as any)
    expect(mockSendMeta.mock.calls[0][0]).toMatchObject({ eventId: 'sub_10', eventName: 'StartTrial', value: 0 })
  })

  it('primer cobro real tras el trial (subscription_cycle) → Purchase', async () => {
    await POST(makeReq({ type: 'order.paid', data: { id: 'ord_5', customerId: 'c1', customer: { externalId: USER.id }, subscriptionId: 'sub_9', billingReason: 'subscription_cycle', totalAmount: 899, currency: 'usd', subscription: { id: 'sub_9', status: 'active', trialEnd: '2026-09-12T20:30:00Z', currentPeriodStart: '2026-09-12T20:30:01Z' } } }) as any)
    expect(mockSendMeta.mock.calls[0][0]).toMatchObject({ eventId: 'sub_9', eventName: 'Purchase', value: 8.99 })
  })

  it('subscription.active no manda nada (solo order.paid)', async () => {
    await POST(makeReq(subEvent('subscription.active', 'active')) as any)
    expect(mockSendMeta).not.toHaveBeenCalled()
  })

  it('si Meta falla el webhook igual responde 200 y el plan se activó', async () => {
    mockSendMeta.mockResolvedValue({ ok: false, error: 'boom' })
    const res = await POST(makeReq({ type: 'order.paid', data: { id: 'ord_4', customerId: 'c1', customer: { externalId: USER.id }, subscriptionId: 'sub_11', totalAmount: 899, currency: 'usd' } }) as any)
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalled()
  })
})
