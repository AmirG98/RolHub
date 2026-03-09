'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { RunicButton } from '@/components/medieval/RunicButton'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { LORES } from '@/lib/constants/lores'
import { Loader2, Sword, Shield, Scroll, Plus, User, RefreshCw } from 'lucide-react'

interface Archetype {
  id: string
  name: string
  description: string
  simple_description: string
  starting_stats: {
    hp: number
    maxHp: number
    combat: number
    exploration: number
    social: number
    lore: number
  }
  starting_inventory: string[]
  special_ability: string
}

interface ExistingCharacter {
  id: string
  name: string
  archetype: string
  level: number
  lore: string
  stats: {
    hp: number
    maxHp: number
    combat: number
    exploration: number
    social: number
    lore: number
  }
}

interface CampaignInfo {
  id: string
  name: string
  lore: string
  engine: string
  latestSession?: { id: string }
}

function getDefaultArchetypes(): Archetype[] {
  return [
    {
      id: 'warrior',
      name: 'Guerrero',
      description: 'Experto en combate cuerpo a cuerpo',
      simple_description: 'Fuerte y resistente, dominas las armas y la armadura.',
      starting_stats: { hp: 25, maxHp: 25, combat: 4, exploration: 2, social: 1, lore: 1 },
      starting_inventory: ['Espada', 'Escudo', 'Armadura de cuero'],
      special_ability: 'Golpe Poderoso: +2 al daño en el primer ataque',
    },
    {
      id: 'scout',
      name: 'Explorador',
      description: 'Ágil y perceptivo, conoce los caminos secretos',
      simple_description: 'Rápido y sigiloso, encuentras caminos donde otros no ven nada.',
      starting_stats: { hp: 18, maxHp: 18, combat: 2, exploration: 4, social: 2, lore: 2 },
      starting_inventory: ['Arco', 'Daga', 'Capa de viaje'],
      special_ability: 'Sigilo: Puedes moverte sin ser detectado',
    },
    {
      id: 'sage',
      name: 'Sabio',
      description: 'Conocedor de secretos antiguos y magia',
      simple_description: 'Tu conocimiento es tu mayor arma, descifras misterios.',
      starting_stats: { hp: 15, maxHp: 15, combat: 1, exploration: 2, social: 3, lore: 4 },
      starting_inventory: ['Bastón', 'Libro de conocimientos', 'Hierbas medicinales'],
      special_ability: 'Sabiduría Antigua: Ventaja en tiradas de conocimiento',
    },
  ]
}

type ViewMode = 'select' | 'create'

export default function JoinCharacterPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const campaignId = params.campaignId as string

  const [campaignInfo, setCampaignInfo] = useState<CampaignInfo | null>(null)
  const [archetypes, setArchetypes] = useState<Archetype[]>([])
  const [existingCharacters, setExistingCharacters] = useState<ExistingCharacter[]>([])
  const [currentCharacter, setCurrentCharacter] = useState<ExistingCharacter | null>(null)
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null)
  const [selectedExistingChar, setSelectedExistingChar] = useState<string | null>(null)
  const [characterName, setCharacterName] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('select')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login')
      return
    }
    fetchData()
  }, [campaignId, isLoaded, user])

  const fetchData = async () => {
    try {
      // Fetch campaign info
      const campaignRes = await fetch(`/api/campaigns/${campaignId}`)
      if (!campaignRes.ok) {
        setError('Campaña no encontrada')
        setLoading(false)
        return
      }
      const campaignData = await campaignRes.json()
      setCampaignInfo(campaignData.campaign)

      // Check if user already has a character in this campaign
      if (campaignData.currentUserCharacter) {
        setCurrentCharacter(campaignData.currentUserCharacter)
      }

      // Fetch user's existing characters (from all campaigns with same lore)
      const charsRes = await fetch(`/api/characters?lore=${campaignData.campaign.lore}`)
      if (charsRes.ok) {
        const charsData = await charsRes.json()
        setExistingCharacters(charsData.characters || [])
      }

      // Fetch archetypes for this lore
      const loreId = campaignData.campaign.lore.toLowerCase()
      try {
        const archetypesRes = await fetch(`/api/lores/${loreId}/archetypes`)
        if (archetypesRes.ok) {
          const archetypesData = await archetypesRes.json()
          setArchetypes(archetypesData.archetypes || [])
        } else {
          setArchetypes(getDefaultArchetypes())
        }
      } catch {
        setArchetypes(getDefaultArchetypes())
      }
    } catch (err) {
      setError('Error al cargar la información')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCharacter = async () => {
    if (!selectedArchetype || !characterName.trim()) return

    setCreating(true)
    setError(null)

    try {
      const archetype = archetypes.find(a => a.id === selectedArchetype)
      if (!archetype) throw new Error('Arquetipo no encontrado')

      const response = await fetch('/api/characters/create-for-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          name: characterName,
          archetype: archetype.name,
          stats: archetype.starting_stats,
          inventory: archetype.starting_inventory,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear personaje')
      }

      // Redirect to the game session or lobby
      if (data.sessionId) {
        router.push(`/play/${data.sessionId}`)
      } else {
        router.push(`/lobby/${campaignId}`)
      }
    } catch (err) {
      setError((err as Error).message)
      setCreating(false)
    }
  }

  const handleSelectExistingCharacter = async () => {
    if (!selectedExistingChar) return

    setCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/characters/use-for-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          characterId: selectedExistingChar,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al asignar personaje')
      }

      // Redirect to the game session or lobby
      if (data.sessionId) {
        router.push(`/play/${data.sessionId}`)
      } else {
        router.push(`/lobby/${campaignId}`)
      }
    } catch (err) {
      setError((err as Error).message)
      setCreating(false)
    }
  }

  const handleContinueWithCurrent = () => {
    const sessionId = campaignInfo?.latestSession?.id
    if (sessionId) {
      router.push(`/play/${sessionId}`)
    } else {
      router.push(`/lobby/${campaignId}`)
    }
  }

  const loreData = campaignInfo ? LORES.find(l => l.id === campaignInfo.lore) : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel-dark p-8 rounded-lg text-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
          <p className="font-heading text-gold">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error && !campaignInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel-dark p-8 rounded-lg text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="font-heading text-2xl text-blood mb-4">Error</h1>
          <p className="font-body text-parchment/80 mb-6">{error}</p>
          <RunicButton onClick={() => router.push('/')} variant="secondary">
            Volver al Inicio
          </RunicButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-ui text-gold-dim mb-2">Uniéndote a</p>
          <h1 className="font-title text-3xl text-gold mb-2">{campaignInfo?.name}</h1>
          <p className="font-heading text-lg" style={{ color: loreData?.color }}>
            {loreData?.name}
          </p>
        </div>

        {/* Current Character Banner (if exists) */}
        {currentCharacter && (
          <div className="mb-8">
            <ParchmentPanel variant="ornate" className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="font-ui text-sm text-ink/60">Tu personaje actual</p>
                    <h3 className="font-heading text-xl text-ink">{currentCharacter.name}</h3>
                    <p className="font-ui text-sm text-ink/80">
                      {currentCharacter.archetype} • Nivel {currentCharacter.level}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <RunicButton onClick={handleContinueWithCurrent} variant="primary">
                    Continuar con este
                  </RunicButton>
                  <RunicButton
                    onClick={() => setCurrentCharacter(null)}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Cambiar
                  </RunicButton>
                </div>
              </div>
            </ParchmentPanel>
          </div>
        )}

        {/* Character Selection (only show if no current character or user wants to change) */}
        {!currentCharacter && (
          <>
            {/* View Mode Tabs */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setViewMode('select')}
                className={`px-6 py-3 rounded-lg font-heading transition-all ${
                  viewMode === 'select'
                    ? 'bg-gold text-shadow'
                    : 'glass-panel text-gold hover:bg-gold/10'
                }`}
              >
                <User className="w-5 h-5 inline mr-2" />
                Usar Personaje Existente
              </button>
              <button
                onClick={() => setViewMode('create')}
                className={`px-6 py-3 rounded-lg font-heading transition-all ${
                  viewMode === 'create'
                    ? 'bg-gold text-shadow'
                    : 'glass-panel text-gold hover:bg-gold/10'
                }`}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Crear Nuevo
              </button>
            </div>

            {/* Existing Characters Selection */}
            {viewMode === 'select' && (
              <>
                {existingCharacters.length > 0 ? (
                  <>
                    <h2 className="font-heading text-xl text-gold mb-4 text-center">
                      Tus Personajes de {loreData?.name}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {existingCharacters.map(char => (
                        <OrnateFrame
                          key={char.id}
                          variant={selectedExistingChar === char.id ? 'gold' : 'shadow'}
                        >
                          <button
                            onClick={() => setSelectedExistingChar(char.id)}
                            className={`w-full text-left p-4 transition-all ${
                              selectedExistingChar === char.id
                                ? 'bg-gold/10'
                                : 'hover:bg-parchment/5'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-gold" />
                              </div>
                              <div>
                                <h3 className="font-heading text-lg text-gold">{char.name}</h3>
                                <p className="font-ui text-xs text-parchment/60">
                                  {char.archetype} • Nivel {char.level}
                                </p>
                              </div>
                            </div>

                            {/* Stats Preview */}
                            <div className="grid grid-cols-2 gap-2 text-xs font-ui">
                              <div className="flex justify-between text-parchment/60">
                                <span>HP:</span>
                                <span className="text-blood">{char.stats?.hp || 20}/{char.stats?.maxHp || 20}</span>
                              </div>
                              <div className="flex justify-between text-parchment/60">
                                <span>Combate:</span>
                                <span className="text-gold">{char.stats?.combat || 2}</span>
                              </div>
                              <div className="flex justify-between text-parchment/60">
                                <span>Exploración:</span>
                                <span className="text-gold">{char.stats?.exploration || 2}</span>
                              </div>
                              <div className="flex justify-between text-parchment/60">
                                <span>Social:</span>
                                <span className="text-gold">{char.stats?.social || 2}</span>
                              </div>
                            </div>
                          </button>
                        </OrnateFrame>
                      ))}
                    </div>

                    {error && (
                      <div className="bg-blood/10 border border-blood/30 rounded-lg p-4 mb-6 text-center">
                        <p className="font-ui text-blood">{error}</p>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <RunicButton
                        onClick={handleSelectExistingCharacter}
                        variant="primary"
                        className="px-12 py-4 text-lg glow-effect"
                        disabled={!selectedExistingChar || creating}
                      >
                        {creating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Asignando personaje...
                          </>
                        ) : (
                          'Usar Este Personaje'
                        )}
                      </RunicButton>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🧙</div>
                    <h3 className="font-heading text-xl text-gold mb-2">
                      No tienes personajes de {loreData?.name}
                    </h3>
                    <p className="font-body text-parchment/60 mb-6">
                      Crea tu primer personaje para esta ambientación
                    </p>
                    <RunicButton onClick={() => setViewMode('create')} variant="primary">
                      <Plus className="w-5 h-5 inline mr-2" />
                      Crear Personaje
                    </RunicButton>
                  </div>
                )}
              </>
            )}

            {/* Create New Character */}
            {viewMode === 'create' && (
              <>
                {/* Character Name Input */}
                <div className="mb-8">
                  <ParchmentPanel variant="ornate" className="p-6">
                    <label className="block font-heading text-lg text-ink mb-3">
                      Nombre de tu personaje
                    </label>
                    <input
                      type="text"
                      value={characterName}
                      onChange={e => setCharacterName(e.target.value)}
                      placeholder="Ingresa el nombre de tu héroe..."
                      className="w-full px-4 py-3 bg-shadow/20 border border-gold-dim rounded-lg
                                 font-body text-lg text-ink placeholder-stone
                                 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </ParchmentPanel>
                </div>

                {/* Archetype Selection */}
                <h2 className="font-heading text-xl text-gold mb-4 text-center">
                  Elige tu Arquetipo
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {archetypes.map(archetype => (
                    <OrnateFrame
                      key={archetype.id}
                      variant={selectedArchetype === archetype.id ? 'gold' : 'shadow'}
                    >
                      <button
                        onClick={() => setSelectedArchetype(archetype.id)}
                        className={`w-full text-left p-4 transition-all ${
                          selectedArchetype === archetype.id
                            ? 'bg-gold/10'
                            : 'hover:bg-parchment/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {archetype.id.includes('warrior') || archetype.id.includes('ranger') ? (
                            <Sword className="w-6 h-6 text-gold" />
                          ) : archetype.id.includes('scout') || archetype.id.includes('explorer') ? (
                            <Shield className="w-6 h-6 text-gold" />
                          ) : (
                            <Scroll className="w-6 h-6 text-gold" />
                          )}
                          <h3 className="font-heading text-lg text-gold">{archetype.name}</h3>
                        </div>

                        <p className="font-body text-parchment/80 text-sm mb-4">
                          {archetype.simple_description}
                        </p>

                        {/* Stats Preview */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-ui">
                          <div className="flex justify-between text-parchment/60">
                            <span>HP:</span>
                            <span className="text-blood">{archetype.starting_stats.hp}</span>
                          </div>
                          <div className="flex justify-between text-parchment/60">
                            <span>Combate:</span>
                            <span className="text-gold">{archetype.starting_stats.combat}</span>
                          </div>
                          <div className="flex justify-between text-parchment/60">
                            <span>Exploración:</span>
                            <span className="text-gold">{archetype.starting_stats.exploration}</span>
                          </div>
                          <div className="flex justify-between text-parchment/60">
                            <span>Social:</span>
                            <span className="text-gold">{archetype.starting_stats.social}</span>
                          </div>
                        </div>

                        {/* Special Ability */}
                        <div className="mt-3 pt-3 border-t border-gold-dim/30">
                          <p className="font-ui text-xs text-gold-dim">
                            <span className="text-gold">Habilidad:</span> {archetype.special_ability}
                          </p>
                        </div>
                      </button>
                    </OrnateFrame>
                  ))}
                </div>

                {error && (
                  <div className="bg-blood/10 border border-blood/30 rounded-lg p-4 mb-6 text-center">
                    <p className="font-ui text-blood">{error}</p>
                  </div>
                )}

                {/* Create Button */}
                <div className="flex justify-center">
                  <RunicButton
                    onClick={handleCreateCharacter}
                    variant="primary"
                    className="px-12 py-4 text-lg glow-effect"
                    disabled={!selectedArchetype || !characterName.trim() || creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Creando personaje...
                      </>
                    ) : (
                      'Crear y Comenzar'
                    )}
                  </RunicButton>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
