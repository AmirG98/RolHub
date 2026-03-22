'use client'

import { useState, useMemo, useCallback } from 'react'
import { RunicButton } from '@/components/medieval/RunicButton'
import {
  Sword, Shield, BookOpen, Wand2, Heart, Zap, Flame, Snowflake,
  Skull, Star, Users, ChevronRight, ChevronLeft, Check, Sparkles, Dices,
  Shirt, Backpack, Coins, Gem, Axe, Crosshair, Music, FlaskConical
} from 'lucide-react'
import { generateRandomDescription } from '@/lib/character/description-templates'
import {
  getClasses, getRaces, getClass, getRace,
  getRecommendedAbilityScores, getStartingGold, getMagicItemsAllowed,
  createDnD5eCharacter, convertToGameStats,
  STANDARD_ARRAY, POINT_BUY_COSTS, POINT_BUY_TOTAL,
  type AbilityScores, type AbilityScore, type DnD5eClass, type DnD5eRace
} from '@/lib/engines/dnd-5e-character'
import { calculateModifier, formatModifier } from '@/lib/engines/dnd-5e'

interface DnD5eCharacterCreatorProps {
  onComplete: (character: {
    name: string
    description: string
    archetypeId: string
    archetypeName: string
    stats: Record<string, unknown>
    inventory: string[]
    level: number
  }) => void
  onBack: () => void
  lore?: string
}

type Step = 'race' | 'class' | 'abilities' | 'level' | 'equipment' | 'name'

const STEPS: Step[] = ['race', 'class', 'abilities', 'level', 'equipment', 'name']

const STEP_TITLES: Record<Step, string> = {
  race: 'Elige tu Raza',
  class: 'Elige tu Clase',
  abilities: 'Asigna tus Atributos',
  level: 'Nivel Inicial',
  equipment: 'Equipamiento',
  name: 'Nombre tu Personaje'
}

// Iconos para clases
const CLASS_ICONS: Record<string, React.ReactNode> = {
  barbarian: <Flame className="h-10 w-10" />,
  bard: <Star className="h-10 w-10" />,
  cleric: <Heart className="h-10 w-10" />,
  druid: <Sparkles className="h-10 w-10" />,
  fighter: <Shield className="h-10 w-10" />,
  monk: <Zap className="h-10 w-10" />,
  paladin: <Sword className="h-10 w-10" />,
  ranger: <BookOpen className="h-10 w-10" />,
  rogue: <Skull className="h-10 w-10" />,
  sorcerer: <Wand2 className="h-10 w-10" />,
  warlock: <Snowflake className="h-10 w-10" />,
  wizard: <BookOpen className="h-10 w-10" />
}

// Iconos para razas
const RACE_ICONS: Record<string, React.ReactNode> = {
  human: <Users className="h-10 w-10" />,
  elf: <Star className="h-10 w-10" />,
  dwarf: <Shield className="h-10 w-10" />,
  halfling: <Heart className="h-10 w-10" />,
  dragonborn: <Flame className="h-10 w-10" />,
  gnome: <Sparkles className="h-10 w-10" />,
  half_elf: <Star className="h-10 w-10" />,
  half_orc: <Sword className="h-10 w-10" />,
  tiefling: <Skull className="h-10 w-10" />
}

const LEVEL_OPTIONS = [
  { level: 1, name: 'Nivel 1 - Aventurero Novato', description: 'Empiezas desde cero. Ideal para aprender.' },
  { level: 3, name: 'Nivel 3 - Experimentado', description: 'Ya tienes tu subclase desbloqueada.' },
  { level: 5, name: 'Nivel 5 - Héroe Establecido', description: 'Ataque Extra, conjuros de nivel 3. Un item mágico.' },
  { level: 10, name: 'Nivel 10 - Leyenda', description: 'Poderoso y experimentado. Tres items mágicos.' }
]

// Traducción de items al español
const ITEM_TRANSLATIONS: Record<string, { name: string; icon: React.ReactNode; category: 'weapon' | 'armor' | 'tool' | 'gear' }> = {
  // Armas
  'dagger': { name: 'Daga', icon: <Sword className="h-4 w-4" />, category: 'weapon' },
  'shortsword': { name: 'Espada corta', icon: <Sword className="h-4 w-4" />, category: 'weapon' },
  'longsword': { name: 'Espada larga', icon: <Sword className="h-4 w-4" />, category: 'weapon' },
  'greatsword': { name: 'Espadón', icon: <Sword className="h-4 w-4" />, category: 'weapon' },
  'rapier': { name: 'Estoque', icon: <Sword className="h-4 w-4" />, category: 'weapon' },
  'scimitar': { name: 'Cimitarra', icon: <Sword className="h-4 w-4" />, category: 'weapon' },
  'battleaxe': { name: 'Hacha de batalla', icon: <Axe className="h-4 w-4" />, category: 'weapon' },
  'greataxe': { name: 'Hacha grande', icon: <Axe className="h-4 w-4" />, category: 'weapon' },
  'handaxe': { name: 'Hacha de mano', icon: <Axe className="h-4 w-4" />, category: 'weapon' },
  'warhammer': { name: 'Martillo de guerra', icon: <Sword className="h-4 w-4" />, category: 'weapon' },
  'mace': { name: 'Maza', icon: <Sword className="h-4 w-4" />, category: 'weapon' },
  'quarterstaff': { name: 'Bastón', icon: <Wand2 className="h-4 w-4" />, category: 'weapon' },
  'club': { name: 'Garrote', icon: <Sword className="h-4 w-4" />, category: 'weapon' },
  'javelin': { name: 'Jabalina', icon: <Crosshair className="h-4 w-4" />, category: 'weapon' },
  'spear': { name: 'Lanza', icon: <Crosshair className="h-4 w-4" />, category: 'weapon' },
  'light_crossbow': { name: 'Ballesta ligera', icon: <Crosshair className="h-4 w-4" />, category: 'weapon' },
  'crossbow_bolts': { name: 'Virotes de ballesta', icon: <Crosshair className="h-4 w-4" />, category: 'weapon' },
  'shortbow': { name: 'Arco corto', icon: <Crosshair className="h-4 w-4" />, category: 'weapon' },
  'longbow': { name: 'Arco largo', icon: <Crosshair className="h-4 w-4" />, category: 'weapon' },
  'arrows': { name: 'Flechas (20)', icon: <Crosshair className="h-4 w-4" />, category: 'weapon' },
  'sling': { name: 'Honda', icon: <Crosshair className="h-4 w-4" />, category: 'weapon' },
  // Armaduras
  'leather_armor': { name: 'Armadura de cuero', icon: <Shirt className="h-4 w-4" />, category: 'armor' },
  'studded_leather': { name: 'Cuero tachonado', icon: <Shirt className="h-4 w-4" />, category: 'armor' },
  'chain_mail': { name: 'Cota de mallas', icon: <Shield className="h-4 w-4" />, category: 'armor' },
  'chain_shirt': { name: 'Camisa de mallas', icon: <Shirt className="h-4 w-4" />, category: 'armor' },
  'scale_mail': { name: 'Cota de escamas', icon: <Shield className="h-4 w-4" />, category: 'armor' },
  'shield': { name: 'Escudo', icon: <Shield className="h-4 w-4" />, category: 'armor' },
  // Herramientas
  'thieves_tools': { name: 'Herramientas de ladrón', icon: <FlaskConical className="h-4 w-4" />, category: 'tool' },
  'musical_instrument': { name: 'Instrumento musical', icon: <Music className="h-4 w-4" />, category: 'tool' },
  'lute': { name: 'Laúd', icon: <Music className="h-4 w-4" />, category: 'tool' },
  'flute': { name: 'Flauta', icon: <Music className="h-4 w-4" />, category: 'tool' },
  'herbalism_kit': { name: 'Kit de herbolario', icon: <FlaskConical className="h-4 w-4" />, category: 'tool' },
  'holy_symbol': { name: 'Símbolo sagrado', icon: <Sparkles className="h-4 w-4" />, category: 'tool' },
  'arcane_focus': { name: 'Foco arcano', icon: <Wand2 className="h-4 w-4" />, category: 'tool' },
  'component_pouch': { name: 'Bolsa de componentes', icon: <Backpack className="h-4 w-4" />, category: 'tool' },
  'druidic_focus': { name: 'Foco druídico', icon: <Sparkles className="h-4 w-4" />, category: 'tool' },
  'spellbook': { name: 'Libro de conjuros', icon: <BookOpen className="h-4 w-4" />, category: 'tool' },
  // Equipo general
  'explorer_pack': { name: 'Equipo de explorador', icon: <Backpack className="h-4 w-4" />, category: 'gear' },
  'dungeoneer_pack': { name: 'Equipo de aventurero', icon: <Backpack className="h-4 w-4" />, category: 'gear' },
  'entertainer_pack': { name: 'Equipo de artista', icon: <Backpack className="h-4 w-4" />, category: 'gear' },
  'priest_pack': { name: 'Equipo de sacerdote', icon: <Backpack className="h-4 w-4" />, category: 'gear' },
  'scholar_pack': { name: 'Equipo de erudito', icon: <Backpack className="h-4 w-4" />, category: 'gear' },
  'diplomat_pack': { name: 'Equipo de diplomático', icon: <Backpack className="h-4 w-4" />, category: 'gear' },
  'burglar_pack': { name: 'Equipo de ladrón', icon: <Backpack className="h-4 w-4" />, category: 'gear' },
}

const CATEGORY_INFO: Record<string, { label: string; color: string; bgColor: string }> = {
  weapon: { label: 'Armas', color: 'text-blood', bgColor: 'bg-blood/20' },
  armor: { label: 'Armadura', color: 'text-blue-400', bgColor: 'bg-blue-400/20' },
  tool: { label: 'Herramientas', color: 'text-purple-400', bgColor: 'bg-purple-400/20' },
  gear: { label: 'Equipo', color: 'text-gold', bgColor: 'bg-gold/20' },
}

// Función para traducir y obtener info de un item
function getItemInfo(item: string): { name: string; icon: React.ReactNode; category: 'weapon' | 'armor' | 'tool' | 'gear' } {
  const normalized = item.toLowerCase().replace(/\s+/g, '_')
  if (ITEM_TRANSLATIONS[normalized]) {
    return ITEM_TRANSLATIONS[normalized]
  }
  // Si no está en el diccionario, devolver el item formateado
  return {
    name: item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    icon: <Backpack className="h-4 w-4" />,
    category: 'gear'
  }
}

export function DnD5eCharacterCreator({ onComplete, onBack, lore }: DnD5eCharacterCreatorProps) {
  const [currentStep, setCurrentStep] = useState<Step>('race')
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null)
  const [selectedSubraceId, setSelectedSubraceId] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [abilityScores, setAbilityScores] = useState<AbilityScores>({
    STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
  })
  const [assignmentMethod, setAssignmentMethod] = useState<'standard' | 'pointbuy'>('standard')
  const [selectedLevel, setSelectedLevel] = useState<number>(1)
  const [characterName, setCharacterName] = useState('')
  const [characterDescription, setCharacterDescription] = useState('')
  const [draconicAncestry, setDraconicAncestry] = useState<string | null>(null)

  // Generar descripcion aleatoria
  const handleGenerateDescription = useCallback(() => {
    const description = generateRandomDescription((lore as any) || 'LOTR')
    setCharacterDescription(description)
  }, [lore])

  const classes = useMemo(() => getClasses(), [])
  const races = useMemo(() => getRaces(), [])

  const selectedRace = selectedRaceId ? getRace(selectedRaceId) : null
  const selectedClass = selectedClassId ? getClass(selectedClassId) : null

  // Calculate point buy total
  const pointBuySpent = useMemo(() => {
    return Object.values(abilityScores).reduce((total, score) => {
      return total + (POINT_BUY_COSTS[score] || 0)
    }, 0)
  }, [abilityScores])

  const pointBuyRemaining = POINT_BUY_TOTAL - pointBuySpent

  // Standard array assignment
  const [standardArrayAssignments, setStandardArrayAssignments] = useState<Partial<Record<AbilityScore, number>>>({})

  const assignStandardArrayValue = (ability: AbilityScore, value: number) => {
    // Remove this value from any other ability
    const newAssignments = { ...standardArrayAssignments }
    Object.keys(newAssignments).forEach(key => {
      if (newAssignments[key as AbilityScore] === value) {
        delete newAssignments[key as AbilityScore]
      }
    })
    newAssignments[ability] = value
    setStandardArrayAssignments(newAssignments)

    // Update actual ability scores
    const newScores: AbilityScores = { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 }
    Object.entries(newAssignments).forEach(([ab, val]) => {
      if (val !== undefined) {
        newScores[ab as AbilityScore] = val
      }
    })
    setAbilityScores(newScores)
  }

  const usedStandardArrayValues = Object.values(standardArrayAssignments).filter(v => v !== undefined) as number[]
  const availableStandardArrayValues = STANDARD_ARRAY.filter(v => !usedStandardArrayValues.includes(v))

  // Apply recommended scores for selected class
  const applyRecommendedScores = () => {
    if (selectedClassId) {
      const recommended = getRecommendedAbilityScores(selectedClassId)
      setAbilityScores(recommended)

      // For standard array, we need to set the assignments too
      if (assignmentMethod === 'standard') {
        const newAssignments: Partial<Record<AbilityScore, number>> = {}
        const sortedAbilities = (Object.entries(recommended) as [AbilityScore, number][])
          .sort((a, b) => b[1] - a[1])

        sortedAbilities.forEach(([ability, value]) => {
          if (STANDARD_ARRAY.includes(value)) {
            newAssignments[ability] = value
          }
        })
        setStandardArrayAssignments(newAssignments)
      }
    }
  }

  // Point buy adjustment
  const adjustScore = (ability: AbilityScore, delta: number) => {
    const newValue = abilityScores[ability] + delta
    if (newValue < 8 || newValue > 15) return

    const newCost = POINT_BUY_COSTS[newValue] - POINT_BUY_COSTS[abilityScores[ability]]
    if (pointBuySpent + newCost > POINT_BUY_TOTAL) return

    setAbilityScores(prev => ({ ...prev, [ability]: newValue }))
  }

  const currentStepIndex = STEPS.indexOf(currentStep)

  const canProceed = () => {
    switch (currentStep) {
      case 'race':
        if (selectedRaceId === 'dragonborn' && !draconicAncestry) return false
        if (selectedRace?.subraces.length && !selectedSubraceId) return false
        return !!selectedRaceId
      case 'class':
        return !!selectedClassId
      case 'abilities':
        if (assignmentMethod === 'standard') {
          return Object.keys(standardArrayAssignments).length === 6
        }
        return pointBuySpent <= POINT_BUY_TOTAL
      case 'level':
        return true
      case 'equipment':
        return true
      case 'name':
        return characterName.trim().length >= 2
    }
  }

  const goNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex])
    } else {
      // Complete character creation
      handleComplete()
    }
  }

  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1])
    } else {
      onBack()
    }
  }

  const handleComplete = () => {
    if (!selectedRaceId || !selectedClassId) return

    const goldInfo = getStartingGold(selectedLevel)
    const gold = 'fixed' in goldInfo ? goldInfo.fixed : Math.floor(Math.random() * (goldInfo.max - goldInfo.min + 1)) + goldInfo.min
    const magicItemInfo = getMagicItemsAllowed(selectedLevel)

    // Build equipment list
    const equipment: string[] = [
      `${gold} monedas de oro`
    ]

    if (magicItemInfo.count > 0) {
      equipment.push(`${magicItemInfo.count} objeto(s) mágico(s) (hasta ${magicItemInfo.maxTier})`)
    }

    // Add class starting equipment
    if (selectedClass?.startingEquipment.fixed) {
      equipment.push(...selectedClass.startingEquipment.fixed.map(i => i.replace(/_/g, ' ')))
    }

    const character = createDnD5eCharacter({
      name: characterName,
      raceId: selectedRaceId,
      subraceId: selectedSubraceId || undefined,
      classId: selectedClassId,
      level: selectedLevel,
      abilityScores,
      skills: [],
      equipment,
      draconicAncestry: draconicAncestry || undefined
    })

    const stats = convertToGameStats(character)

    onComplete({
      name: characterName,
      description: characterDescription,
      archetypeId: `dnd5e_${selectedClassId}_${selectedRaceId}`,
      archetypeName: `${character.race.name} ${character.class.name}`,
      stats: { ...stats } as Record<string, unknown>,
      inventory: equipment,
      level: selectedLevel
    })
  }

  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full content-wrapper pb-24 md:pb-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-ui text-gold-dim mb-2">
            {STEPS.map((step, i) => (
              <span
                key={step}
                className={i <= currentStepIndex ? 'text-gold' : ''}
              >
                {i + 1}
              </span>
            ))}
          </div>
          <div className="h-1 bg-shadow rounded-full overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Title */}
        <h1 className="font-title text-2xl sm:text-3xl md:text-4xl text-gold-bright text-center mb-6 ink-reveal">
          {STEP_TITLES[currentStep]}
        </h1>

        {/* Step Content */}
        <div className="mb-8">
          {/* RACE SELECTION */}
          {currentStep === 'race' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {races.map((race) => (
                  <div
                    key={race.id}
                    className={`glass-panel rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
                      selectedRaceId === race.id ? 'glow-effect ring-2 ring-gold-bright' : ''
                    }`}
                    onClick={() => {
                      setSelectedRaceId(race.id)
                      setSelectedSubraceId(null)
                      setDraconicAncestry(null)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gold-bright">
                        {RACE_ICONS[race.id] || <Users className="h-10 w-10" />}
                      </div>
                      <div>
                        <h3 className="font-heading text-lg text-gold">{race.name}</h3>
                        <p className="font-body text-xs text-parchment/60 line-clamp-2">
                          {race.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subraces */}
              {selectedRace && selectedRace.subraces.length > 0 && (
                <div className="glass-panel-dark rounded-lg p-4">
                  <h3 className="font-heading text-lg text-gold mb-3">Elige Subrazа</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedRace.subraces.map((subrace) => (
                      <div
                        key={subrace.id}
                        className={`p-3 rounded border cursor-pointer transition-all ${
                          selectedSubraceId === subrace.id
                            ? 'border-gold bg-gold/10'
                            : 'border-gold-dim/30 hover:border-gold/50'
                        }`}
                        onClick={() => setSelectedSubraceId(subrace.id)}
                      >
                        <h4 className="font-heading text-sm text-gold">{subrace.name}</h4>
                        <p className="text-xs text-parchment/60">{subrace.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Draconic Ancestry */}
              {selectedRaceId === 'dragonborn' && selectedRace?.draconicAncestries && (
                <div className="glass-panel-dark rounded-lg p-4">
                  <h3 className="font-heading text-lg text-gold mb-3">Linaje Dracónico</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {selectedRace.draconicAncestries.map((ancestry) => (
                      <div
                        key={ancestry.dragon}
                        className={`p-2 rounded text-center cursor-pointer transition-all ${
                          draconicAncestry === ancestry.dragon
                            ? 'border border-gold bg-gold/10'
                            : 'border border-gold-dim/30 hover:border-gold/50'
                        }`}
                        onClick={() => setDraconicAncestry(ancestry.dragon)}
                      >
                        <div className="font-heading text-sm text-gold">{ancestry.dragon}</div>
                        <div className="text-xs text-parchment/60">{ancestry.damageType}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Race Details */}
              {selectedRace && (
                <div className="glass-panel-dark rounded-lg p-4">
                  <h3 className="font-heading text-lg text-gold mb-2">{selectedRace.name}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gold-dim">Velocidad:</span>
                      <span className="text-parchment ml-2">{selectedRace.speed} pies</span>
                    </div>
                    <div>
                      <span className="text-gold-dim">Tamaño:</span>
                      <span className="text-parchment ml-2">{selectedRace.size}</span>
                    </div>
                    <div>
                      <span className="text-gold-dim">Idiomas:</span>
                      <span className="text-parchment ml-2">{selectedRace.languages.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-gold-dim">Bonificadores:</span>
                      <span className="text-parchment ml-2">
                        {Object.entries(selectedRace.abilityScoreIncrease)
                          .filter(([k]) => k !== 'choice')
                          .map(([k, v]) => `${k === 'all' ? 'Todos' : k} +${v}`)
                          .join(', ')}
                      </span>
                    </div>
                  </div>
                  {selectedRace.traits.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gold-dim/30">
                      <span className="text-gold-dim text-sm">Rasgos: </span>
                      <span className="text-parchment text-sm">
                        {selectedRace.traits.map(t => t.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CLASS SELECTION */}
          {currentStep === 'class' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className={`glass-panel rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
                      selectedClassId === cls.id ? 'glow-effect ring-2 ring-gold-bright' : ''
                    }`}
                    onClick={() => setSelectedClassId(cls.id)}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="text-gold-bright">
                        {CLASS_ICONS[cls.id] || <Sword className="h-10 w-10" />}
                      </div>
                      <h3 className="font-heading text-lg text-gold">{cls.name}</h3>
                      <p className="font-body text-xs text-parchment/60 line-clamp-2">
                        {cls.description}
                      </p>
                      <div className="text-xs text-emerald">
                        Dado de golpe: {cls.hitDie}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Class Details */}
              {selectedClass && (
                <div className="glass-panel-dark rounded-lg p-4">
                  <h3 className="font-heading text-lg text-gold mb-2">{selectedClass.name}</h3>
                  <p className="text-sm text-parchment/80 mb-3">{selectedClass.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gold-dim">Dado de golpe:</span>
                      <span className="text-parchment ml-2">{selectedClass.hitDie}</span>
                    </div>
                    <div>
                      <span className="text-gold-dim">Habilidad principal:</span>
                      <span className="text-parchment ml-2">{selectedClass.primaryAbility.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-gold-dim">Salvaciones:</span>
                      <span className="text-parchment ml-2">{selectedClass.savingThrows.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-gold-dim">Armaduras:</span>
                      <span className="text-parchment ml-2">
                        {selectedClass.armorProficiencies.length > 0
                          ? selectedClass.armorProficiencies.join(', ')
                          : 'Ninguna'}
                      </span>
                    </div>
                  </div>
                  {selectedClass.features['1'] && (
                    <div className="mt-3 pt-3 border-t border-gold-dim/30">
                      <span className="text-gold-dim text-sm">Características nivel 1: </span>
                      <span className="text-parchment text-sm">
                        {selectedClass.features['1'].map(f => f.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ABILITY SCORES */}
          {currentStep === 'abilities' && (
            <div className="space-y-6">
              {/* Method selector */}
              <div className="flex justify-center gap-4 mb-6">
                <button
                  className={`px-4 py-2 rounded font-ui text-sm transition-all ${
                    assignmentMethod === 'standard'
                      ? 'bg-gold text-shadow'
                      : 'bg-shadow/50 text-parchment hover:bg-shadow/70'
                  }`}
                  onClick={() => setAssignmentMethod('standard')}
                >
                  Array Estándar
                </button>
                <button
                  className={`px-4 py-2 rounded font-ui text-sm transition-all ${
                    assignmentMethod === 'pointbuy'
                      ? 'bg-gold text-shadow'
                      : 'bg-shadow/50 text-parchment hover:bg-shadow/70'
                  }`}
                  onClick={() => setAssignmentMethod('pointbuy')}
                >
                  Compra de Puntos
                </button>
              </div>

              {/* Recommended button */}
              {selectedClassId && (
                <div className="text-center mb-4">
                  <button
                    className="text-sm text-emerald hover:text-emerald/80 font-ui underline"
                    onClick={applyRecommendedScores}
                  >
                    Usar valores recomendados para {selectedClass?.name}
                  </button>
                </div>
              )}

              {/* Standard Array */}
              {assignmentMethod === 'standard' && (
                <div className="glass-panel-dark rounded-lg p-4">
                  <p className="text-center text-sm text-parchment/60 mb-4">
                    Asigna los valores {STANDARD_ARRAY.join(', ')} a tus atributos
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as AbilityScore[]).map((ability) => (
                      <div key={ability} className="text-center">
                        <div className="font-heading text-gold text-sm mb-2">{ability}</div>
                        <select
                          className="w-full bg-shadow border border-gold-dim/30 rounded p-2 text-parchment font-mono text-center"
                          value={standardArrayAssignments[ability] || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              assignStandardArrayValue(ability, parseInt(e.target.value))
                            }
                          }}
                        >
                          <option value="">--</option>
                          {[...availableStandardArrayValues, standardArrayAssignments[ability]]
                            .filter((v, i, arr) => v !== undefined && arr.indexOf(v) === i)
                            .sort((a, b) => (b || 0) - (a || 0))
                            .map((value) => (
                              <option key={value} value={value}>
                                {value} ({formatModifier(calculateModifier(value || 10))})
                              </option>
                            ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Point Buy */}
              {assignmentMethod === 'pointbuy' && (
                <div className="glass-panel-dark rounded-lg p-4">
                  <div className="text-center mb-4">
                    <span className="text-gold-dim">Puntos restantes: </span>
                    <span className={`font-mono text-lg ${pointBuyRemaining < 0 ? 'text-blood' : 'text-emerald'}`}>
                      {pointBuyRemaining}
                    </span>
                    <span className="text-parchment/60 text-sm"> / {POINT_BUY_TOTAL}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as AbilityScore[]).map((ability) => (
                      <div key={ability} className="text-center">
                        <div className="font-heading text-gold text-sm mb-2">{ability}</div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="w-8 h-8 rounded bg-shadow border border-gold-dim/30 text-parchment hover:bg-gold/20"
                            onClick={() => adjustScore(ability, -1)}
                            disabled={abilityScores[ability] <= 8}
                          >
                            -
                          </button>
                          <div className="w-12 text-center">
                            <div className="font-mono text-lg text-parchment">{abilityScores[ability]}</div>
                            <div className="text-xs text-gold-dim">
                              ({formatModifier(calculateModifier(abilityScores[ability]))})
                            </div>
                          </div>
                          <button
                            className="w-8 h-8 rounded bg-shadow border border-gold-dim/30 text-parchment hover:bg-gold/20"
                            onClick={() => adjustScore(ability, 1)}
                            disabled={abilityScores[ability] >= 15}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-xs text-parchment/40 mt-1">
                          Costo: {POINT_BUY_COSTS[abilityScores[ability]]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Racial bonuses preview */}
              {selectedRace && (
                <div className="text-center text-sm text-parchment/60">
                  Bonificadores raciales de {selectedRace.name}:{' '}
                  <span className="text-emerald">
                    {Object.entries(selectedRace.abilityScoreIncrease)
                      .filter(([k]) => k !== 'choice')
                      .map(([k, v]) => `${k === 'all' ? 'Todos' : k} +${v}`)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* LEVEL SELECTION */}
          {currentStep === 'level' && (
            <div className="space-y-4">
              {LEVEL_OPTIONS.map((option) => {
                const goldInfo = getStartingGold(option.level)
                const magicInfo = getMagicItemsAllowed(option.level)
                const goldText = 'fixed' in goldInfo ? `${goldInfo.fixed}` : `${goldInfo.min}-${goldInfo.max}`

                return (
                  <div
                    key={option.level}
                    className={`glass-panel rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                      selectedLevel === option.level ? 'glow-effect ring-2 ring-gold-bright' : ''
                    }`}
                    onClick={() => setSelectedLevel(option.level)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-heading text-lg text-gold">{option.name}</h3>
                        <p className="text-sm text-parchment/60">{option.description}</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gold-dim">{goldText} oro</div>
                        {magicInfo.count > 0 && (
                          <div className="text-emerald">{magicInfo.count} item(s) mágico(s)</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* EQUIPMENT */}
          {currentStep === 'equipment' && (
            <div className="space-y-6">
              <div className="glass-panel-dark rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Backpack className="h-6 w-6 text-gold" />
                  <div>
                    <h3 className="font-heading text-xl text-gold">Tu Equipamiento Inicial</h3>
                    <p className="text-xs text-parchment/60">
                      Todo lo que llevarás al comenzar tu aventura
                    </p>
                  </div>
                </div>

                {/* Equipo de clase - organizado por categorías */}
                {selectedClass?.startingEquipment.fixed && selectedClass.startingEquipment.fixed.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gold-dim/30">
                      <span className="text-sm font-ui text-gold-dim">Equipo de {selectedClass.name}</span>
                    </div>

                    {/* Agrupar items por categoría */}
                    {(() => {
                      const itemsByCategory: Record<string, { name: string; icon: React.ReactNode }[]> = {}
                      selectedClass.startingEquipment.fixed.forEach(item => {
                        const info = getItemInfo(item)
                        if (!itemsByCategory[info.category]) {
                          itemsByCategory[info.category] = []
                        }
                        itemsByCategory[info.category].push({ name: info.name, icon: info.icon })
                      })

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(itemsByCategory).map(([category, items]) => (
                            <div
                              key={category}
                              className={`rounded-lg p-3 border ${CATEGORY_INFO[category]?.bgColor || 'bg-shadow/50'} border-gold-dim/20`}
                            >
                              <div className={`text-xs font-ui mb-2 ${CATEGORY_INFO[category]?.color || 'text-parchment'}`}>
                                {CATEGORY_INFO[category]?.label || category}
                              </div>
                              <div className="space-y-1.5">
                                {items.map((item, i) => (
                                  <div key={i} className="flex items-center gap-2 text-parchment">
                                    <span className={CATEGORY_INFO[category]?.color || 'text-gold-dim'}>
                                      {item.icon}
                                    </span>
                                    <span className="text-sm font-body">{item.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Recursos por nivel */}
                <div className="pt-4 border-t border-gold-dim/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Coins className="h-4 w-4 text-gold" />
                    <span className="text-sm font-ui text-gold-dim">Recursos de Nivel {selectedLevel}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Oro */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gold/10 border border-gold/30">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                        <Coins className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <div className="text-lg font-heading text-gold">
                          {(() => {
                            const goldInfo = getStartingGold(selectedLevel)
                            return 'fixed' in goldInfo ? goldInfo.fixed : `${goldInfo.min}-${goldInfo.max}`
                          })()}
                        </div>
                        <div className="text-xs text-parchment/60">Monedas de oro</div>
                      </div>
                    </div>

                    {/* Items mágicos si aplica */}
                    {getMagicItemsAllowed(selectedLevel).count > 0 && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Gem className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-lg font-heading text-purple-400">
                            {getMagicItemsAllowed(selectedLevel).count} Item{getMagicItemsAllowed(selectedLevel).count > 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-parchment/60">
                            Mágico{getMagicItemsAllowed(selectedLevel).count > 1 ? 's' : ''} (hasta {getMagicItemsAllowed(selectedLevel).maxTier})
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nota informativa */}
                <div className="mt-4 p-3 rounded-lg bg-emerald/10 border border-emerald/30">
                  <p className="text-xs text-emerald flex items-start gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Tu equipamiento está listo. Al comenzar la partida, el DM te ayudará a elegir
                      opciones adicionales si tu clase lo permite.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CHARACTER NAME & DESCRIPTION */}
          {currentStep === 'name' && (
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="glass-panel-dark rounded-lg p-6">
                {/* Nombre */}
                <label className="block font-heading text-gold text-lg mb-4 text-center">
                  ¿Cómo se llama tu personaje?
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Nombre del personaje"
                  className="w-full bg-shadow border border-gold-dim/30 rounded-lg p-4 text-parchment font-body text-xl text-center placeholder:text-parchment/30 focus:outline-none focus:border-gold mb-6"
                  autoFocus
                />

                {/* Descripción */}
                <label className="block font-ui text-sm text-gold-dim mb-2">
                  Describe a tu personaje
                  <span className="text-parchment/50 ml-1">(para generar su retrato)</span>
                </label>
                <textarea
                  value={characterDescription}
                  onChange={(e) => setCharacterDescription(e.target.value)}
                  placeholder="Apariencia física, rasgos distintivos, expresión, vestimenta..."
                  className="w-full bg-shadow border border-gold-dim/30 rounded-lg p-4 text-parchment font-body text-sm placeholder:text-parchment/30 focus:outline-none focus:border-gold resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald/20 hover:bg-emerald/30
                             border border-emerald/50 rounded-lg text-emerald font-ui text-xs
                             transition-colors group"
                  >
                    <Dices className="w-3.5 h-3.5 group-hover:animate-spin" />
                    Generar descripción
                  </button>
                  <span className="text-xs text-parchment/40">{characterDescription.length}/500</span>
                </div>
              </div>

              {/* Character Summary */}
              {selectedRace && selectedClass && characterName.trim() && (
                <div className="glass-panel rounded-lg p-4">
                  <h3 className="font-heading text-lg text-gold mb-3 text-center">Resumen</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gold-dim">Nombre:</span>
                      <span className="text-parchment ml-2">{characterName}</span>
                    </div>
                    <div>
                      <span className="text-gold-dim">Raza:</span>
                      <span className="text-parchment ml-2">{selectedRace.name}</span>
                    </div>
                    <div>
                      <span className="text-gold-dim">Clase:</span>
                      <span className="text-parchment ml-2">{selectedClass.name}</span>
                    </div>
                    <div>
                      <span className="text-gold-dim">Nivel:</span>
                      <span className="text-parchment ml-2">{selectedLevel}</span>
                    </div>
                  </div>
                  {characterDescription && (
                    <div className="mt-3 pt-3 border-t border-gold-dim/30">
                      <span className="text-gold-dim text-xs">Descripción:</span>
                      <p className="text-parchment text-xs mt-1 italic">"{characterDescription}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 md:relative bg-shadow/95 md:bg-transparent p-4 md:p-0 border-t border-gold/20 md:border-0 flex justify-between items-center z-40">
          <RunicButton variant="secondary" onClick={goBack} className="text-sm md:text-base px-4 md:px-6">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Atrás
          </RunicButton>

          <RunicButton
            variant="primary"
            disabled={!canProceed()}
            onClick={goNext}
            className="text-sm md:text-base px-4 md:px-8"
          >
            {currentStepIndex === STEPS.length - 1 ? (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                Crear Personaje
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </RunicButton>
        </div>
      </div>
    </div>
  )
}
