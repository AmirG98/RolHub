/**
 * Character Portrait Generation
 *
 * Genera retratos de personajes usando Fal.ai FLUX Pro
 * Cada lore tiene un estilo de arte específico
 */

import { type Lore } from '@/lib/maps/map-config'

// Estilos de arte para retratos por lore
const LORE_PORTRAIT_STYLES: Record<Lore, string> = {
  LOTR: 'fantasy portrait painting, Tolkien illustration style, medieval fantasy, oil painting, detailed face, dramatic lighting, heroic pose, epic atmosphere',

  ZOMBIES: 'survival horror portrait, gritty realism, post-apocalyptic, weathered face, desaturated colors, cinematic lighting, determined expression',

  ISEKAI: 'anime character portrait, vibrant colors, detailed anime art, fantasy adventurer, dynamic pose, magical aura, Studio Ghibli inspired',

  VIKINGOS: 'norse warrior portrait, painterly style, rugged features, braided hair, fur and leather, dramatic sky background, epic viking saga art',

  STAR_WARS: 'sci-fi character portrait, Star Wars concept art style, dramatic lighting, space opera aesthetic, detailed costume, cinematic',

  CYBERPUNK: 'cyberpunk character portrait, neon lighting, futuristic cybernetics, rain effects, noir aesthetic, high tech low life',

  LOVECRAFT_HORROR: 'dark portrait, cosmic horror aesthetic, unsettling atmosphere, muted colors with eldritch highlights, mysterious expression',

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
}

export interface CharacterPortraitResult {
  url: string
  prompt: string
  isGenerated: boolean
  generationTime?: number
}

/**
 * Construye el prompt para el retrato
 */
export function buildPortraitPrompt(options: CharacterPortraitOptions): string {
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

/**
 * Genera un retrato de personaje con Fal.ai
 */
export async function generateCharacterPortrait(
  options: CharacterPortraitOptions
): Promise<CharacterPortraitResult> {
  const FAL_KEY = process.env.FAL_KEY
  const ENABLE_IMAGES = process.env.NEXT_PUBLIC_ENABLE_IMAGES === 'true'

  if (!ENABLE_IMAGES) {
    return {
      url: '',
      prompt: options.archetype,
      isGenerated: false,
    }
  }

  if (!FAL_KEY) {
    console.warn('FAL_KEY not configured - portrait generation disabled')
    return {
      url: '',
      prompt: options.archetype,
      isGenerated: false,
    }
  }

  const startTime = Date.now()
  const fullPrompt = buildPortraitPrompt(options)

  // Config según calidad
  const qualityConfig = {
    draft: { steps: 15, guidance: 3.0 },
    standard: { steps: 25, guidance: 3.5 },
    high: { steps: 35, guidance: 4.0 },
  }

  const config = qualityConfig[options.quality || 'standard']

  try {
    const response = await fetch('https://fal.run/fal-ai/flux-pro', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        negative_prompt: NEGATIVE_PROMPT,
        image_size: {
          width: 512,
          height: 768, // Formato retrato vertical
        },
        num_inference_steps: config.steps,
        guidance_scale: config.guidance,
        enable_safety_checker: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Fal.ai API error: ${errorText}`)
    }

    const result = await response.json()
    const imageUrl = result.images?.[0]?.url || result.image?.url

    if (!imageUrl) {
      throw new Error('No image URL in response')
    }

    return {
      url: imageUrl,
      prompt: fullPrompt,
      isGenerated: true,
      generationTime: Date.now() - startTime,
    }
  } catch (error) {
    console.error('Character portrait generation failed:', error)
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
