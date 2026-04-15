import { Paddle, Environment } from '@paddle/paddle-node-sdk'

// Lazy singleton de Paddle — evita crash en build cuando env vars no están definidas
let _paddle: Paddle | null = null

export function getPaddle(): Paddle {
  if (!_paddle) {
    const key = process.env.PADDLE_API_KEY
    if (!key) {
      throw new Error('PADDLE_API_KEY no configurada')
    }
    _paddle = new Paddle(key, {
      environment: Environment.production,
    })
  }
  return _paddle
}

// Price IDs del producto RolHub Pro
export const PADDLE_PRICES = {
  PRO_MONTHLY: 'pri_01kp9env7gq78apsftksqy520e',
  PRO_YEARLY: 'pri_01kp9eq7twmd2rx18xx9cagbwc',
} as const

export const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || ''
export const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || ''
