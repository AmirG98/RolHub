import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | RolHub - Guias de Rol',
    default: 'Guias de Rol y Tutoriales | RolHub',
  },
  description: 'Aprende a jugar rol desde cero. Guias, tutoriales y consejos para principiantes y jugadores experimentados.',
  keywords: ['juego de rol', 'RPG', 'tutorial rol', 'como jugar rol', 'D&D', 'dungeon master', 'crear personaje'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'RolHub',
  },
}

export default function GuiasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
