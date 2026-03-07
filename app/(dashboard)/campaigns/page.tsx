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
    <div className="min-h-screen particle-bg py-8">
      <div className="max-w-6xl mx-auto content-wrapper px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-title text-4xl text-gold">Mis Campañas</h1>
          <Link href="/onboarding">
            <RunicButton variant="primary">+ Nueva Campaña</RunicButton>
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="glass-panel-dark rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="font-heading text-2xl text-parchment mb-3">
              No tienes campañas todavía
            </h2>
            <p className="font-body text-parchment/60 mb-6">
              Crea tu primera aventura y comienza a explorar mundos infinitos
            </p>
            <Link href="/onboarding">
              <RunicButton variant="primary" className="glow-effect">
                Crear mi Primera Campaña
              </RunicButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const loreData = LORES.find(l => l.id === campaign.lore)
              return (
                <div
                  key={campaign.id}
                  className="glass-panel rounded-lg p-6 hover:scale-105 transition-all hover:glow-effect group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{loreData?.icon || '🎮'}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-ui ${
                      campaign.status === 'ACTIVE'
                        ? 'bg-neon-green/20 text-neon-green'
                        : 'bg-parchment/20 text-parchment/60'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl text-parchment mb-2 group-hover:text-gold transition">
                    {campaign.name}
                  </h3>

                  <p className="font-ui text-sm mb-4" style={{ color: loreData?.color }}>
                    {loreData?.name || campaign.lore}
                  </p>

                  <div className="flex items-center justify-between text-xs font-ui text-parchment/60 mb-4">
                    <span>{campaign.mode === 'CAMPAIGN' ? '📖 Campaña' : '⚡ One-Shot'}</span>
                    <span>{campaign.sessions.length} sesiones</span>
                  </div>

                  <Link href={`/play/${campaign.sessions[campaign.sessions.length - 1]?.id || campaign.id}`}>
                    <RunicButton variant="secondary" className="w-full">
                      {campaign.sessions.length > 0 ? 'Continuar →' : 'Comenzar →'}
                    </RunicButton>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
