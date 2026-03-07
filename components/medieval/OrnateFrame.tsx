import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface OrnateFrameProps {
  children: ReactNode
  className?: string
  variant?: 'gold' | 'shadow'
}

export function OrnateFrame({ children, className, variant = 'gold' }: OrnateFrameProps) {
  const borderColor = variant === 'gold' ? '#C9A84C' : '#2C2416'

  return (
    <div className={cn('relative', className)}>
      {/* SVG Frame inline */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2" y="2"
          width="calc(100% - 4px)"
          height="calc(100% - 4px)"
          fill="none"
          stroke={borderColor}
          strokeWidth="2"
        />
        {/* Corner ornaments */}
        <circle cx="8" cy="8" r="4" fill={borderColor} />
        <circle cx="calc(100% - 8px)" cy="8" r="4" fill={borderColor} />
        <circle cx="8" cy="calc(100% - 8px)" r="4" fill={borderColor} />
        <circle cx="calc(100% - 8px)" cy="calc(100% - 8px)" r="4" fill={borderColor} />
      </svg>

      <div className="relative z-10 p-4">
        {children}
      </div>
    </div>
  )
}
