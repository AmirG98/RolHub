// @vitest-environment node
/**
 * Tests del webhook de Lemon Squeezy: verificación de firma HMAC + mapeo de
 * eventos a cambios de plan. Mockea Prisma para verificar los updates.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'

const WEBHOOK_SECRET = 'test_secret_123'
process.env.LEMONSQUEEZY_WEBHOOK_SECRET = WEBHOOK_SECRET

// Mock de Prisma
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

import { POST } from '@/app/api/webhooks/lemonsqueezy/route'

const USER = { id: 'usr_1', clerkId: 'user_abc', stripeCustomerId: null }

function sign(body: string): string {
  return crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex')
}

function makeRequest(payload: unknown, opts: { signature?: string } = {}): Request {
  const body = JSON.stringify(payload)
  return new Request('http://localhost/api/webhooks/lemonsqueezy', {
    method: 'POST',
    headers: { 'x-signature': opts.signature ?? sign(body) },
    body,
  })
}

function subPayload(event: string, status: string, extra: Record<string, unknown> = {}) {
  return {
    meta: { event_name: event, custom_data: { user_id: USER.id, clerk_id: USER.clerkId } },
    data: { id: 'sub_99', attributes: { status, customer_id: 12345, ...extra } },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFindUnique.mockResolvedValue(USER)
  mockFindFirst.mockResolvedValue(USER)
})

describe('verificación de firma', () => {
  it('rechaza firma inválida con 401', async () => {
    const res = await POST(makeRequest(subPayload('subscription_created', 'active'), { signature: 'deadbeef' }) as any)
    expect(res.status).toBe(401)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('rechaza sin firma', async () => {
    const body = JSON.stringify(subPayload('subscription_created', 'active'))
    const req = new Request('http://localhost/x', { method: 'POST', body })
    expect((await POST(req as any)).status).toBe(401)
  })

  it('acepta firma válida', async () => {
    const res = await POST(makeRequest(subPayload('subscription_created', 'active')) as any)
    expect(res.status).toBe(200)
  })
})

describe('mapeo de eventos → plan', () => {
  it('subscription_created activo → PRO', async () => {
    await POST(makeRequest(subPayload('subscription_created', 'active')) as any)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: USER.id },
      data: expect.objectContaining({ plan: 'PRO', planExpiresAt: null, stripeSubscriptionId: 'sub_99' }),
    }))
  })

  it('on_trial también → PRO', async () => {
    await POST(makeRequest(subPayload('subscription_updated', 'on_trial')) as any)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ plan: 'PRO' }),
    }))
  })

  it('paused → FREE', async () => {
    await POST(makeRequest(subPayload('subscription_updated', 'paused')) as any)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ plan: 'FREE' }),
    }))
  })

  it('past_due NO cambia el plan (solo warn)', async () => {
    await POST(makeRequest(subPayload('subscription_updated', 'past_due')) as any)
    const call = mockUpdate.mock.calls[0][0]
    expect(call.data.plan).toBeUndefined() // no toca plan
  })

  it('cancelled con ends_at futuro → mantiene PRO hasta expirar', async () => {
    const future = new Date(Date.now() + 30 * 864e5).toISOString()
    await POST(makeRequest(subPayload('subscription_cancelled', 'cancelled', { ends_at: future })) as any)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ plan: 'PRO', stripeSubscriptionId: 'sub_99' }),
    }))
    expect(mockUpdate.mock.calls[0][0].data.planExpiresAt).toBeInstanceOf(Date)
  })

  it('cancelled con ends_at pasado → FREE', async () => {
    const past = new Date(Date.now() - 864e5).toISOString()
    await POST(makeRequest(subPayload('subscription_cancelled', 'cancelled', { ends_at: past })) as any)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ plan: 'FREE', planExpiresAt: null, stripeSubscriptionId: null }),
    }))
  })

  it('subscription_expired → FREE', async () => {
    await POST(makeRequest(subPayload('subscription_expired', 'expired')) as any)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ plan: 'FREE', planExpiresAt: null, stripeSubscriptionId: null }),
    }))
  })

  it('order_created → PRO', async () => {
    await POST(makeRequest({
      meta: { event_name: 'order_created', custom_data: { user_id: USER.id } },
      data: { id: 'ord_1', attributes: { status: 'paid', customer_id: 12345 } },
    }) as any)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ plan: 'PRO' }),
    }))
  })
})

describe('resolución de usuario', () => {
  it('usuario no encontrado → 200 sin update (no reintentar)', async () => {
    mockFindUnique.mockResolvedValue(null)
    mockFindFirst.mockResolvedValue(null)
    const res = await POST(makeRequest(subPayload('subscription_created', 'active')) as any)
    expect(res.status).toBe(200)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('sin user_id resuelve por customer_id', async () => {
    mockFindUnique.mockResolvedValue(null)
    const payload = {
      meta: { event_name: 'subscription_created' }, // sin custom_data
      data: { id: 'sub_x', attributes: { status: 'active', customer_id: 12345 } },
    }
    await POST(makeRequest(payload) as any)
    expect(mockFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { stripeCustomerId: '12345' },
    }))
    expect(mockUpdate).toHaveBeenCalled()
  })
})
