'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { RunicButton } from '@/components/medieval/RunicButton'
import Link from 'next/link'
import { LORES } from '@/lib/constants/lores'
import { Heart, Scroll, MapPin, Calendar, User, MoreVertical, Pencil, Trash2, X, Check, Crown } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'
import { hasPending } from '@/lib/onboarding/pending'

interface Campaign {
  id: string
  name: string
  lore: string
  engine: string
  mode: string
  status: string
  createdAt: string
  updatedAt: string
  sessions: { id: string; startedAt: string }[]
  lastPlayedAt: string
  currentScene: string
  currentAct: number
  characterName: string
  characterLevel: number
  hp: string
  activeQuests: number
  completedQuests: number
}

export default function CampaignsPage() {
  const router = useRouter()
  const { user } = useUser()
  const t = useTranslations()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Safety net: si un usuario aterriza acá pero tenía un wizard de onboarding
  // pendiente (porque Clerk ignoró forceRedirectUrl), volvemos a onboarding
  // con resume=1 para que se retome la creación del personaje.
  useEffect(() => {
    if (hasPending()) {
      router.replace('/onboarding?resume=1')
    }
  }, [router])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) fetchCampaigns()
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

  const handleRename = useCallback(async (campaignId: string) => {
    if (!editName.trim()) return
    try {
      await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      })
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, name: editName.trim() } : c))
      setEditingId(null)
    } catch (error) {
      console.error('Error renaming:', error)
    }
  }, [editName])

  const handleDelete = useCallback(async (campaignId: string) => {
    try {
      await fetch(`/api/campaigns/${campaignId}`, { method: 'DELETE' })
      setCampaigns(prev => prev.filter(c => c.id !== campaignId))
      setDeletingId(null)
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass-panel-dark p-8 rounded-lg">
          <p className="font-heading text-gold">{t.campaigns.loading}</p>
        </div>
      </div>
    )
  }

  const renderCampaignCard = (campaign: Campaign, isLatest: boolean) => {
    const loreData = LORES.find(l => l.id === campaign.lore)
    const [currentHP, maxHP] = campaign.hp.split('/').map(Number)
    const hpPercentage = (currentHP / maxHP) * 100
    const hpColor = hpPercentage > 60 ? 'bg-emerald' : hpPercentage > 30 ? 'bg-gold' : 'bg-blood'
    const lastPlayed = new Date(campaign.lastPlayedAt)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24))
    const lastPlayedText = diffDays === 0
      ? t.campaigns.dateToday
      : diffDays === 1
        ? t.campaigns.dateYesterday
        : t.campaigns.dateDaysAgo.replace('{n}', String(diffDays))

    return (
      <div
        key={campaign.id}
        className={`glass-panel rounded-lg p-4 md:p-6 transition-all group relative ${
          isLatest
            ? 'ring-2 ring-gold-bright/60 hover:ring-gold-bright col-span-1 sm:col-span-2 lg:col-span-3'
            : 'hover:scale-[1.02] hover:glow-effect'
        }`}
      >
        {/* Badge última partida */}
        {isLatest && (
          <div className="absolute -top-3 left-4 bg-gold-bright text-shadow px-3 py-0.5 rounded-full text-xs font-heading flex items-center gap-1">
            <Crown className="w-3 h-3" />
            {t.campaigns.latestBadge}
          </div>
        )}

        {/* Menú de 3 puntos */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => { e.preventDefault(); setMenuOpen(menuOpen === campaign.id ? null : campaign.id) }}
            className="p-1.5 rounded-lg hover:bg-parchment/10 transition text-parchment/50 hover:text-parchment"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen === campaign.id && (
            <div className="absolute right-0 top-8 glass-panel-dark rounded-lg shadow-lg border border-gold-dim/30 py-1 min-w-[140px] z-20">
              <button
                onClick={() => {
                  setEditingId(campaign.id)
                  setEditName(campaign.name)
                  setMenuOpen(null)
                }}
                className="w-full px-3 py-2 text-left text-sm font-ui text-parchment hover:bg-parchment/10 flex items-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5" /> {t.campaigns.rename}
              </button>
              <button
                onClick={() => { setDeletingId(campaign.id); setMenuOpen(null) }}
                className="w-full px-3 py-2 text-left text-sm font-ui text-blood hover:bg-blood/10 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> {t.campaigns.delete}
              </button>
            </div>
          )}
        </div>

        <div className={isLatest ? 'flex flex-col sm:flex-row gap-4 sm:gap-6' : ''}>
          <div className={isLatest ? 'flex-1' : ''}>
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl md:text-4xl">{loreData?.icon || '🎮'}</div>
              <div className="flex-1 min-w-0">
                {editingId === campaign.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename(campaign.id)}
                      className="flex-1 bg-shadow border border-gold-dim/50 rounded px-2 py-1 font-heading text-base text-parchment focus:outline-none focus:border-gold"
                      autoFocus
                    />
                    <button onClick={() => handleRename(campaign.id)} className="text-emerald hover:text-emerald/80">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-parchment/50 hover:text-parchment">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h3 className="font-heading text-base md:text-xl text-parchment group-hover:text-gold transition line-clamp-1">
                    {campaign.name}
                  </h3>
                )}
                <p className="font-ui text-xs md:text-sm" style={{ color: loreData?.color }}>
                  {loreData?.name || campaign.lore} • {t.campaigns.act} {campaign.currentAct}/5
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-ui ${
                campaign.status === 'ACTIVE' ? 'bg-emerald/20 text-emerald' : 'bg-parchment/20 text-parchment/60'
              }`}>
                {campaign.status === 'ACTIVE' ? t.campaigns.statusActive : campaign.status}
              </span>
            </div>

            {/* Character info */}
            <div className="glass-panel-dark rounded-lg p-3 mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gold" />
                  <span className="font-heading text-sm text-parchment">{campaign.characterName}</span>
                </div>
                <span className="font-ui text-xs text-gold-dim">{t.campaigns.levelAbbr}{campaign.characterLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-blood" />
                <div className="flex-1 h-2 bg-shadow rounded-full overflow-hidden">
                  <div className={`h-full ${hpColor} transition-all`} style={{ width: `${hpPercentage}%` }} />
                </div>
                <span className="font-mono text-xs text-parchment/80">{campaign.hp}</span>
              </div>
            </div>

            {/* Scene and quests */}
            <div className="space-y-1.5 mb-3 text-xs font-ui">
              <div className="flex items-center gap-2 text-parchment">
                <MapPin className="w-3 h-3 text-gold" />
                <span className="truncate font-medium">{campaign.currentScene}</span>
              </div>
              <div className="flex items-center gap-2 text-parchment">
                <Scroll className="w-3 h-3 text-gold" />
                <span><span className="text-gold font-semibold">{campaign.activeQuests}</span> {t.campaigns.activeQuestsCount} • <span className="text-emerald font-semibold">{campaign.completedQuests}</span> {t.campaigns.completedQuestsCount}</span>
              </div>
            </div>
          </div>

          <div className={isLatest ? 'sm:w-48 flex flex-col justify-end' : ''}>
            {/* Footer */}
            <div className="flex items-center justify-between text-[10px] md:text-xs font-ui text-parchment/50 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{lastPlayedText}</span>
              </div>
              <span>{campaign.sessions.length} {campaign.sessions.length === 1 ? t.campaigns.sessionSingular : t.campaigns.sessionPlural}</span>
            </div>

            {campaign.sessions.length > 0 ? (
              <Link href={`/play/${campaign.sessions[0].id}`}>
                <RunicButton variant="primary" className={`w-full text-sm ${isLatest ? 'glow-effect text-base py-3' : 'glow-effect'}`}>
                  {isLatest ? t.campaigns.continueAdventureCta : t.campaigns.continueCta}
                </RunicButton>
              </Link>
            ) : (
              <RunicButton variant="secondary" className="w-full opacity-50 cursor-not-allowed text-sm" disabled>
                {t.campaigns.noSessions}
              </RunicButton>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen particle-bg py-4 md:py-8">
      <div className="max-w-6xl mx-auto content-wrapper px-3 md:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <h1 className="font-title text-2xl md:text-4xl text-gold">{t.campaigns.myCampaigns}</h1>
          <Link href="/onboarding">
            <RunicButton variant="primary" className="w-full sm:w-auto text-sm md:text-base">{t.campaigns.newCampaign}</RunicButton>
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="glass-panel-dark rounded-lg p-8 md:p-12 text-center">
            <div className="text-5xl md:text-6xl mb-3 md:mb-4">📖</div>
            <h2 className="font-heading text-xl md:text-2xl text-parchment mb-2 md:mb-3">
              {t.campaigns.emptyHeading}
            </h2>
            <p className="font-body text-sm md:text-base text-parchment/60 mb-4 md:mb-6">
              {t.campaigns.emptyDescription}
            </p>
            <Link href="/onboarding">
              <RunicButton variant="primary" className="glow-effect">
                {t.campaigns.emptyCta}
              </RunicButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {campaigns.map((campaign, index) => renderCampaignCard(campaign, index === 0))}
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {deletingId && (
          <div className="fixed inset-0 bg-shadow/80 z-50 flex items-center justify-center p-4" onClick={() => setDeletingId(null)}>
            <div className="glass-panel-dark rounded-lg p-6 max-w-sm w-full border border-blood/30" onClick={e => e.stopPropagation()}>
              <h3 className="font-heading text-lg text-blood mb-3">{t.campaigns.deleteModalTitle}</h3>
              <p className="font-body text-sm text-parchment/80 mb-4">
                {t.campaigns.deleteModalText}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 px-4 py-2 rounded font-ui text-sm text-parchment bg-shadow-mid hover:bg-shadow border border-gold-dim/30"
                >
                  {t.campaigns.cancel}
                </button>
                <button
                  onClick={() => handleDelete(deletingId)}
                  className="flex-1 px-4 py-2 rounded font-ui text-sm text-parchment bg-blood/80 hover:bg-blood"
                >
                  {t.campaigns.delete}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  )
}
