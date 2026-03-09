'use client'

import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { Users, Crown, Gamepad2, Eye, Heart, Wifi, WifiOff } from 'lucide-react'

interface Participant {
  id: string
  role: 'OWNER' | 'DM' | 'PLAYER' | 'SPECTATOR'
  isOnline: boolean
  user?: {
    id: string
    username: string
  }
  character?: {
    id: string
    name: string
    archetype: string
    hp?: string
  } | null
}

interface ParticipantListProps {
  participants: Participant[]
  currentUserId?: string
  isMultiplayer: boolean
}

export function ParticipantList({ participants, currentUserId, isMultiplayer }: ParticipantListProps) {
  if (!isMultiplayer || participants.length <= 1) {
    return null
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-4 h-4 text-gold" />
      case 'DM':
        return <Gamepad2 className="w-4 h-4 text-gold" />
      case 'SPECTATOR':
        return <Eye className="w-4 h-4 text-gold-dim" />
      default:
        return null
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'Anfitrión'
      case 'DM':
        return 'DM'
      case 'SPECTATOR':
        return 'Espectador'
      default:
        return 'Jugador'
    }
  }

  // Parse HP string like "14/20" to get percentage
  const parseHP = (hpString?: string) => {
    if (!hpString) return { current: 0, max: 0, percentage: 0 }
    const [current, max] = hpString.split('/').map(Number)
    return {
      current,
      max,
      percentage: max > 0 ? (current / max) * 100 : 0,
    }
  }

  return (
    <OrnateFrame variant="shadow">
      <ParchmentPanel>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gold" />
          <h3 className="font-heading text-lg text-ink">Grupo</h3>
          <span className="ml-auto font-ui text-xs text-gold-dim">
            {participants.filter(p => p.isOnline).length}/{participants.length} en línea
          </span>
        </div>

        <div className="space-y-3">
          {participants.map((participant) => {
            const isCurrentUser = participant.user?.id === currentUserId
            const hp = parseHP(participant.character?.hp)

            return (
              <div
                key={participant.id}
                className={`p-3 rounded-lg transition-all ${
                  isCurrentUser
                    ? 'bg-gold/10 border border-gold/30'
                    : 'bg-shadow/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Player name and role */}
                    <div className="flex items-center gap-2">
                      {/* Online indicator */}
                      {participant.isOnline ? (
                        <Wifi className="w-3 h-3 text-emerald flex-shrink-0" />
                      ) : (
                        <WifiOff className="w-3 h-3 text-stone/50 flex-shrink-0" />
                      )}

                      <span className={`font-ui text-sm truncate ${
                        participant.isOnline ? 'text-parchment' : 'text-parchment/50'
                      }`}>
                        {participant.user?.username || 'Jugador'}
                      </span>

                      {getRoleIcon(participant.role)}

                      {isCurrentUser && (
                        <span className="text-[10px] text-gold-dim">(Tú)</span>
                      )}
                    </div>

                    {/* Character info */}
                    {participant.character ? (
                      <div className="mt-1.5 pl-5">
                        <p className="font-heading text-sm text-gold truncate">
                          {participant.character.name}
                        </p>
                        <p className="font-ui text-xs text-gold-dim">
                          {participant.character.archetype}
                        </p>

                        {/* HP bar */}
                        {participant.character.hp && (
                          <div className="mt-2">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Heart className="w-3 h-3 text-blood" />
                              <span className="font-ui text-xs text-blood">
                                {hp.current}/{hp.max}
                              </span>
                            </div>
                            <div className="h-1.5 bg-shadow rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  hp.percentage > 60
                                    ? 'bg-emerald'
                                    : hp.percentage > 30
                                    ? 'bg-gold'
                                    : 'bg-blood'
                                }`}
                                style={{ width: `${hp.percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="font-ui text-xs text-stone/50 mt-1 pl-5 italic">
                        {participant.role === 'SPECTATOR'
                          ? 'Observando'
                          : 'Sin personaje'}
                      </p>
                    )}
                  </div>

                  {/* Role badge */}
                  <div className={`px-2 py-0.5 rounded text-[10px] font-ui uppercase ${
                    participant.role === 'OWNER'
                      ? 'bg-gold/20 text-gold'
                      : participant.role === 'DM'
                      ? 'bg-gold/20 text-gold'
                      : participant.role === 'SPECTATOR'
                      ? 'bg-stone/20 text-stone'
                      : 'bg-emerald/20 text-emerald'
                  }`}>
                    {getRoleLabel(participant.role)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ParchmentPanel>
    </OrnateFrame>
  )
}
