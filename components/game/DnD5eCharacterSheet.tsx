'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, Heart, Shield, Zap, Footprints, Target, Dices, Weight, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HelpTooltip, HelpModal } from './HelpTooltip'
import { ALL_SKILLS, type AbilityId } from '@/lib/game/help-content'
import { calculateModifier, formatModifier } from '@/lib/engines/dnd-5e'
import {
  calculateEncumbrance,
  getItemWeight,
  formatWeight,
  getEncumbranceColor,
  getEncumbranceMessage,
  type EncumbranceStatus
} from '@/lib/game/encumbrance'

// ============================================
// TYPES
// ============================================

interface DnD5eStats {
  // Básicos
  hp: number
  maxHp: number
  ac: number
  level: number
  proficiencyBonus: number
  speed: number

  // Ability Scores
  STR: number
  DEX: number
  CON: number
  INT: number
  WIS: number
  CHA: number

  // Character info
  className?: string
  raceName?: string
  subrace?: string
  hitDice?: string
  experience?: number
  experienceToNext?: number

  // Proficiencies
  savingThrowProficiencies?: AbilityId[]
  skillProficiencies?: string[]

  // Features
  features?: {
    name: string
    description: string
    source: 'race' | 'class' | 'subrace' | 'background'
  }[]
}

interface DnD5eCharacterSheetProps {
  name: string
  archetype: string
  avatarUrl?: string
  stats: DnD5eStats
  inventory?: string[]
  conditions?: string[]
  gold?: number
  tutorialLevel?: 'novice' | 'experienced'
  className?: string
}

// ============================================
// HELPER COMPONENTS
// ============================================

function SectionHeader({
  title,
  isOpen,
  onToggle,
  helpTerm,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  helpTerm?: string
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center justify-between py-2 px-3",
        "bg-shadow/60 border border-gold-dim/30 rounded-t-lg",
        "text-gold-bright font-heading text-sm tracking-wide",
        "hover:bg-shadow/80 transition-colors"
      )}
    >
      <span className="flex items-center gap-2">
        {title}
        {helpTerm && (
          <HelpTooltip category="combat" term={helpTerm} iconSize="sm" />
        )}
      </span>
      {isOpen ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      )}
    </button>
  )
}

function AbilityScoreBox({
  ability,
  score,
  tutorialLevel,
}: {
  ability: AbilityId
  score: number
  tutorialLevel: 'novice' | 'experienced'
}) {
  const modifier = calculateModifier(score)
  const modifierStr = formatModifier(modifier)

  return (
    <div className="flex flex-col items-center p-2 bg-shadow/50 rounded-lg border border-gold-dim/20">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs font-ui text-gold-dim">{ability}</span>
        <HelpTooltip category="ability" term={ability} level={tutorialLevel} iconSize="sm" />
      </div>
      <span className="text-xl font-heading text-parchment">{score}</span>
      <span className={cn(
        "text-sm font-mono",
        modifier >= 0 ? "text-emerald-400" : "text-red-400"
      )}>
        {modifierStr}
      </span>
    </div>
  )
}

function HPBar({ current, max }: { current: number; max: number }) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100))
  const isLow = percentage <= 25
  const isMedium = percentage > 25 && percentage <= 50

  return (
    <div className="relative h-4 bg-shadow rounded-full overflow-hidden border border-gold-dim/30">
      <div
        className={cn(
          "absolute inset-y-0 left-0 transition-all duration-500",
          isLow ? "bg-red-500" : isMedium ? "bg-yellow-500" : "bg-emerald-500"
        )}
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-ui text-white font-bold drop-shadow-md">
          {current} / {max}
        </span>
      </div>
    </div>
  )
}

function SavingThrowRow({
  ability,
  score,
  proficiencyBonus,
  isProficient,
  tutorialLevel,
}: {
  ability: AbilityId
  score: number
  proficiencyBonus: number
  isProficient: boolean
  tutorialLevel: 'novice' | 'experienced'
}) {
  const modifier = calculateModifier(score)
  const total = modifier + (isProficient ? proficiencyBonus : 0)
  const totalStr = formatModifier(total)

  return (
    <div className="flex items-center gap-2 py-1">
      <span className={cn(
        "w-3 h-3 rounded-full border",
        isProficient
          ? "bg-gold border-gold"
          : "border-gold-dim/50"
      )} />
      <span className="w-8 text-xs font-ui text-gold-dim">{ability}</span>
      <span className={cn(
        "font-mono text-sm",
        total >= 0 ? "text-emerald-400" : "text-red-400"
      )}>
        {totalStr}
      </span>
      <HelpTooltip category="saving_throw" term={`${ability}_save`} level={tutorialLevel} iconSize="sm" />
    </div>
  )
}

function SkillRow({
  skill,
  abilityScore,
  proficiencyBonus,
  isProficient,
  tutorialLevel,
}: {
  skill: typeof ALL_SKILLS[number]
  abilityScore: number
  proficiencyBonus: number
  isProficient: boolean
  tutorialLevel: 'novice' | 'experienced'
}) {
  const modifier = calculateModifier(abilityScore)
  const total = modifier + (isProficient ? proficiencyBonus : 0)
  const totalStr = formatModifier(total)

  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className={cn(
        "w-2.5 h-2.5 rounded-full border flex-shrink-0",
        isProficient
          ? "bg-gold border-gold"
          : "border-gold-dim/40"
      )} />
      <span className="flex-1 text-xs font-body text-parchment/80 truncate">
        {skill.name}
      </span>
      <span className="text-[10px] font-ui text-gold-dim/60">({skill.ability})</span>
      <span className={cn(
        "font-mono text-xs w-8 text-right",
        total >= 0 ? "text-emerald-400" : "text-red-400"
      )}>
        {totalStr}
      </span>
    </div>
  )
}

// ============================================
// EQUIPMENT SECTION WITH WEIGHT
// ============================================

function EncumbranceBar({ status }: { status: EncumbranceStatus }) {
  const { currentWeight, carryCapacity, percentFull, level } = status

  // Colores de la barra según nivel de carga
  const barColor = level === 'normal' ? 'bg-emerald-500'
    : level === 'encumbered' ? 'bg-yellow-500'
    : level === 'heavily_encumbered' ? 'bg-orange-500'
    : 'bg-red-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-ui">
        <span className={getEncumbranceColor(level)}>
          {currentWeight} / {carryCapacity} lb
        </span>
        <span className="text-parchment/50">{percentFull}%</span>
      </div>
      <div className="relative h-2 bg-shadow rounded-full overflow-hidden border border-gold-dim/20">
        {/* Marcadores de umbrales */}
        <div
          className="absolute top-0 bottom-0 w-px bg-yellow-500/50"
          style={{ left: `${(status.encumberedThreshold / carryCapacity) * 100}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-px bg-orange-500/50"
          style={{ left: `${(status.heavyThreshold / carryCapacity) * 100}%` }}
        />
        {/* Barra de peso actual */}
        <div
          className={cn("absolute inset-y-0 left-0 transition-all duration-300", barColor)}
          style={{ width: `${Math.min(percentFull, 100)}%` }}
        />
      </div>
      <p className={cn("text-[10px] font-ui", getEncumbranceColor(level))}>
        {getEncumbranceMessage(level)}
      </p>
    </div>
  )
}

function EquipmentSection({
  inventory,
  gold,
  strength,
  isOpen,
  onToggle,
}: {
  inventory: string[]
  gold: number
  strength: number
  isOpen: boolean
  onToggle: () => void
}) {
  const encumbrance = calculateEncumbrance(inventory, strength)

  return (
    <div>
      <SectionHeader
        title="EQUIPO"
        isOpen={isOpen}
        onToggle={onToggle}
      />
      {isOpen && (
        <div className="p-3 border border-t-0 border-gold-dim/30 rounded-b-lg bg-shadow/30 space-y-3">
          {/* Barra de carga */}
          <EncumbranceBar status={encumbrance} />

          {/* Lista de items con peso */}
          {inventory.length > 0 ? (
            <ul className="space-y-1 pt-2 border-t border-gold-dim/20">
              {inventory.map((item, index) => {
                const weight = getItemWeight(item)
                return (
                  <li
                    key={index}
                    className="text-sm font-body text-parchment/80 flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-2 flex-1 min-w-0">
                      <Package className="w-3 h-3 text-gold-dim flex-shrink-0" />
                      <span className="truncate">{item}</span>
                    </span>
                    <span className="text-xs font-mono text-parchment/50 flex-shrink-0">
                      {formatWeight(weight)}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-parchment/50 font-body italic">Sin equipo</p>
          )}

          {/* Oro */}
          {gold > 0 && (
            <div className="pt-2 border-t border-gold-dim/20 flex justify-between items-center">
              <span className="text-sm font-body text-gold">
                Oro: {gold} gp
              </span>
              <span className="text-xs font-mono text-parchment/50">
                {formatWeight(gold * 0.02)} {/* 50 monedas = 1 lb */}
              </span>
            </div>
          )}

          {/* Resumen de capacidad */}
          <div className="pt-2 border-t border-gold-dim/20">
            <div className="flex items-center gap-2 text-xs font-ui text-parchment/60">
              <Weight className="w-3 h-3" />
              <span>Capacidad: STR ({strength}) × 15 = {strength * 15} lb</span>
            </div>
            {encumbrance.speedPenalty !== 0 && (
              <div className="flex items-center gap-2 text-xs font-ui text-orange-400 mt-1">
                <Footprints className="w-3 h-3" />
                <span>Velocidad: {encumbrance.speedPenalty} pies</span>
              </div>
            )}
            {encumbrance.hasDisadvantage && (
              <div className="flex items-center gap-2 text-xs font-ui text-red-400 mt-1">
                <Target className="w-3 h-3" />
                <span>Desventaja en checks de STR, DEX y CON</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function DnD5eCharacterSheet({
  name,
  archetype,
  avatarUrl,
  stats,
  inventory = [],
  conditions = [],
  gold = 0,
  tutorialLevel = 'novice',
  className,
}: DnD5eCharacterSheetProps) {
  // Section visibility state
  const [openSections, setOpenSections] = useState({
    attributes: true,
    combat: true,
    saves: false,
    skills: false,
    features: false,
    equipment: false,
  })

  const [showHelpModal, setShowHelpModal] = useState(false)

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Calculate derived values
  const proficiencyBonus = stats.proficiencyBonus || 2
  const saveProficiencies = stats.savingThrowProficiencies || []
  const skillProficiencies = stats.skillProficiencies || []

  // Calculate encumbrance from inventory
  const encumbrance = calculateEncumbrance(inventory, stats.STR || 10)
  const effectiveSpeed = Math.max(0, (stats.speed || 30) + encumbrance.speedPenalty)

  return (
    <div className={cn(
      "bg-shadow-mid/80 border border-gold-dim/40 rounded-lg overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-shadow/60 border-b border-gold-dim/30">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-gold flex-shrink-0 bg-shadow">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gold text-2xl font-heading">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name & Info */}
          <div>
            <h2 className="font-heading text-xl text-gold-bright">{name}</h2>
            <p className="text-sm text-parchment/70 font-body">
              {stats.raceName && stats.className
                ? `${stats.raceName}${stats.subrace ? ` (${stats.subrace})` : ''} • ${stats.className}`
                : archetype}
            </p>
            <p className="text-xs text-gold-dim font-ui">
              Nivel {stats.level}
              {stats.experience !== undefined && stats.experienceToNext && (
                <span className="ml-2 text-parchment/50">
                  XP: {stats.experience} / {stats.experienceToNext}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Help Button */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="p-2 text-gold-dim hover:text-gold transition-colors"
          title="Guía de Referencia"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Conditions */}
      {conditions.length > 0 && (
        <div className="px-3 py-2 bg-blood/20 border-b border-blood/30 flex flex-wrap gap-1">
          {conditions.map((condition) => (
            <span
              key={condition}
              className="px-2 py-0.5 text-xs font-ui bg-blood/30 text-red-300 rounded-full border border-blood/50"
            >
              {condition}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* ============ ATRIBUTOS ============ */}
        <div>
          <SectionHeader
            title="ATRIBUTOS"
            isOpen={openSections.attributes}
            onToggle={() => toggleSection('attributes')}
          />
          {openSections.attributes && (
            <div className="p-3 border border-t-0 border-gold-dim/30 rounded-b-lg bg-shadow/30">
              <div className="grid grid-cols-6 gap-2">
                {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as AbilityId[]).map((ability) => (
                  <AbilityScoreBox
                    key={ability}
                    ability={ability}
                    score={stats[ability] || 10}
                    tutorialLevel={tutorialLevel}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============ COMBATE ============ */}
        <div>
          <SectionHeader
            title="COMBATE"
            isOpen={openSections.combat}
            onToggle={() => toggleSection('combat')}
          />
          {openSections.combat && (
            <div className="p-3 border border-t-0 border-gold-dim/30 rounded-b-lg bg-shadow/30 space-y-3">
              {/* HP Bar */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-ui text-gold-dim">Puntos de Vida</span>
                  <HelpTooltip category="combat" term="hp" level={tutorialLevel} iconSize="sm" />
                </div>
                <HPBar current={stats.hp} max={stats.maxHp} />
              </div>

              {/* Combat Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* AC */}
                <div className="flex items-center gap-2 p-2 bg-shadow/50 rounded border border-gold-dim/20">
                  <Shield className="w-5 h-5 text-gold" />
                  <div>
                    <span className="text-lg font-heading text-parchment">{stats.ac}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-ui text-gold-dim">CA</span>
                      <HelpTooltip category="combat" term="ac" level={tutorialLevel} iconSize="sm" />
                    </div>
                  </div>
                </div>

                {/* Initiative */}
                <div className="flex items-center gap-2 p-2 bg-shadow/50 rounded border border-gold-dim/20">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <div>
                    <span className={cn(
                      "text-lg font-heading",
                      calculateModifier(stats.DEX) >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {formatModifier(calculateModifier(stats.DEX))}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-ui text-gold-dim">Iniciativa</span>
                      <HelpTooltip category="combat" term="initiative" level={tutorialLevel} iconSize="sm" />
                    </div>
                  </div>
                </div>

                {/* Speed - with encumbrance penalty */}
                <div className={cn(
                  "flex items-center gap-2 p-2 bg-shadow/50 rounded border",
                  encumbrance.speedPenalty !== 0
                    ? "border-orange-500/50"
                    : "border-gold-dim/20"
                )}>
                  <Footprints className={cn(
                    "w-5 h-5",
                    encumbrance.speedPenalty !== 0 ? "text-orange-400" : "text-blue-400"
                  )} />
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-lg font-heading",
                        encumbrance.speedPenalty !== 0 ? "text-orange-400" : "text-parchment"
                      )}>
                        {effectiveSpeed}
                      </span>
                      {encumbrance.speedPenalty !== 0 && (
                        <span className="text-xs text-parchment/40 line-through">
                          {stats.speed || 30}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-ui text-gold-dim">pies</span>
                      {encumbrance.speedPenalty !== 0 && (
                        <span className="text-[8px] font-ui text-orange-400">
                          ({encumbrance.speedPenalty})
                        </span>
                      )}
                      <HelpTooltip category="combat" term="speed" level={tutorialLevel} iconSize="sm" />
                    </div>
                  </div>
                </div>

                {/* Proficiency */}
                <div className="flex items-center gap-2 p-2 bg-shadow/50 rounded border border-gold-dim/20">
                  <Target className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="text-lg font-heading text-emerald-400">+{proficiencyBonus}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-ui text-gold-dim">Comp.</span>
                      <HelpTooltip category="combat" term="proficiency" level={tutorialLevel} iconSize="sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hit Dice */}
              {stats.hitDice && (
                <div className="flex items-center gap-2 text-sm">
                  <Dices className="w-4 h-4 text-gold-dim" />
                  <span className="text-parchment/70 font-body">
                    Dados de Golpe: <span className="text-parchment">{stats.hitDice}</span>
                  </span>
                  <HelpTooltip category="combat" term="hitDice" level={tutorialLevel} iconSize="sm" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============ TIRADAS DE SALVACIÓN ============ */}
        <div>
          <SectionHeader
            title="TIRADAS DE SALVACIÓN"
            isOpen={openSections.saves}
            onToggle={() => toggleSection('saves')}
            helpTerm="general"
          />
          {openSections.saves && (
            <div className="p-3 border border-t-0 border-gold-dim/30 rounded-b-lg bg-shadow/30">
              <div className="grid grid-cols-2 gap-x-4">
                {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as AbilityId[]).map((ability) => (
                  <SavingThrowRow
                    key={ability}
                    ability={ability}
                    score={stats[ability] || 10}
                    proficiencyBonus={proficiencyBonus}
                    isProficient={saveProficiencies.includes(ability)}
                    tutorialLevel={tutorialLevel}
                  />
                ))}
              </div>
              <p className="mt-2 text-[10px] text-parchment/50 font-ui">
                ● = Competente (añade +{proficiencyBonus})
              </p>
            </div>
          )}
        </div>

        {/* ============ HABILIDADES ============ */}
        <div>
          <SectionHeader
            title="HABILIDADES"
            isOpen={openSections.skills}
            onToggle={() => toggleSection('skills')}
          />
          {openSections.skills && (
            <div className="p-3 border border-t-0 border-gold-dim/30 rounded-b-lg bg-shadow/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                {ALL_SKILLS.map((skill) => {
                  const abilityScore = stats[skill.ability as AbilityId] || 10
                  return (
                    <SkillRow
                      key={skill.id}
                      skill={skill}
                      abilityScore={abilityScore}
                      proficiencyBonus={proficiencyBonus}
                      isProficient={skillProficiencies.includes(skill.id)}
                      tutorialLevel={tutorialLevel}
                    />
                  )
                })}
              </div>
              <p className="mt-2 text-[10px] text-parchment/50 font-ui">
                ● = Competente (añade +{proficiencyBonus})
              </p>
            </div>
          )}
        </div>

        {/* ============ RASGOS Y CARACTERÍSTICAS ============ */}
        {stats.features && stats.features.length > 0 && (
          <div>
            <SectionHeader
              title="RASGOS Y CARACTERÍSTICAS"
              isOpen={openSections.features}
              onToggle={() => toggleSection('features')}
            />
            {openSections.features && (
              <div className="p-3 border border-t-0 border-gold-dim/30 rounded-b-lg bg-shadow/30 space-y-2">
                {stats.features.map((feature, index) => (
                  <div key={index} className="p-2 bg-shadow/40 rounded border border-gold-dim/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading text-sm text-gold">{feature.name}</span>
                      <span className="text-[10px] font-ui text-parchment/40 capitalize">
                        ({feature.source})
                      </span>
                    </div>
                    <p className="text-xs font-body text-parchment/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ EQUIPO ============ */}
        <EquipmentSection
          inventory={inventory}
          gold={gold}
          strength={stats.STR}
          isOpen={openSections.equipment}
          onToggle={() => toggleSection('equipment')}
        />
      </div>

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        level={tutorialLevel}
      />
    </div>
  )
}
