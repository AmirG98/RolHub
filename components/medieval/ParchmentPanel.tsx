import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ParchmentPanelProps {
  children: ReactNode
  className?: string
  ornate?: boolean
}

export function ParchmentPanel({ children, className, ornate = false }: ParchmentPanelProps) {
  return (
    <div
      className={cn(
        'texture-parchment rounded-sm p-6',
        ornate && 'ornate-border',
        className
      )}
    >
      {children}
    </div>
  )
}
