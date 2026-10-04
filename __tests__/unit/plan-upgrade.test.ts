import { describe, it, expect } from 'vitest'
import { planUpgrade } from '@/lib/billing/upgrade'
import { SubscriptionsUpdateRequest$outboundSchema } from '@polar-sh/sdk/models/operations/subscriptionsupdate.js'

const PRODUCTS = { adventurer: 'prod_adv', hero: 'prod_hero', legend: 'prod_legend' }
const user = (o: Partial<{ stripeSubscriptionId: string | null; planTier: string | null; subStatus: string | null }> = {}) => ({
  stripeSubscriptionId: 'sub_1', planTier: 'adventurer', subStatus: 'active', ...o,
})

describe('planUpgrade', () => {
  it('Aventurero → Héroe por defecto, cobrando la diferencia ahora', () => {
    const p = planUpgrade(user(), 'upgrade', undefined, PRODUCTS)
    expect(p).toEqual({ ok: true, targetTier: 'hero', update: { productId: 'prod_hero', prorationBehavior: 'invoice' } })
  })
  it('puede saltar directo a Leyenda', () => {
    const p = planUpgrade(user(), 'upgrade', 'legend', PRODUCTS)
    expect(p.ok && p.targetTier).toBe('legend')
  })
  it('Leyenda no tiene a dónde subir', () => {
    expect(planUpgrade(user({ planTier: 'legend' }), 'upgrade', undefined, PRODUCTS)).toMatchObject({ ok: false, error: 'already_top_tier' })
  })
  it('no permite "upgrade" hacia abajo o al mismo plan', () => {
    expect(planUpgrade(user({ planTier: 'hero' }), 'upgrade', 'adventurer', PRODUCTS)).toMatchObject({ ok: false, error: 'not_an_upgrade' })
    expect(planUpgrade(user({ planTier: 'hero' }), 'upgrade', 'hero', PRODUCTS)).toMatchObject({ ok: false, error: 'not_an_upgrade' })
  })
  it('sin suscripción → 400', () => {
    expect(planUpgrade(user({ stripeSubscriptionId: null }), 'upgrade', undefined, PRODUCTS)).toMatchObject({ ok: false, status: 400 })
  })
  it('plan sin producto configurado → 503', () => {
    expect(planUpgrade(user(), 'upgrade', 'hero', { ...PRODUCTS, hero: '' })).toMatchObject({ ok: false, status: 503 })
  })
  it('start_now solo durante el trial', () => {
    expect(planUpgrade(user(), 'start_now', undefined, PRODUCTS)).toMatchObject({ ok: false, error: 'not_trialing' })
    const now = new Date('2026-10-05T12:00:00Z')
    expect(planUpgrade(user({ subStatus: 'trialing' }), 'start_now', undefined, PRODUCTS, now)).toEqual({ ok: true, targetTier: 'adventurer', update: { trialEnd: now } })
  })
})

describe('los payloads son válidos para el SDK de Polar (schema real)', () => {
  it('cambio de producto', () => {
    const p = planUpgrade(user(), 'upgrade', undefined, PRODUCTS)
    if (!p.ok) throw new Error('unexpected')
    const out = SubscriptionsUpdateRequest$outboundSchema.parse({ id: 'sub_1', subscriptionUpdate: p.update })
    expect(out.SubscriptionUpdate).toMatchObject({ product_id: 'prod_hero', proration_behavior: 'invoice' })
  })
  it('fin anticipado del trial', () => {
    const now = new Date('2026-10-05T12:00:00Z')
    const p = planUpgrade(user({ subStatus: 'trialing' }), 'start_now', undefined, PRODUCTS, now)
    if (!p.ok) throw new Error('unexpected')
    const out = SubscriptionsUpdateRequest$outboundSchema.parse({ id: 'sub_1', subscriptionUpdate: p.update })
    expect(out.SubscriptionUpdate).toMatchObject({ trial_end: '2026-10-05T12:00:00.000Z' })
  })
})
