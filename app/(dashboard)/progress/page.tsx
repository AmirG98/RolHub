'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Flame,
  Swords,
  Scroll,
  Castle,
  Trophy,
  Lock,
  Sparkles,
  Globe,
  Calendar,
  Target,
} from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { useTranslations } from '@/lib/i18n'

interface ProgressPayload {
  user: {
    username: string
    level: number
    xp: number
    xpWithinLevel: number
    xpForNextLevel: number
    xpProgress: number
    streakDays: number
    longestStreak: number
    lastActiveAt: string | null
    isPlayingToday: boolean
  }
  stats: {
    totalTurns: number
    totalSessions: number
    totalCampaigns: number
    completedCampaigns: number
    totalCharacters: number
    distinctLores: number
    daysSinceRegistered: number
  }
  achievements: {
    unlocked: Array<{ id: string; tier: 'bronze' | 'silver' | 'gold'; xpBonus: number; unlockedAt: string }>
    locked: Array<{ id: string; tier: 'bronze' | 'silver' | 'gold'; xpBonus: number; hint: string | null }>
    totalCount: number
  }
  recentActivity: Array<{ date: string; turns: number }>
}

const TIER_COLORS: Record<'bronze' | 'silver' | 'gold', { border: string; bg: string; text: string; icon: string }> = {
  bronze: { border: 'border-[#CD7F32]/60', bg: 'bg-[#CD7F32]/10', text: 'text-[#CD7F32]', icon: '🥉' },
  silver: { border: 'border-parchment/60', bg: 'bg-parchment/10', text: 'text-parchment', icon: '🥈' },
  gold: { border: 'border-gold/60', bg: 'bg-gold/10', text: 'text-gold', icon: '🥇' },
}

export default function ProgressPage() {
  const { isLoaded, isSignedIn } = useUser()
  const t = useTranslations()
  const [data, setData] = useState<ProgressPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    fetch('/api/user/progress')
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch((e) => setError((e as Error).message))
  }, [isLoaded, isSignedIn])

  if (!isLoaded) {
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center">
        <p className="font-body text-parchment/60">{t.progress.loading}</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center p-4">
        <div className="glass-panel-dark rounded-lg p-8 max-w-md text-center">
          <p className="font-body text-parchment/80">{t.errors.unauthorized}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center p-4">
        <div className="glass-panel-dark rounded-lg p-8 max-w-md text-center">
          <p className="font-heading text-blood mb-2">{t.progress.error}</p>
          <p className="font-body text-parchment/60 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center">
        <p className="font-body text-parchment/60 animate-pulse">{t.progress.loading}</p>
      </div>
    )
  }

  const { user, stats, achievements, recentActivity } = data

  // Max turns en las últimas 14 days para escalar el heatmap
  const maxDayTurns = Math.max(1, ...recentActivity.map((d) => d.turns))

  return (
    <div className="min-h-screen particle-bg pb-16">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Header: username + level + XP bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ParchmentPanel variant="ornate" className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="font-title text-2xl md:text-3xl text-ink mb-1">{user.username}</h1>
                <p className="font-ui text-sm text-ink/60">{t.progress.title}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-start md:justify-end">
                  <Sparkles className="w-6 h-6 text-gold" />
                  <span className="font-heading text-3xl md:text-4xl text-ink">
                    {t.progress.level} {user.level}
                  </span>
                </div>
              </div>
            </div>

            {/* XP bar */}
            <div className="relative w-full h-6 bg-ink/10 rounded-full overflow-hidden border border-gold-dim/40">
              <motion.div
                className="h-full bg-gradient-to-r from-gold-dim via-gold to-gold-bright"
                initial={{ width: 0 }}
                animate={{ width: `${user.xpProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-ui text-xs text-ink font-semibold drop-shadow">
                  {user.xpWithinLevel} / 100 {t.progress.xpProgress}
                </span>
              </div>
            </div>
          </ParchmentPanel>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={<Flame className="w-6 h-6 text-blood" />}
            label={t.progress.streakTitle}
            value={user.streakDays}
            sublabel={
              user.longestStreak > 0
                ? t.progress.streakBest.replace('{n}', String(user.longestStreak))
                : t.progress.streakStartToday
            }
            highlight={user.isPlayingToday}
            delay={0.1}
          />
          <StatCard
            icon={<Swords className="w-6 h-6 text-gold" />}
            label={t.progress.totalTurns}
            value={stats.totalTurns}
            delay={0.2}
          />
          <StatCard
            icon={<Scroll className="w-6 h-6 text-emerald" />}
            label={t.progress.totalSessions}
            value={stats.totalSessions}
            delay={0.3}
          />
          <StatCard
            icon={<Castle className="w-6 h-6 text-gold-bright" />}
            label={t.progress.totalCampaigns}
            value={stats.totalCampaigns}
            sublabel={
              stats.completedCampaigns > 0
                ? `${stats.completedCampaigns} ${t.progress.completedCampaigns.toLowerCase()}`
                : undefined
            }
            delay={0.4}
          />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <StatCard
            icon={<Globe className="w-5 h-5 text-gold" />}
            label={t.progress.distinctLores}
            value={stats.distinctLores}
            compact
            delay={0.5}
          />
          <StatCard
            icon={<Target className="w-5 h-5 text-gold" />}
            label={t.progress.totalCharacters}
            value={stats.totalCharacters}
            compact
            delay={0.55}
          />
          <StatCard
            icon={<Calendar className="w-5 h-5 text-gold" />}
            label={t.progress.daysSinceRegistered}
            value={stats.daysSinceRegistered}
            compact
            delay={0.6}
          />
        </div>

        {/* Recent activity heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <ParchmentPanel variant="ornate" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg text-ink flex items-center gap-2">
                <Flame className="w-5 h-5 text-blood" />
                {t.progress.recentActivityTitle}
              </h2>
              <span className="font-ui text-xs text-ink/50">{t.progress.recentActivity14Days}</span>
            </div>
            <div className="flex gap-1 md:gap-2 items-end h-16">
              {recentActivity.map((d) => {
                const intensity = d.turns / maxDayTurns
                const heightPct = d.turns === 0 ? 10 : 15 + intensity * 85
                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center gap-1"
                    title={`${d.date}: ${d.turns} turnos`}
                  >
                    <div
                      className={`w-full rounded-t ${
                        d.turns === 0
                          ? 'bg-ink/10'
                          : intensity > 0.66
                            ? 'bg-blood'
                            : intensity > 0.33
                              ? 'bg-gold'
                              : 'bg-gold-dim/60'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="font-mono text-[9px] text-ink/40">{d.date.slice(8)}</span>
                  </div>
                )
              })}
            </div>
          </ParchmentPanel>
        </motion.div>

        {/* Achievements grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <ParchmentPanel variant="ornate" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg text-ink flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold" />
                {t.progress.achievementsTitle}
              </h2>
              <span className="font-ui text-xs text-ink/60">
                {t.progress.achievementsUnlocked
                  .replace('{n}', String(achievements.unlocked.length))
                  .replace('{total}', String(achievements.totalCount))}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Unlocked first */}
              {achievements.unlocked.map((a) => {
                const def = (t.progress.achievementDefs as any)[a.id]
                const colors = TIER_COLORS[a.tier]
                return (
                  <AchievementCard
                    key={a.id}
                    name={def?.name || a.id}
                    desc={def?.desc || ''}
                    tier={a.tier}
                    colors={colors}
                    unlocked
                    footer={`+${a.xpBonus} XP`}
                  />
                )
              })}
              {/* Then locked */}
              {achievements.locked.map((a) => {
                const def = (t.progress.achievementDefs as any)[a.id]
                const colors = TIER_COLORS[a.tier]
                return (
                  <AchievementCard
                    key={a.id}
                    name={def?.name || a.id}
                    desc={def?.desc || ''}
                    tier={a.tier}
                    colors={colors}
                    unlocked={false}
                    footer={a.hint || `+${a.xpBonus} XP`}
                  />
                )
              })}
            </div>
          </ParchmentPanel>
        </motion.div>

        {/* Back link */}
        <div className="text-center">
          <Link href="/campaigns" className="font-ui text-sm text-gold/70 hover:text-gold transition-colors">
            ← {t.home.continuePlaying}
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sublabel,
  highlight,
  compact,
  delay,
}: {
  icon: React.ReactNode
  label: string
  value: number
  sublabel?: string
  highlight?: boolean
  compact?: boolean
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: delay || 0 }}
    >
      <div
        className={`glass-panel-dark rounded-lg p-4 border ${
          highlight ? 'border-gold glow-effect' : 'border-gold-dim/30'
        } ${compact ? 'flex items-center gap-3' : 'text-center'}`}
      >
        <div className={compact ? 'flex-shrink-0' : 'mb-2 flex justify-center'}>{icon}</div>
        <div className={compact ? 'flex-1 min-w-0' : ''}>
          <p
            className={`font-heading text-parchment ${
              compact ? 'text-lg leading-tight' : 'text-2xl md:text-3xl'
            }`}
          >
            {value}
          </p>
          <p className={`font-ui text-parchment/60 ${compact ? 'text-[10px]' : 'text-xs mt-1'} truncate`}>
            {label}
          </p>
          {sublabel && (
            <p className={`font-ui text-parchment/40 ${compact ? 'text-[9px]' : 'text-[10px] mt-0.5'}`}>
              {sublabel}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function AchievementCard({
  name,
  desc,
  tier,
  colors,
  unlocked,
  footer,
}: {
  name: string
  desc: string
  tier: 'bronze' | 'silver' | 'gold'
  colors: { border: string; bg: string; text: string; icon: string }
  unlocked: boolean
  footer: string
}) {
  return (
    <div
      className={`rounded-lg p-3 border-2 transition-all ${
        unlocked ? `${colors.border} ${colors.bg}` : 'border-ink/20 bg-ink/5 opacity-60'
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className="text-xl">{unlocked ? colors.icon : <Lock className="w-4 h-4 text-ink/40" />}</div>
        <div className="flex-1 min-w-0">
          <p className={`font-heading text-sm ${unlocked ? 'text-ink' : 'text-ink/50'} leading-tight`}>{name}</p>
        </div>
      </div>
      <p className={`font-body text-[11px] ${unlocked ? 'text-ink/70' : 'text-ink/40'} mb-2 line-clamp-2`}>
        {desc}
      </p>
      <p className={`font-mono text-[10px] ${unlocked ? colors.text : 'text-ink/40'}`}>{footer}</p>
    </div>
  )
}
