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

  it('order.paid → PRO (sin status de subscription)', async () => {
    await POST(makeReq({ type: 'order.paid', data: { id: 'ord_1', customerId: 'c1', customer: { externalId: USER.id } } }) as any)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ plan: 'PRO' }),
    }))
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
