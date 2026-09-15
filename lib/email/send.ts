/**
 * Envío por Resend. Sin RESEND_API_KEY no envía (devuelve skipped) para que
 * el cron pueda correr en modo dry-run en cualquier entorno.
 * Config (Vercel): RESEND_API_KEY, EMAIL_FROM (default "The Narrator <narrator@rol-hub.com>").
 */
import { Resend } from 'resend'
import type { RenderedEmail } from './templates'

export const DEFAULT_EMAIL_FROM = 'The Narrator at RolHub <narrator@rol-hub.com>'

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

export interface SendResult {
  ok: boolean
  skipped?: 'not_configured'
  id?: string
  error?: string
}

export async function sendEmail(
  to: string,
  email: RenderedEmail,
  unsubscribeUrl: string,
  client?: { emails: { send: (payload: Record<string, unknown>) => Promise<{ data?: { id: string } | null; error?: { message: string } | null }> } }
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey && !client) return { ok: false, skipped: 'not_configured' }
  const resend = client ?? new Resend(apiKey)
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || DEFAULT_EMAIL_FROM,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true, id: data?.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
