// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { resolveNumericChoice } from '@/lib/game/numeric-choice'

const S = ['I examine the area', 'I talk to the innkeeper', 'I leave']

describe('resolveNumericChoice', () => {
  it('mapea "2", "2.", "2)", "option 2", "opción 2"', () => {
    for (const input of ['2', '2.', ' 2)', 'option 2', 'Opción 2', 'opcion 2.']) {
      expect(resolveNumericChoice(input, S)).toBe(S[1])
    }
  })

  it('"1 2" (el caso real del guest) elige la primera', () => {
    expect(resolveNumericChoice('1 2', S)).toBe(S[0])
    expect(resolveNumericChoice('2, 3', S)).toBe(S[1])
  })

  it('no mapea texto normal ni números fuera de rango', () => {
    expect(resolveNumericChoice('I attack', S)).toBeNull()
    expect(resolveNumericChoice('4', S)).toBeNull()
    expect(resolveNumericChoice('0', S)).toBeNull()
    expect(resolveNumericChoice('12', S)).toBeNull()
    expect(resolveNumericChoice('2 goblins', S)).toBeNull()
  })

  it('no secuestra un dígito cuando el DM ofreció su propia lista numerada', () => {
    const dm = 'Three doors:\n1. the iron door\n2. the rotting door\n3. the stairs — which one?'
    expect(resolveNumericChoice('2', S, dm)).toBeNull()
    // una sola línea numerada no cuenta como lista
    expect(resolveNumericChoice('2', S, 'You have 1. one chance.')).toBe(S[1])
  })
})
