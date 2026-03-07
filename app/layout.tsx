import type { Metadata } from "next";
import { Cinzel_Decorative, Cinzel, EB_Garamond, Crimson_Text, Courier_Prime } from 'next/font/google'
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
  title: "RPG Hub - Digital Dungeon Master",
  description: "Hub de rol narrativo con DM autónomo powered by Claude API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${cinzelDecorative.variable} ${cinzel.variable} ${ebGaramond.variable} ${crimsonText.variable} ${courierPrime.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
