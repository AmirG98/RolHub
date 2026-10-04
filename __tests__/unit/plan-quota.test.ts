import { describe, it, expect } from 'vitest'
import {
  getQuotaStatus, quotaRemainingAfter, quotaFieldsFromSubscription, tierFromProductId, quotaEnforcedFrom,
  nextTierOf, TIERS, SUB_TRIAL_TURNS,
} from '@/lib/plans/quota'

const LAUNCH = new Date('2026-10-10T00:00:00Z')
const PRODUCTS = { adventurer: 'prod_adv', hero: 'prod_hero', legend: 'prod_legend' }
const after = new Date('2026-10-12T00:00:00Z')
const before = new Date('2026-10-01T00:00:00Z')

describe('quotaEnforcedFrom — flag por env', () => {
  it('sin env: usa la fecha de lanzamiento del código (2026-10-04 22:00 UTC)', () => {
    const d = quotaEnforcedFrom({})
    expect(d?.toISOString()).toBe('2026-10-04T22:00:00.000Z')
    // un período que empezó ANTES del lanzamiento queda ilimitado
    expect(getQuotaStatus({ planTier: 'adventurer', subStatus: 'active', periodStart: new Date('2026-09-30T00:00:00Z'), periodTurns: 9999 }, d).enforced).toBe(false)
    // un suscriptor NUEVO (alta posterior) tiene cupo desde el primer día
    const alta = new Date('2026-10-05T10:00:00Z')
    expect(getQuotaStatus({ planTier: 'adventurer', subStatus: 'trialing', periodStart: alta, subscribedAt: alta, periodTurns: 0 }, d)).toMatchObject({ enforced: true, limit: 60 })
  })
  it('fecha inválida: apagado', () => expect(quotaEnforcedFrom({ QUOTA_ENFORCED_FROM: 'pronto' })).toBeNull())
  it('fecha ISO', () => expect(quotaEnforcedFrom({ QUOTA_ENFORCED_FROM: '2026-10-10T00:00:00Z' })?.getTime()).toBe(LAUNCH.getTime()))
})

describe('getQuotaStatus', () => {
  it('apagado (sin fecha) → nunca enforced', () => {
    expect(getQuotaStatus({ planTier: 'adventurer', periodStart: after, periodTurns: 999 }, null).enforced).toBe(false)
  })
  it('SUSCRIPTOR EXISTENTE: período empezó antes del lanzamiento → ilimitado', () => {
    const q = getQuotaStatus({ planTier: 'adventurer', subStatus: 'active', periodStart: before, periodTurns: 763 }, LAUNCH)
    expect(q.enforced).toBe(false)
  })
  it('sin periodStart (nunca sincronizado) → ilimitado', () => {
    expect(getQuotaStatus({ planTier: 'adventurer', periodTurns: 500 }, LAUNCH).enforced).toBe(false)
  })
  it('período nuevo tras el lanzamiento → cupo del plan', () => {
    // subscribedAt posterior al lanzamiento = suscriptor nuevo (sin exención)
    const q = getQuotaStatus({ planTier: 'adventurer', subStatus: 'active', periodStart: after, periodEnd: new Date('2026-11-12'), periodTurns: 120, subscribedAt: after }, LAUNCH)
    expect(q).toMatchObject({ enforced: true, kind: 'quota', tier: 'adventurer', limit: 150, used: 120, remaining: 30, nextTier: 'hero' })
    expect(q.resetsAt?.toISOString().slice(0, 10)).toBe('2026-11-12')
  })
  it('agotado → remaining 0', () => {
    expect(getQuotaStatus({ planTier: 'hero', subStatus: 'active', periodStart: after, periodTurns: 400 }, LAUNCH).remaining).toBe(0)
    expect(getQuotaStatus({ planTier: 'hero', subStatus: 'active', periodStart: after, periodTurns: 455 }, LAUNCH).remaining).toBe(0)
  })
  it('Leyenda no tiene plan siguiente', () => {
    expect(getQuotaStatus({ planTier: 'legend', subStatus: 'active', periodStart: after, periodTurns: 10 }, LAUNCH)).toMatchObject({ limit: 1000, nextTier: null })
  })
  it('trial de la suscripción: 60 turnos, sea cual sea el plan', () => {
    const q = getQuotaStatus({ planTier: 'legend', subStatus: 'trialing', periodStart: after, periodTurns: 60, subscribedAt: after }, LAUNCH)
    expect(q).toMatchObject({ enforced: true, kind: 'sub_trial', limit: SUB_TRIAL_TURNS, remaining: 0 })
  })
  it('plan desconocido → Aventurero', () => {
    expect(getQuotaStatus({ planTier: 'platinum', subStatus: 'active', periodStart: after, periodTurns: 0 }, LAUNCH).tier).toBe('adventurer')
  })
  it('quotaRemainingAfter descuenta el turno en curso', () => {
    const q = getQuotaStatus({ planTier: 'adventurer', subStatus: 'active', periodStart: after, periodTurns: 149 }, LAUNCH)
    expect(q.remaining).toBe(1)
    expect(quotaRemainingAfter(q)).toBe(0) // este es el último
  })
})

describe('tiers', () => {
  it('orden y precios', () => {
    expect(nextTierOf('adventurer')).toBe('hero')
    expect(nextTierOf('hero')).toBe('legend')
    expect(nextTierOf('legend')).toBeNull()
    expect(TIERS.adventurer).toMatchObject({ turns: 150, priceMonthly: 8.99 })
    expect(TIERS.hero).toMatchObject({ turns: 400, priceMonthly: 24.99 })
    expect(TIERS.legend).toMatchObject({ turns: 1000, priceMonthly: 59.99 })
  })
  it('ningún plan vende el turno por debajo de $0.059 (el costo no permite descuento por volumen)', () => {
    for (const t of Object.values(TIERS)) expect(t.priceMonthly / t.turns).toBeGreaterThanOrEqual(0.059)
  })
  it('tierFromProductId', () => {
    expect(tierFromProductId('prod_hero', PRODUCTS)).toBe('hero')
    expect(tierFromProductId('prod_legend', PRODUCTS)).toBe('legend')
    expect(tierFromProductId('otro', PRODUCTS)).toBe('adventurer')
    expect(tierFromProductId(null, PRODUCTS)).toBe('adventurer')
    // producto sin configurar no matchea un productId vacío
    expect(tierFromProductId('', { adventurer: 'prod_adv', hero: '', legend: '' })).toBe('adventurer')
  })
})

describe('quotaFieldsFromSubscription — cuándo se reinicia el contador', () => {
  const sub = (o: Partial<{ status: string; productId: string; currentPeriodStart: Date; currentPeriodEnd: Date }> = {}) => ({
    status: 'active', productId: 'prod_adv', currentPeriodStart: after, currentPeriodEnd: new Date('2026-11-12'), ...o,
  })
  it('primera sincronización: setea período y contador en 0', () => {
    const f = quotaFieldsFromSubscription(sub(), {}, PRODUCTS)
    expect(f).toMatchObject({ planTier: 'adventurer', subStatus: 'active', periodTurns: 0 })
    expect(f.periodStart?.getTime()).toBe(after.getTime())
  })
  it('mismo período (webhook repetido): NO reinicia', () => {
    const f = quotaFieldsFromSubscription(sub(), { periodStart: after, subStatus: 'active' }, PRODUCTS)
    expect('periodTurns' in f).toBe(false)
  })
  it('renovación (período nuevo): reinicia', () => {
    const next = new Date('2026-11-12T00:00:00Z')
    const f = quotaFieldsFromSubscription(sub({ currentPeriodStart: next }), { periodStart: after, subStatus: 'active' }, PRODUCTS)
    expect(f.periodTurns).toBe(0)
  })
  it('upgrade a mitad de período: sube el plan y CONSERVA lo jugado', () => {
    const f = quotaFieldsFromSubscription(sub({ productId: 'prod_hero' }), { periodStart: after, subStatus: 'active' }, PRODUCTS)
    expect(f.planTier).toBe('hero')
    expect('periodTurns' in f).toBe(false)
  })
  it('trial → pago: reinicia aunque el período no cambie', () => {
    const f = quotaFieldsFromSubscription(sub(), { periodStart: after, subStatus: 'trialing' }, PRODUCTS)
    expect(f.periodTurns).toBe(0)
  })
})
