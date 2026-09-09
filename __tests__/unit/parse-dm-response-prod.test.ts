// @vitest-environment node
/**
 * Casos REALES de prod (2026-09-09, 28 de 253 turnos DM afectados, 11%).
 * El modelo respondió prosa + bloque ```json aparte en vez de un objeto con
 * narration. El parser viejo devolvía el crudo entero (JSON visible al
 * jugador) y descartaba el dice_request (0/28 tiradas aplicadas). El primer
 * usuario pagador lo vio en su primer turno como PRO.
 */
import { describe, it, expect } from 'vitest'
import { parseDMResponse, findStructuredBlocks, extractEmbeddedJson } from '@/lib/claude/parse-dm-response'

const PROSE = `Your Slime flattens itself against your collar, which in Slime language means *bad feeling.*

Whatever made those wounds on Reward is close. Very close. And it doesn't know you're here yet.`

describe('Caso A — prosa + fence json con dice_request (forma dominante en prod)', () => {
  const raw = `${PROSE}

\`\`\`json
{
  "dice_request": {
    "reason": "Staying perfectly still and concealed as the unknown creature approaches",
    "formula": "1d20+4",
    "type": "skill",
    "difficulty": 13,
    "stat": "exploration",
    "on_success": "You hold your position perfectly",
    "on_failure": "A twig snaps underfoot"
  }
}
\`\`\``

  it('la narración queda limpia: sin JSON, sin fences, sin llaves', () => {
    const r = parseDMResponse(raw)
    expect(r.data.narration).toContain('Slime language')
    expect(r.data.narration).toContain("doesn't know you're here yet.")
    expect(r.data.narration).not.toContain('dice_request')
    expect(r.data.narration).not.toContain('```')
    expect(r.data.narration).not.toContain('{')
  })

  it('RECUPERA el dice_request (antes se perdía la tirada)', () => {
    const r = parseDMResponse<{ dice_request?: { formula: string; difficulty: number } }>(raw)
    expect(r.data.dice_request?.formula).toBe('1d20+4')
    expect(r.data.dice_request?.difficulty).toBe(13)
    expect(r.recoveredKeys).toContain('dice_request')
    expect(r.fullParse).toBe(false)
  })
})

describe('Caso A2 — fence de texto plano ("cartel") + fence json', () => {
  const raw = `You have maybe three seconds before he bolts.

\`\`\`
🎲 TAMING ATTEMPT — Critical Moment
\`\`\`

\`\`\`json
{
  "dice_request": { "reason": "Collar placement", "formula": "1d20+5", "type": "skill", "difficulty": 14, "stat": "taming" },
  "suggested_actions": ["Move slow", "Talk softly"]
}
\`\`\``

  it('conserva el texto del cartel, quita el JSON, recupera ambos campos', () => {
    const r = parseDMResponse<{ dice_request?: { formula: string }; suggested_actions?: string[] }>(raw)
    expect(r.data.narration).toContain('three seconds')
    expect(r.data.narration).toContain('TAMING ATTEMPT')
    expect(r.data.narration).not.toContain('`')
    expect(r.data.narration).not.toContain('dice_request')
    expect(r.data.dice_request?.formula).toBe('1d20+5')
    expect(r.data.suggested_actions).toEqual(['Move slow', 'Talk softly'])
  })
})

describe('Caso A3 — JSON suelto TRUNCADO al final (max_tokens)', () => {
  const raw = `Ignis is close.

\`\`\`
Your Beast Flute is ready.
\`\`\`

{"suggested_actions": ["Ready the Beast Flute and approach slowly", "Offer special monster food from a distance"`

  it('corta el JSON truncado y no recupera basura', () => {
    const r = parseDMResponse<{ suggested_actions?: string[] }>(raw)
    expect(r.data.narration).toContain('Ignis is close.')
    expect(r.data.narration).toContain('Your Beast Flute is ready.')
    expect(r.data.narration).not.toContain('suggested_actions')
    expect(r.data.narration).not.toContain('{')
    expect(r.data.suggested_actions).toBeUndefined()
  })
})

describe('Caso B — objeto raíz truncado con JSON anidado dentro de narration (turno 26 del primer pagador)', () => {
  // Lo que Claude devolvió: {"narration":"...prosa...\n\n```\nTAMING...\n```\n\n{\n  \"dice_request\": {... (cortado)
  const raw = '{"narration":"Whatever made those claw marks just announced itself.\\n\\n```\\nTAMING OPPORTUNITY: This is the moment to formalize the bond.\\n```\\n\\n{\\n  \\"dice_request\\": {\\n    \\"reason\\": \\"Taming bond\\",\\n    \\"formula\\": \\"1d20+5\\",\\n    \\"on_failure\\": \\"Reward pulls back'

  it('el jugador NO ve el JSON anidado', () => {
    const r = parseDMResponse(raw)
    expect(r.data.narration).toContain('claw marks just announced itself')
    expect(r.data.narration).toContain('TAMING OPPORTUNITY')
    expect(r.data.narration).not.toContain('dice_request')
    expect(r.data.narration).not.toContain('{')
    expect(r.data.narration).not.toContain('```')
  })
})

describe('findStructuredBlocks', () => {
  it('respeta llaves dentro de strings y anidamiento', () => {
    const text = 'x {"dice_request": {"reason": "a } b { c", "formula": "1d20"}} y'
    const b = findStructuredBlocks(text)
    expect(b).toHaveLength(1)
    expect(b[0].truncated).toBe(false)
    expect(text.slice(b[0].start, b[0].end)).toBe('{"dice_request": {"reason": "a } b { c", "formula": "1d20"}}')
  })

  it('ignora llaves de prosa sin campos estructurados', () => {
    expect(findStructuredBlocks('el ritual necesita { luna llena } y {sal}')).toHaveLength(0)
  })

  it('marca truncado un objeto estructurado sin cierre', () => {
    const b = findStructuredBlocks('texto {"hp_change": -3, "reason": "cae')
    expect(b).toHaveLength(1)
    expect(b[0].truncated).toBe(true)
  })
})

describe('extractEmbeddedJson — no rompe lo que ya andaba', () => {
  it('objeto raíz válido con fence embebido en narration: limpia y recupera', () => {
    const raw = JSON.stringify({
      narration: 'Beredin te mira. ```json { "dice_request": { "reason": "Social", "formula": "1d20+2", "type": "social" } }``` **¿Qué hacés?**',
      suggested_actions: ['a', 'b'],
    })
    const r = parseDMResponse<{ dice_request?: { formula: string }; suggested_actions?: string[] }>(raw)
    expect(r.fullParse).toBe(true)
    expect(r.data.narration).toContain('Beredin te mira')
    expect(r.data.narration).toContain('¿Qué hacés?')
    expect(r.data.narration).not.toContain('dice_request')
    expect(r.data.dice_request?.formula).toBe('1d20+2')
    expect(r.data.suggested_actions).toEqual(['a', 'b'])
    expect(r.recoveredKeys).toEqual(['dice_request'])
  })

  it('no pisa campos que ya venían en el objeto raíz', () => {
    const raw = JSON.stringify({
      narration: 'Texto {"suggested_actions": ["embebida"]} fin.',
      suggested_actions: ['raíz'],
    })
    const r = parseDMResponse<{ suggested_actions?: string[] }>(raw)
    expect(r.data.suggested_actions).toEqual(['raíz'])
    expect(r.recoveredKeys).toEqual([])
  })
})
