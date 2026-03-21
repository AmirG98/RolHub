'use client'

import { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getHelpContent, type HelpLevel } from '@/lib/game/help-content'

interface HelpTooltipProps {
  category: 'ability' | 'combat' | 'saving_throw' | 'skill' | 'story_mode'
  term: string
  level?: HelpLevel
  className?: string
  iconSize?: 'sm' | 'md' | 'lg'
}

const ICON_SIZES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export function HelpTooltip({
  category,
  term,
  level = 'novice',
  className,
  iconSize = 'sm',
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const content = getHelpContent(category, term, level)

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={cn(
          "text-gold-dim/60 hover:text-gold transition-colors",
          "focus:outline-none focus:text-gold"
        )}
        aria-label={`Ayuda sobre ${term}`}
      >
        <HelpCircle className={ICON_SIZES[iconSize]} />
      </button>

      {/* Tooltip */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2",
            "w-64 sm:w-80 p-3 rounded-lg",
            "bg-shadow-mid border border-gold-dim/40",
            "shadow-lg shadow-black/50",
            "text-xs sm:text-sm font-body text-parchment/90 leading-relaxed"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gold-dim/40" />
          </div>

          {content}

          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-1 right-1 p-1 text-gold-dim/60 hover:text-gold sm:hidden"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

// Versión inline que muestra el texto directamente
export function HelpText({
  category,
  term,
  level = 'novice',
  className,
}: Omit<HelpTooltipProps, 'iconSize'>) {
  const content = getHelpContent(category, term, level)

  return (
    <p className={cn("text-xs text-parchment/60 font-body", className)}>
      {content}
    </p>
  )
}

// Modal de ayuda completo
interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
  level?: HelpLevel
}

export function HelpModal({ isOpen, onClose, level = 'novice' }: HelpModalProps) {
  const [activeSection, setActiveSection] = useState<'abilities' | 'combat' | 'skills' | 'saves'>('abilities')

  if (!isOpen) return null

  const sections = [
    { id: 'abilities', label: 'Atributos' },
    { id: 'combat', label: 'Combate' },
    { id: 'saves', label: 'Salvaciones' },
    { id: 'skills', label: 'Habilidades' },
  ] as const

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-2xl max-h-[80vh] overflow-hidden",
          "bg-shadow-mid border border-gold-dim/50 rounded-lg",
          "shadow-2xl shadow-gold/10"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gold-dim/30">
          <h2 className="font-heading text-xl text-gold-bright">
            Guía de Referencia
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gold-dim hover:text-gold transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gold-dim/20">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex-1 py-2 px-4 text-sm font-ui transition-colors",
                activeSection === section.id
                  ? "text-gold-bright border-b-2 border-gold"
                  : "text-parchment/60 hover:text-parchment"
              )}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeSection === 'abilities' && (
            <div className="space-y-4">
              {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability) => (
                <div key={ability} className="p-3 rounded bg-shadow/50 border border-gold-dim/20">
                  <h3 className="font-heading text-gold mb-1">{ability}</h3>
                  <p className="text-sm text-parchment/80 font-body">
                    {getHelpContent('ability', ability, level)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'combat' && (
            <div className="space-y-4">
              {['hp', 'ac', 'initiative', 'proficiency', 'speed', 'hitDice'].map((stat) => (
                <div key={stat} className="p-3 rounded bg-shadow/50 border border-gold-dim/20">
                  <h3 className="font-heading text-gold mb-1 capitalize">
                    {stat === 'hp' ? 'Puntos de Vida' :
                     stat === 'ac' ? 'Clase de Armadura' :
                     stat === 'hitDice' ? 'Dados de Golpe' :
                     stat.charAt(0).toUpperCase() + stat.slice(1)}
                  </h3>
                  <p className="text-sm text-parchment/80 font-body">
                    {getHelpContent('combat', stat, level)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'saves' && (
            <div className="space-y-4">
              <div className="p-3 rounded bg-shadow/50 border border-gold-dim/20">
                <h3 className="font-heading text-gold mb-1">General</h3>
                <p className="text-sm text-parchment/80 font-body">
                  {getHelpContent('saving_throw', 'general', level)}
                </p>
              </div>
              {['STR_save', 'DEX_save', 'CON_save', 'INT_save', 'WIS_save', 'CHA_save'].map((save) => (
                <div key={save} className="p-3 rounded bg-shadow/50 border border-gold-dim/20">
                  <h3 className="font-heading text-gold mb-1">
                    {save.replace('_save', '')}
                  </h3>
                  <p className="text-sm text-parchment/80 font-body">
                    {getHelpContent('saving_throw', save, level)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'skills' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'acrobatics', 'animal_handling', 'arcana', 'athletics', 'deception',
                'history', 'insight', 'intimidation', 'investigation', 'medicine',
                'nature', 'perception', 'performance', 'persuasion', 'religion',
                'sleight_of_hand', 'stealth', 'survival'
              ].map((skill) => (
                <div key={skill} className="p-3 rounded bg-shadow/50 border border-gold-dim/20">
                  <h3 className="font-heading text-gold text-sm mb-1 capitalize">
                    {skill.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-xs text-parchment/80 font-body">
                    {getHelpContent('skill', skill, level)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
