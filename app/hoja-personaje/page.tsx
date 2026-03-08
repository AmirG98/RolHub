'use client'

import { useState, useRef } from 'react'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Download, Upload, FileText, Plus, Trash2, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

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

  const saveToJSON = () => {
    const dataStr = JSON.stringify(character, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const fileName = `${character.name || 'personaje'}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', fileName)
    linkElement.click()
  }

  const downloadPDF = async () => {
    if (!sheetRef.current) return

    setGeneratingPDF(true)

    try {
      // Crear un div temporal con estilos específicos para el PDF
      const pdfContent = document.createElement('div')
      pdfContent.innerHTML = `
        <div style="
          width: 595px;
          padding: 40px;
          background: linear-gradient(135deg, #F4E8C1 0%, #D4B896 100%);
          font-family: Georgia, serif;
          color: #1C1208;
        ">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px double #C9A84C; padding-bottom: 20px;">
            <h1 style="font-size: 28px; color: #8B6914; margin: 0; letter-spacing: 2px;">
              📜 HOJA DE PERSONAJE
            </h1>
            <p style="font-size: 12px; color: #666; margin-top: 5px;">RPG Hub - Narrador Autónomo</p>
          </div>

          <!-- Info básica -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; gap: 20px;">
            <div style="flex: 2;">
              <div style="background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px; border: 1px solid #C9A84C;">
                <p style="margin: 0 0 5px 0; font-size: 11px; color: #666;">NOMBRE</p>
                <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1C1208;">${character.name || 'Sin nombre'}</p>
              </div>
            </div>
            <div style="flex: 1;">
              <div style="background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px; border: 1px solid #C9A84C;">
                <p style="margin: 0 0 5px 0; font-size: 11px; color: #666;">ARQUETIPO</p>
                <p style="margin: 0; font-size: 16px; font-weight: bold; color: #8B6914;">${character.archetype || 'Sin definir'}</p>
              </div>
            </div>
          </div>

          <!-- Nivel y XP -->
          <div style="display: flex; gap: 15px; margin-bottom: 25px;">
            <div style="flex: 1; background: #1C1208; color: #F4E8C1; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #C9A84C;">NIVEL</p>
              <p style="margin: 0; font-size: 32px; font-weight: bold;">${character.level}</p>
            </div>
            <div style="flex: 1; background: #1C1208; color: #F4E8C1; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #C9A84C;">EXPERIENCIA</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold;">${character.experience} XP</p>
            </div>
            <div style="flex: 1; background: linear-gradient(135deg, #8B1A1A 0%, #5C1010 100%); color: #F4E8C1; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #F4E8C1;">PUNTOS DE VIDA</p>
              <p style="margin: 0; font-size: 28px; font-weight: bold;">${character.hp} / ${character.maxHp}</p>
            </div>
          </div>

          <!-- Atributos -->
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 14px; color: #8B6914; margin: 0 0 15px 0; border-bottom: 1px solid #C9A84C; padding-bottom: 5px;">
              ⚔️ ATRIBUTOS
            </h2>
            <div style="display: flex; gap: 10px;">
              ${[
                { name: 'COMBATE', value: character.combat, color: '#8B1A1A' },
                { name: 'EXPLORACIÓN', value: character.exploration, color: '#1A3A2A' },
                { name: 'SOCIAL', value: character.social, color: '#C9A84C' },
                { name: 'CONOCIMIENTO', value: character.lore, color: '#4A3C2A' }
              ].map(stat => `
                <div style="flex: 1; background: ${stat.color}; color: white; padding: 12px; border-radius: 8px; text-align: center;">
                  <p style="margin: 0 0 5px 0; font-size: 9px; letter-spacing: 1px;">${stat.name}</p>
                  <p style="margin: 0; font-size: 28px; font-weight: bold;">${stat.value}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Condiciones -->
          ${character.conditions.length > 0 ? `
            <div style="margin-bottom: 25px;">
              <h2 style="font-size: 14px; color: #8B6914; margin: 0 0 10px 0; border-bottom: 1px solid #C9A84C; padding-bottom: 5px;">
                ⚡ CONDICIONES ACTIVAS
              </h2>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${character.conditions.map(c => `
                  <span style="background: #8B1A1A; color: white; padding: 5px 12px; border-radius: 15px; font-size: 11px;">
                    ${c}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Inventario -->
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 14px; color: #8B6914; margin: 0 0 10px 0; border-bottom: 1px solid #C9A84C; padding-bottom: 5px;">
              🎒 INVENTARIO
            </h2>
            <div style="background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px; border: 1px solid #C9A84C; min-height: 60px;">
              ${character.inventory.filter(i => i).length > 0
                ? `<ul style="margin: 0; padding-left: 20px; columns: 2; column-gap: 20px;">
                    ${character.inventory.filter(i => i).map(item => `
                      <li style="font-size: 12px; margin-bottom: 5px;">${item}</li>
                    `).join('')}
                  </ul>`
                : '<p style="color: #666; font-style: italic; margin: 0; font-size: 12px;">Inventario vacío</p>'
              }
            </div>
          </div>

          <!-- Historia -->
          ${character.backstory ? `
            <div style="margin-bottom: 25px;">
              <h2 style="font-size: 14px; color: #8B6914; margin: 0 0 10px 0; border-bottom: 1px solid #C9A84C; padding-bottom: 5px;">
                📖 HISTORIA
              </h2>
              <div style="background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px; border: 1px solid #C9A84C;">
                <p style="margin: 0; font-size: 11px; line-height: 1.6; white-space: pre-wrap;">${character.backstory}</p>
              </div>
            </div>
          ` : ''}

          <!-- Notas -->
          ${character.notes ? `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 14px; color: #8B6914; margin: 0 0 10px 0; border-bottom: 1px solid #C9A84C; padding-bottom: 5px;">
                📝 NOTAS DE SESIÓN
              </h2>
              <div style="background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px; border: 1px solid #C9A84C;">
                <p style="margin: 0; font-size: 11px; line-height: 1.6; white-space: pre-wrap;">${character.notes}</p>
              </div>
            </div>
          ` : ''}

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #C9A84C;">
            <p style="margin: 0; font-size: 10px; color: #666;">
              Generado con RPG Hub • ${new Date().toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      `

      document.body.appendChild(pdfContent)

      const canvas = await html2canvas(pdfContent.firstElementChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F4E8C1'
      })

      document.body.removeChild(pdfContent)

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      })

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
      pdf.save(`${character.name || 'personaje'}_ficha.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF. Por favor, intenta de nuevo.')
    } finally {
      setGeneratingPDF(false)
    }
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
      <div className="max-w-6xl mx-auto p-4 md:p-8 content-wrapper">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="font-title text-3xl md:text-5xl text-gold-bright mb-2 glow-effect-on-hover">
            📜 Hoja de Personaje
          </h1>
          <p className="font-ui text-sm md:text-base text-parchment/80">
            Crea y gestiona tu personaje de rol
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
          <RunicButton
            variant="primary"
            onClick={downloadPDF}
            disabled={generatingPDF}
            className="text-sm md:text-base"
          >
            {generatingPDF ? (
              <>
                <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <FileText className="inline-block mr-2 h-4 w-4" />
                Descargar PDF
              </>
            )}
          </RunicButton>
          <RunicButton variant="secondary" onClick={saveToJSON} className="text-sm md:text-base">
            <Download className="inline-block mr-2 h-4 w-4" />
            Guardar JSON
          </RunicButton>
          <label className="cursor-pointer">
            <div className="inline-block">
              <RunicButton variant="secondary" className="text-sm md:text-base">
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

        <div ref={sheetRef} className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Columna izquierda */}
          <div className="space-y-4 md:space-y-6">
            {/* Info básica */}
            <div className="glass-panel-dark rounded-lg p-4 md:p-6">
              <h2 className="font-heading text-xl md:text-2xl text-gold mb-3 md:mb-4">Información Básica</h2>

              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="font-ui text-parchment text-sm mb-1 md:mb-2 block">Nombre</label>
                  <input
                    type="text"
                    value={character.name}
                    onChange={(e) => updateCharacter('name', e.target.value)}
                    placeholder="Nombre del personaje"
                    className="w-full glass-panel px-3 md:px-4 py-2 rounded-lg font-body text-sm md:text-base text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="font-ui text-parchment text-sm mb-1 md:mb-2 block">Arquetipo/Clase</label>
                  <input
                    type="text"
                    value={character.archetype}
                    onChange={(e) => updateCharacter('archetype', e.target.value)}
                    placeholder="Ej: Guerrero, Mago, Pícaro"
                    className="w-full glass-panel px-3 md:px-4 py-2 rounded-lg font-body text-sm md:text-base text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="font-ui text-parchment text-sm mb-1 md:mb-2 block">Nivel</label>
                    <input
                      type="number"
                      value={character.level}
                      onChange={(e) => updateCharacter('level', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full glass-panel px-3 md:px-4 py-2 rounded-lg font-heading text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                  <div>
                    <label className="font-ui text-parchment text-sm mb-1 md:mb-2 block">Experiencia</label>
                    <input
                      type="number"
                      value={character.experience}
                      onChange={(e) => updateCharacter('experience', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full glass-panel px-3 md:px-4 py-2 rounded-lg font-heading text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Puntos de vida */}
            <div className="glass-panel-dark rounded-lg p-4 md:p-6">
              <h2 className="font-heading text-xl md:text-2xl text-gold mb-3 md:mb-4">Puntos de Vida</h2>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                <div>
                  <label className="font-ui text-parchment text-sm mb-1 md:mb-2 block">HP Actual</label>
                  <input
                    type="number"
                    value={character.hp}
                    onChange={(e) => updateCharacter('hp', parseInt(e.target.value) || 0)}
                    className="w-full glass-panel px-3 md:px-4 py-2 rounded-lg font-heading text-xl md:text-2xl text-blood focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="font-ui text-parchment text-sm mb-1 md:mb-2 block">HP Máximo</label>
                  <input
                    type="number"
                    value={character.maxHp}
                    onChange={(e) => updateCharacter('maxHp', parseInt(e.target.value) || 1)}
                    className="w-full glass-panel px-3 md:px-4 py-2 rounded-lg font-heading text-xl md:text-2xl text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              {/* Barra de HP visual */}
              <div className="glass-panel p-2 rounded-lg">
                <div className="relative h-5 md:h-6 bg-shadow rounded overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blood to-gold-bright transition-all duration-300"
                    style={{ width: `${Math.min((character.hp / character.maxHp) * 100, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-ui text-parchment text-xs md:text-sm font-bold drop-shadow-lg">
                      {character.hp} / {character.maxHp}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="glass-panel-dark rounded-lg p-4 md:p-6">
              <h2 className="font-heading text-xl md:text-2xl text-gold mb-3 md:mb-4">Atributos</h2>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {(['combat', 'exploration', 'social', 'lore'] as const).map((stat) => (
                  <div key={stat}>
                    <label className="font-ui text-parchment text-xs md:text-sm mb-1 md:mb-2 block capitalize">
                      {stat === 'combat' ? 'Combate' :
                       stat === 'exploration' ? 'Exploración' :
                       stat === 'social' ? 'Social' : 'Conocimiento'}
                    </label>
                    <input
                      type="number"
                      value={character[stat]}
                      onChange={(e) => updateCharacter(stat, parseInt(e.target.value) || 0)}
                      className="w-full glass-panel px-3 md:px-4 py-2 rounded-lg font-heading text-lg md:text-xl text-gold-bright focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Condiciones */}
            <div className="glass-panel-dark rounded-lg p-4 md:p-6">
              <h2 className="font-heading text-xl md:text-2xl text-gold mb-3 md:mb-4">Condiciones</h2>

              <div className="flex gap-2 mb-3 md:mb-4">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                  placeholder="Ej: Envenenado, Exhausto"
                  className="flex-1 glass-panel px-3 md:px-4 py-2 rounded-lg font-body text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <RunicButton variant="primary" onClick={addCondition} className="px-3">
                  <Plus className="h-4 w-4" />
                </RunicButton>
              </div>

              <div className="flex flex-wrap gap-2">
                {character.conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="glass-panel px-2 md:px-3 py-1 rounded-full flex items-center gap-1 md:gap-2"
                  >
                    <span className="font-ui text-xs md:text-sm text-parchment">{condition}</span>
                    <button
                      onClick={() => removeCondition(condition)}
                      className="text-blood hover:text-gold-bright transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {character.conditions.length === 0 && (
                  <p className="font-ui text-parchment/40 text-xs md:text-sm">Sin condiciones</p>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4 md:space-y-6">
            {/* Inventario */}
            <div className="glass-panel-dark rounded-lg p-4 md:p-6">
              <h2 className="font-heading text-xl md:text-2xl text-gold mb-3 md:mb-4">Inventario</h2>

              <div className="flex gap-2 mb-3 md:mb-4">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInventoryItem()}
                  placeholder="Agregar item"
                  className="flex-1 glass-panel px-3 md:px-4 py-2 rounded-lg font-body text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <RunicButton variant="primary" onClick={addInventoryItem} className="px-3">
                  <Plus className="h-4 w-4" />
                </RunicButton>
              </div>

              <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
                {character.inventory.map((item, index) => (
                  item && (
                    <div
                      key={index}
                      className="glass-panel px-3 md:px-4 py-2 rounded-lg flex items-center justify-between"
                    >
                      <span className="font-body text-sm text-parchment">{item}</span>
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
                  <p className="font-ui text-parchment/40 text-xs md:text-sm text-center py-4">
                    Inventario vacío
                  </p>
                )}
              </div>
            </div>

            {/* Historia */}
            <div className="glass-panel-dark rounded-lg p-4 md:p-6">
              <h2 className="font-heading text-xl md:text-2xl text-gold mb-3 md:mb-4">Historia</h2>
              <textarea
                value={character.backstory}
                onChange={(e) => updateCharacter('backstory', e.target.value)}
                placeholder="Cuenta la historia de tu personaje..."
                rows={5}
                className="w-full glass-panel px-3 md:px-4 py-2 rounded-lg font-body text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold resize-none"
              />
            </div>

            {/* Notas */}
            <div className="glass-panel-dark rounded-lg p-4 md:p-6">
              <h2 className="font-heading text-xl md:text-2xl text-gold mb-3 md:mb-4">Notas de Sesión</h2>
              <textarea
                value={character.notes}
                onChange={(e) => updateCharacter('notes', e.target.value)}
                placeholder="Anota eventos importantes, misiones, NPCs conocidos..."
                rows={6}
                className="w-full glass-panel px-3 md:px-4 py-2 rounded-lg font-body text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
