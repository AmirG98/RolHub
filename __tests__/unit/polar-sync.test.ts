// @vitest-environment node
/**
 * Tests de /api/billing/sync y de los helpers puros de plan en lib/polar.
 * El endpoint es el fallback "pull" de activación: si el webhook de Polar no
 * llegó todavía (o nunca), consulta a Polar y activa PRO igual.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

process.env.POLAR_ACCESS_TOKEN = 'tok'
process.env.POLAR_PRODUCT_ID = 'prod_rolhub'

let mockClerkId: string | null = 'user_abc'
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => Promise.resolve({ userId: mockClerkId }),
}))

const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
      update: (...a: unknown[]) => mockUpdate(...a),
    },
  },
}))

const mockGetState = vi.fn()
vi.mock('@/lib/polar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/polar')>()
  return {
    ...actual,
    isPolarConfigured: () => true,
    getPolar: () => ({ customers: { getStateExternal: (...a: unknown[]) => mockGetState(...a) } }),
  }
})

import { POST } from '@/app/api/billing/sync/route'
import { pickActiveSubscription, planFieldsFromActiveSubscription } from '@/lib/polar'

const FREE_USER = { id: 'usr_1', plan: 'FREE', planExpiresAt: null, stripeSubscriptionId: null, stripeCustomerId: null }

beforeEach(() => {
  vi.clearAllMocks()
  mockClerkId = 'user_abc'
  mockFindUnique.mockResolvedValue(FREE_USER)
  mockUpdate.mockResolvedValue({})
})

describe('pickActiveSubscription', () => {
  it('devuelve null si no hay suscripciones activas', () => {
    expect(pickActiveSubscription([])).toBeNull()
    expect(pickActiveSubscription([{ id: 's', status: 'canceled' }])).toBeNull()
  })

  it('prefiere la que coincide con POLAR_PRODUCT_ID', () => {
    const subs = [
      { id: 'other', status: 'active', productId: 'prod_x' },
      { id: 'mine', status: 'active', productId: 'prod_rolhub' },
    ]
    expect(pickActiveSubscription(subs, 'prod_rolhub')?.id).toBe('mine')
  })

  it('cae a cualquier activa si ninguna coincide con el product id', () => {
    const subs = [{ id: 'only', status: 'trialing', productId: 'prod_x' }]
    expect(pickActiveSubscription(subs, 'prod_rolhub')?.id).toBe('only')
  })
})

describe('planFieldsFromActiveSubscription', () => {
  it('suscripción que renueva → sin vencimiento', () => {
    const f = planFieldsFromActiveSubscription({ id: 's1', status: 'active', cancelAtPeriodEnd: false, currentPeriodEnd: '2030-01-01T00:00:00Z' })
    expect(f).toEqual({ plan: 'PRO', planExpiresAt: null, stripeSubscriptionId: 's1' })
  })

  it('cancelada a fin de período → vence en currentPeriodEnd', () => {
    const f = planFieldsFromActiveSubscription({ id: 's1', status: 'active', cancelAtPeriodEnd: true, currentPeriodEnd: '2030-01-01T00:00:00Z' })
    expect(f.planExpiresAt?.toISOString()).toBe('2030-01-01T00:00:00.000Z')
  })

  it('cancelada sin currentPeriodEnd → usa endsAt', () => {
    const f = planFieldsFromActiveSubscription({ id: 's1', status: 'active', cancelAtPeriodEnd: true, endsAt: '2031-06-01T00:00:00Z' })
    expect(f.planExpiresAt?.toISOString()).toBe('2031-06-01T00:00:00.000Z')
  })
})

describe('POST /api/billing/sync', () => {
  it('sin sesión → 401', async () => {
    mockClerkId = null
    const res = await POST()
    expect(res.status).toBe(401)
    expect(mockGetState).not.toHaveBeenCalled()
  })

  it('ya PRO en DB → active sin consultar a Polar (idempotente)', async () => {
    mockFindUnique.mockResolvedValue({ ...FREE_USER, plan: 'PRO', stripeSubscriptionId: 'sub_db' })
    const res = await POST()
    const body = await res.json()
    expect(body).toMatchObject({ plan: 'PRO', active: true, source: 'db', subscriptionId: 'sub_db' })
    expect(mockGetState).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('PRO vencido en DB → consulta a Polar en vez de confiar en la DB', async () => {
    mockFindUnique.mockResolvedValue({ ...FREE_USER, plan: 'PRO', planExpiresAt: new Date(Date.now() - 864e5) })
    mockGetState.mockResolvedValue({ id: 'cust_1', activeSubscriptions: [] })
    const body = await (await POST()).json()
    expect(mockGetState).toHaveBeenCalledWith({ externalId: 'usr_1' })
    expect(body.active).toBe(false)
  })

  it('FREE + suscripción activa en Polar → activa PRO y guarda ids', async () => {
    mockGetState.mockResolvedValue({
      id: 'cust_1',
      activeSubscriptions: [{ id: 'sub_1', status: 'active', productId: 'prod_rolhub', cancelAtPeriodEnd: false, currentPeriodEnd: new Date('2030-01-01') }],
    })
    const body = await (await POST()).json()
    expect(body).toMatchObject({ plan: 'PRO', active: true, source: 'polar', subscriptionId: 'sub_1' })
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'usr_1' },
      data: { plan: 'PRO', planExpiresAt: null, stripeSubscriptionId: 'sub_1', stripeCustomerId: 'cust_1' },
    })
  })

  it('FREE + cliente inexistente en Polar (404) → no activa, no es error', async () => {
    mockGetState.mockRejectedValue(Object.assign(new Error('nf'), { statusCode: 404 }))
    const res = await POST()
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ plan: 'FREE', active: false, source: 'none' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('FREE + Polar caído (5xx) → 502, no toca la DB', async () => {
    mockGetState.mockRejectedValue(Object.assign(new Error('boom'), { statusCode: 503 }))
    const res = await POST()
    expect(res.status).toBe(502)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('si el update con stripeCustomerId choca por @unique, activa igual sin él', async () => {
    mockGetState.mockResolvedValue({ id: 'cust_dup', activeSubscriptions: [{ id: 'sub_1', status: 'active' }] })
    mockUpdate.mockRejectedValueOnce(new Error('P2002 unique')).mockResolvedValueOnce({})
    const body = await (await POST()).json()
    expect(body.active).toBe(true)
    expect(mockUpdate).toHaveBeenCalledTimes(2)
    expect(mockUpdate.mock.calls[1][0].data).toEqual({ plan: 'PRO', planExpiresAt: null, stripeSubscriptionId: 'sub_1' })
  })
})
