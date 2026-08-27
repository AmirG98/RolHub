// Integración con Polar.sh (Merchant of Record).
// Reemplaza Lemon Squeezy (que rechazó por ser "gaming platform"). Polar
// acepta juegos + AI + Argentina, es MoR (maneja impuestos/IVA), payout vía
// Stripe Connect. La lógica de negocio (User.plan/planExpiresAt) no cambia.
//
// Config vía env:
//   POLAR_ACCESS_TOKEN       — API key (Settings → tokens en el dashboard)
//   POLAR_WEBHOOK_SECRET     — secret del webhook (verifica firma)
//   POLAR_PRODUCT_ID         — id del producto RolHub Pro
//   POLAR_PRICE_ID_MONTHLY   — id del precio mensual (checkout usa product o price)
//   POLAR_SERVER             — 'production' | 'sandbox' (default production)

import { Polar } from '@polar-sh/sdk'

let _polar: Polar | null = null

/** Cliente Polar (lazy singleton). Lanza si falta el token. */
export function getPolar(): Polar {
  if (!_polar) {
    const accessToken = process.env.POLAR_ACCESS_TOKEN
    if (!accessToken) throw new Error('POLAR_ACCESS_TOKEN no configurado')
    _polar = new Polar({
      accessToken,
      server: (process.env.POLAR_SERVER as 'production' | 'sandbox') || 'production',
    })
  }
  return _polar
}

export const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || ''
export const POLAR_PRODUCT_ID = process.env.POLAR_PRODUCT_ID || ''
export const POLAR_PRICE_ID_MONTHLY = process.env.POLAR_PRICE_ID_MONTHLY || ''

/** ¿Está configurado el checkout? (product o price presente + token) */
export function isPolarConfigured(): boolean {
  return !!process.env.POLAR_ACCESS_TOKEN && (!!POLAR_PRODUCT_ID || !!POLAR_PRICE_ID_MONTHLY)
}
