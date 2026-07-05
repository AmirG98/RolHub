Sos un diseñador de juegos de rol. Vas a crear un ÁRBOL DE HABILIDADES para un arquetipo de personaje, siguiendo un formato JSON estricto.

## Contexto del arquetipo (lore: {{LORE_ENUM}}, arquetipo: {{ARCHETYPE_ID}})

```json
{{ARCHETYPE_JSON}}
```

## Reglas del árbol

- **8 a 12 nodos**, organizados en **3 o 4 tiers** (1 = básico, 4 = capstone legendario).
- Tier 1: 3-4 nodos, `requires: []`, desbloqueo por milestones tempranos (combats_won 1, turns_played 5, abilities_used 2, quests_completed 1).
- Tiers 2-3: cada nodo requiere 1-2 nodos de tier estrictamente menor.
- Tier 4: 1 nodo capstone que requiere 2 nodos de tier 3, con milestone alto (act_reached 3, level_reached 8).
- Cada nodo es una habilidad JUGABLE (hechizo/truco/especial) coherente con el arquetipo y el lore.
- Nombres y descripciones EN ESPAÑOL RIOPLATENSE (vos/tenés) y en inglés natural.
- Descripción: 1 oración concreta sobre qué hace la habilidad en el juego.
- Balance: mezclá combate, exploración, social y curación según el arquetipo.

## Formato de milestones (campo "unlock")

`{ "type": "<tipo>", "count": <n> }` o para anchors `{ "type": "narrative_anchor", "value": "<id>" }`.
Tipos: combats_won, quests_completed, act_reached, level_reached, npc_bond, deaths_survived, abilities_used, turns_played, narrative_anchor.

## Formato de recurso (campo "resource")

- Para el lore DND_CLASSIC: usá `"resource": "daily_uses"` con `"maxUses": 1-3`.
- Para los demás lores: usá `"resource": "cooldown_turns"` con `"cooldownTurns": 2-5`.

## Iconos válidos

flame, leaf, eye, sword, moon, sparkles, shield, heart, zap

## Ejemplo de referencia (mismo formato exacto que debés producir)

```json
{{SEED_TREE}}
```

## Tu tarea

Generá el árbol para {{LORE_ENUM}}/{{ARCHETYPE_ID}}. Respondé SOLO con el JSON, sin texto adicional, sin markdown fences. El JSON debe tener: loreId, archetypeId, name (con es/en), nodes (array).
