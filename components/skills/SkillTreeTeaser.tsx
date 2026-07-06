'use client'

import Link from 'next/link'
import { Lock, Sparkles } from 'lucide-react'
import { getLocalized } from '@/lib/i18n/localize'
import { RunicButton } from '@/components/medieval/RunicButton'

interface TeaserTree {
  name: unknown
  totalNodes: number
  tier1: Array<{ id: string; name: unknown; icon?: string; kind: string }>
}

interface Props {
  tree: TeaserTree
  locale: 'es' | 'en'
}

/**
 * Vista del árbol para guests: se ven los nombres de tier 1 borrosos + CTA de
 * registro. Los milestones SÍ se registran mientras juegan (al registrarse no
 * pierden progreso — ese es el gancho).
 */
export function SkillTreeTeaser({ tree, locale }: Props) {
  const t = {
    title: locale === 'en' ? 'Skill Tree' : 'Árbol de Habilidades',
    subtitle:
      locale === 'en'
        ? `${tree.totalNodes} abilities to unlock as you play`
        : `${tree.totalNodes} habilidades para desbloquear jugando`,
    cta: locale === 'en' ? 'Sign up to unlock' : 'Registrate para desbloquear',
    note:
      locale === 'en'
        ? 'Your progress is saved — sign up and keep everything you earned.'
        : 'Tu progreso se guarda — registrate y conservá todo lo que ganaste.',
  }

  return (
    <div className="relative">
      <div className="text-center mb-6">
        <h2 className="font-title text-2xl text-gold mb-1">{getLocalized(tree.name as any, locale)}</h2>
        <p className="font-body text-sm text-parchment/60">{t.subtitle}</p>
      </div>

      {/* Tier 1 borroso */}
      <div className="flex flex-wrap justify-center gap-4 blur-[3px] select-none pointer-events-none opacity-70">
        {tree.tier1.map((n) => (
          <div key={n.id} className="w-44 rounded-lg border border-gold-dim/30 bg-shadow/40 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-5 h-5 text-gold-dim" />
              <span className="font-heading text-sm text-parchment/60 truncate">
                {getLocalized(n.name as any, locale)}
              </span>
            </div>
            <div className="h-8 bg-shadow/60 rounded" />
          </div>
        ))}
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="glass-panel-dark rounded-xl px-6 py-5 text-center max-w-xs border border-gold-dim/40">
          <Lock className="w-8 h-8 text-gold mx-auto mb-2" />
          <p className="font-body text-sm text-parchment/80 mb-4">{t.note}</p>
          <Link href="/register">
            <RunicButton variant="primary" className="w-full">
              {t.cta}
            </RunicButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
