'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { RunicButton } from '@/components/medieval/RunicButton'
import { GuestWarningModal } from '@/components/guest/GuestWarningBanner'
import { useGuest, GuestCharacter } from '@/lib/guest'
import { useLanguage } from '@/lib/i18n'
import GuestGameSession from './GuestGameSession'
import { Play, Scroll, Swords, Map, MessageCircle, ChevronRight } from 'lucide-react'

// Lores disponibles
const GUEST_LORES = [
  { id: 'LOTR', name: 'Tierras Medias', nameEn: 'Middle Earth', emoji: '🏰', description: 'Fantasía épica tolkieniana', descriptionEn: 'Epic Tolkien-style fantasy' },
  { id: 'ZOMBIES', name: 'Apocalipsis Zombie', nameEn: 'Zombie Apocalypse', emoji: '☠️', description: 'Supervivencia y horror', descriptionEn: 'Survival and horror' },
  { id: 'DND_CLASSIC', name: 'Reinos Olvidados', nameEn: 'Forgotten Realms', emoji: '⚔️', description: 'D&D clásico en Faerûn', descriptionEn: 'Classic D&D in Faerûn' },
]

// Arquetipos simplificados para guest
const GUEST_ARCHETYPES: Record<string, { id: string; name: string; nameEn: string; stats: Record<string, number> }[]> = {
  LOTR: [
    { id: 'warrior', name: 'Guerrero', nameEn: 'Warrior', stats: { combat: 4, exploration: 2, social: 2, lore: 1 } },
    { id: 'ranger', name: 'Montaraz', nameEn: 'Ranger', stats: { combat: 3, exploration: 4, social: 1, lore: 2 } },
    { id: 'mage', name: 'Mago', nameEn: 'Mage', stats: { combat: 1, exploration: 2, social: 3, lore: 4 } },
  ],
  ZOMBIES: [
    { id: 'survivor', name: 'Superviviente', nameEn: 'Survivor', stats: { combat: 3, exploration: 3, social: 2, lore: 1 } },
    { id: 'medic', name: 'Médico', nameEn: 'Medic', stats: { combat: 1, exploration: 2, social: 3, lore: 4 } },
    { id: 'soldier', name: 'Soldado', nameEn: 'Soldier', stats: { combat: 4, exploration: 2, social: 2, lore: 1 } },
  ],
  DND_CLASSIC: [
    { id: 'guild-adventurer', name: 'Aventurero de Gremio', nameEn: 'Guild Adventurer', stats: { combat: 4, exploration: 3, social: 2, lore: 1 } },
    { id: 'academy-mage', name: 'Mago de la Academia', nameEn: 'Academy Mage', stats: { combat: 1, exploration: 2, social: 3, lore: 4 } },
    { id: 'street-rogue', name: 'Pícaro Callejero', nameEn: 'Street Rogue', stats: { combat: 3, exploration: 4, social: 3, lore: 1 } },
  ],
}

type Step = 'warning' | 'lore' | 'archetype' | 'name' | 'playing'

// IDs de los lores soportados por el guest flow (debe coincidir con GUEST_LORES abajo)
const GUEST_LORE_IDS = new Set(['LOTR', 'ZOMBIES', 'DND_CLASSIC'])

// Wrapper externo: Next requiere que useSearchParams esté dentro de un
// <Suspense> boundary para que la página prerenderice estáticamente.
export default function PlayGuestPage() {
  return (
    <Suspense fallback={null}>
      <PlayGuestPageInner />
    </Suspense>
  )
}

function PlayGuestPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useLanguage()
  const { isGuest, session, startGuestSession, setGuestCharacter } = useGuest()
  const isEnglish = locale === 'en'

  const [step, setStep] = useState<Step>('warning')
  const [selectedLore, setSelectedLore] = useState<string | null>(null)
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null)
  const [characterName, setCharacterName] = useState('')

  // Si ya hay sesión de guest activa, ir directo a jugar
  useEffect(() => {
    if (isGuest && session?.character) {
      setStep('playing')
    }
  }, [isGuest, session])

  // Deep-link: si la URL trae ?lore=X y es un lore guest válido, pre-seleccionar
  // y saltar directo al step de arquetipo (después del warning modal).
  // El warning se respeta porque `step` arranca en 'warning' y el effect solo
  // override cuando el usuario ya aceptó y pasamos a 'lore'.
  useEffect(() => {
    const loreParam = searchParams.get('lore')
    if (!loreParam || !GUEST_LORE_IDS.has(loreParam)) return
    // Pre-seleccionar el lore sin tocar el step actual
    setSelectedLore(loreParam)
    startGuestSession(loreParam, 'STORY_MODE', 'ONE_SHOT')
  }, [searchParams, startGuestSession])

  const labels = isEnglish ? {
    selectWorld: 'Choose Your World',
    selectArchetype: 'Choose Your Class',
    nameCharacter: 'Name Your Character',
    namePlaceholder: 'Enter a name...',
    startAdventure: 'Start Adventure',
    back: 'Back',
    continue: 'Continue'
  } : {
    selectWorld: 'Elegí tu Mundo',
    selectArchetype: 'Elegí tu Clase',
    nameCharacter: 'Nombrá a tu Personaje',
    namePlaceholder: 'Ingresá un nombre...',
    startAdventure: 'Comenzar Aventura',
    back: 'Volver',
    continue: 'Continuar'
  }

  const handleContinueAsGuest = () => {
    // Si ya hay un lore pre-seleccionado por el query param, saltar directo
    // al step de arquetipo. Si no, ir al selector de lore normal.
    if (selectedLore) {
      setStep('archetype')
    } else {
      setStep('lore')
    }
  }

  const handleSelectLore = (loreId: string) => {
    setSelectedLore(loreId)
    startGuestSession(loreId, 'STORY_MODE', 'ONE_SHOT')
    setStep('archetype')
  }

  const handleSelectArchetype = (archetypeId: string) => {
    setSelectedArchetype(archetypeId)
    setStep('name')
  }

  const [isCreating, setIsCreating] = useState(false)
  const [creationFailed, setCreationFailed] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)

  // Mensajes narrativos rotando durante la creación — locale-aware
  const LOADING_MESSAGES_ES = [
    'Forjando tu destino...',
    'Tejiendo las primeras líneas de tu historia...',
    'Invocando al narrador...',
    'El mundo despierta para recibirte...',
  ]
  const LOADING_MESSAGES_EN = [
    'Forging your destiny...',
    'Weaving the first lines of your story...',
    'Summoning the narrator...',
    'The world awakens to receive you...',
  ]
  const loadingMessages = isEnglish ? LOADING_MESSAGES_EN : LOADING_MESSAGES_ES

  // Rotar mensajes cada 2.5s mientras isCreating
  useEffect(() => {
    if (!isCreating) {
      setLoadingMessageIndex(0)
      return
    }
    const interval = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % loadingMessages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isCreating, loadingMessages.length])

  // Un intento individual de crear la sesión, con timeout por AbortController
  const attemptCreateSession = async (signal: AbortSignal): Promise<string | null> => {
    const response = await fetch('/api/session/guest-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lore: selectedLore,
        archetypeId: selectedArchetype,
        characterName: characterName.trim(),
        characterDescription: '',
        locale,
      }),
      signal,
    })
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    return data?.sessionId || null
  }

  const handleStartGame = async () => {
    if (!selectedLore || !selectedArchetype || !characterName.trim()) return
    const archetype = GUEST_ARCHETYPES[selectedLore]?.find(a => a.id === selectedArchetype)
    if (!archetype) return

    setIsCreating(true)
    setCreationFailed(false)

    // 3 reintentos internos transparentes con backoff. Cada intento con timeout de 30s.
    const BACKOFFS = [0, 1500, 3000] // delays antes de cada intento (primer intento inmediato)
    const PER_ATTEMPT_TIMEOUT_MS = 30000

    for (let attempt = 0; attempt < BACKOFFS.length; attempt++) {
      if (BACKOFFS[attempt] > 0) {
        await new Promise((r) => setTimeout(r, BACKOFFS[attempt]))
      }
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), PER_ATTEMPT_TIMEOUT_MS)
      try {
        const sessionId = await attemptCreateSession(controller.signal)
        clearTimeout(timeoutId)
        if (sessionId) {
          // El loading queda visible hasta que el router cambie la página
          router.push(`/play/${sessionId}`)
          return
        }
      } catch (err) {
        clearTimeout(timeoutId)
        if (process.env.NODE_ENV === 'development') {
          console.error(`[play-guest] attempt ${attempt + 1} failed:`, err)
        }
      }
    }

    // Si llegamos acá es que los 3 intentos fallaron
    setIsCreating(false)
    setCreationFailed(true)
  }

  // Render según el paso actual
  if (step === 'warning') {
    return (
      <GuestWarningModal
        locale={locale as 'es' | 'en'}
        onContinue={handleContinueAsGuest}
      />
    )
  }

  if (step === 'playing' && session?.character) {
    return <GuestGameSession />
  }

  // Loading temático durante la creación — oculta todo lo demás para que el
  // usuario no vea botones ni errores. Los reintentos son transparentes.
  if (isCreating) {
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <OrnateFrame variant="gold">
            <ParchmentPanel variant="ornate" className="p-8 md:p-12 text-center">
              <div className="space-y-6">
                <div className="text-6xl md:text-7xl candlelight">✨</div>
                <h1 className="font-title text-2xl md:text-3xl text-ink animate-pulse">
                  {loadingMessages[loadingMessageIndex]}
                </h1>
                <p className="font-ui text-sm text-ink/60">
                  {isEnglish
                    ? 'This may take a few moments...'
                    : 'Esto puede tardar unos momentos...'}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" style={{ animationDelay: '200ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </ParchmentPanel>
          </OrnateFrame>
        </div>
      </div>
    )
  }

  // Fallback amable si los 3 reintentos fallaron
  if (creationFailed) {
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <OrnateFrame variant="gold">
            <ParchmentPanel variant="ornate" className="p-8 md:p-12 text-center">
              <div className="space-y-6">
                <div className="text-5xl md:text-6xl">🕯️</div>
                <h1 className="font-title text-2xl md:text-3xl text-ink">
                  {isEnglish ? 'The runes are settling...' : 'Las runas se están asentando...'}
                </h1>
                <p className="font-body text-ink/70 max-w-md mx-auto leading-relaxed">
                  {isEnglish
                    ? 'It will take a moment. Please try again in a few seconds.'
                    : 'Tomará un momento. Volvé a intentarlo en unos segundos.'}
                </p>
                <div className="pt-2">
                  <RunicButton
                    onClick={handleStartGame}
                    variant="primary"
                    className="px-8"
                  >
                    {isEnglish ? 'Try Again' : 'Volver a intentar'}
                  </RunicButton>
                </div>
              </div>
            </ParchmentPanel>
          </OrnateFrame>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <OrnateFrame variant="gold">
          <ParchmentPanel variant="ornate" className="p-6 md:p-8">
            {/* Step: Select Lore */}
            {step === 'lore' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="font-title text-3xl text-ink mb-2">{labels.selectWorld}</h1>
                  <p className="font-ui text-ink/60 text-sm">
                    {isEnglish ? 'Each world has its own stories and dangers' : 'Cada mundo tiene sus propias historias y peligros'}
                  </p>
                </div>

                <div className="grid gap-4">
                  {GUEST_LORES.map((lore) => (
                    <button
                      key={lore.id}
                      onClick={() => handleSelectLore(lore.id)}
                      className="flex items-center gap-4 p-4 bg-ink/5 hover:bg-gold/10 border-2 border-transparent hover:border-gold/50 rounded-xl transition-all group"
                    >
                      <div className="text-4xl">{lore.emoji}</div>
                      <div className="flex-1 text-left">
                        <h3 className="font-heading text-lg text-ink group-hover:text-gold transition-colors">
                          {isEnglish ? lore.nameEn : lore.name}
                        </h3>
                        <p className="font-ui text-sm text-ink/60">{isEnglish ? lore.descriptionEn : lore.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-ink/30 group-hover:text-gold transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Select Archetype */}
            {step === 'archetype' && selectedLore && (
              <div className="space-y-6">
                <button
                  onClick={() => setStep('lore')}
                  className="flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors"
                >
                  ← {labels.back}
                </button>

                <div className="text-center">
                  <h1 className="font-title text-3xl text-ink mb-2">{labels.selectArchetype}</h1>
                </div>

                <div className="grid gap-4">
                  {GUEST_ARCHETYPES[selectedLore]?.map((archetype) => (
                    <button
                      key={archetype.id}
                      onClick={() => handleSelectArchetype(archetype.id)}
                      className="flex items-center gap-4 p-4 bg-ink/5 hover:bg-gold/10 border-2 border-transparent hover:border-gold/50 rounded-xl transition-all group"
                    >
                      <div className="flex-1 text-left">
                        <h3 className="font-heading text-lg text-ink group-hover:text-gold transition-colors">
                          {isEnglish ? archetype.nameEn : archetype.name}
                        </h3>
                        {/* Stats preview */}
                        <div className="flex gap-4 mt-2 text-xs text-ink/60">
                          <span className="flex items-center gap-1">
                            <Swords className="h-3 w-3" /> {archetype.stats.combat}
                          </span>
                          <span className="flex items-center gap-1">
                            <Map className="h-3 w-3" /> {archetype.stats.exploration}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" /> {archetype.stats.social}
                          </span>
                          <span className="flex items-center gap-1">
                            <Scroll className="h-3 w-3" /> {archetype.stats.lore}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-ink/30 group-hover:text-gold transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Name Character */}
            {step === 'name' && (
              <div className="space-y-6">
                <button
                  onClick={() => setStep('archetype')}
                  className="flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors"
                >
                  ← {labels.back}
                </button>

                <div className="text-center">
                  <h1 className="font-title text-3xl text-ink mb-2">{labels.nameCharacter}</h1>
                </div>

                <div className="max-w-sm mx-auto">
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder={labels.namePlaceholder}
                    maxLength={30}
                    className="w-full p-4 text-center font-heading text-xl bg-parchment-dark/50 border-2 border-gold-dim/30 rounded-lg
                             text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                    autoFocus
                  />
                </div>

                <div className="flex justify-center">
                  <RunicButton
                    onClick={handleStartGame}
                    disabled={!characterName.trim() || isCreating}
                    variant="primary"
                    className="px-8"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {labels.startAdventure}
                  </RunicButton>
                </div>
              </div>
            )}
          </ParchmentPanel>
        </OrnateFrame>
      </div>
    </div>
  )
}
