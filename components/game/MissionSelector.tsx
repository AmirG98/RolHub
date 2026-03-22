'use client'

import { cn } from '@/lib/utils'
import { Sword, Compass, Shield, Skull, Users, Search, Zap } from 'lucide-react'

interface MissionSelectorProps {
  missions: string[]
  onSelect: (mission: string) => void
  disabled?: boolean
}

// Mapeo de tags a iconos
const getTagIcon = (mission: string) => {
  const lowerMission = mission.toLowerCase()

  if (lowerMission.includes('combat') || lowerMission.includes('raid') || lowerMission.includes('asalto')) {
    return <Sword className="w-5 h-5" />
  }
  if (lowerMission.includes('explor') || lowerMission.includes('mazmorra') || lowerMission.includes('dungeon')) {
    return <Compass className="w-5 h-5" />
  }
  if (lowerMission.includes('escort') || lowerMission.includes('rescate') || lowerMission.includes('proteger')) {
    return <Shield className="w-5 h-5" />
  }
  if (lowerMission.includes('horror') || lowerMission.includes('tumba') || lowerMission.includes('lobo') || lowerMission.includes('monstruo')) {
    return <Skull className="w-5 h-5" />
  }
  if (lowerMission.includes('social') || lowerMission.includes('superviviente') || lowerMission.includes('gremio')) {
    return <Users className="w-5 h-5" />
  }
  if (lowerMission.includes('investig') || lowerMission.includes('desapar') || lowerMission.includes('hack')) {
    return <Search className="w-5 h-5" />
  }

  return <Zap className="w-5 h-5" />
}

// Extraer el titulo de "Elegir: Titulo de la Mision"
const extractTitle = (mission: string) => {
  if (mission.startsWith('Elegir: ')) {
    return mission.substring(8)
  }
  return mission
}

export function MissionSelector({ missions, onSelect, disabled }: MissionSelectorProps) {
  if (missions.length === 0) return null

  return (
    <div className="my-4">
      <h3 className="font-heading text-lg text-gold mb-3 text-center">
        Elige tu aventura
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {missions.map((mission, i) => {
          const title = extractTitle(mission)

          return (
            <button
              key={i}
              onClick={() => onSelect(mission)}
              disabled={disabled}
              className={cn(
                "glass-panel p-4 text-left transition-all duration-300",
                "hover:scale-[1.02] hover:glow-effect",
                "border border-gold-dim/30 hover:border-gold/60",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                "group"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="text-gold-dim group-hover:text-gold transition-colors mt-0.5">
                  {getTagIcon(title)}
                </div>
                <div className="flex-1">
                  <h4 className="font-heading text-gold group-hover:text-gold-bright text-base md:text-lg transition-colors">
                    {title}
                  </h4>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
