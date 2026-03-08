'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { RunicButton } from '@/components/medieval/RunicButton'
import Link from 'next/link'
import { LORES } from '@/lib/constants/lores'

interface Character {
  id: string
  name: string
  lore: string
  archetype: string
  level: number
  stats: any
  campaign: { name: string, lore: string, status: string } | null
}

export default function CharactersPage() {
  const { user } = useUser()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCharacters()
    }
  }, [user])

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters')
      const data = await response.json()
      setCharacters(data.characters || [])
    } catch (error) {
      console.error('Error fetching characters:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass-panel-dark p-8 rounded-lg">
          <p className="font-heading text-gold">Cargando personajes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen particle-bg py-4 md:py-8">
      <div className="max-w-6xl mx-auto content-wrapper px-3 md:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <h1 className="font-title text-2xl md:text-4xl text-gold">Mis Personajes</h1>
          <Link href="/onboarding">
            <RunicButton variant="primary" className="w-full sm:w-auto text-sm md:text-base">+ Nuevo Personaje</RunicButton>
          </Link>
        </div>

        {characters.length === 0 ? (
          <div className="glass-panel-dark rounded-lg p-8 md:p-12 text-center">
            <div className="text-5xl md:text-6xl mb-3 md:mb-4">🎭</div>
            <h2 className="font-heading text-xl md:text-2xl text-parchment mb-2 md:mb-3">
              No tienes personajes todavía
            </h2>
            <p className="font-body text-sm md:text-base text-parchment/60 mb-4 md:mb-6">
              Crea tu primer héroe y comienza tu aventura
            </p>
            <Link href="/onboarding">
              <RunicButton variant="primary" className="glow-effect">
                Crear mi Primer Personaje
              </RunicButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {characters.map((character) => {
              const loreData = LORES.find(l => l.id === character.lore)
              return (
                <div
                  key={character.id}
                  className="glass-panel rounded-lg p-4 md:p-6 hover:scale-105 transition-all hover:glow-effect group"
                >
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="text-3xl md:text-4xl">{loreData?.icon || '🎭'}</div>
                    <div className="glass-panel px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                      <span className="text-[10px] md:text-xs font-ui text-gold">Nv.{character.level}</span>
                    </div>
                  </div>

                  <h3 className="font-heading text-lg md:text-2xl text-parchment mb-1 md:mb-2 group-hover:text-gold transition line-clamp-1">
                    {character.name}
                  </h3>

                  <p className="font-ui text-xs md:text-sm mb-1 md:mb-2" style={{ color: loreData?.color }}>
                    {character.archetype}
                  </p>

                  {character.campaign && (
                    <p className="font-body text-[10px] md:text-xs text-parchment/60 mb-3 md:mb-4 line-clamp-1">
                      Campaña: {character.campaign.name}
                    </p>
                  )}

                  {character.stats && character.stats.hp !== undefined && (
                    <div className="mb-3 md:mb-4">
                      <div className="flex justify-between text-[10px] md:text-xs font-ui text-parchment/60 mb-1">
                        <span>HP</span>
                        <span>{character.stats.hp}/{character.stats.maxHp}</span>
                      </div>
                      <div className="w-full h-1.5 md:h-2 bg-shadow rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blood via-red-500 to-blood glow-effect"
                          style={{ width: `${(character.stats.hp / character.stats.maxHp) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <RunicButton variant="secondary" className="w-full text-sm">
                    Ver Ficha
                  </RunicButton>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
