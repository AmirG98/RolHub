// @vitest-environment node
/**
 * Portal de suscripción (gestionar / cancelar). Un cliente tuvo que pedir la
 * cancelación por mail: no había link al portal Y la ruta mandaba el campo
 * con el nombre equivocado (escondido por un `as any`).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { CustomerSessionsCreateCustomerSessionCreate$outboundSchema as CreateSchema } from '@polar-sh/sdk/models/operations/customersessionscreate'

let mockClerkId: string | null = 'user_abc'
vi.mock('@clerk/nextjs/server', () => ({ auth: () => Promise.resolve({ userId: mockClerkId }) }))
const mockFindUnique = vi.fn()
vi.mock('@/lib/db/prisma', () => ({ prisma: { user: { findUnique: (...a: unknown[]) => mockFindUnique(...a) } } }))
const mockCreate = vi.fn()
vi.mock('@/lib/polar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/polar')>()
  return { ...actual, getPolar: () => ({ customerSessions: { create: (...a: unknown[]) => mockCreate(...a) } }) }
})

import { POST } from '@/app/api/billing/portal/route'

beforeEach(() => {
  vi.clearAllMocks()
  mockClerkId = 'user_abc'
  mockFindUnique.mockResolvedValue({ id: 'usr_1', clerkId: 'user_abc', stripeSubscriptionId: 'sub_1' })
  mockCreate.mockResolvedValue({ customerPortalUrl: 'https://polar.sh/portal/xyz' })
})

describe('POST /api/billing/portal', () => {
  it('crea la customer session por externalCustomerId (nombre que acepta el SDK) y devuelve la URL', async () => {
    const res = await POST(new Request('http://localhost/api/billing/portal', { method: 'POST' }) as never)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ customerPortalUrl: 'https://polar.sh/portal/xyz' })
    const payload = mockCreate.mock.calls[0][0]
    expect(payload).toEqual({ externalCustomerId: 'usr_1' })
    // Validación real contra el schema del SDK: el nombre viejo era inválido
    expect(CreateSchema.safeParse(payload).success).toBe(true)
    expect(CreateSchema.safeParse({ customerExternalId: 'usr_1' }).success).toBe(false)
  })
  it('sin sesión → 401; sin suscripción → 400', async () => {
    mockClerkId = null
    expect((await POST(new Request('http://localhost/api/billing/portal', { method: 'POST' }) as never)).status).toBe(401)
    mockClerkId = 'user_abc'
    mockFindUnique.mockResolvedValue({ id: 'usr_1', stripeSubscriptionId: null })
    expect((await POST(new Request('http://localhost/api/billing/portal', { method: 'POST' }) as never)).status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })
  it('la UI enlaza al portal (pricing con plan pago) y el badge del navbar lleva a /pricing', () => {
    const pricing = fs.readFileSync(path.resolve(__dirname, '../../app/pricing/page.tsx'), 'utf8')
    expect(pricing).toContain("fetch('/api/billing/portal'")
    expect(pricing).toContain('t.pricing.manageSubscription')
    const navbar = fs.readFileSync(path.resolve(__dirname, '../../components/medieval/Navbar.tsx'), 'utf8')
    expect(navbar).toMatch(/href="\/pricing"[^>]*>\s*<PlanBadge/)
  })
})
