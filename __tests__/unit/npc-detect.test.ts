/**
 * Tests de la detección de NPCs con forma de nombre propio.
 * Los fixtures de "fantasmas" son los NPCs basura REALES encontrados en el
 * world state de un jugador de prod (2026-07-10).
 */
import { describe, it, expect } from 'vitest'
import { detectNpcNames, isValidNpcName } from '@/lib/game/npc-detect'

// Basura real registrada como NPCs en prod por el regex viejo
const REAL_GHOSTS = [
  'Pero primero',
  'Jinete de Vado Viejo', // este es dudoso pero tiene forma válida — ver abajo
  'No tardas en verlo',
  'Encontrás tres cosas',
  'Pero más relevante aún',
  'La Lengua Negra es más que palabras',
  'Algunas palabras emergen con claridad',
  'Entre astillas y lona rasgada encontrás',
  'La distancia desde el borde del bosque al claro',
  'Solo tres palabras persisten con claridad brutal',
  'Entre sus ropas encontrás algo que antes no notaste',
]

describe('isValidNpcName — rechaza los fantasmas reales de prod', () => {
  // Todos menos "Jinete de Vado Viejo" y "Muchacho de Vado Viejo" (forma válida de nombre)
  const mustReject = REAL_GHOSTS.filter((g) => !/de Vado Viejo$/.test(g))

  it.each(mustReject.map((g) => [g]))('rechaza "%s"', (ghost) => {
    expect(isValidNpcName(ghost)).toBe(false)
  })

  it('acepta nombres con partícula tipo "Jinete de Vado Viejo" (forma válida)', () => {
    // Semi-legítimos: tienen forma de nombre propio, el filtro de forma no
    // puede distinguirlos de nombres reales — aceptable.
    expect(isValidNpcName('Jinete de Vado Viejo')).toBe(true)
  })
})

describe('isValidNpcName — acepta nombres reales', () => {
  const REAL_NPCS = ['Aldric', 'Tomás', 'Firindë', 'Olvar', 'Barliman Cebadín', 'Vera', 'Elrond de Aelinar']
  it.each(REAL_NPCS.map((n) => [n]))('acepta "%s"', (name) => {
    expect(isValidNpcName(name)).toBe(true)
  })
})

describe('isValidNpcName — reglas de forma', () => {
  it('rechaza más de 4 palabras', () => {
    expect(isValidNpcName('Juan Pedro García López Marín')).toBe(false)
  })
  it('rechaza palabras sin capitalizar (no partículas)', () => {
    expect(isValidNpcName('El viejo molinero')).toBe(false)
  })
  it('rechaza discursivos capitalizados', () => {
    expect(isValidNpcName('Pero')).toBe(false)
    expect(isValidNpcName('Ahora')).toBe(false)
    expect(isValidNpcName('Entonces')).toBe(false)
  })
  it('rechaza verbos en voseo capitalizados', () => {
    expect(isValidNpcName('Encontrás')).toBe(false)
    expect(isValidNpcName('Podés')).toBe(false)
  })
  it('rechaza la blocklist heredada de etiquetas', () => {
    expect(isValidNpcName('Sistema')).toBe(false)
    expect(isValidNpcName('Combate')).toBe(false)
    expect(isValidNpcName('Posada')).toBe(false)
  })
  it('rechaza nombres muy cortos o muy largos', () => {
    expect(isValidNpcName('Al')).toBe(false)
    expect(isValidNpcName('X'.repeat(41))).toBe(false)
  })
})

describe('detectNpcNames — extracción desde narración', () => {
  it('detecta NPCs con diálogo y filtra fragmentos', () => {
    const narration = `El mercado bulle de actividad.

**Aldric:** «Mi hijo desapareció hace tres días.»

Pero primero: notás que el bardo te observa.

**Firindë:** «Los caminos del este ya no son seguros.»

Encontrás tres cosas: una capa, un mapa y monedas.`
    expect(detectNpcNames(narration)).toEqual(['Aldric', 'Firindë'])
  })

  it('dedup de NPCs repetidos', () => {
    const narration = `Vera: «Sentate.» ... Vera: «Escuchame bien.»`
    expect(detectNpcNames(narration)).toEqual(['Vera'])
  })

  it('narración sin diálogos → vacío', () => {
    expect(detectNpcNames('El bosque está en silencio. Nada se mueve.')).toEqual([])
  })
})
