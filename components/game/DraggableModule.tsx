'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronDown, ChevronUp, X } from 'lucide-react'
import { type ModuleId, getModuleName, getModuleIcon, useLayoutStore } from '@/lib/stores/layout-store'
import { cn } from '@/lib/utils'

interface DraggableModuleProps {
  moduleId: ModuleId
  children: React.ReactNode
  collapsed?: boolean
  className?: string
}

export function DraggableModule({
  moduleId,
  children,
  collapsed = false,
  className,
}: DraggableModuleProps) {
  const { isCustomizing, toggleModuleCollapsed, toggleModuleVisibility } = useLayoutStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: moduleId,
    disabled: !isCustomizing,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-lg transition-all',
        isDragging && 'opacity-50 scale-105 z-50',
        isCustomizing && 'ring-1 ring-gold-dim/30 ring-dashed',
        className
      )}
    >
      {/* Header con controles - solo visible en modo customización o siempre para colapsar */}
      <div
        className={cn(
          'flex items-center justify-between px-3 py-2 rounded-t-lg',
          isCustomizing ? 'bg-shadow/80' : 'bg-transparent'
        )}
      >
        <div className="flex items-center gap-2">
          {/* Drag handle - solo en modo customización */}
          {isCustomizing && (
            <button
              className="cursor-grab active:cursor-grabbing text-gold-dim hover:text-gold transition-colors p-1"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}

          <span className="text-sm font-ui text-gold-dim">
            {getModuleIcon(moduleId)} {getModuleName(moduleId)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Toggle collapse */}
          <button
            onClick={() => toggleModuleCollapsed(moduleId)}
            className="p-1 text-gold-dim hover:text-gold transition-colors"
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>

          {/* Remove - solo en modo customización */}
          {isCustomizing && (
            <button
              onClick={() => toggleModuleVisibility(moduleId)}
              className="p-1 text-blood/60 hover:text-blood transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          'transition-all duration-200 overflow-hidden',
          collapsed ? 'h-0' : 'h-auto'
        )}
      >
        {children}
      </div>
    </div>
  )
}

// Componente para módulos no arrastrables (ej: en mobile)
export function StaticModule({
  moduleId,
  children,
  collapsed = false,
  className,
}: DraggableModuleProps) {
  const { toggleModuleCollapsed } = useLayoutStore()

  return (
    <div className={cn('relative rounded-lg', className)}>
      {/* Header compacto */}
      <button
        onClick={() => toggleModuleCollapsed(moduleId)}
        className="w-full flex items-center justify-between px-3 py-2 bg-shadow/50 rounded-t-lg hover:bg-shadow/70 transition-colors"
      >
        <span className="text-sm font-ui text-gold-dim">
          {getModuleIcon(moduleId)} {getModuleName(moduleId)}
        </span>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-gold-dim" />
        ) : (
          <ChevronUp className="h-4 w-4 text-gold-dim" />
        )}
      </button>

      {/* Content */}
      <div
        className={cn(
          'transition-all duration-200 overflow-hidden',
          collapsed ? 'h-0' : 'h-auto'
        )}
      >
        {children}
      </div>
    </div>
  )
}
