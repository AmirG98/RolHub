'use client'

import { Crown } from 'lucide-react'

interface PlanBadgeProps {
  plan: string
  size?: 'sm' | 'md'
}

export function PlanBadge({ plan, size = 'sm' }: PlanBadgeProps) {
  if (plan === 'FREE') return null

  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5 gap-0.5' : 'text-xs px-2 py-1 gap-1'
  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'

  const colorClasses = plan === 'PRO'
    ? 'bg-gold/15 text-gold border-gold/30'
    : 'bg-emerald/15 text-emerald border-emerald/30'

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full border font-heading ${colorClasses}`}>
      <Crown className={iconSize} />
      {plan}
    </span>
  )
}
