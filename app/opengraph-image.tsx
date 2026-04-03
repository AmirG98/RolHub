import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'RolHub - Juegos de Rol con IA'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0D0A05 0%, #1A1208 50%, #0D0A05 100%)',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '2px solid #8B6914',
            borderRadius: '16px',
            padding: '60px 80px',
            boxShadow: '0 0 60px rgba(201,168,76,0.15)',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#C9A84C',
              letterSpacing: '0.05em',
              marginBottom: '16px',
            }}
          >
            RolHub
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#D4B896',
              textAlign: 'center',
              maxWidth: '600px',
              lineHeight: 1.4,
            }}
          >
            Juegos de Rol con Director de Juego de Inteligencia Artificial
          </div>
          <div
            style={{
              marginTop: '24px',
              fontSize: 18,
              color: '#8B6914',
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
            }}
          >
            rol-hub.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
