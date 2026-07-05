/**
 * Generador de árboles de habilidades con Claude.
 *
 * Para cada arquetipo de cada lore, genera data/skill-trees/<lore>/<arch>.json
 * usando Sonnet + el árbol semilla como few-shot, validando la salida contra
 * el schema Zod y reintentando con el error si falla.
 *
 * Uso:
 *   npx tsx scripts/generate-skill-trees/generate.ts            # todos los faltantes
 *   npx tsx scripts/generate-skill-trees/generate.ts --lore LOTR --force
 *   npx tsx scripts/generate-skill-trees/generate.ts --only lotr:ranger
 *
 * Env: ANTHROPIC_API_KEY. Modelo: DM_MODEL (Sonnet) o el default.
 */
import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { validateSkillTree } from '../../lib/validation/skill-tree.schema'

const MODEL = process.env.DM_MODEL || 'claude-sonnet-4-6'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LORE_FILE_TO_ENUM: Record<string, string> = {
  lotr: 'LOTR',
  zombies: 'ZOMBIES',
  isekai: 'ISEKAI',
  vikingos: 'VIKINGOS',
  starwars: 'STAR_WARS',
  cyberpunk: 'CYBERPUNK',
  lovecraft: 'LOVECRAFT_HORROR',
  'dnd-classic': 'DND_CLASSIC',
  romantasy: 'ROMANTASY',
  'cozy-witch': 'COZY_WITCH',
}

const ROOT = path.join(__dirname, '..', '..')
const SEED = fs.readFileSync(
  path.join(ROOT, 'data/skill-trees/dnd-classic/guild-adventurer.json'),
  'utf-8'
)
const PROMPT_TEMPLATE = fs.readFileSync(path.join(__dirname, 'prompt-template.md'), 'utf-8')

interface Args {
  force: boolean
  lore?: string
  only?: string
}

function parseArgs(): Args {
  const a = process.argv.slice(2)
  const get = (f: string) => {
    const i = a.indexOf(f)
    return i >= 0 ? a[i + 1] : undefined
  }
  return { force: a.includes('--force'), lore: get('--lore'), only: get('--only') }
}

async function generateOne(
  loreFile: string,
  loreEnum: string,
  archetype: any,
  attempt = 1
): Promise<any | null> {
  const prompt = PROMPT_TEMPLATE.replace('{{LORE_ENUM}}', loreEnum)
    .replace('{{ARCHETYPE_ID}}', archetype.id)
    .replace('{{ARCHETYPE_JSON}}', JSON.stringify(archetype, null, 2))
    .replace('{{SEED_TREE}}', SEED)

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.log(`    ✗ sin JSON en la respuesta (intento ${attempt})`)
    return attempt < 3 ? generateOne(loreFile, loreEnum, archetype, attempt + 1) : null
  }

  let parsed: any
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch (e: any) {
    console.log(`    ✗ JSON inválido (intento ${attempt}): ${e.message}`)
    return attempt < 3 ? generateOne(loreFile, loreEnum, archetype, attempt + 1) : null
  }

  // Forzar loreId/archetypeId correctos (por si el modelo los cambia)
  parsed.loreId = loreEnum
  parsed.archetypeId = archetype.id

  const validation = validateSkillTree(parsed)
  if (!validation.ok) {
    console.log(`    ✗ schema falló (intento ${attempt}): ${validation.issues.slice(0, 3).join(' | ')}`)
    if (attempt < 3) {
      // Reintento con feedback del error
      const retryPrompt =
        prompt +
        `\n\nTu intento anterior falló la validación con estos errores:\n${validation.issues.join('\n')}\nCorregilos y devolvé SOLO el JSON válido.`
      const retry = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4000,
        messages: [{ role: 'user', content: retryPrompt }],
      })
      const retryRaw = retry.content[0]?.type === 'text' ? retry.content[0].text : ''
      const rm = retryRaw.match(/\{[\s\S]*\}/)
      if (rm) {
        try {
          const rp = JSON.parse(rm[0])
          rp.loreId = loreEnum
          rp.archetypeId = archetype.id
          if (validateSkillTree(rp).ok) return rp
        } catch {}
      }
      return generateOne(loreFile, loreEnum, archetype, attempt + 2)
    }
    return null
  }

  return parsed
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

  for (const [loreFile, loreEnum] of Object.entries(LORE_FILE_TO_ENUM)) {
    if (args.lore && args.lore !== loreEnum) continue
    const loreData = JSON.parse(fs.readFileSync(path.join(ROOT, `data/lores/${loreFile}.json`), 'utf-8'))
    const archetypes = loreData.archetypes || []

    for (const archetype of archetypes) {
      const key = `${loreFile}:${archetype.id}`
      if (args.only && args.only !== key) continue

      const outPath = path.join(ROOT, 'data/skill-trees', loreFile, `${archetype.id}.json`)
      if (fs.existsSync(outPath) && !args.force) {
        skipped++
        continue
      }

      console.log(`  ${loreEnum}/${archetype.id}…`)
      const tree = await generateOne(loreFile, loreEnum, archetype)
      if (tree) {
        fs.mkdirSync(path.dirname(outPath), { recursive: true })
        fs.writeFileSync(outPath, JSON.stringify(tree, null, 2) + '\n')
        console.log(`    ✓ ${tree.nodes.length} nodos → ${path.relative(ROOT, outPath)}`)
        generated++
      } else {
        console.log(`    ✗✗ falló tras reintentos`)
        failed++
      }
    }
  }

  console.log(`\nGenerados: ${generated} · Saltados (ya existían): ${skipped} · Fallidos: ${failed}`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Generador falló:', err)
  process.exit(1)
})
