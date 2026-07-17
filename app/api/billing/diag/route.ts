// DIAGNÓSTICO TEMPORAL de la config de Lemon Squeezy. Protegido por CRON_SECRET
// para que no sea público. NO revela valores de secretos — solo si están
// presentes y si la API key conecta. BORRAR tras depurar.
import { NextRequest, NextResponse } from 'next/server'
import { ensureLemonSqueezy, LS_STORE_ID, LS_VARIANTS } from '@/lib/lemonsqueezy'
import { getAuthenticatedUser } from '@lemonsqueezy/lemonsqueezy.js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const present = {
    LEMONSQUEEZY_API_KEY: !!process.env.LEMONSQUEEZY_API_KEY,
    LEMONSQUEEZY_STORE_ID: !!process.env.LEMONSQUEEZY_STORE_ID,
    LEMONSQUEEZY_WEBHOOK_SECRET: !!process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
    LEMONSQUEEZY_VARIANT_MONTHLY: !!process.env.LEMONSQUEEZY_VARIANT_MONTHLY,
  }
  const values = {
    storeId: LS_STORE_ID || null,
    variantMonthly: LS_VARIANTS.PRO_MONTHLY || null,
  }

  let apiKeyWorks: boolean | string = false
  try {
    ensureLemonSqueezy()
    const me = await getAuthenticatedUser()
    apiKeyWorks = me.error ? `error: ${me.error.message}` : true
  } catch (err: any) {
    apiKeyWorks = `exception: ${err?.message}`
  }

  return NextResponse.json({ present, values, apiKeyWorks })
}
