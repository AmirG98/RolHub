/**
 * Generador de abilities bilingües para archetypes que no las tienen.
 *
 * Los 8 lores sin abilities explícitas derivaban UNA ability desde
 * special_ability (string español-only) → jugadores con locale=en veían
 * texto en español. Este script genera 3 abilities {es,en} por archetype:
 * la primera ES el special_ability traducido (continuidad), + 2 temáticas.
 *
 * Escribe las abilities DENTRO de data/lores/<lore>.json (archetypes[].abilities),
 * el mismo formato que DND_CLASSIC y COZY_WITCH ya usan.
 * buildAbilitiesForArchetype las prefiere automáticamente.
 *
 * Uso:
 *   npx tsx scripts/generate-abilities/generate.ts            # todos los faltantes
 *   npx tsx scripts/generate-abilities/generate.ts --lore lotr --force
 *
 * Env: ANTHROPIC_API_KEY. Modelo: DM_MODEL (Sonnet).
 */
import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { validateAbilities } from '../../lib/validation/ability.schema'

const MODEL = process.env.DM_MODEL || 'claude-sonnet-4-6'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const ROOT = path.join(__dirname, '..', '..')

// Lores a procesar (dnd-classic y cozy-witch ya tienen abilities)
const LORE_FILES = [
  'lotr', 'zombies', 'isekai', 'vikingos', 'starwars',
  'cyberpunk', 'lovecraft', 'romantasy',
]

// Ejemplo few-shot del formato exacto (de cozy-witch, cooldown_turns)
const EXAMPLE = JSON.stringify(
  [
    {
      id: 'voz-verde',
      name: { es: 'Voz Verde', en: 'Green Voice' },
      description: {
        es: 'Las plantas te dicen qué necesitan y qué vieron.',
        en: 'Plants tell you what they need and what they saw.',
      },
      kind: 'special',
      resource: 'cooldown_turns',
      cooldownTurns: 3,
      icon: 'leaf',
      tags: ['healing', 'utility'],
    },
  ],
  null,
  2
)

function buildPrompt(loreName: string, archetype: any): string {
  return `Sos un diseñador de juegos de rol. Generá las HABILIDADES INICIALES de un arquetipo de personaje en formato JSON estricto.

## Arquetipo (lore: ${loreName})
${JSON.stringify(
    {
      id: archetype.id,
      name: archetype.name,
      description: archetype.description,
      special_ability: archetype.special_ability,
      starting_stats: archetype.starting_stats,
    },
    null,
    2
  )}

## Reglas
- Generá EXACTAMENTE 3 habilidades.
- LA PRIMERA debe ser el special_ability de arriba, convertido al formato: mismo nombre en español (la parte antes de los dos puntos), traducción natural al inglés, y la descripción traducida fielmente en ambos idiomas.
- Las otras 2 son habilidades temáticas nuevas coherentes con el arquetipo y el lore.
- Todas con resource "cooldown_turns" y cooldownTurns entre 2 y 5.
- name y description SIEMPRE bilingües: {"es": "...", "en": "..."}. Español rioplatense (vos/tenés) para descripciones nuevas; para la traducción del special_ability respetá el texto original.
- id en kebab-case, único.
- kind: "spell" | "trick" | "special". icon: flame|leaf|eye|sword|moon|sparkles|shield|heart|zap.
- tags: 1-2 de combat|utility|social|healing|exploration|stealth.

## Formato exacto (ejemplo)
${EXAMPLE}

Respondé SOLO con el array JSON de 3 habilidades, sin texto adicional ni fences.`
}

async function generateOne(loreName: string, archetype: any, attempt = 1): Promise<any[] | null> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: buildPrompt(loreName, archetype) }],
  })
  const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) {
    console.log(`    ✗ sin JSON (intento ${attempt})`)
    return attempt < 3 ? generateOne(loreName, archetype, attempt + 1) : null
  }
  let parsed: any
  try {
    parsed = JSON.parse(match[0])
  } catch (e: any) {
    console.log(`    ✗ JSON inválido (intento ${attempt}): ${e.message}`)
    return attempt < 3 ? generateOne(loreName, archetype, attempt + 1) : null
  }
  const validation = validateAbilities(parsed)
  if (!validation.ok) {
    console.log(`    ✗ schema (intento ${attempt}): ${validation.issues.slice(0, 2).join(' | ')}`)
    return attempt < 3 ? generateOne(loreName, archetype, attempt + 1) : null
  }
  return parsed
}

interface Args { force: boolean; lore?: string }
function parseArgs(): Args {
  const a = process.argv.slice(2)
  const i = a.indexOf('--lore')
  return { force: a.includes('--force'), lore: i >= 0 ? a[i + 1] : undefined }
}

async function main() {
  const args = parseArgs()
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY requerida')
    process.exit(1)
  }

  let generated = 0
  let skipped = 0
  let failed = 0

  for (const loreFile of LORE_FILES) {
    if (args.lore && args.lore !== loreFile) continue
    const filePath = path.join(ROOT, `data/lores/${loreFile}.json`)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    let changed = false

    for (const archetype of data.archetypes || []) {
      if (Array.isArray(archetype.abilities) && archetype.abilities.length > 0 && !args.force) {
        skipped++
        continue
      }
      console.log(`  ${loreFile}/${archetype.id}…`)
      const abilities = await generateOne(loreFile, archetype)
      if (abilities) {
        archetype.abilities = abilities
        changed = true
        generated++
        console.log(`    ✓ ${abilities.length} abilities (1ª: ${abilities[0].name.es} / ${abilities[0].name.en})`)
      } else {
        failed++
        console.log(`    ✗✗ falló tras reintentos`)
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
      console.log(`  → ${loreFile}.json actualizado`)
    }
  }

  console.log(`\nGenerados: ${generated} · Saltados: ${skipped} · Fallidos: ${failed}`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Generador falló:', err)
  process.exit(1)
})
