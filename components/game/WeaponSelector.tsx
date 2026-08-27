'use client'

import { useState, useMemo } from 'react'
import { useLanguage } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sword,
  Wand2,
  Target,
  Shield,
  Footprints,
  X,
  ChevronRight,
  Sparkles,
  Flame,
  Snowflake,
  Zap,
} from 'lucide-react'

import {
  Weapon,
  Spell,
  parseWeaponsFromInventory,
  parseSpellsFromInventory,
  getWeaponDescription,
  getSpellDescription,
} from '@/lib/game/weapons'

export type AttackOption = {
  type: 'weapon' | 'spell' | 'ability' | 'unarmed'
  item: Weapon | Spell | null
  name: string
  damage: string
  damageType: string
  range: string
  description: string
}

interface WeaponSelectorProps {
  inventory: string[]
  onSelect: (option: AttackOption) => void
  onCancel: () => void
  className?: string
}

/**
 * Selector de armas/hechizos para combate
 * Parsea el inventario (strings) y muestra opciones disponibles
 */
export function WeaponSelector({
  inventory,
  onSelect,
  onCancel,
  className = '',
}: WeaponSelectorProps) {
  const { locale } = useLanguage()
  const isEn = locale === 'en'
  const [activeTab, setActiveTab] = useState<'weapons' | 'spells' | 'abilities'>('weapons')
  const [selectedOption, setSelectedOption] = useState<AttackOption | null>(null)

  // Parsear inventario para encontrar armas y hechizos
  const weapons = useMemo(() => parseWeaponsFromInventory(inventory), [inventory])
  const spells = useMemo(() => parseSpellsFromInventory(inventory), [inventory])

  // Opción de ataque desarmado siempre disponible
  const unarmedOption: AttackOption = {
    type: 'unarmed',
    item: null,
    name: isEn ? 'Unarmed Strike' : 'Ataque Desarmado',
    damage: '1 + STR',
    damageType: 'bludgeoning',
    range: isEn ? 'Melee' : 'Cuerpo a cuerpo',
    description: isEn ? 'You strike with fist, elbow, knee or head.' : 'Golpeas con puño, codo, rodilla o cabeza.',
  }

  // Convertir armas a opciones
  const weaponOptions: AttackOption[] = weapons.map(w => ({
    type: 'weapon',
    item: w,
    name: isEn ? w.name : w.nameEs,
    damage: w.damage,
    damageType: w.damageType,
    range: w.range === 'melee' ? (isEn ? 'Melee' : 'Cuerpo a cuerpo') :
           w.range === 'reach' ? (isEn ? 'Reach (10 ft)' : 'Alcance (10 pies)') :
           `${w.rangeDistance?.normal || 30}/${w.rangeDistance?.long || 120} ${isEn ? 'ft' : 'pies'}`,
    description: getWeaponDescription(w, locale),
  }))

  // Convertir hechizos a opciones
  const spellOptions: AttackOption[] = spells.map(s => ({
    type: 'spell',
    item: s,
    name: isEn ? s.name : s.nameEs,
    damage: s.damage || (isEn ? 'Effect' : 'Efecto'),
    damageType: s.damageType || 'special',
    range: s.range,
    description: getSpellDescription(s, locale),
  }))

  // Confirmar selección
  const handleConfirm = () => {
    if (selectedOption) {
      onSelect(selectedOption)
    }
  }

  // Icono según tipo de daño
  const getDamageIcon = (damageType: string) => {
    switch (damageType) {
      case 'fire': return <Flame className="w-4 h-4 text-orange-400" />
      case 'cold': return <Snowflake className="w-4 h-4 text-blue-400" />
      case 'lightning': return <Zap className="w-4 h-4 text-yellow-400" />
      case 'radiant': return <Sparkles className="w-4 h-4 text-yellow-200" />
      case 'necrotic': return <Sparkles className="w-4 h-4 text-purple-400" />
      case 'force': return <Sparkles className="w-4 h-4 text-blue-200" />
      default: return <Sword className="w-4 h-4 text-stone-400" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`bg-stone-900/95 border border-gold-dim rounded-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-stone-800/80 border-b border-gold-dim/30">
        <h3 className="font-heading text-gold text-lg">{isEn ? 'Choose Attack' : 'Elegir Ataque'}</h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-stone-700 rounded transition-colors"
        >
          <X className="w-5 h-5 text-stone-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gold-dim/30">
        <button
          onClick={() => setActiveTab('weapons')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm transition-colors ${
            activeTab === 'weapons'
              ? 'bg-gold/20 text-gold border-b-2 border-gold'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Sword className="w-4 h-4" />
          {isEn ? 'Weapons' : 'Armas'} ({weaponOptions.length + 1})
        </button>
        <button
          onClick={() => setActiveTab('spells')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm transition-colors ${
            activeTab === 'spells'
              ? 'bg-gold/20 text-gold border-b-2 border-gold'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          {isEn ? 'Spells' : 'Hechizos'} ({spellOptions.length})
        </button>
        <button
          onClick={() => setActiveTab('abilities')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm transition-colors ${
            activeTab === 'abilities'
              ? 'bg-gold/20 text-gold border-b-2 border-gold'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {isEn ? 'Abilities' : 'Habilidades'}
        </button>
      </div>

      {/* Content */}
      <div className="max-h-64 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'weapons' && (
            <motion.div
              key="weapons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-2 space-y-1"
            >
              {/* Ataque desarmado */}
              <OptionButton
                option={unarmedOption}
                isSelected={selectedOption?.name === unarmedOption.name}
                onClick={() => setSelectedOption(unarmedOption)}
                damageIcon={getDamageIcon(unarmedOption.damageType)}
              />

              {/* Armas del inventario */}
              {weaponOptions.map((option, i) => (
                <OptionButton
                  key={`weapon-${i}`}
                  option={option}
                  isSelected={selectedOption?.name === option.name}
                  onClick={() => setSelectedOption(option)}
                  damageIcon={getDamageIcon(option.damageType)}
                />
              ))}

              {weaponOptions.length === 0 && (
                <p className="text-stone-500 text-sm text-center py-4">
                  No se detectaron armas en el inventario.
                  <br />
                  Usa el ataque desarmado.
                </p>
              )}
            </motion.div>
          )}

          {activeTab === 'spells' && (
            <motion.div
              key="spells"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-2 space-y-1"
            >
              {spellOptions.map((option, i) => (
                <OptionButton
                  key={`spell-${i}`}
                  option={option}
                  isSelected={selectedOption?.name === option.name}
                  onClick={() => setSelectedOption(option)}
                  damageIcon={getDamageIcon(option.damageType)}
                />
              ))}

              {spellOptions.length === 0 && (
                <p className="text-stone-500 text-sm text-center py-4">
                  No se detectaron hechizos conocidos.
                  <br />
                  Los hechizos se detectan del inventario o clase.
                </p>
              )}
            </motion.div>
          )}

          {activeTab === 'abilities' && (
            <motion.div
              key="abilities"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-2"
            >
              <p className="text-stone-500 text-sm text-center py-4">
                {isEn ? 'Special class abilities will be added' : 'Las habilidades especiales de clase se agregarán'}
                <br />
                {isEn ? 'automatically based on your archetype.' : 'automáticamente según tu arquetipo.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer con botón de confirmar */}
      <div className="p-3 border-t border-gold-dim/30 bg-stone-800/50">
        <button
          onClick={handleConfirm}
          disabled={!selectedOption}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-heading transition-all ${
            selectedOption
              ? 'bg-gold text-stone-900 hover:bg-gold-bright'
              : 'bg-stone-700 text-stone-500 cursor-not-allowed'
          }`}
        >
          <Target className="w-5 h-5" />
          {selectedOption ? (isEn ? `Attack with ${selectedOption.name}` : `Atacar con ${selectedOption.name}`) : (isEn ? 'Select an attack' : 'Selecciona un ataque')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

interface OptionButtonProps {
  option: AttackOption
  isSelected: boolean
  onClick: () => void
  damageIcon: React.ReactNode
}

function OptionButton({ option, isSelected, onClick, damageIcon }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${
        isSelected
          ? 'bg-gold/20 border border-gold'
          : 'bg-stone-800/50 border border-transparent hover:bg-stone-800 hover:border-stone-600'
      }`}
    >
      <div className={`p-2 rounded-lg ${isSelected ? 'bg-gold/30' : 'bg-stone-700'}`}>
        {option.type === 'weapon' && <Sword className="w-5 h-5 text-stone-300" />}
        {option.type === 'spell' && <Wand2 className="w-5 h-5 text-purple-400" />}
        {option.type === 'ability' && <Sparkles className="w-5 h-5 text-blue-400" />}
        {option.type === 'unarmed' && <span className="text-xl">👊</span>}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-heading ${isSelected ? 'text-gold' : 'text-stone-200'}`}>
            {option.name}
          </span>
          {damageIcon}
        </div>

        <div className="flex items-center gap-3 mt-1 text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <span className="text-red-400">{option.damage}</span>
            <span>{option.damageType}</span>
          </span>
          <span>|</span>
          <span>{option.range}</span>
        </div>

        {option.description && (
          <p className="text-xs text-stone-500 mt-1 line-clamp-1">
            {option.description}
          </p>
        )}
      </div>

      {isSelected && (
        <div className="text-gold">
          <ChevronRight className="w-5 h-5" />
        </div>
      )}
    </button>
  )
}

export default WeaponSelector
