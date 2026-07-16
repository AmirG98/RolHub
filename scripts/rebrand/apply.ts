/**
 * Aplica el mapa de renombres IP → nombres originales (rename-map.json).
 *
 * - Reemplazo con límites de palabra ((?<!\w)term(?!\w)) para no tocar
 *   substrings dentro de otras palabras.
 * - Orden: términos más largos primero (evita que "Bolsón" pise "Bolsón Cerrado").
 * - El scope 'global' aplica la unión de todos los maps de lore EXCEPTO
 *   "Baldur" suelto (en vikingos es mitología nórdica legítima) — las frases
 *   completas ("Puerta de Baldur") sí van global.
 *
 * Uso: npx tsx scripts/rebrand/apply.ts [--dry]
 */
import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'

const ROOT = path.join(__dirname, '..', '..')
const DRY = process.argv.includes('--dry')

interface Scope { files: string[]; map?: Record<string, string> }
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'rename-map.json'), 'utf-8'))
const scopes: Record<string, Scope> = config.scopes

// Términos que NO van en el scope global (colisiones legítimas fuera de su lore)
const GLOBAL_EXCLUDE = new Set(['Baldur'])

function buildGlobalMap(): Record<string, string> {
  const merged: Record<string, string> = {}
  for (const key of ['lotr', 'starwars', 'dnd', 'romantasy']) {
    for (const [from, to] of Object.entries(scopes[key].map || {})) {
      if (GLOBAL_EXCLUDE.has(from)) continue
      merged[from] = to
    }
  }
  return merged
}

function applyMap(text: string, map: Record<string, string>): { text: string; hits: Record<string, number> } {
  const hits: Record<string, number> = {}
  // más largos primero
  const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length)
  let out = text
  for (const [from, to] of entries) {
    const re = new RegExp(`(?<![\\wÀ-ÿ])${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\wÀ-ÿ])`, 'g')
    const n = (out.match(re) || []).length
    if (n > 0) {
      out = out.replace(re, to)
      hits[from] = n
    }
  }
  return { text: out, hits }
}

let totalFiles = 0
let totalHits = 0

for (const [scopeName, scope] of Object.entries(scopes)) {
  const map = scopeName === 'global' ? buildGlobalMap() : scope.map || {}
  if (Object.keys(map).length === 0) continue

  const files = scope.files.flatMap((g) => globSync(g, { cwd: ROOT, nodir: true }))
  for (const rel of [...new Set(files)]) {
    const full = path.join(ROOT, rel)
    if (!fs.existsSync(full)) continue
    const original = fs.readFileSync(full, 'utf-8')
    const { text, hits } = applyMap(original, map)
    const n = Object.values(hits).reduce((a, b) => a + b, 0)
    if (n === 0) continue
    totalFiles++
    totalHits += n
    console.log(`[${scopeName}] ${rel}: ${n} reemplazos (${Object.entries(hits).slice(0, 5).map(([k, v]) => `${k}×${v}`).join(', ')}${Object.keys(hits).length > 5 ? '…' : ''})`)
    if (!DRY) fs.writeFileSync(full, text)
  }
}

console.log(`\n${DRY ? '[DRY RUN] ' : ''}Archivos tocados: ${totalFiles} · Reemplazos: ${totalHits}`)
