'use client'

import { EnginePanelProps, DiceRoll } from '@/lib/engines/types'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Sparkles, Swords, Compass, Users, Scroll } from 'lucide-react'

interface StoryModePanelProps extends EnginePanelProps {
  // Story Mode no tiene props adicionales
}

// Truncar texto largo
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

export function StoryModePanel({
  character,
  worldState,
  locale,
  onDiceRoll,
  disabled = false
}: StoryModePanelProps) {
  const isEnglish = locale === 'en'

  // Get active quest for display
  const activeQuest = worldState?.activeQuests?.[0] || (isEnglish ? 'Explore the world' : 'Explora el mundo')

  const labels = isEnglish ? {
    quest: 'Quest',
    stats: 'Character Abilities',
    combat: 'Combat',
    exploration: 'Exploration',
    social: 'Social',
    inspirationDice: 'Inspiration Roll',
    inspirationDesc: 'Roll for dramatic moments',
    tip: 'Tip: Focus on describing your actions. The DM will determine outcomes based on narrative coherence.'
  } : {
    quest: 'Misión',
    stats: 'Habilidades del Personaje',
    combat: 'Combate',
    exploration: 'Exploración',
    social: 'Social',
    inspirationDice: 'Tirada de Inspiración',
    inspirationDesc: 'Tirá para momentos dramáticos',
    tip: 'Tip: Enfocáte en describir tus acciones. El DM determinará los resultados basándose en la coherencia narrativa.'
  }

  // Obtener stats del personaje
  const stats = character.stats || {}
  const combat = stats.combat || stats.Combat || 0
  const exploration = stats.exploration || stats.Exploration || 0
  const social = stats.social || stats.Social || 0

  // Función para tirada de inspiración (opcional en Story Mode)
  const handleInspirationRoll = () => {
    // Tirada simple de 2d6 para momentos de incertidumbre
    const die1 = Math.floor(Math.random() * 6) + 1
    const die2 = Math.floor(Math.random() * 6) + 1
    const roll: DiceRoll = {
      formula: '2d6',
      results: [die1, die2],
      total: die1 + die2
    }
    onDiceRoll(roll)
  }

  return (
    <div className="space-y-4">
      {/* Active Quest Header */}
      <div className="pb-3 border-b border-gold-dim/30">
        <div className="flex items-center gap-2 mb-2">
          <Scroll className="h-5 w-5 text-gold flex-shrink-0" />
          <span className="font-heading text-sm text-gold uppercase tracking-wide">
            {labels.quest}
          </span>
        </div>
        <p className="font-body text-sm text-parchment leading-relaxed">
          {truncateText(activeQuest, 100)}
        </p>
        {worldState?.currentScene && (
          <p className="font-ui text-xs text-parchment/50 mt-1">
            📍 {worldState.currentScene}
          </p>
        )}
      </div>

      {/* Stats Display */}
      <div className="space-y-2">
        <h4 className="font-heading text-sm text-gold">{labels.stats}</h4>

        {/* Combat */}
        <div className="flex items-center gap-3 glass-panel rounded-lg p-2">
          <Swords className="h-5 w-5 text-blood flex-shrink-0" />
          <div className="flex-1">
            <div className="font-ui text-xs text-parchment">{labels.combat}</div>
            <div className="flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-4 rounded-sm ${
                    i < combat ? 'bg-blood' : 'bg-shadow'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="font-mono text-lg text-gold-bright">{combat}</span>
        </div>

        {/* Exploration */}
        <div className="flex items-center gap-3 glass-panel rounded-lg p-2">
          <Compass className="h-5 w-5 text-emerald flex-shrink-0" />
          <div className="flex-1">
            <div className="font-ui text-xs text-parchment">{labels.exploration}</div>
            <div className="flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-4 rounded-sm ${
                    i < exploration ? 'bg-emerald' : 'bg-shadow'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="font-mono text-lg text-gold-bright">{exploration}</span>
        </div>

        {/* Social */}
        <div className="flex items-center gap-3 glass-panel rounded-lg p-2">
          <Users className="h-5 w-5 text-neon-purple flex-shrink-0" />
          <div className="flex-1">
            <div className="font-ui text-xs text-parchment">{labels.social}</div>
            <div className="flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-4 rounded-sm ${
                    i < social ? 'bg-neon-purple' : 'bg-shadow'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="font-mono text-lg text-gold-bright">{social}</span>
        </div>
      </div>

      {/* Inspiration Roll (Optional) */}
      <div className="glass-panel-dark rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold-bright" />
          <span className="font-heading text-sm text-gold">{labels.inspirationDice}</span>
        </div>
        <p className="font-body text-xs text-parchment/60">{labels.inspirationDesc}</p>
        <RunicButton
          variant="secondary"
          onClick={handleInspirationRoll}
          disabled={disabled}
          className="w-full text-sm"
        >
          🎲 2d6
        </RunicButton>
      </div>

      {/* Tip */}
      <div className="bg-gold/10 rounded-lg p-3 border border-gold-dim/30">
        <p className="font-ui text-xs text-gold/80 italic">
          💡 {labels.tip}
        </p>
      </div>
    </div>
  )
}
