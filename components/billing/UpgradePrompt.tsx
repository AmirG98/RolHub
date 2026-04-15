'use client'

import { Crown, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/lib/i18n'

interface UpgradePromptProps {
  variant: 'trial_ended' | 'expired'
  onDismiss?: () => void
}

export function UpgradePrompt({ variant, onDismiss }: UpgradePromptProps) {
  const t = useTranslations()
  const router = useRouter()

  const title = variant === 'trial_ended' ? t.upgrade.trialEnded : t.upgrade.expired
  const subtitle = variant === 'trial_ended' ? t.upgrade.trialEndedSub : t.upgrade.expiredSub

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shadow/80">
      <div className="glass-panel-dark rounded-xl p-8 max-w-md w-full glow-effect text-center relative">
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-parchment/40 hover:text-parchment transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <Crown className="w-12 h-12 text-gold-bright mx-auto mb-4" />

        <h2 className="font-title text-2xl text-gold-bright mb-2">
          {title}
        </h2>

        <p className="font-body text-parchment/60 mb-6 leading-relaxed">
          {subtitle}
        </p>

        <button
          onClick={() => router.push('/pricing')}
          className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-gold-dim via-gold to-gold-dim text-shadow font-heading text-lg tracking-wide hover:from-gold hover:via-gold-bright hover:to-gold transition-all mb-3"
        >
          {t.upgrade.cta}
        </button>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="font-ui text-sm text-parchment/30 hover:text-parchment/50 transition-colors"
          >
            {t.upgrade.dismiss}
          </button>
        )}
      </div>
    </div>
  )
}
