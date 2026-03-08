import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'

interface Character {
  id: string
  name: string
  archetype: string
  level: number
  stats: any
  inventory: any
  conditions: string[]
}

interface PartyTrackerProps {
  characters: Character[]
  worldState: any
}

export default function PartyTracker({ characters, worldState }: PartyTrackerProps) {
  if (characters.length === 0) {
    return null
  }

  const character = characters[0] // Por ahora solo mostramos el primer personaje

  return (
    <div className="space-y-4">
      <OrnateFrame variant="shadow">
        <ParchmentPanel>
          <h3 className="font-heading text-xl text-ink mb-4">Tu Personaje</h3>

          <div className="space-y-3">
            <div>
              <p className="font-ui text-xs text-gold-dim uppercase tracking-wide">Nombre</p>
              <p className="font-heading text-lg text-ink">{character.name}</p>
            </div>

            <div>
              <p className="font-ui text-xs text-gold-dim uppercase tracking-wide">Arquetipo</p>
              <p className="font-body text-stone">{character.archetype}</p>
            </div>

            <div className="pt-3 border-t border-gold-dim/30">
              <p className="font-ui text-xs text-gold-dim uppercase tracking-wide mb-2">HP</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-6 bg-stone/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blood to-blood/80 transition-all duration-300"
                    style={{
                      width: `${
                        (parseInt(
                          worldState.party[character.name]?.hp?.split('/')[0] ||
                            character.stats.hp ||
                            20
                        ) /
                          parseInt(
                            worldState.party[character.name]?.hp?.split('/')[1] ||
                              character.stats.maxHp ||
                              20
                          )) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="font-heading text-blood text-sm">
                  {worldState.party[character.name]?.hp ||
                    `${character.stats.hp}/${character.stats.maxHp}`}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gold-dim/30">
              <p className="font-ui text-xs text-gold-dim uppercase tracking-wide mb-2">
                Estadísticas
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-ui text-gold-dim">Combate:</span>{' '}
                  <span className="font-heading text-ink">{character.stats?.combat || 1}</span>
                </div>
                <div>
                  <span className="font-ui text-gold-dim">Exploración:</span>{' '}
                  <span className="font-heading text-ink">{character.stats?.exploration || 1}</span>
                </div>
                <div>
                  <span className="font-ui text-gold-dim">Social:</span>{' '}
                  <span className="font-heading text-ink">{character.stats?.social || 1}</span>
                </div>
                <div>
                  <span className="font-ui text-gold-dim">Lore:</span>{' '}
                  <span className="font-heading text-ink">{character.stats?.lore || 1}</span>
                </div>
              </div>
            </div>

            {character.conditions && character.conditions.length > 0 && (
              <div className="pt-3 border-t border-gold-dim/30">
                <p className="font-ui text-xs text-gold-dim uppercase tracking-wide mb-2">
                  Condiciones
                </p>
                <div className="flex flex-wrap gap-2">
                  {character.conditions.map((condition, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-blood/20 border border-blood/40 rounded text-xs font-ui text-blood"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gold-dim/30">
              <p className="font-ui text-xs text-gold-dim uppercase tracking-wide mb-2">Inventario</p>
              <div className="space-y-1">
                {(character.inventory as string[]).slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 font-body text-stone text-xs">
                    <span className="text-gold-dim">"</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ParchmentPanel>
      </OrnateFrame>
    </div>
  )
}
