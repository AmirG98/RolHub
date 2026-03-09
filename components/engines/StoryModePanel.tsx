'use client'

import { EnginePanelProps, DiceRoll } from '@/lib/engines/types'
import { RunicButton } from '@/components/medieval/RunicButton'
import { BookOpen, Sparkles, Swords, Compass, Users } from 'lucide-react'

interface StoryModePanelProps extends EnginePanelProps {
  // Story Mode no tiene props adicionales
}

export function StoryModePanel({
  character,
  locale,
  onDiceRoll,
  disabled = false
}: StoryModePanelProps) {
  const isEnglish = locale === 'en'

  const labels = isEnglish ? {
    title: 'Story Mode',
    subtitle: 'Narrative-focused gameplay',
    description: 'This mode prioritizes the story over mechanics. Dice are optional - your choices and character abilities guide the narrative.',
    stats: 'Character Abilities',
    combat: 'Combat',
    exploration: 'Exploration',
    social: 'Social',
    inspirationDice: 'Inspiration Roll',
    inspirationDesc: 'Roll for dramatic moments',
    tip: 'Tip: Focus on describing your actions. The DM will determine outcomes based on narrative coherence.'
  } : {
    title: 'Modo Historia',
    subtitle: 'Juego enfocado en la narrativa',
    description: 'Este modo prioriza la historia sobre las mecánicas. Los dados son opcionales - tus elecciones y habilidades del personaje guían la narrativa.',
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
      {/* Header */}
      <div className="text-center pb-3 border-b border-gold-dim/30">
        <div className="flex items-center justify-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-gold" />
          <h3 className="font-heading text-lg text-gold">{labels.title}</h3>
        </div>
        <p className="font-ui text-xs text-parchment/60">{labels.subtitle}</p>
      </div>

      {/* Description */}
      <div className="glass-panel rounded-lg p-3">
        <p className="font-body text-xs text-parchment/80 leading-relaxed">
          {labels.description}
        </p>
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
