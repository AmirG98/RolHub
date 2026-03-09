'use client'

import { useState } from 'react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { RunicButton } from '@/components/medieval/RunicButton'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import {
  Crown, Send, Loader2, Eye, EyeOff, Wand2, Dice6,
  Heart, Skull, Scroll, MapPin, Music, Users
} from 'lucide-react'

interface DMPanelProps {
  sessionId: string
  campaignId: string
  onNarrationSent?: () => void
  worldState: any
  participants: Array<{
    id: string
    user?: { username: string }
    character?: { id: string; name: string } | null
  }>
}

type DMActionType = 'narrate' | 'damage' | 'heal' | 'event' | 'npc' | 'roll'

export default function DMPanel({
  sessionId,
  campaignId,
  onNarrationSent,
  worldState,
  participants,
}: DMPanelProps) {
  const [narration, setNarration] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionType, setActionType] = useState<DMActionType>('narrate')
  const [isPrivate, setIsPrivate] = useState(false)
  const [selectedTargets, setSelectedTargets] = useState<string[]>([])

  // For damage/heal actions
  const [damageAmount, setDamageAmount] = useState('')
  const [damageTarget, setDamageTarget] = useState<string>('')

  // For world state updates
  const [worldUpdates, setWorldUpdates] = useState<Record<string, any>>({})

  const handleSendNarration = async () => {
    if (!narration.trim() && actionType === 'narrate') return

    setSending(true)
    setError(null)

    try {
      const response = await fetch('/api/session/dm-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          narration: narration.trim(),
          actionType,
          isPrivate,
          targetPlayerIds: selectedTargets.length > 0 ? selectedTargets : undefined,
          worldStateUpdates: Object.keys(worldUpdates).length > 0 ? worldUpdates : undefined,
          damageHeal: actionType === 'damage' || actionType === 'heal' ? {
            type: actionType,
            amount: parseInt(damageAmount) || 0,
            targetCharacterId: damageTarget,
          } : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al enviar la narración')
      }

      setNarration('')
      setWorldUpdates({})
      setDamageAmount('')
      setDamageTarget('')
      setSelectedTargets([])
      onNarrationSent?.()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  const actionButtons: { type: DMActionType; icon: React.ReactNode; label: string }[] = [
    { type: 'narrate', icon: <Scroll className="w-4 h-4" />, label: 'Narrar' },
    { type: 'damage', icon: <Skull className="w-4 h-4" />, label: 'Daño' },
    { type: 'heal', icon: <Heart className="w-4 h-4" />, label: 'Curar' },
    { type: 'event', icon: <Wand2 className="w-4 h-4" />, label: 'Evento' },
    { type: 'npc', icon: <Users className="w-4 h-4" />, label: 'NPC' },
    { type: 'roll', icon: <Dice6 className="w-4 h-4" />, label: 'Tirada' },
  ]

  const playersWithCharacters = participants.filter(p => p.character)

  return (
    <OrnateFrame variant="gold">
      <ParchmentPanel variant="ornate" className="p-4">
        {/* DM Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gold/30">
          <Crown className="w-5 h-5 text-gold" />
          <h2 className="font-heading text-lg text-gold">Panel del Dungeon Master</h2>
        </div>

        {/* Action Type Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {actionButtons.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => setActionType(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-ui transition-colors ${
                actionType === type
                  ? 'bg-gold/20 text-gold border border-gold/50'
                  : 'bg-shadow/30 text-parchment/70 hover:bg-shadow/50'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Damage/Heal Target Selector */}
        {(actionType === 'damage' || actionType === 'heal') && (
          <div className="mb-4 p-3 bg-shadow/20 rounded-lg">
            <label className="font-ui text-sm text-gold-dim mb-2 block">
              {actionType === 'damage' ? 'Infligir daño a:' : 'Curar a:'}
            </label>
            <div className="flex gap-3">
              <select
                value={damageTarget}
                onChange={(e) => setDamageTarget(e.target.value)}
                className="flex-1 bg-shadow/50 border border-gold/30 rounded-lg px-3 py-2 text-parchment font-ui text-sm"
              >
                <option value="">Seleccionar personaje...</option>
                {playersWithCharacters.map(p => (
                  <option key={p.character!.id} value={p.character!.id}>
                    {p.character!.name} ({p.user?.username})
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={damageAmount}
                onChange={(e) => setDamageAmount(e.target.value)}
                placeholder="Cantidad"
                className="w-24 bg-shadow/50 border border-gold/30 rounded-lg px-3 py-2 text-parchment font-ui text-sm"
              />
            </div>
          </div>
        )}

        {/* Narration Textarea */}
        <div className="mb-4">
          <textarea
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            placeholder={
              actionType === 'narrate' ? 'Escribe tu narración...' :
              actionType === 'event' ? 'Describe el evento que ocurre...' :
              actionType === 'npc' ? 'El NPC dice o hace...' :
              actionType === 'roll' ? 'Describe la tirada requerida...' :
              'Descripción opcional...'
            }
            className="w-full h-32 bg-shadow/50 border border-gold/30 rounded-lg p-3 text-parchment font-body resize-none focus:outline-none focus:border-gold/60"
          />
        </div>

        {/* Options Row */}
        <div className="flex items-center justify-between mb-4">
          {/* Private Message Toggle */}
          <button
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-ui transition-colors ${
              isPrivate
                ? 'bg-blood/20 text-blood border border-blood/50'
                : 'bg-shadow/30 text-parchment/70 hover:bg-shadow/50'
            }`}
          >
            {isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPrivate ? 'Mensaje Privado' : 'Mensaje Público'}
          </button>

          {/* Target Players (for private messages) */}
          {isPrivate && (
            <div className="flex gap-2">
              {playersWithCharacters.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedTargets(prev =>
                      prev.includes(p.id)
                        ? prev.filter(id => id !== p.id)
                        : [...prev, p.id]
                    )
                  }}
                  className={`px-2 py-1 rounded text-xs font-ui transition-colors ${
                    selectedTargets.includes(p.id)
                      ? 'bg-gold/20 text-gold'
                      : 'bg-shadow/30 text-parchment/60'
                  }`}
                >
                  {p.character?.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-blood/10 border border-blood/30 rounded-lg">
            <p className="font-ui text-sm text-blood">{error}</p>
          </div>
        )}

        {/* Send Button */}
        <RunicButton
          onClick={handleSendNarration}
          disabled={sending || (!narration.trim() && actionType === 'narrate')}
          variant="primary"
          className="w-full"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar Narración
            </>
          )}
        </RunicButton>

        {/* World State Info (DM Only) */}
        <div className="mt-4 pt-4 border-t border-gold/20">
          <details className="group">
            <summary className="font-ui text-sm text-gold-dim cursor-pointer hover:text-gold">
              Ver Estado del Mundo (solo DM)
            </summary>
            <div className="mt-2 p-3 bg-shadow/30 rounded-lg text-xs font-mono text-parchment/70 max-h-40 overflow-auto">
              <pre>{JSON.stringify(worldState, null, 2)}</pre>
            </div>
          </details>
        </div>
      </ParchmentPanel>
    </OrnateFrame>
  )
}
