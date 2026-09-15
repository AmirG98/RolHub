import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe-token'

export const dynamic = 'force-dynamic'

// Baja de los emails de seguimiento. Link firmado (sin sesión), idempotente.
// Soporta GET (click en el mail) y POST (List-Unsubscribe-Post one-click).
async function unsubscribe(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('u') || ''
  const token = req.nextUrl.searchParams.get('t') || ''
  if (!userId || !verifyUnsubscribeToken(userId, token)) {
    return new NextResponse(page('Link inválido / Invalid link', 'Este link de baja no es válido. / This unsubscribe link is not valid.'), { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }
  await prisma.user.updateMany({ where: { id: userId }, data: { emailOptOut: true } })
  return new NextResponse(page('Listo / Done', 'No vas a recibir más emails de seguimiento. / You will not receive more follow-up emails.'), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export const GET = unsubscribe
export const POST = unsubscribe

function page(title: string, body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title} — RolHub</title></head><body style="margin:0;background:#0d0a05;color:#f4e8c1;font-family:Georgia,serif"><div style="max-width:520px;margin:60px auto;padding:32px;border:1px solid #8b6914;border-radius:8px;background:#1a1208"><p style="font-size:12px;letter-spacing:3px;color:#c9a84c">ROLHUB</p><h1 style="color:#f5c842;font-size:22px">${title}</h1><p style="font-size:16px;line-height:1.5">${body}</p><p><a href="https://rol-hub.com" style="color:#c9a84c">rol-hub.com</a></p></div></body></html>`
}
