'use client'

import React, { useState } from 'react'
import { type Quest, getQuestProgress } from '@/lib/types/quest'
import { QuestMarkerInline, QuestTypeBadge } from '@/components/maps/QuestMarker'

interface QuestPanelProps {
  quests: Quest[]
  onQuestClick?: (quest: Quest) => void
  onViewOnMap?: (locationId: string) => void
  className?: string
}

/**
 * Panel lateral de quests para mostrar en GameSession
 * Muestra quests activas, completadas, y descubrimientos
 */
export function QuestPanel({
  quests,
  onQuestClick,
  onViewOnMap,
  className = '',
}: QuestPanelProps) {
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  const activeQuests = quests.filter(q => q.status === 'active')
  const completedQuests = quests.filter(q => q.status === 'completed')
  const failedQuests = quests.filter(q => q.status === 'failed')

  const mainQuest = activeQuests.find(q => q.priority === 'main')
  const sideQuests = activeQuests.filter(q => q.priority === 'side')

  return (
    <div className={`bg-shadow-mid rounded-lg border border-gold/30 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-3 py-2 bg-shadow border-b border-gold/20">
        <h3 className="font-heading text-gold-bright text-sm tracking-wide">
          Misiones
          {activeQuests.length > 0 && (
            <span className="ml-2 text-parchment/60">({activeQuests.length} activas)</span>
          )}
        </h3>
      </div>

      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {/* Quest Principal */}
        {mainQuest && (
          <div className="p-2 border-b border-gold/10">
            <div className="text-xs text-gold/70 font-ui mb-1.5 uppercase tracking-wider">
              Quest Principal
            </div>
            <QuestItem
              quest={mainQuest}
              expanded={expandedQuestId === mainQuest.id}
              onToggle={() => setExpandedQuestId(expandedQuestId === mainQuest.id ? null : mainQuest.id)}
              onClick={() => onQuestClick?.(mainQuest)}
              onViewOnMap={onViewOnMap}
            />
          </div>
        )}

        {/* Quests Secundarias */}
        {sideQuests.length > 0 && (
          <div className="p-2 border-b border-gold/10">
            <div className="text-xs text-gold/70 font-ui mb-1.5 uppercase tracking-wider">
              Secundarias ({sideQuests.length})
            </div>
            <div className="space-y-2">
              {sideQuests.map(quest => (
                <QuestItem
                  key={quest.id}
                  quest={quest}
                  expanded={expandedQuestId === quest.id}
                  onToggle={() => setExpandedQuestId(expandedQuestId === quest.id ? null : quest.id)}
                  onClick={() => onQuestClick?.(quest)}
                  onViewOnMap={onViewOnMap}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        {/* Sin quests activas */}
        {activeQuests.length === 0 && (
          <div className="p-4 text-center text-parchment/50 text-sm">
            No tienes misiones activas.
            <br />
            <span className="text-xs">Explora y habla con NPCs para descubrir nuevas quests.</span>
          </div>
        )}

        {/* Completadas (colapsables) */}
        {completedQuests.length > 0 && (
          <div className="border-t border-gold/10">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="w-full px-3 py-2 flex items-center justify-between text-xs text-parchment/60 hover:text-parchment/80 transition-colors"
            >
              <span>Completadas ({completedQuests.length})</span>
              <span className="text-gold/50">{showCompleted ? '▲' : '▼'}</span>
            </button>
            {showCompleted && (
              <div className="px-2 pb-2 space-y-1">
                {completedQuests.map(quest => (
                  <div
                    key={quest.id}
                    className="flex items-center gap-2 p-1.5 rounded bg-emerald/10 border border-emerald/20"
                  >
                    <span className="text-emerald text-xs">✓</span>
                    <span className="text-parchment/60 text-sm line-through">{quest.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Falladas */}
        {failedQuests.length > 0 && (
          <div className="border-t border-gold/10 px-2 py-2">
            <div className="text-xs text-blood/70 font-ui mb-1">Falladas</div>
            {failedQuests.map(quest => (
              <div
                key={quest.id}
                className="flex items-center gap-2 p-1.5 rounded bg-blood/10 border border-blood/20"
              >
                <span className="text-blood text-xs">✗</span>
                <span className="text-parchment/50 text-sm line-through">{quest.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface QuestItemProps {
  quest: Quest
  expanded: boolean
  onToggle: () => void
  onClick?: () => void
  onViewOnMap?: (locationId: string) => void
  compact?: boolean
}

function QuestItem({
  quest,
  expanded,
  onToggle,
  onClick,
  onViewOnMap,
  compact = false,
}: QuestItemProps) {
  const progress = getQuestProgress(quest)
  const completedObjectives = quest.objectives.filter(o => o.completed).length
  const totalObjectives = quest.objectives.length

  return (
    <div
      className={`
        rounded border transition-all duration-200
        ${compact
          ? 'bg-shadow/50 border-gold/10 hover:border-gold/30'
          : 'bg-shadow border-gold/20 hover:border-gold/40'
        }
      `}
    >
      {/* Header clickeable */}
      <button
        onClick={onToggle}
        className="w-full px-2.5 py-2 flex items-start gap-2 text-left"
      >
        <QuestMarkerInline type={quest.priority === 'main' ? 'main' : 'side'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-ui truncate ${compact ? 'text-sm' : 'text-base'} text-parchment`}>
              {quest.title}
            </span>
            {totalObjectives > 1 && (
              <span className="text-xs text-parchment/50">
                {completedObjectives}/{totalObjectives}
              </span>
            )}
          </div>
          {!compact && (
            <p className="text-xs text-parchment/60 mt-0.5 line-clamp-2">
              {quest.description}
            </p>
          )}
        </div>
        <span className="text-gold/50 text-xs">
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Contenido expandido */}
      {expanded && (
        <div className="px-2.5 pb-2.5 border-t border-gold/10 mt-1">
          {/* Descripción si es compact */}
          {compact && (
            <p className="text-xs text-parchment/60 py-2">
              {quest.description}
            </p>
          )}

          {/* Objetivos */}
          {quest.objectives.length > 0 && (
            <div className="space-y-1.5 mt-2">
              <div className="text-xs text-gold/60 font-ui">Objetivos:</div>
              {quest.objectives.map(obj => (
                <div
                  key={obj.id}
                  className={`
                    flex items-start gap-2 text-xs
                    ${obj.completed ? 'text-parchment/40' : 'text-parchment/80'}
                  `}
                >
                  <span className={obj.completed ? 'text-emerald' : 'text-gold/50'}>
                    {obj.completed ? '✓' : '○'}
                  </span>
                  <span className={obj.completed ? 'line-through' : ''}>
                    {obj.description}
                  </span>
                  {obj.locationId && !obj.completed && onViewOnMap && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewOnMap(obj.locationId!)
                      }}
                      className="text-gold/60 hover:text-gold-bright text-xs ml-auto"
                    >
                      [mapa]
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Barra de progreso */}
          {totalObjectives > 1 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-parchment/50 mb-1">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-shadow rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-dim to-gold transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-2 mt-3">
            {quest.targetLocationId && onViewOnMap && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onViewOnMap(quest.targetLocationId!)
                }}
                className="px-2 py-1 text-xs bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded text-gold transition-colors"
              >
                Ver en mapa
              </button>
            )}
            {quest.rewards && quest.rewards.length > 0 && (
              <div className="text-xs text-parchment/50">
                Recompensa: {quest.rewards[0]}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Versión compacta del panel para sidebar estrecho
 */
export function QuestPanelCompact({
  quests,
  onQuestClick,
  className = '',
}: Omit<QuestPanelProps, 'onViewOnMap'>) {
  const activeQuests = quests.filter(q => q.status === 'active')

  return (
    <div className={`space-y-1 ${className}`}>
      {activeQuests.map(quest => (
        <button
          key={quest.id}
          onClick={() => onQuestClick?.(quest)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded bg-shadow/50 hover:bg-shadow border border-gold/10 hover:border-gold/30 transition-all text-left"
        >
          <QuestMarkerInline type={quest.priority === 'main' ? 'main' : 'side'} />
          <span className="text-sm text-parchment truncate">{quest.title}</span>
        </button>
      ))}
      {activeQuests.length === 0 && (
        <div className="text-xs text-parchment/40 text-center py-2">
          Sin misiones activas
        </div>
      )}
    </div>
  )
}

/**
 * Widget de quest actual para mostrar en HUD
 */
interface CurrentQuestWidgetProps {
  quest: Quest | null
  onViewOnMap?: (locationId: string) => void
  className?: string
}

export function CurrentQuestWidget({
  quest,
  onViewOnMap,
  className = '',
}: CurrentQuestWidgetProps) {
  if (!quest) return null

  const nextObjective = quest.objectives.find(o => !o.completed)

  return (
    <div className={`bg-shadow/90 border border-gold/30 rounded-lg p-2.5 ${className}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <QuestMarkerInline type={quest.priority === 'main' ? 'main' : 'side'} />
        <span className="font-ui text-sm text-gold-bright truncate">{quest.title}</span>
      </div>
      {nextObjective && (
        <div className="flex items-center gap-2 text-xs text-parchment/70">
          <span className="text-gold/50">→</span>
          <span className="truncate">{nextObjective.description}</span>
          {nextObjective.locationId && onViewOnMap && (
            <button
              onClick={() => onViewOnMap(nextObjective.locationId!)}
              className="text-gold/60 hover:text-gold-bright shrink-0"
            >
              [ver]
            </button>
          )}
        </div>
      )}
    </div>
  )
}
