'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, BookOpen, Swords, MessageCircle, Heart, Dices, MapPin, Package, Scroll, Mic, Star } from 'lucide-react'

interface TourSlide {
  icon: typeof BookOpen
  iconColor: string
  title: { es: string; en: string }
  description: { es: string; en: string }
}

const TOUR_SLIDES: TourSlide[] = [
  {
    icon: Star,
    iconColor: 'text-gold-bright',
    title: { es: '¡Bienvenido a tu aventura!', en: 'Welcome to your adventure!' },
    description: {
      es: 'Esta es tu pantalla de juego. Acá vivirás toda la historia. Te mostramos rápidamente qué encontrás en cada lugar.',
      en: "This is your game screen. This is where the entire story unfolds. Let's quickly show you what you'll find.",
    },
  },
  {
    icon: BookOpen,
    iconColor: 'text-gold',
    title: { es: 'El Narrador', en: 'The Narrator' },
    description: {
      es: 'En el panel central aparece la historia narrada por el DM. Cada vez que hacés algo, el narrador responde con lo que sucede en el mundo.',
      en: 'The central panel shows the story narrated by the DM. Every time you do something, the narrator responds with what happens in the world.',
    },
  },
  {
    icon: Swords,
    iconColor: 'text-emerald',
    title: { es: 'Tu Acción', en: 'Your Action' },
    description: {
      es: 'Escribí qué hace tu personaje en el campo de texto, o usá el micrófono para hablar. Podés elegir entre "Hacer" (acción física) o "Hablar" (diálogo).',
      en: 'Type what your character does in the text field, or use the microphone to speak. Choose between "Do" (physical action) or "Talk" (dialogue).',
    },
  },
  {
    icon: MessageCircle,
    iconColor: 'text-gold-dim',
    title: { es: 'Acciones Sugeridas', en: 'Suggested Actions' },
    description: {
      es: 'Debajo del input aparecen botones con acciones sugeridas. Si no sabés qué hacer, tocá una y el juego continúa.',
      en: "Below the input you'll find suggested action buttons. If you're not sure what to do, tap one and the game continues.",
    },
  },
  {
    icon: Heart,
    iconColor: 'text-blood',
    title: { es: 'Tu Personaje', en: 'Your Character' },
    description: {
      es: 'En la barra superior ves tu vida (HP), nivel y stats. Tocá "Ver Hoja" para abrir tu ficha completa con inventario y habilidades.',
      en: 'The top bar shows your health (HP), level, and stats. Tap "View Sheet" to open your full character sheet with inventory and abilities.',
    },
  },
  {
    icon: Dices,
    iconColor: 'text-gold-bright',
    title: { es: 'Dados', en: 'Dice' },
    description: {
      es: 'Cuando una acción requiera suerte, el juego te pedirá tirar dados automáticamente. También podés tirar desde el botón de dados.',
      en: 'When an action requires luck, the game will automatically ask you to roll dice. You can also roll from the dice button.',
    },
  },
  {
    icon: MapPin,
    iconColor: 'text-emerald',
    title: { es: 'Mapa y Ubicaciones', en: 'Map & Locations' },
    description: {
      es: 'A la derecha ves el mapa con las ubicaciones disponibles. Podés viajar entre ciudades y explorar sub-locaciones dentro de cada lugar. Necesitás raciones para viajes largos.',
      en: 'On the right you see the map with available locations. You can travel between cities and explore sub-locations within each place. You need rations for long trips.',
    },
  },
  {
    icon: Package,
    iconColor: 'text-gold',
    title: { es: 'Inventario y Misiones', en: 'Inventory & Quests' },
    description: {
      es: 'Tu inventario muestra los items que tenés. Las misiones aparecen en la sección de Quests — explorá y hablá con NPCs para conseguir nuevas.',
      en: 'Your inventory shows your items. Quests appear in the Quests section — explore and talk to NPCs to discover new ones.',
    },
  },
  {
    icon: Mic,
    iconColor: 'text-neon-blue',
    title: { es: 'Voz y Audio', en: 'Voice & Audio' },
    description: {
      es: 'Podés usar el micrófono para dictar tus acciones. En mobile, mantené apretado para grabar como un audio de WhatsApp. El narrador también puede hablar con voz.',
      en: 'You can use the microphone to dictate your actions. On mobile, hold the button to record like a WhatsApp voice note. The narrator can also speak with voice.',
    },
  },
]

interface GameTutorialTourProps {
  onComplete: () => void
  locale: 'es' | 'en'
}

export function GameTutorialTour({ onComplete, locale }: GameTutorialTourProps) {
  const [current, setCurrent] = useState(0)
  const isEN = locale === 'en'
  const slide = TOUR_SLIDES[current]
  const isLast = current === TOUR_SLIDES.length - 1
  const Icon = slide.icon

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-shadow/85 p-4">
      <div className="glass-panel-dark rounded-xl border border-gold/40 max-w-md w-full overflow-hidden shadow-[0_0_60px_rgba(201,168,76,0.15)]">
        {/* Slide content */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-shadow border border-gold-dim/30 mb-4 ${slide.iconColor}`}>
            <Icon className="w-8 h-8" />
          </div>

          <h2 className="font-heading text-lg text-gold-bright mb-3">
            {isEN ? slide.title.en : slide.title.es}
          </h2>

          <p className="font-body text-sm text-parchment/80 leading-relaxed min-h-[4rem]">
            {isEN ? slide.description.en : slide.description.es}
          </p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 py-3">
          {TOUR_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? 'bg-gold w-4' : 'bg-gold-dim/30 hover:bg-gold-dim/50'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 pb-6 pt-2">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="flex items-center gap-1 font-ui text-xs text-parchment/50 hover:text-parchment/80 transition disabled:opacity-0"
          >
            <ChevronLeft size={14} />
            {isEN ? 'Back' : 'Anterior'}
          </button>

          <button
            onClick={onComplete}
            className="font-ui text-[10px] text-parchment/40 hover:text-parchment/60 transition"
          >
            {isEN ? 'Skip' : 'Saltar'}
          </button>

          <button
            onClick={isLast ? onComplete : () => setCurrent(current + 1)}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gold/20 border border-gold/40 font-ui text-xs text-gold hover:bg-gold/30 transition"
          >
            {isLast
              ? (isEN ? 'Start playing!' : '¡Empezar a jugar!')
              : (isEN ? 'Next' : 'Siguiente')}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Re-export for backwards compatibility (GameSession imports GAME_TOUR_STEPS)
export const GAME_TOUR_STEPS = TOUR_SLIDES
