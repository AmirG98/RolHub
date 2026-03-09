'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { RunicButton } from '@/components/medieval/RunicButton'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { LORES } from '@/lib/constants/lores'
import { useParticipantPresence } from '@/hooks/useParticipantPresence'
import {
  Users, Crown, Gamepad2, Wifi, WifiOff, Copy, Check, Link2, Play, Loader2, Shield
} from 'lucide-react'

interface Participant {
  id: string
  role: 'OWNER' | 'DM' | 'PLAYER' | 'SPECTATOR'
  isOnline: boolean
  user?: { id: string; username: string }
  character?: { id: string; name: string; archetype: string } | null
}

interface CampaignInfo {
  id: string
  name: string
  lore: string
  engine: string
  mode: string
  isMultiplayer: boolean
  maxPlayers: number
  inviteCode: string | null
  status: string
  participants: Participant[]
  latestSession?: { id: string } | null
}

export default function LobbyPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const campaignId = params.campaignId as string

  const [campaign, setCampaign] = useState<CampaignInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Presence tracking
  useParticipantPresence(campaignId)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login')
      return
    }
    fetchCampaign()

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchCampaign, 5000)
    return () => clearInterval(interval)
  }, [campaignId, isLoaded, user])

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`)
      if (!response.ok) {
        setError('Campaña no encontrada')
        setLoading(false)
        return
      }
      const data = await response.json()
      setCampaign(data.campaign)
    } catch (err) {
      setError('Error al cargar la campaña')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = async () => {
    if (campaign?.inviteCode) {
      await navigator.clipboard.writeText(campaign.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyLink = async () => {
    if (campaign?.inviteCode) {
      const url = `${window.location.origin}/invite/${campaign.inviteCode}`
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleStartGame = async () => {
    if (!campaign) return

    setStarting(true)
    try {
      // If there's already a session, go to it
      if (campaign.latestSession?.id) {
        router.push(`/play/${campaign.latestSession.id}`)
        return
      }

      // Otherwise create a new session
      const response = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar la sesión')
      }

      router.push(`/play/${data.sessionId}`)
    } catch (err) {
      setError((err as Error).message)
      setStarting(false)
    }
  }

  const loreData = campaign ? LORES.find(l => l.id === campaign.lore) : null
  const currentUser = campaign?.participants.find(p => p.user?.id === user?.id)
  const isOwner = currentUser?.role === 'OWNER'
  const onlineCount = campaign?.participants.filter(p => p.isOnline).length || 0
  const hasCharacter = !!currentUser?.character

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel-dark p-8 rounded-lg text-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
          <p className="font-heading text-gold">Cargando lobby...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
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
      <div className="max-w-2xl mx-auto">
        {/* Campaign Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{loreData?.icon || '🎮'}</div>
          <h1 className="font-title text-3xl text-gold mb-2">{campaign.name}</h1>
          <p className="font-heading text-lg" style={{ color: loreData?.color }}>
            {loreData?.name} • {campaign.mode === 'CAMPAIGN' ? 'Campaña' : 'One-Shot'}
          </p>
        </div>

        {/* Invite Section */}
        {campaign.inviteCode && (
          <OrnateFrame variant="gold">
            <ParchmentPanel variant="ornate" className="mb-6">
              <h2 className="font-heading text-xl text-ink text-center mb-4">
                Invita a tus amigos
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Invite Code */}
                <div className="flex-1">
                  <p className="font-ui text-xs text-gold-dim mb-1">Código</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-shadow/20 rounded-lg px-4 py-2 font-mono text-xl text-gold tracking-widest text-center">
                      {campaign.inviteCode}
                    </div>
                    <button
                      onClick={copyCode}
                      className="p-2 bg-gold/10 hover:bg-gold/20 rounded-lg text-gold transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Copy Link */}
                <div className="flex items-end">
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 rounded-lg text-gold transition-colors font-ui text-sm"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                    {copiedLink ? 'Copiado!' : 'Copiar Link'}
                  </button>
                </div>
              </div>
            </ParchmentPanel>
          </OrnateFrame>
        )}

        {/* Players List */}
        <OrnateFrame variant="shadow">
          <ParchmentPanel className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl text-ink flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                Jugadores
              </h2>
              <span className="font-ui text-sm text-gold-dim">
                {onlineCount}/{campaign.participants.length} en línea
                ({campaign.maxPlayers} máx)
              </span>
            </div>

            <div className="space-y-3">
              {campaign.participants.map(participant => (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    participant.user?.id === user?.id
                      ? 'bg-gold/10 border border-gold/30'
                      : 'bg-shadow/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Online indicator */}
                    {participant.isOnline ? (
                      <Wifi className="w-4 h-4 text-emerald" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-stone/50" />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-ui ${
                          participant.isOnline ? 'text-parchment' : 'text-parchment/50'
                        }`}>
                          {participant.user?.username || 'Jugador'}
                        </span>
                        {participant.role === 'OWNER' && (
                          <Crown className="w-4 h-4 text-gold" />
                        )}
                        {participant.role === 'DM' && (
                          <Gamepad2 className="w-4 h-4 text-gold" />
                        )}
                        {participant.user?.id === user?.id && (
                          <span className="text-[10px] text-gold-dim">(Tú)</span>
                        )}
                      </div>
                      {participant.character ? (
                        <p className="font-heading text-sm text-gold">
                          {participant.character.name}
                          <span className="text-gold-dim font-ui ml-1">
                            ({participant.character.archetype})
                          </span>
                        </p>
                      ) : (
                        <p className="font-ui text-xs text-stone/50 italic">
                          Sin personaje
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Role badge */}
                  <span className={`px-2 py-1 rounded text-xs font-ui ${
                    participant.role === 'OWNER'
                      ? 'bg-gold/20 text-gold'
                      : participant.role === 'DM'
                      ? 'bg-gold/20 text-gold'
                      : 'bg-emerald/20 text-emerald'
                  }`}>
                    {participant.role === 'OWNER' ? 'Anfitrión' :
                     participant.role === 'DM' ? 'DM' : 'Jugador'}
                  </span>
                </div>
              ))}
            </div>
          </ParchmentPanel>
        </OrnateFrame>

        {/* Actions */}
        <div className="space-y-4">
          {/* Need character warning */}
          {!hasCharacter && (
            <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-gold flex-shrink-0" />
              <div>
                <p className="font-ui text-gold text-sm">Necesitas crear un personaje</p>
                <p className="font-body text-gold-dim text-xs">
                  Antes de comenzar, debes elegir tu personaje para esta campaña.
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!hasCharacter ? (
              <RunicButton
                onClick={() => router.push(`/join/${campaignId}/character`)}
                variant="primary"
                className="flex-1"
              >
                <Shield className="w-4 h-4 mr-2" />
                Crear Personaje
              </RunicButton>
            ) : isOwner ? (
              <RunicButton
                onClick={handleStartGame}
                variant="primary"
                className="flex-1 glow-effect"
                disabled={starting}
              >
                {starting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Comenzar Aventura
                  </>
                )}
              </RunicButton>
            ) : (
              <div className="flex-1 text-center py-4">
                <p className="font-ui text-gold-dim">
                  Esperando a que el anfitrión inicie la partida...
                </p>
              </div>
            )}

            <RunicButton
              onClick={() => router.push('/campaigns')}
              variant="secondary"
            >
              Volver
            </RunicButton>
          </div>
        </div>
      </div>
    </div>
  )
}
