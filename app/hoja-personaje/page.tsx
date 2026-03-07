'use client'

import { useState } from 'react'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Download, Upload, Save, Plus, Trash2 } from 'lucide-react'

interface CharacterSheet {
  name: string
  archetype: string
  level: number
  experience: number
  hp: number
  maxHp: number
  combat: number
  exploration: number
  social: number
  lore: number
  inventory: string[]
  conditions: string[]
  backstory: string
  notes: string
}

export default function HojaPersonajePage() {
  const [character, setCharacter] = useState<CharacterSheet>({
    name: '',
    archetype: '',
    level: 1,
    experience: 0,
    hp: 20,
    maxHp: 20,
    combat: 1,
    exploration: 1,
    social: 1,
    lore: 1,
    inventory: [''],
    conditions: [],
    backstory: '',
    notes: '',
  })

  const [newItem, setNewItem] = useState('')
  const [newCondition, setNewCondition] = useState('')

  const updateCharacter = (field: keyof CharacterSheet, value: any) => {
    setCharacter({ ...character, [field]: value })
  }

  const addInventoryItem = () => {
    if (newItem.trim()) {
      updateCharacter('inventory', [...character.inventory, newItem])
      setNewItem('')
    }
  }

  const removeInventoryItem = (index: number) => {
    updateCharacter('inventory', character.inventory.filter((_, i) => i !== index))
  }

  const addCondition = () => {
    if (newCondition.trim() && !character.conditions.includes(newCondition)) {
      updateCharacter('conditions', [...character.conditions, newCondition])
      setNewCondition('')
    }
  }

  const removeCondition = (condition: string) => {
    updateCharacter('conditions', character.conditions.filter(c => c !== condition))
  }

  const saveToFile = () => {
    const dataStr = JSON.stringify(character, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const fileName = `${character.name || 'personaje'}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', fileName)
    linkElement.click()
  }

  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          setCharacter(data)
        } catch (error) {
          alert('Error al cargar el archivo')
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen particle-bg">
      <div className="max-w-6xl mx-auto p-8 content-wrapper">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-title text-5xl text-gold-bright mb-2 glow-effect-on-hover">
            📜 Hoja de Personaje
          </h1>
          <p className="font-ui text-parchment/80">
            Crea y gestiona tu personaje de rol
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-center gap-4 mb-8">
          <RunicButton variant="secondary" onClick={saveToFile}>
            <Download className="inline-block mr-2 h-4 w-4" />
            Descargar
          </RunicButton>
          <label className="cursor-pointer">
            <div className="inline-block">
              <RunicButton variant="secondary">
                <Upload className="inline-block mr-2 h-4 w-4" />
                Cargar
              </RunicButton>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={loadFromFile}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Columna izquierda */}
          <div className="space-y-6">
            {/* Info básica */}
            <div className="glass-panel-dark rounded-lg p-6">
              <h2 className="font-heading text-2xl text-gold mb-4">Información Básica</h2>

              <div className="space-y-4">
                <div>
                  <label className="font-ui text-parchment text-sm mb-2 block">Nombre</label>
                  <input
                    type="text"
                    value={character.name}
                    onChange={(e) => updateCharacter('name', e.target.value)}
                    placeholder="Nombre del personaje"
                    className="w-full glass-panel px-4 py-2 rounded-lg font-body text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="font-ui text-parchment text-sm mb-2 block">Arquetipo/Clase</label>
                  <input
                    type="text"
                    value={character.archetype}
                    onChange={(e) => updateCharacter('archetype', e.target.value)}
                    placeholder="Ej: Guerrero, Mago, Pícaro"
                    className="w-full glass-panel px-4 py-2 rounded-lg font-body text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-ui text-parchment text-sm mb-2 block">Nivel</label>
                    <input
                      type="number"
                      value={character.level}
                      onChange={(e) => updateCharacter('level', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full glass-panel px-4 py-2 rounded-lg font-heading text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                  <div>
                    <label className="font-ui text-parchment text-sm mb-2 block">Experiencia</label>
                    <input
                      type="number"
                      value={character.experience}
                      onChange={(e) => updateCharacter('experience', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full glass-panel px-4 py-2 rounded-lg font-heading text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Puntos de vida */}
            <div className="glass-panel-dark rounded-lg p-6">
              <h2 className="font-heading text-2xl text-gold mb-4">Puntos de Vida</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="font-ui text-parchment text-sm mb-2 block">HP Actual</label>
                  <input
                    type="number"
                    value={character.hp}
                    onChange={(e) => updateCharacter('hp', parseInt(e.target.value) || 0)}
                    className="w-full glass-panel px-4 py-2 rounded-lg font-heading text-2xl text-blood focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="font-ui text-parchment text-sm mb-2 block">HP Máximo</label>
                  <input
                    type="number"
                    value={character.maxHp}
                    onChange={(e) => updateCharacter('maxHp', parseInt(e.target.value) || 1)}
                    className="w-full glass-panel px-4 py-2 rounded-lg font-heading text-2xl text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              {/* Barra de HP visual */}
              <div className="glass-panel p-2 rounded-lg">
                <div className="relative h-6 bg-shadow rounded overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blood to-gold-bright transition-all duration-300"
                    style={{ width: `${Math.min((character.hp / character.maxHp) * 100, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-ui text-parchment text-sm font-bold drop-shadow-lg">
                      {character.hp} / {character.maxHp}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="glass-panel-dark rounded-lg p-6">
              <h2 className="font-heading text-2xl text-gold mb-4">Atributos</h2>

              <div className="grid grid-cols-2 gap-4">
                {(['combat', 'exploration', 'social', 'lore'] as const).map((stat) => (
                  <div key={stat}>
                    <label className="font-ui text-parchment text-sm mb-2 block capitalize">
                      {stat === 'combat' ? 'Combate' :
                       stat === 'exploration' ? 'Exploración' :
                       stat === 'social' ? 'Social' : 'Conocimiento'}
                    </label>
                    <input
                      type="number"
                      value={character[stat]}
                      onChange={(e) => updateCharacter(stat, parseInt(e.target.value) || 0)}
                      className="w-full glass-panel px-4 py-2 rounded-lg font-heading text-xl text-gold-bright focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Condiciones */}
            <div className="glass-panel-dark rounded-lg p-6">
              <h2 className="font-heading text-2xl text-gold mb-4">Condiciones</h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                  placeholder="Ej: Envenenado, Exhausto"
                  className="flex-1 glass-panel px-4 py-2 rounded-lg font-body text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <RunicButton variant="primary" onClick={addCondition}>
                  <Plus className="h-4 w-4" />
                </RunicButton>
              </div>

              <div className="flex flex-wrap gap-2">
                {character.conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="glass-panel px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    <span className="font-ui text-sm text-parchment">{condition}</span>
                    <button
                      onClick={() => removeCondition(condition)}
                      className="text-blood hover:text-gold-bright transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {character.conditions.length === 0 && (
                  <p className="font-ui text-parchment/40 text-sm">Sin condiciones</p>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            {/* Inventario */}
            <div className="glass-panel-dark rounded-lg p-6">
              <h2 className="font-heading text-2xl text-gold mb-4">Inventario</h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInventoryItem()}
                  placeholder="Agregar item"
                  className="flex-1 glass-panel px-4 py-2 rounded-lg font-body text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <RunicButton variant="primary" onClick={addInventoryItem}>
                  <Plus className="h-4 w-4" />
                </RunicButton>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {character.inventory.map((item, index) => (
                  item && (
                    <div
                      key={index}
                      className="glass-panel px-4 py-2 rounded-lg flex items-center justify-between"
                    >
                      <span className="font-body text-parchment">{item}</span>
                      <button
                        onClick={() => removeInventoryItem(index)}
                        className="text-blood hover:text-gold-bright transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                ))}
                {character.inventory.filter(i => i).length === 0 && (
                  <p className="font-ui text-parchment/40 text-sm text-center py-4">
                    Inventario vacío
                  </p>
                )}
              </div>
            </div>

            {/* Historia */}
            <div className="glass-panel-dark rounded-lg p-6">
              <h2 className="font-heading text-2xl text-gold mb-4">Historia</h2>
              <textarea
                value={character.backstory}
                onChange={(e) => updateCharacter('backstory', e.target.value)}
                placeholder="Cuenta la historia de tu personaje..."
                rows={6}
                className="w-full glass-panel px-4 py-2 rounded-lg font-body text-parchment focus:outline-none focus:ring-2 focus:ring-gold resize-none"
              />
            </div>

            {/* Notas */}
            <div className="glass-panel-dark rounded-lg p-6">
              <h2 className="font-heading text-2xl text-gold mb-4">Notas de Sesión</h2>
              <textarea
                value={character.notes}
                onChange={(e) => updateCharacter('notes', e.target.value)}
                placeholder="Anota eventos importantes, misiones, NPCs conocidos..."
                rows={8}
                className="w-full glass-panel px-4 py-2 rounded-lg font-body text-parchment focus:outline-none focus:ring-2 focus:ring-gold resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
