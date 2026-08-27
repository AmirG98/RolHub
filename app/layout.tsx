import type { Metadata } from "next";
import Script from 'next/script'
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
    default: "RolHub — The First AI Dungeon Master Across Any World",
    template: "%s | RolHub",
  },
  description: "Play tabletop RPG with an autonomous AI Dungeon Master. Pick from multiple original worlds, create your character, and live epic stories — solo or with friends. No experience needed.",
  keywords: ['AI dungeon master', 'AI RPG', 'tabletop RPG online', 'solo RPG', 'AI game master', 'play D&D online', 'interactive fiction', 'AI storytelling game'],
  authors: [{ name: 'RolHub' }],
  creator: 'RolHub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rol-hub.com',
    siteName: 'RolHub',
    title: 'RolHub — The First AI Dungeon Master Across Any World',
    description: 'Play tabletop RPG with an autonomous AI Dungeon Master across multiple original worlds. No experience needed.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RolHub — The First AI Dungeon Master Across Any World',
    description: 'Play tabletop RPG with an autonomous AI Dungeon Master across multiple original worlds.',
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
    // PASO 1: Ir a https://search.google.com/search-console
    // PASO 2: Agregar propiedad "https://rol-hub.com" (URL prefix)
    // PASO 3: Elegir verificacion por "HTML tag" y copiar el content value aca abajo
    // PASO 4: Deploy y verificar en Search Console
    // PASO 5: Ir a Sitemaps > agregar "sitemap.xml"
    // google: 'PEGAR_CODIGO_DE_VERIFICACION_ACA',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${cinzelDecorative.variable} ${cinzel.variable} ${ebGaramond.variable} ${crimsonText.variable} ${courierPrime.variable}`}>
        <head>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PHKBWCQ2');`}
          </Script>
        </head>
        <body className="min-h-screen bg-shadow">
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-PHKBWCQ2"
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
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
