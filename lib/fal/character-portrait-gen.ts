/**
 * Character Portrait Generation
 *
 * Genera retratos de personajes usando Fal.ai FLUX Schnell
 * Cada lore tiene un estilo de arte específico
 * Usa caché en PostgreSQL para evitar regenerar retratos
 */

import { type Lore } from '@/lib/maps/map-config'
import {
  getCachedCharacterPortrait,
  cacheCharacterPortrait,
} from '@/lib/cache/asset-cache'

// Estilos de arte para retratos por lore
const LORE_PORTRAIT_STYLES: Record<string, string> = {
  LOTR: 'fantasy portrait painting, Tolkien illustration style, medieval fantasy, oil painting, detailed face, dramatic lighting, heroic pose, epic atmosphere',

  ZOMBIES: 'survival horror portrait, gritty realism, post-apocalyptic, weathered face, desaturated colors, cinematic lighting, determined expression',

  ISEKAI: 'anime character portrait, vibrant colors, detailed anime art, fantasy adventurer, dynamic pose, magical aura, Studio Ghibli inspired',

  VIKINGOS: 'norse warrior portrait, painterly style, rugged features, braided hair, fur and leather, dramatic sky background, epic viking saga art',

  STAR_WARS: 'sci-fi character portrait, Star Wars concept art style, dramatic lighting, space opera aesthetic, detailed costume, cinematic',

  CYBERPUNK: 'cyberpunk character portrait, neon lighting, futuristic cybernetics, rain effects, noir aesthetic, high tech low life',

  LOVECRAFT_HORROR: 'dark portrait, cosmic horror aesthetic, unsettling atmosphere, muted colors with eldritch highlights, mysterious expression',

  ROMANTASY: 'romantic fantasy portrait, ethereal lighting, fae court aesthetic, ACOTAR inspired, intricate gown or armor, lush florals in background, sensual atmosphere, dreamy painterly style',

  CUSTOM: 'fantasy character portrait, detailed illustration, dramatic lighting, heroic pose',
}

// Descripciones de arquetipos comunes
const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  // LOTR
  'Montaraz': 'rugged ranger, hooded cloak, weathered face, bow and sword, forest background',
  'Heredero de Númenor': 'noble warrior, kingly bearing, ancient armor, determined gaze',
  'Jinete de Rohan': 'horse lord, flowing blonde hair, chainmail, horse motif, plains background',
  'Guardián del Bosque': 'elven archer, elegant features, green cloak, mystical forest',
  'Portador del Anillo': 'humble hobbit, curious eyes, simple clothes, golden ring glow',
  'Mago Peregrino': 'wise wizard, long beard, staff and hat, mystical aura',

  // ZOMBIES
  'Superviviente': 'survivor, practical clothing, makeshift weapons, alert expression',
  'Médico de Campo': 'field medic, bloodstained coat, medical bag, exhausted but determined',
  'Ex-Militar': 'military veteran, tactical gear, scars, steely gaze',
  'Mecánico': 'mechanic, oil-stained clothes, tools, resourceful look',

  // ISEKAI
  'Héroe Invocado': 'summoned hero, glowing aura, fantasy armor, determined pose',
  'Mago Reencarnado': 'reincarnated mage, mystical robes, floating magic circles',
  'Guerrero de Otro Mundo': 'otherworld warrior, unique weapon, heroic stance',

  // VIKINGOS
  'Guerrero Vikingo': 'viking warrior, braided beard, battle axe, fur cape',
  'Skald': 'norse bard, intricate tattoos, lyre instrument, wise eyes',
  'Berserker': 'berserker, wild eyes, animal pelts, battle scars, fearsome',
  'Völva': 'seeress, mystical staff, runic symbols, otherworldly gaze',

  // STAR WARS
  'Jedi': 'jedi knight, lightsaber, robes, serene expression, force aura',
  'Contrabandista': 'smuggler, blaster, leather jacket, cocky smile',
  'Mandaloriano': 'mandalorian, beskar armor, helmet, warrior stance',
  'Piloto Rebelde': 'rebel pilot, flight suit, helmet, determined',

  // CYBERPUNK
  'Netrunner': 'netrunner, cyberdeck, neural interface, neon reflections',
  'Solo': 'street samurai, cybernetic arms, tactical gear, cold eyes',
  'Fixer': 'fixer, expensive suit, cybernetic eye, knowing smile',
  'Techie': 'tech specialist, augmented reality glasses, tools, focused',

  // LOVECRAFT
  'Investigador': 'investigator, 1920s attire, notebook, haunted expression',
  'Ocultista': 'occultist, ritual robes, arcane symbols, knowing gaze',
  'Profesor': 'professor, scholarly clothes, ancient tome, worried eyes',

  // ROMANTASY
  'Cortesano (Maestre del Juego)': 'fae courtier, intricate silk gown or doublet, jeweled accessories, knowing smile, candlelit ballroom background, ACOTAR aesthetic',
  'Guerrera Illyriana (Guardiana Alada)': 'winged warrior, leather battle armor with sigils, dual blades, fierce eyes, mountain backdrop, dark wings spread',
  'Alta Dama (Hechicera de las Estrellas)': 'high lady sorceress, flowing robes with star embroidery, glowing crystal staff, ethereal presence, twilight garden background',
}

// Descripciones visuales de razas D&D 5e para retratos
const DND5E_RACE_VISUALS: Record<string, string> = {
  // Razas base
  human: 'human, normal proportions, realistic features',
  elf: 'slender elf with pointed ears, angular elegant features, ethereal beauty',
  'high-elf': 'slender high elf with pointed ears, angular features, ethereal beauty, pale luminous skin',
  'wood-elf': 'wild wood elf with pointed ears, tanned skin, nature-woven hair, forest markings',
  drow: 'dark elf with obsidian black skin, stark white hair, pointed ears, red or violet glowing eyes',
  dwarf: 'stout dwarf, broad shoulders, thick braided beard, compact muscular build, weathered face',
  'hill-dwarf': 'stout hill dwarf, broad shoulders, braided red-brown beard, warm weathered face',
  'mountain-dwarf': 'massive mountain dwarf, broad shoulders, iron-gray braided beard, stern face',
  halfling: 'small halfling, 3 feet tall, curly hair, round friendly face, bare large hairy feet',
  'lightfoot-halfling': 'small lightfoot halfling, nimble build, mischievous smile, curly hair',
  'stout-halfling': 'small stout halfling, sturdy build, ruddy cheeks, curly hair',
  dragonborn: 'dragonborn with reptilian scales covering entire body, draconic head with snout, no hair, tall muscular humanoid dragon',
  gnome: 'tiny gnome, 3 feet tall, large bright curious eyes, wild unkempt hair, small pointed ears',
  'forest-gnome': 'tiny forest gnome, wild green-tinted hair, bright eyes, nature-touched appearance',
  'rock-gnome': 'tiny rock gnome, goggles on forehead, bright inquisitive eyes, tinkerer appearance',
  'half-elf': 'half-elf with slightly pointed ears, blend of human and elven features, graceful yet sturdy',
  'half-orc': 'half-orc with grayish-green skin, prominent lower tusks, muscular imposing build, fierce eyes',
  tiefling: 'tiefling with curved ram-like horns, solid colored eyes without pupils, reddish skin, long sinuous tail, infernal demonic features',
}

// Colores de ancestría dracónica para Dragonborn
const DRACONIC_ANCESTRY_COLORS: Record<string, string> = {
  black: 'black scales, acid-scarred',
  blue: 'deep blue scales, lightning-crackled',
  brass: 'warm brass-colored scales, desert-weathered',
  bronze: 'gleaming bronze scales, ocean-touched',
  copper: 'bright copper scales, playful expression',
  gold: 'majestic golden scales, regal bearing',
  green: 'deep green scales, forest-dwelling',
  red: 'crimson red scales, fire-touched',
  silver: 'shining silver scales, frost-tinged',
  white: 'pale white scales, ice-covered',
}

// Descripciones visuales de clases D&D 5e para retratos
const DND5E_CLASS_VISUALS: Record<string, string> = {
  barbarian: 'wearing fur and leather armor, tribal war markings, massive weapon, wild untamed ferocious appearance',
  bard: 'wearing colorful elegant performer clothes, carrying a lute or instrument, charming charismatic expression',
  cleric: 'wearing ceremonial religious robes with prominent holy symbol, divine light aura, sacred vestments',
  druid: 'wearing natural materials with leaves and vines woven in, wooden gnarled staff, deep nature connection',
  fighter: 'wearing heavy plate armor, shield and longsword, battle-scarred veteran, military disciplined bearing',
  monk: 'wearing simple monastic robes tied at waist, martial arts ready stance, calm focused serene expression',
  paladin: 'wearing brilliant shining plate armor with holy crest, radiant divine aura, righteous noble bearing',
  ranger: 'wearing practical leather armor with hooded forest cloak, longbow and quiver, rugged wilderness survivor',
  rogue: 'wearing dark fitted leather armor, daggers and lockpicks at belt, shadowy hooded figure, sharp cunning eyes',
  sorcerer: 'arcane magical energy crackling visibly around hands, flowing enchanted robes with glowing magical symbols',
  warlock: 'wearing dark mystical robes with eldritch otherworldly symbols, patron mark glowing, mysterious dangerous aura',
  wizard: 'wearing scholarly academic robes, ancient spellbook in hand, ornate arcane staff, wise intellectual appearance',
}

// Negative prompt para evitar problemas comunes
const NEGATIVE_PROMPT = 'text, watermark, signature, ugly, deformed, disfigured, poor quality, bad anatomy, extra limbs, blurry, low resolution, duplicate, morbid, mutilated, out of frame, poorly drawn face, mutation, extra fingers, missing limbs, floating limbs, disconnected limbs, malformed hands, blur, out of focus, long neck, long body, mutated hands, fused fingers, multiple faces'

export interface CharacterPortraitOptions {
  /** Nombre del personaje */
  name: string
  /** Arquetipo del personaje */
  archetype: string
  /** Lore/mundo del personaje */
  lore: Lore
  /** Descripción adicional (opcional) */
  description?: string
  /** Género (opcional) */
  gender?: 'male' | 'female' | 'neutral'
  /** Calidad de generación */
  quality?: 'draft' | 'standard' | 'high'
  /** ID de la raza D&D 5e (opcional) */
  raceId?: string
  /** ID de la subraza D&D 5e (opcional) */
  subraceId?: string
  /** ID de la clase D&D 5e (opcional) */
  classId?: string
  /** Ancestría dracónica para Dragonborn (opcional) */
  draconicAncestry?: string
}

export interface CharacterPortraitResult {
  url: string
  prompt: string
  isGenerated: boolean
  generationTime?: number
}

/**
 * Construye el prompt para el retrato
 * Si el personaje tiene datos de raza y clase D&D 5e, usa el builder especializado
 */
export function buildPortraitPrompt(options: CharacterPortraitOptions): string {
  // Si tiene datos de raza y clase D&D 5e, usar el builder especializado
  if (options.raceId && options.classId) {
    return buildDnD5ePortraitPrompt({
      raceId: options.raceId,
      subraceId: options.subraceId,
      classId: options.classId,
      lore: options.lore,
      gender: options.gender,
      characterDescription: options.description,
      draconicAncestry: options.draconicAncestry,
    })
  }

  // Flujo original para personajes no-D&D 5e
  const style = LORE_PORTRAIT_STYLES[options.lore] || LORE_PORTRAIT_STYLES.CUSTOM

  // Buscar descripción del arquetipo
  const archetypeDesc = ARCHETYPE_DESCRIPTIONS[options.archetype] || options.archetype.toLowerCase()

  const parts: string[] = [
    'character portrait',
    style,
    archetypeDesc,
  ]

  // Añadir género si se especifica
  if (options.gender === 'male') {
    parts.push('male character')
  } else if (options.gender === 'female') {
    parts.push('female character')
  }

  // Añadir descripción personalizada
  if (options.description) {
    parts.push(options.description)
  }

  // Calidad
  parts.push('masterpiece, highly detailed, professional illustration, centered composition')

  return parts.join(', ')
}

// Opciones específicas para retratos D&D 5e
export interface DnD5ePortraitOptions {
  /** ID de la raza (e.g., 'elf', 'dwarf', 'dragonborn') */
  raceId: string
  /** ID de la subraza (e.g., 'high-elf', 'hill-dwarf') */
  subraceId?: string
  /** ID de la clase (e.g., 'fighter', 'wizard') */
  classId: string
  /** Lore/mundo para determinar el estilo artístico */
  lore: string
  /** Género del personaje */
  gender?: string
  /** Descripción personalizada adicional */
  characterDescription?: string
  /** Ancestría dracónica (solo para Dragonborn) */
  draconicAncestry?: string
}

/**
 * Construye un prompt de retrato específico para personajes D&D 5e
 * Combina raza, clase, ancestría dracónica y estilo del lore
 */
export function buildDnD5ePortraitPrompt(options: DnD5ePortraitOptions): string {
  const loreKey = options.lore as Lore
  const artStyle = LORE_PORTRAIT_STYLES[loreKey] || LORE_PORTRAIT_STYLES.CUSTOM

  // Priorizar subraza sobre raza base para descripciones más específicas
  const raceVisual = (options.subraceId && DND5E_RACE_VISUALS[options.subraceId])
    || DND5E_RACE_VISUALS[options.raceId]
    || options.raceId

  const classVisual = DND5E_CLASS_VISUALS[options.classId] || options.classId

  const parts: string[] = [artStyle, raceVisual]

  // Añadir color de ancestría dracónica si es dragonborn
  if (options.draconicAncestry && options.raceId === 'dragonborn') {
    const draconicColor = DRACONIC_ANCESTRY_COLORS[options.draconicAncestry.toLowerCase()]
    if (draconicColor) {
      parts.push(draconicColor)
    }
  }

  parts.push(classVisual)

  // Género
  if (options.gender === 'male') {
    parts.push('male character')
  } else if (options.gender === 'female') {
    parts.push('female character')
  }

  // Descripción personalizada
  if (options.characterDescription) {
    parts.push(options.characterDescription)
  }

  parts.push('character portrait, upper body, detailed face, masterpiece, high quality')

  return parts.join(', ')
}

/**
 * Genera un retrato de personaje con Fal.ai
 */
export async function generateCharacterPortrait(
  options: CharacterPortraitOptions
): Promise<CharacterPortraitResult> {
  const FAL_KEY = process.env.FAL_KEY

  // Solo depender de FAL_KEY — NEXT_PUBLIC_ENABLE_IMAGES puede no estar
  // disponible en runtime del servidor en Vercel (se inyecta solo en build time)
  if (!FAL_KEY) {
    console.warn('[Portrait] SKIPPED: FAL_KEY not configured')
    return {
      url: '',
      prompt: options.archetype,
      isGenerated: false,
    }
  }

  console.log(`[Portrait] Starting generation with FAL_KEY=${FAL_KEY.substring(0, 8)}...`)

  const startTime = Date.now()
  const fullPrompt = buildPortraitPrompt(options)
  console.log(`[Portrait] Prompt: ${fullPrompt.substring(0, 120)}...`)

  // Config según calidad
  const qualityConfig = {
    draft: { steps: 15, guidance: 3.0 },
    standard: { steps: 25, guidance: 3.5 },
    high: { steps: 35, guidance: 4.0 },
  }

  const config = qualityConfig[options.quality || 'standard']

  try {
    // FLUX Schnell: ~$0.003/imagen vs FLUX Pro ~$0.05/imagen
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      // FLUX Schnell: solo acepta prompt, image_size, num_inference_steps
      body: JSON.stringify({
        prompt: fullPrompt,
        image_size: {
          width: 512,
          height: 768, // Formato retrato vertical
        },
        num_inference_steps: 4, // Schnell usa 1-4 steps
        enable_safety_checker: true,
      }),
    })

    console.log(`[Portrait] Fal.ai response: status=${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Portrait] Fal.ai ERROR: ${response.status} — ${errorText}`)
      throw new Error(`Fal.ai API error (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    const imageUrl = result.images?.[0]?.url || result.image?.url

    if (!imageUrl) {
      console.error('[Portrait] Fal.ai returned OK but no image URL in response:', JSON.stringify(result).substring(0, 200))
      throw new Error('No image URL in response')
    }

    console.log(`[Portrait] SUCCESS: ${imageUrl.substring(0, 80)} (${Date.now() - startTime}ms)`)

    return {
      url: imageUrl,
      prompt: fullPrompt,
      isGenerated: true,
      generationTime: Date.now() - startTime,
    }
  } catch (error) {
    console.error('[Portrait] FAILED:', (error as Error).message || error)
    return {
      url: '',
      prompt: fullPrompt,
      isGenerated: false,
    }
  }
}

/**
 * Handler para API route
 */
export async function handleCharacterPortraitRequest(
  body: {
    name: string
    archetype: string
    lore: string
    description?: string
    gender?: string
    quality?: string
  }
): Promise<{
  success: boolean
  url?: string
  error?: string
  prompt?: string
  generationTime?: number
}> {
  try {
    const result = await generateCharacterPortrait({
      name: body.name,
      archetype: body.archetype,
      lore: body.lore as Lore,
      description: body.description,
      gender: body.gender as 'male' | 'female' | 'neutral' | undefined,
      quality: (body.quality as 'draft' | 'standard' | 'high') || 'standard',
    })

    if (!result.isGenerated || !result.url) {
      return {
        success: false,
        error: 'Portrait generation failed or disabled',
        prompt: result.prompt,
      }
    }

    return {
      success: true,
      url: result.url,
      prompt: result.prompt,
      generationTime: result.generationTime,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// =============================================================================
// Cached Character Portrait Generation
// =============================================================================

export interface CachedPortraitOptions extends CharacterPortraitOptions {
  /** Character ID para el cache key */
  characterId: string
  /** Forzar regeneración ignorando caché */
  forceRegenerate?: boolean
}

/**
 * Genera retrato de personaje con caché
 * Primero busca en DB, si no existe genera y guarda
 * También actualiza Character.avatarUrl automáticamente
 */
export async function generateCachedCharacterPortrait(
  options: CachedPortraitOptions
): Promise<CharacterPortraitResult> {
  // Si no se fuerza regeneración, buscar en caché
  if (!options.forceRegenerate) {
    const cachedUrl = await getCachedCharacterPortrait(options.characterId)
    if (cachedUrl) {
      console.log(`[Cache HIT] Character portrait: ${options.characterId}`)
      return {
        url: cachedUrl,
        prompt: buildPortraitPrompt(options),
        isGenerated: true,
        generationTime: 0, // Desde caché = instantáneo
      }
    }
  }

  console.log(`[Cache MISS] Generating portrait: ${options.characterId}`)

  // Generar nuevo retrato
  const result = await generateCharacterPortrait(options)

  // Si se generó exitosamente, guardar en caché
  // Esto también actualiza Character.avatarUrl automáticamente
  if (result.isGenerated && result.url) {
    await cacheCharacterPortrait(
      options.characterId,
      result.url,
      result.prompt
    )
    console.log(`[Cache SAVED] Character portrait: ${options.characterId}`)
  }

  return result
}

/**
 * Handler para API route con soporte de caché
 */
export async function handleCachedCharacterPortraitRequest(
  body: {
    characterId: string
    name: string
    archetype: string
    lore: string
    description?: string
    gender?: string
    quality?: string
    forceRegenerate?: boolean
  }
): Promise<{
  success: boolean
  url?: string
  error?: string
  prompt?: string
  generationTime?: number
  fromCache?: boolean
}> {
  try {
    const result = await generateCachedCharacterPortrait({
      characterId: body.characterId,
      name: body.name,
      archetype: body.archetype,
      lore: body.lore as Lore,
      description: body.description,
      gender: body.gender as 'male' | 'female' | 'neutral' | undefined,
      quality: (body.quality as 'draft' | 'standard' | 'high') || 'standard',
      forceRegenerate: body.forceRegenerate,
    })

    if (!result.isGenerated || !result.url) {
      return {
        success: false,
        error: 'Portrait generation failed or disabled',
        prompt: result.prompt,
      }
    }

    return {
      success: true,
      url: result.url,
      prompt: result.prompt,
      generationTime: result.generationTime,
      fromCache: result.generationTime === 0,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
