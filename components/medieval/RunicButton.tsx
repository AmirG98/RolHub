'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface RunicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
}

export function RunicButton({
  children,
  className,
  variant = 'primary',
  ...props
}: RunicButtonProps) {
  const variants = {
    primary: 'bg-gold hover:bg-gold-bright text-shadow hover:shadow-glow',
    secondary: 'bg-shadow-mid hover:bg-shadow-light text-parchment border border-gold-dim',
    danger: 'bg-blood hover:bg-red-700 text-parchment hover:shadow-glow',
  }

  return (
    <button
      className={cn(
        'px-6 py-3 rounded font-heading font-semibold transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
