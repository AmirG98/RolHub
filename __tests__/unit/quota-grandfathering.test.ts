/**
 * GARANTÍA LEGAL: quien se suscribió con "8.99 ilimitado" conserva ilimitado
 * hasta terminar el período PAGO que tenía contratado; quien estaba en el
 * trial, hasta terminar su primer mes pago. Estos tests simulan la vida real
 * de una suscripción (eventos de Polar en orden) y miran el cupo en cada
 * momento. Si alguno falla, estamos recortándole a alguien lo que compró.
 */
import { describe, it, expect } from 'vitest'
import { getQuotaStatus, quotaFieldsFromSubscription, addOneMonth, type QuotaUser, type SubscriptionForQuota } from '@/lib/plans/quota'

const LAUNCH = new Date('2026-10-10T00:00:00Z')
const PRODUCTS = { adventurer: 'prod_adv', hero: 'prod_hero', legend: 'prod_legend' }
const d = (s: string) => new Date(s + 'T12:00:00Z')

/** Estado del usuario tras aplicar un evento de suscripción (como hace el webhook). */
function apply(user: QuotaUser, sub: SubscriptionForQuota): QuotaUser {
  const f = quotaFieldsFromSubscription(sub, user, PRODUCTS, LAUNCH)
  return { ...user, ...f, periodTurns: f.periodTurns ?? user.periodTurns ?? 0 }
}
const at = (user: QuotaUser, when: string, turns?: number) =>
  getQuotaStatus(turns === undefined ? user : { ...user, periodTurns: turns }, LAUNCH, d(when))

describe('suscriptor que YA PAGABA antes del lanzamiento', () => {
  const sub = { status: 'active', productId: 'prod_adv', createdAt: d('2026-09-29'), startedAt: d('2026-09-29'), trialEnd: null }
  // visto por el backfill el 5/10, con su período 29/9 → 29/10
  let u = apply({}, { ...sub, currentPeriodStart: d('2026-09-29'), currentPeriodEnd: d('2026-10-29') })

  it('conserva ilimitado hasta el fin de su período pago (29/10)', () => {
    expect((u.quotaExemptUntil as Date).toISOString().slice(0, 10)).toBe('2026-10-29')
    expect(at(u, '2026-10-05', 700).enforced).toBe(false) // antes del lanzamiento
    expect(at(u, '2026-10-15', 763).enforced).toBe(false) // después del lanzamiento, mismo período
    expect(at(u, '2026-10-28', 900).enforced).toBe(false) // último día
  })
  it('al renovar pasa al cupo de 150, con el contador en 0', () => {
    u = apply({ ...u, periodTurns: 900 }, { ...sub, currentPeriodStart: d('2026-10-29'), currentPeriodEnd: d('2026-11-29') })
    expect(u.periodTurns).toBe(0)
    expect(at(u, '2026-10-30')).toMatchObject({ enforced: true, kind: 'quota', limit: 150, remaining: 150 })
  })
  it('la fecha de exención no se mueve con eventos posteriores', () => {
    expect((u.quotaExemptUntil as Date).toISOString().slice(0, 10)).toBe('2026-10-29')
  })
})

describe('suscriptor que estaba EN TRIAL al lanzamiento', () => {
  const base = { productId: 'prod_adv', createdAt: d('2026-10-08'), startedAt: d('2026-10-08'), trialEnd: d('2026-10-11') }
  let u = apply({}, { ...base, status: 'trialing', currentPeriodStart: d('2026-10-08'), currentPeriodEnd: d('2026-10-11') })

  it('trial ilimitado, antes y después del lanzamiento', () => {
    expect(at(u, '2026-10-09', 300).enforced).toBe(false)
    expect(at(u, '2026-10-10', 758).enforced).toBe(false)
  })
  it('su PRIMER MES PAGO también es ilimitado (se anotó con 8.99 ilimitado)', () => {
    u = apply(u, { ...base, status: 'active', currentPeriodStart: d('2026-10-11'), currentPeriodEnd: d('2026-11-11') })
    expect((u.quotaExemptUntil as Date).toISOString().slice(0, 10)).toBe('2026-11-11')
    expect(at(u, '2026-10-20', 500).enforced).toBe(false)
    expect(at(u, '2026-11-10', 999).enforced).toBe(false)
  })
  it('recién en su SEGUNDO mes pago rige el cupo', () => {
    u = apply(u, { ...base, status: 'active', currentPeriodStart: d('2026-11-11'), currentPeriodEnd: d('2026-12-11') })
    expect(at(u, '2026-11-12')).toMatchObject({ enforced: true, limit: 150 })
  })
})

describe('suscriptor NUEVO (después del lanzamiento): cupo desde el día 1', () => {
  const base = { productId: 'prod_adv', createdAt: d('2026-10-12'), startedAt: d('2026-10-12'), trialEnd: d('2026-10-15') }
  let u = apply({}, { ...base, status: 'trialing', currentPeriodStart: d('2026-10-12'), currentPeriodEnd: d('2026-10-15') })
  it('trial con 60 turnos, sin exención', () => {
    expect(u.quotaExemptUntil).toBeNull()
    expect(at(u, '2026-10-13', 60)).toMatchObject({ enforced: true, kind: 'sub_trial', limit: 60, remaining: 0 })
  })
  it('al pagar: 150 turnos y contador reiniciado', () => {
    u = apply({ ...u, periodTurns: 60 }, { ...base, status: 'active', currentPeriodStart: d('2026-10-15'), currentPeriodEnd: d('2026-11-15') })
    expect(at(u, '2026-10-16')).toMatchObject({ enforced: true, kind: 'quota', limit: 150, remaining: 150 })
  })
})

describe('ante datos faltantes, siempre a favor del usuario', () => {
  it('suscriptor anterior sin fecha de exención calculada → ilimitado', () => {
    const u: QuotaUser = { planTier: 'adventurer', subStatus: 'active', periodStart: d('2026-10-29'), subscribedAt: d('2026-09-01'), quotaExemptUntil: null, periodTurns: 5000 }
    expect(at(u, '2026-11-01').enforced).toBe(false)
  })
  it('sin fecha de alta conocida → se lo trata como anterior al cupo', () => {
    const u: QuotaUser = { planTier: 'adventurer', subStatus: 'active', periodStart: d('2026-10-29'), subscribedAt: null, quotaExemptUntil: null, periodTurns: 5000 }
    expect(at(u, '2026-11-01').enforced).toBe(false)
  })
  it('visto por primera vez recién en su renovación (sin backfill): se le regala ese período', () => {
    const u = apply({}, { status: 'active', productId: 'prod_adv', createdAt: d('2026-09-20'), startedAt: d('2026-09-20'), currentPeriodStart: d('2026-10-23'), currentPeriodEnd: d('2026-11-23') })
    expect(at(u, '2026-11-01', 800).enforced).toBe(false)
    const next = apply(u, { status: 'active', productId: 'prod_adv', createdAt: d('2026-09-20'), startedAt: d('2026-09-20'), currentPeriodStart: d('2026-11-23'), currentPeriodEnd: d('2026-12-23') })
    expect(at(next, '2026-11-24').enforced).toBe(true)
  })
  it('renovó ANTES del lanzamiento: ese período entero queda ilimitado', () => {
    let u = apply({}, { status: 'active', productId: 'prod_adv', createdAt: d('2026-09-07'), startedAt: d('2026-09-07'), currentPeriodStart: d('2026-09-07'), currentPeriodEnd: d('2026-10-07') })
    u = apply(u, { status: 'active', productId: 'prod_adv', createdAt: d('2026-09-07'), startedAt: d('2026-09-07'), currentPeriodStart: d('2026-10-07'), currentPeriodEnd: d('2026-11-07') })
    expect(at(u, '2026-10-25', 600).enforced).toBe(false) // período empezó antes del lanzamiento
    u = apply(u, { status: 'active', productId: 'prod_adv', createdAt: d('2026-09-07'), startedAt: d('2026-09-07'), currentPeriodStart: d('2026-11-07'), currentPeriodEnd: d('2026-12-07') })
    expect(at(u, '2026-11-08').enforced).toBe(true)
  })
  it('un upgrade a mitad del período exento no le quita el ilimitado', () => {
    let u = apply({}, { status: 'active', productId: 'prod_adv', createdAt: d('2026-09-29'), startedAt: d('2026-09-29'), currentPeriodStart: d('2026-09-29'), currentPeriodEnd: d('2026-10-29') })
    u = apply(u, { status: 'active', productId: 'prod_hero', createdAt: d('2026-09-29'), startedAt: d('2026-09-29'), currentPeriodStart: d('2026-09-29'), currentPeriodEnd: d('2026-10-29') })
    expect(u.planTier).toBe('hero')
    expect(at(u, '2026-10-20', 2000).enforced).toBe(false)
  })
})

describe('addOneMonth', () => {
  it('suma un mes calendario', () => expect(addOneMonth(d('2026-10-11')).toISOString().slice(0, 10)).toBe('2026-11-11'))
  it('fin de mes: se pasa de largo, a favor del usuario', () => expect(addOneMonth(d('2027-01-31')).getTime()).toBeGreaterThan(d('2027-02-28').getTime()))
})
