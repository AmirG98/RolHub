'use client'

import { useState, useCallback } from 'react'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Download, FileText, RotateCcw, Upload, Loader2, ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Importar DnD5eCharacterCreator dinámicamente (usa muchos datos)
const DnD5eCharacterCreator = dynamic(
  () => import('@/components/onboarding/DnD5eCharacterCreator').then(mod => mod.DnD5eCharacterCreator),
  { ssr: false, loading: () => <CreatorLoading /> }
)

// Importar DnD5eCharacterSheet dinámicamente
const DnD5eCharacterSheet = dynamic(
  () => import('@/components/game/DnD5eCharacterSheet').then(mod => mod.DnD5eCharacterSheet),
  { ssr: false, loading: () => <SheetLoading /> }
)

interface CreatedCharacter {
  name: string
  description: string
  archetypeId: string
  archetypeName: string
  stats: Record<string, unknown>
  inventory: string[]
  level: number
  subclass?: { id: string; name: string }
}

export default function HojaPersonajePage() {
  const [createdCharacter, setCreatedCharacter] = useState<CreatedCharacter | null>(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  // Handler cuando se completa la creación
  const handleCharacterCreated = useCallback((character: CreatedCharacter) => {
    setCreatedCharacter(character)
    // Guardar en localStorage para persistencia
    try {
      localStorage.setItem('rolhub_character_sheet', JSON.stringify(character))
    } catch {
      // Silenciar error de storage
    }
  }, [])

  // Cargar personaje guardado al montar
  useState(() => {
    try {
      const saved = localStorage.getItem('rolhub_character_sheet')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.name && parsed.stats) {
          setCreatedCharacter(parsed)
        }
      }
    } catch {
      // Silenciar error
    }
  })

  // Exportar como JSON
  const saveToJSON = () => {
    if (!createdCharacter) return
    const dataStr = JSON.stringify(createdCharacter, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const fileName = `${createdCharacter.name || 'personaje'}_dnd5e.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', fileName)
    linkElement.click()
  }

  // Cargar desde JSON
  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.name && data.stats) {
            setCreatedCharacter(data)
            localStorage.setItem('rolhub_character_sheet', JSON.stringify(data))
          } else {
            alert('El archivo no contiene un personaje D&D 5e válido')
          }
        } catch {
          alert('Error al cargar el archivo')
        }
      }
      reader.readAsText(file)
    }
  }

  // Exportar como PDF
  const downloadPDF = async () => {
    const sheetEl = document.getElementById('character-sheet-content')
    if (!sheetEl) return

    setGeneratingPDF(true)
    try {
      const canvas = await html2canvas(sheetEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0D0A05',
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
      pdf.save(`${createdCharacter?.name || 'personaje'}_dnd5e.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  // Crear nuevo personaje
  const handleNewCharacter = () => {
    setCreatedCharacter(null)
    try {
      localStorage.removeItem('rolhub_character_sheet')
    } catch {
      // Silenciar
    }
  }

  // === MODO VISUALIZACIÓN: Personaje ya creado ===
  if (createdCharacter) {
    const stats = createdCharacter.stats as any
    const worldState = {
      party: {
        [createdCharacter.name]: {
          hp: `${stats.hp || 20}/${stats.maxHp || 20}`,
          level: createdCharacter.level,
          experience: 0,
          conditions: [],
          active_effects: [],
          inventory: createdCharacter.inventory || [],
          relationships: {},
        },
      },
    }

    return (
      <div className="min-h-screen particle-bg">
        <div className="max-w-4xl mx-auto p-4 md:p-8 content-wrapper">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-parchment/60 hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-ui text-sm">Inicio</span>
            </Link>
            <h1 className="font-title text-2xl md:text-3xl text-gold-bright">
              Hoja de Personaje
            </h1>
            <div className="w-16" /> {/* Spacer */}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6">
            <RunicButton variant="primary" onClick={downloadPDF} disabled={generatingPDF}>
              {generatingPDF ? (
                <><Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />Generando...</>
              ) : (
                <><FileText className="inline-block mr-2 h-4 w-4" />Descargar PDF</>
              )}
            </RunicButton>
            <RunicButton variant="secondary" onClick={saveToJSON}>
              <Download className="inline-block mr-2 h-4 w-4" />
              Guardar JSON
            </RunicButton>
            <RunicButton variant="secondary" onClick={handleNewCharacter}>
              <RotateCcw className="inline-block mr-2 h-4 w-4" />
              Crear Otro
            </RunicButton>
          </div>

          {/* Hoja de personaje D&D 5e */}
          <div id="character-sheet-content">
            <DnD5eCharacterSheet
              name={createdCharacter.name}
              archetype={`${stats.raceName || ''} ${stats.className || createdCharacter.archetypeName}`.trim()}
              stats={stats}
              inventory={createdCharacter.inventory}
              conditions={[]}
              tutorialLevel="experienced"
            />
          </div>
        </div>
      </div>
    )
  }

  // === MODO CREACIÓN: Sin personaje ===
  return (
    <div className="min-h-screen particle-bg">
      <div className="max-w-4xl mx-auto p-4 md:p-8 content-wrapper">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-parchment/60 hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-ui text-sm">Inicio</span>
          </Link>
          <h1 className="font-title text-2xl md:text-3xl text-gold-bright">
            Crear Personaje D&D 5e
          </h1>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <RunicButton variant="secondary" className="text-xs">
                <Upload className="inline-block mr-1 h-3 w-3" />
                Cargar
              </RunicButton>
              <input type="file" accept=".json" onChange={loadFromFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* Creador D&D 5e */}
        <DnD5eCharacterCreator
          onComplete={handleCharacterCreated}
          onBack={() => window.history.back()}
        />
      </div>
    </div>
  )
}

function CreatorLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center text-gold animate-pulse">
        <div className="text-4xl mb-3">⚔️</div>
        <p className="font-heading text-sm">Preparando el grimorio de creación...</p>
      </div>
    </div>
  )
}

function SheetLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center text-gold animate-pulse">
        <div className="text-4xl mb-3">📜</div>
        <p className="font-heading text-sm">Desplegando la hoja de personaje...</p>
      </div>
    </div>
  )
}
