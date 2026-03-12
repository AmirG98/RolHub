import type { Metadata } from "next";
import { Cinzel_Decorative, Cinzel, EB_Garamond, Crimson_Text, Courier_Prime } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/components/medieval/Navbar'
// import { MusicProvider } from '@/components/audio/MusicProvider' // Deshabilitado temporalmente
import { VideoBackground } from '@/components/ui/VideoBackground'
import { LanguageProvider } from '@/lib/i18n'
import { GuestProvider } from '@/lib/guest'
import "./globals.css";

const cinzelDecorative = Cinzel_Decorative({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-title',
  display: 'swap',
})

const cinzel = Cinzel({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const ebGaramond = EB_Garamond({
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const crimsonText = Crimson_Text({
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
})

const courierPrime = Courier_Prime({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://rol-hub.com'),
  title: {
    default: "RolHub - Juegos de Rol con DM de Inteligencia Artificial",
    template: "%s | RolHub",
  },
  description: "Juega partidas de rol narrativo con un Director de Juego con IA. Crea tu personaje, elige tu mundo y vive aventuras unicas. Sin experiencia previa necesaria.",
  keywords: ['juego de rol', 'RPG online', 'DM inteligencia artificial', 'rol narrativo', 'D&D online', 'jugar rol gratis', 'dungeon master IA'],
  authors: [{ name: 'RolHub' }],
  creator: 'RolHub',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://rol-hub.com',
    siteName: 'RolHub',
    title: 'RolHub - Juegos de Rol con DM de Inteligencia Artificial',
    description: 'Juega partidas de rol narrativo con un Director de Juego con IA. Sin experiencia previa necesaria.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RolHub - Juegos de Rol con IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RolHub - Juegos de Rol con DM de Inteligencia Artificial',
    description: 'Juega partidas de rol narrativo con un Director de Juego con IA.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Se agregara despues de verificar en Google Search Console
    // google: 'verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es" className={`${cinzelDecorative.variable} ${cinzel.variable} ${ebGaramond.variable} ${crimsonText.variable} ${courierPrime.variable}`}>
        <body className="min-h-screen bg-shadow">
          <LanguageProvider>
            <GuestProvider>
              <VideoBackground />
              <Navbar />
              <main>
                {children}
              </main>
              {/* <MusicProvider /> Deshabilitado temporalmente */}
            </GuestProvider>
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
