import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F4E8C1',
          dark: '#D4B896'
        },
        gold: {
          DEFAULT: '#C9A84C',
          bright: '#F5C842',
          dim: '#8B6914'
        },
        blood: '#8B1A1A',
        shadow: {
          DEFAULT: '#0D0A05',
          mid: '#1A1208',
          light: '#2C2416'
        },
        ink: '#1C1208',
        emerald: '#1A3A2A',
      },
      fontFamily: {
        title: ['var(--font-title)', 'serif'],
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'serif'],
        ui: ['var(--font-ui)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'ornate': '0 0 0 3px #0D0A05, 0 0 0 4px #8B6914, inset 0 0 20px rgba(0,0,0,0.5)',
        'glow': '0 0 20px rgba(201,168,76,0.3)',
      },
      animation: {
        'flicker': 'flicker 3s ease-in-out infinite',
        'ink-reveal': 'inkReveal 0.5s ease forwards',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.85', filter: 'brightness(0.9)' },
        },
        inkReveal: {
          'from': { opacity: '0', filter: 'blur(2px)', transform: 'translateY(4px)' },
          'to': { opacity: '1', filter: 'blur(0)', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
