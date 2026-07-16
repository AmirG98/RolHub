/**
 * GATE ANTI-IP: ningún contenido del producto puede contener nombres de
 * franquicias protegidas. Este test es la razón por la que Paddle rechazó
 * el dominio ("use of copyrighted content without appropriate authorisation")
 * no puede volver a pasar.
 *
 * Scope: contenido del producto (lores, skill trees, compendios, bestiario,
 * constants, prompts de arte, map data, páginas de guías). NO aplica a:
 * - ids internos/nombres de archivo (slugs no user-facing)
 * - menciones editoriales de VIDEOJUEGOS en guías comparativas (Skyrim,
 *   Baldur's Gate como juegos citados — uso nominativo)
 * - mitología/dominio público (Baldur nórdico en vikingos, Lovecraft)
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'

// Términos de franquicias que NO pueden aparecer en contenido del producto
const BLOCKLIST = [
  // Tolkien Estate
  'Tierra Media', 'Middle-earth', 'Tolkien', 'tolkien', 'Sauron', 'Mordor',
  'Rivendel', 'Rivendell', 'Lothlórien', 'Hobbiton', 'Gandalf', 'Frodo',
  'Nazgûl', 'mithril', 'lembas', 'Pony Pisador', 'Prancing Pony', 'Bolsón',
  'Mithrandir', 'la Comarca', 'Minas Tirith', 'Fangorn', 'Montañas Nubladas',
  'Misty Mountains', 'Aragorn', 'Legolas', 'Gimli', 'Bilbo', 'Galadriel',
  'Elrond', 'Saruman', 'Gollum', 'Boromir',
  // Disney/Lucasfilm
  'Star Wars', 'star wars', 'Jedi', 'Sith', 'Tatooine', 'Mos Eisley',
  'Skywalker', 'lightsaber', 'sable de luz', 'wookiee', 'Coruscant',
  'Halcón Milenario', 'Millennium Falcon', 'padawan', 'holocrón', 'kyber',
  'mandaloriano', 'Estrella de la Muerte', 'Chewbacca', 'Han Solo', 'Obi-Wan',
  // Wizards of the Coast (Forgotten Realms — el SRD NO licencia el setting)
  'Reinos Olvidados', 'Forgotten Realms', 'Waterdeep', 'Faerûn', 'Faerun',
  'Portal Bostezante', 'Yawning Portal', 'Neverwinter', 'Menzoberranzan',
  'Undermountain', 'Zhentarim', 'Candlekeep', 'Phandalin', 'Lolth', 'Drizzt',
  'Elminster', 'Mystra', 'drow', 'Drow', 'beholder', 'illithid', 'mind flayer',
  // Sarah J. Maas / ACOTAR / Fourth Wing
  'Velaris', 'Prythian', 'Illyrian', 'illyriana', 'illyriano', 'ACOTAR',
  'Hybern', 'Amarantha', 'Rhysand', 'Feyre', 'Basgiath',
  // Personajes-ejemplo de otras franquicias en contenido propio
  'Hermione', 'Professor X', 'Darth',
]

// Contenido del producto a escanear
const CONTENT_GLOBS = [
  'data/lores/*.json',
  'data/skill-trees/**/*.json',
  'data/compendium/*.ts',
  'data/bestiary/*.ts',
  'data/dnd5e/*.json',
  'lib/constants/lores.ts',
  'lib/fal/*.ts',
  'lib/audio/ambient-prompts.ts',
  'lib/character/description-templates.ts',
  'lib/maps/lore-map-data.ts',
  'lib/game/help-content.ts',
  'app/guias/**/*.tsx',
  'app/compendio/**/*.tsx',
  'app/play-guest/page.tsx',
  'components/onboarding/*.tsx',
]

// Excepciones puntuales verificadas a mano (uso nominativo o dominio público):
// archivo → términos permitidos en ese archivo
const ALLOWED: Record<string, string[]> = {
  // Comparaciones editoriales de videojuegos (nominativo)
  'app/guias/rol-vs-videojuegos/page.tsx': ['Baldur'],
  'lib/i18n/translations.ts': ['Baldur'],
  // Baldur dios nórdico (mitología, dominio público)
  'data/lores/vikingos.json': ['Baldur'],
}

function wordHit(text: string, term: string): number {
  const re = new RegExp(`(?<![\\wÀ-ÿ])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\wÀ-ÿ])`, 'g')
  return (text.match(re) || []).length
}

describe('Gate anti-IP: contenido del producto sin franquicias protegidas', () => {
  const files = [...new Set(CONTENT_GLOBS.flatMap((g) => globSync(g, { cwd: process.cwd(), nodir: true })))]

  it('hay archivos de contenido para escanear', () => {
    expect(files.length).toBeGreaterThan(50)
  })

  it.each(files.map((f) => [f]))('%s está limpio de IP protegida', (file) => {
    const text = fs.readFileSync(path.join(process.cwd(), file), 'utf-8')
    const allowed = new Set(ALLOWED[file] || [])
    const violations: string[] = []
    for (const term of BLOCKLIST) {
      if (allowed.has(term)) continue
      const n = wordHit(text, term)
      if (n > 0) violations.push(`"${term}"×${n}`)
    }
    expect(violations, `IP protegida en ${file}: ${violations.join(', ')}`).toEqual([])
  })
})
