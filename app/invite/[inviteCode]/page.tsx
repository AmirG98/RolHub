'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser, SignInButton } from '@clerk/nextjs'
import { RunicButton } from '@/components/medieval/RunicButton'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { LORES } from '@/lib/constants/lores'
import { Users, Scroll, Loader2 } from 'lucide-react'

interface CampaignInfo {
  id: string
  name: string
  lore: string
  playerCount: number
  maxPlayers: number
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const inviteCode = params.inviteCode as string

  const [campaignInfo, setCampaignInfo] = useState<CampaignInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaignInfo()
  }, [inviteCode])

  const fetchCampaignInfo = async () => {
    try {
      const response = await fetch(`/api/campaigns/invite/${inviteCode}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Código de invitación inválido')
        return
      }

      setCampaignInfo(data.campaign)
    } catch (err) {
      setError('Error al cargar la información')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!user) return

    setJoining(true)
    setError(null)

    try {
      const response = await fetch('/api/campaigns/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      if (data.needsCharacter) {
        // Redirect to character selection for this campaign
        router.push(`/join/${data.campaignId}/character`)
      } else if (data.sessionId) {
        // Already has character, go to session
        router.push(`/play/${data.sessionId}`)
      } else {
        // Go to lobby
        router.push(`/lobby/${data.campaignId}`)
      }
    } catch (err) {
      setError((err as Error).message)
      setJoining(false)
    }
  }

  const loreData = campaignInfo ? LORES.find(l => l.id === campaignInfo.lore) : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel-dark p-8 rounded-lg text-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
          <p className="font-heading text-gold">Verificando invitación...</p>
        </div>
      </div>
    )
  }

  if (error && !campaignInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel-dark p-8 rounded-lg text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="font-heading text-2xl text-blood mb-4">Invitación Inválida</h1>
          <p className="font-body text-parchment/80 mb-6">{error}</p>
          <RunicButton onClick={() => router.push('/')} variant="secondary">
            Volver al Inicio
          </RunicButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <OrnateFrame variant="gold">
          <ParchmentPanel variant="ornate" className="text-center">
            {/* Campaign Icon */}
            <div className="text-6xl mb-4">{loreData?.icon || '🎮'}</div>

            {/* Title */}
            <h1 className="font-title text-2xl text-ink mb-2">
              Te han invitado a
            </h1>
            <h2 className="font-heading text-3xl text-gold mb-4" style={{ color: loreData?.color }}>
              {campaignInfo?.name}
            </h2>

            {/* Lore */}
            <p className="font-ui text-lg mb-6" style={{ color: loreData?.color }}>
              {loreData?.name || campaignInfo?.lore}
            </p>

            {/* Player count */}
            <div className="flex items-center justify-center gap-2 mb-6 text-stone">
              <Users className="w-5 h-5" />
              <span className="font-ui">
                {campaignInfo?.playerCount} / {campaignInfo?.maxPlayers} jugadores
              </span>
            </div>

            {/* Invite Code */}
            <div className="glass-panel rounded-lg p-3 mb-6">
              <p className="font-ui text-xs text-gold-dim mb-1">Código de invitación</p>
              <p className="font-mono text-2xl text-gold tracking-widest">{inviteCode}</p>
            </div>

            {error && (
              <div className="bg-blood/10 border border-blood/30 rounded-lg p-3 mb-4">
                <p className="font-ui text-blood text-sm">{error}</p>
              </div>
            )}

            {/* Action Button */}
            {!isLoaded ? (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 text-gold animate-spin" />
              </div>
            ) : user ? (
              <RunicButton
                onClick={handleJoin}
                variant="primary"
                className="w-full glow-effect"
                disabled={joining}
              >
                {joining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Uniéndose...
                  </>
                ) : (
                  <>
                    <Scroll className="w-4 h-4 mr-2" />
                    Unirse a la Aventura
                  </>
                )}
              </RunicButton>
            ) : (
              <div className="space-y-3">
                <p className="font-body text-stone text-sm">
                  Inicia sesión para unirte a esta aventura
                </p>
                <SignInButton mode="modal">
                  <RunicButton variant="primary" className="w-full">
                    Iniciar Sesión
                  </RunicButton>
                </SignInButton>
              </div>
            )}
          </ParchmentPanel>
        </OrnateFrame>
      </div>
    </div>
  )
}
