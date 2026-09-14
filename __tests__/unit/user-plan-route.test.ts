// @vitest-environment node
/**
 * GET /api/user/plan: plan + estado efectivo. Un PRO vencido tiene que
 * reportarse como 'pro_expired' para que /pricing le ofrezca re-suscribirse.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

let mockClerkId: string | null = 'user_abc'
vi.mock('@clerk/nextjs/server', () => ({ auth: () => Promise.resolve({ userId: mockClerkId }) }))
const mockFindUnique = vi.fn()
vi.mock('@/lib/db/prisma', () => ({ prisma: { user: { findUnique: (...a: unknown[]) => mockFindUnique(...a) } } }))

import { GET } from '@/app/api/user/plan/route'

beforeEach(() => { vi.clearAllMocks(); mockClerkId = 'user_abc' })

describe('GET /api/user/plan', () => {
  it('PRO vigente → status pro', async () => {
    mockFindUnique.mockResolvedValue({ plan: 'PRO', planExpiresAt: null, trialSessionUsed: false, totalTurns: 50, stripeSubscriptionId: 's1' })
    expect(await (await GET()).json()).toEqual({ plan: 'PRO', status: 'pro' })
  })
  it('PRO vencido → status pro_expired (no "gestionar" una suscripción muerta)', async () => {
    mockFindUnique.mockResolvedValue({ plan: 'PRO', planExpiresAt: new Date(Date.now() - 864e5), trialSessionUsed: false, totalTurns: 50 })
    expect(await (await GET()).json()).toEqual({ plan: 'PRO', status: 'pro_expired' })
  })
  it('FREE con trial agotado → trial_used', async () => {
    mockFindUnique.mockResolvedValue({ plan: 'FREE', planExpiresAt: null, trialSessionUsed: false, totalTurns: 25 })
    expect((await (await GET()).json()).status).toBe('trial_used')
  })
  it('sin sesión → 401', async () => {
    mockClerkId = null
    expect((await GET()).status).toBe(401)
  })
})
