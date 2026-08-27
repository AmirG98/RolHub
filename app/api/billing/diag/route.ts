// DIAGNÓSTICO TEMPORAL de la config de Polar. Protegido por CRON_SECRET.
// NO revela secretos — solo si están presentes y si la API key conecta. BORRAR tras depurar.
import { NextRequest, NextResponse } from 'next/server'
import { getPolar, POLAR_PRODUCT_ID } from '@/lib/polar'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const present = {
    POLAR_ACCESS_TOKEN: !!process.env.POLAR_ACCESS_TOKEN,
    POLAR_WEBHOOK_SECRET: !!process.env.POLAR_WEBHOOK_SECRET,
    POLAR_PRODUCT_ID: !!process.env.POLAR_PRODUCT_ID,
    POLAR_SERVER: process.env.POLAR_SERVER || '(default production)',
  }
  let apiKeyWorks: boolean | string = false
  let productOk: boolean | string = false
  try {
    const polar = getPolar()
    // getProduct valida token + que el product id existe en la org
    const prod = await polar.products.get({ id: POLAR_PRODUCT_ID })
    apiKeyWorks = true
    productOk = prod?.id === POLAR_PRODUCT_ID ? `ok: ${prod.name}` : 'product id no coincide'
  } catch (err: any) {
    const msg = err?.message || String(err)
    apiKeyWorks = msg.includes('401') || msg.includes('unauthor') ? 'token inválido' : `error: ${msg.slice(0,80)}`
  }
  return NextResponse.json({ present, productId: POLAR_PRODUCT_ID.slice(0,8) + '…', apiKeyWorks, productOk })
}
