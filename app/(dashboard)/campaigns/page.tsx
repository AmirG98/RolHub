'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { RunicButton } from '@/components/medieval/RunicButton'
import Link from 'next/link'
import { LORES } from '@/lib/constants/lores'

interface Campaign {
  id: string
  name: string
  lore: string
  engine: string
  mode: string
  status: string
  createdAt: string
  sessions: { id: string }[]
}

export default function CampaignsPage() {
  const { user } = useUser()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCampaigns()
    }
  }, [user])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns')
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass-panel-dark p-8 rounded-lg">
          <p className="font-heading text-gold">Cargando campañas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen particle-bg py-4 md:py-8">
      <div className="max-w-6xl mx-auto content-wrapper px-3 md:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <h1 className="font-title text-2xl md:text-4xl text-gold">Mis Campañas</h1>
          <Link href="/onboarding">
            <RunicButton variant="primary" className="w-full sm:w-auto text-sm md:text-base">+ Nueva Campaña</RunicButton>
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="glass-panel-dark rounded-lg p-8 md:p-12 text-center">
            <div className="text-5xl md:text-6xl mb-3 md:mb-4">📖</div>
            <h2 className="font-heading text-xl md:text-2xl text-parchment mb-2 md:mb-3">
              No tienes campañas todavía
            </h2>
            <p className="font-body text-sm md:text-base text-parchment/60 mb-4 md:mb-6">
              Crea tu primera aventura y comienza a explorar mundos infinitos
            </p>
            <Link href="/onboarding">
              <RunicButton variant="primary" className="glow-effect">
                Crear mi Primera Campaña
              </RunicButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {campaigns.map((campaign) => {
              const loreData = LORES.find(l => l.id === campaign.lore)
              return (
                <div
                  key={campaign.id}
                  className="glass-panel rounded-lg p-4 md:p-6 hover:scale-105 transition-all hover:glow-effect group"
                >
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="text-3xl md:text-4xl">{loreData?.icon || '🎮'}</div>
                    <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-ui ${
                      campaign.status === 'ACTIVE'
                        ? 'bg-neon-green/20 text-neon-green'
                        : 'bg-parchment/20 text-parchment/60'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>

                  <h3 className="font-heading text-base md:text-xl text-parchment mb-1 md:mb-2 group-hover:text-gold transition line-clamp-1">
                    {campaign.name}
                  </h3>

                  <p className="font-ui text-xs md:text-sm mb-3 md:mb-4" style={{ color: loreData?.color }}>
                    {loreData?.name || campaign.lore}
                  </p>

                  <div className="flex items-center justify-between text-[10px] md:text-xs font-ui text-parchment/60 mb-3 md:mb-4">
                    <span>{campaign.mode === 'CAMPAIGN' ? '📖 Campaña' : '⚡ One-Shot'}</span>
                    <span>{campaign.sessions.length} sesiones</span>
                  </div>

                  {campaign.sessions.length > 0 ? (
                    <Link href={`/play/${campaign.sessions[campaign.sessions.length - 1].id}`}>
                      <RunicButton variant="secondary" className="w-full text-sm">
                        Continuar →
                      </RunicButton>
                    </Link>
                  ) : (
                    <RunicButton
                      variant="secondary"
                      className="w-full opacity-50 cursor-not-allowed text-sm"
                      disabled
                    >
                      Sin sesiones
                    </RunicButton>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
