import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ParchmentPanelProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'ornate'
  onClick?: () => void
}

export function ParchmentPanel({
  children,
  className,
  variant = 'default',
  onClick
}: ParchmentPanelProps) {
  return (
    <div
      className={cn(
        'texture-parchment rounded-sm p-6',
        variant === 'ornate' && 'ornate-border',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
