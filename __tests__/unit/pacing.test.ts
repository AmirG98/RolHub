// @vitest-environment node
/**
 * Anti-bucle narrativo. Motivación: dos clientes pagos vieron la misma escena
 * re-narrada durante horas; el segundo canceló con feedback "low quality".
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import {
  nextTurnsInScene, turnsInSceneOf, sceneStaleDirective, lastSuggestionsDirective, actDirective,
  formatQuestsForPrompt, applyObjectiveCompletion, questCompletedByObjective, antiLoopRules,
  engineCombatDirective, SCENE_STALE_TURNS, SCENE_HARD_TURNS, ACT_1_MAX_TURNS,
} from '@/lib/game/pacing'
import type { Quest } from '@/lib/types/quest'

const quest = (over: Partial<Quest> = {}): Quest => ({
  id: 'quest_1', title: 'Pharmacy Run', description: 'Loot the pharmacy', status: 'active', priority: 'main',
  objectives: [
    { id: 'obj_a', description: 'Reach the pharmacy', completed: false },
    { id: 'obj_b', description: 'Loot the drawers', completed: false },
  ],
  sourceType: 'narrative', createdAt: 1, lore: 'ZOMBIES',
  ...over,
} as Quest)

describe('contador de turnos en escena', () => {
  it('incrementa y se resetea al cambiar de escena', () => {
    expect(nextTurnsInScene(undefined, false)).toBe(1)
    expect(nextTurnsInScene(7, false)).toBe(8)
    expect(nextTurnsInScene(7, true)).toBe(0)
    expect(nextTurnsInScene('garbage', false)).toBe(1)
    expect(turnsInSceneOf({ turns_in_scene: 5 })).toBe(5)
    expect(turnsInSceneOf({})).toBe(0)
    expect(turnsInSceneOf(null)).toBe(0)
  })
})

describe('sceneStaleDirective', () => {
  it('nada al principio, sugerencia suave a los 4, cierre a los 8, obligatorio a los 12', () => {
    expect(sceneStaleDirective(0, 'en')).toBe('')
    expect(sceneStaleDirective(3, 'es')).toBe('')
    expect(sceneStaleDirective(4, 'en')).toMatch(/consider advancing/)
    expect(sceneStaleDirective(SCENE_STALE_TURNS, 'en')).toMatch(/Wrap it up/)
    expect(sceneStaleDirective(SCENE_HARD_TURNS, 'en')).toMatch(/LAST one here/)
    expect(sceneStaleDirective(SCENE_HARD_TURNS, 'en')).toContain('scene_change')
    expect(sceneStaleDirective(20, 'es')).toMatch(/ÚLTIMO acá/)
  })
})

describe('lastSuggestionsDirective', () => {
  it('lista lo ofrecido y pide acciones distintas', () => {
    const d = lastSuggestionsDirective(['Signal Marcus', 'Loot the drawers'], 'en')
    expect(d).toContain('"Signal Marcus"')
    expect(d).toContain('DIFFERENT')
  })
  it('vacío si no hay datos o no son strings', () => {
    expect(lastSuggestionsDirective(undefined, 'en')).toBe('')
    expect(lastSuggestionsDirective([1, null], 'es')).toBe('')
  })
})

describe('actDirective', () => {
  it('empuja a cerrar el acto 1 después de ACT_1_MAX_TURNS', () => {
    expect(actDirective(1, ACT_1_MAX_TURNS - 1, 'en')).toBe('')
    expect(actDirective(1, ACT_1_MAX_TURNS, 'en')).toContain('act_advance')
    expect(actDirective(2, 100, 'en')).toBe('')
    expect(actDirective(undefined, 50, 'es')).toContain('act_advance')
  })
})

describe('formatQuestsForPrompt', () => {
  it('muestra questId y objectiveId (sin ellos el DM no puede completar objetivos)', () => {
    const out = formatQuestsForPrompt([quest()], 'en')
    expect(out).toContain('[questId: quest_1]')
    expect(out).toContain('[objectiveId: obj_a]')
    expect(out).toContain('[objectiveId: obj_b]')
    expect(out).toContain('Pending')
  })
  it('omite objetivos cumplidos y quests no activas', () => {
    const q = quest({ objectives: [{ id: 'obj_a', description: 'done', completed: true }, { id: 'obj_b', description: 'todo', completed: false }] })
    const out = formatQuestsForPrompt([q, quest({ id: 'q2', status: 'completed' })], 'es')
    expect(out).not.toContain('obj_a')
    expect(out).toContain('obj_b')
    expect(out).not.toContain('q2')
  })
  it('sin quests activas', () => {
    expect(formatQuestsForPrompt([], 'en')).toBe('- No active quests')
  })
})

describe('objetivos y cierre de quest', () => {
  it('completa un objetivo sin cerrar la quest', () => {
    const out = applyObjectiveCompletion([quest()], { questId: 'quest_1', objectiveId: 'obj_a' })
    expect(out[0].objectives[0].completed).toBe(true)
    expect(out[0].status).toBe('active')
    expect(questCompletedByObjective([quest()], { questId: 'quest_1', objectiveId: 'obj_a' })).toBeNull()
  })
  it('cierra la quest con el último objetivo', () => {
    const q = quest({ objectives: [{ id: 'obj_a', description: 'a', completed: true }, { id: 'obj_b', description: 'b', completed: false }] })
    const done = questCompletedByObjective([q], { questId: 'quest_1', objectiveId: 'obj_b' })
    expect(done?.status).toBe('completed')
    expect(done?.title).toBe('Pharmacy Run')
  })
  it('ids desconocidos o quest ya completada → null y sin cambios', () => {
    expect(questCompletedByObjective([quest()], { questId: 'nope', objectiveId: 'obj_a' })).toBeNull()
    expect(questCompletedByObjective([quest({ status: 'completed' })], { questId: 'quest_1', objectiveId: 'obj_a' })).toBeNull()
    expect(questCompletedByObjective(undefined, { questId: 'quest_1', objectiveId: 'obj_a' })).toBeNull()
    expect(questCompletedByObjective([quest()], null)).toBeNull()
    expect(applyObjectiveCompletion([quest()], { questId: 'nope', objectiveId: 'x' })).toEqual([quest()])
  })
})

describe('directivas estáticas', () => {
  it('antiLoopRules cubre amenazas, repetición, salida, quests y actos en ambos idiomas', () => {
    for (const l of ['en', 'es'] as const) {
      const r = antiLoopRules(l)
      expect(r).toContain('quest_complete_objective')
      expect(r).toContain('act_advance')
      expect(r).toContain('xp_reward')
      expect(r.split('\n').length).toBe(5)
    }
  })
  it('engineCombatDirective solo para DND_5E', () => {
    expect(engineCombatDirective('STORY_MODE', 'en')).toBe('')
    expect(engineCombatDirective('DND_5E', 'en')).toContain('combat_trigger')
    expect(engineCombatDirective('DND_5E', 'es')).toContain('combat_trigger')
  })
})

describe('turn route cableado (estático)', () => {
  const src = fs.readFileSync(path.resolve(__dirname, '../../app/api/session/turn/route.ts'), 'utf8')
  it('usa los helpers y persiste el contador de escena', () => {
    expect(src).toContain('formatQuestsForPrompt(')
    expect(src).toContain('sceneStaleDirective(')
    expect(src).toContain('lastSuggestionsDirective(')
    expect(src).toContain('antiLoopRules(')
    expect(src).toContain('engineCombatDirective(')
    expect(src).toContain('worldStateUpdates.turns_in_scene')
    expect(src).toContain('"act_advance": false')
    expect(src).toContain('"quest_complete_objective": null')
  })
  it('el estancamiento ya no depende de act === 1 (era true para siempre tras el turno 12)', () => {
    expect(src).not.toContain('worldState.act === 1)')
  })
})
