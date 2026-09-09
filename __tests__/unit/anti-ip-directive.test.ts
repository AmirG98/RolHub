// @vitest-environment node
/**
 * La directiva anti-IP del prompt del DM. Motivación: una partida real de
 * Cyberpunk (2026-08-31) narró "Arasaka" y "NetWatch" — el modelo los inventa
 * solo aunque los datos estén limpios. Cada lore rebrandeado o expuesto a una
 * franquicia fuerte tiene que tener directiva en AMBOS idiomas.
 */
import { describe, it, expect } from 'vitest'
import { antiIpDirective } from '@/lib/claude/anti-ip-directive'

const COVERED = ['LOTR', 'STAR_WARS', 'DND_CLASSIC', 'ROMANTASY', 'CYBERPUNK'] as const

describe('antiIpDirective', () => {
  it.each(COVERED)('%s tiene directiva en es y en', (lore) => {
    expect(antiIpDirective(lore, 'es')).toMatch(/PROHIBIDO/)
    expect(antiIpDirective(lore, 'en')).toMatch(/FORBIDDEN/)
  })

  it('CYBERPUNK: da los nombres originales y prohíbe los de Cyberpunk 2077', () => {
    const en = antiIpDirective('CYBERPUNK', 'en')
    for (const ours of ['Neon City', 'Kurotek', 'VigilNet', 'Club Limbo', 'MedForce']) expect(en).toContain(ours)
    for (const theirs of ['Arasaka', 'Night City', 'NetWatch', 'Militech', 'Silverhand']) expect(en).toContain(theirs)
    expect(en).toMatch(/FORBIDDEN[^.]*Arasaka/)
  })

  it('lores sin franquicia devuelven cadena vacía (no inyectan nada)', () => {
    expect(antiIpDirective('ZOMBIES', 'en')).toBe('')
    expect(antiIpDirective('VIKINGOS', 'es')).toBe('')
  })
})
