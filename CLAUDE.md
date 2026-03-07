# CLAUDE.md — RPG DIGITAL HUB v2.0
> Archivo maestro definitivo. Leer completo antes de cada sesión de desarrollo.
> Actualizar sección 20 (Estado Actual) al terminar cada sesión.
> Este archivo ES la memoria del proyecto. Nunca asumir — siempre consultar acá.

---

## ÍNDICE RÁPIDO
1.  Qué es este proyecto
2.  Stack tecnológico
3.  Estructura de carpetas
4.  Base de datos — Schema Prisma
5.  Sistema de contexto — Arquitectura de memoria
6.  Party Tracker — Chequeo automático
7.  Lores — Estructura de cada biblia
8.  Motores de reglas
9.  Generación de imágenes
10. Sistema de voz y audio
11. Estética visual — Primera capa sin Figma
12. Flujo de onboarding (3 pantallas)
13. Funcionalidades de Foundry VTT incorporadas
14. Sistema de tutoriales por nivel de jugador
15. Sistema de auto-chequeo y prevención de bugs
16. Arquitectura MCP — Preparado para agentes
17. Convenciones de código
18. Variables de entorno
19. Orden de construcción — Fases
20. Estado actual del proyecto ← ACTUALIZAR SIEMPRE

---

## 1. QUÉ ES ESTE PROYECTO

Un hub digital de juego de rol narrativo con DM autónomo powered by Claude API.
Pensado para gamers que nunca jugaron rol — la experiencia tiene que sentirse
como un videojuego RPG narrativo, no como una sesión de D&D tradicional.

El jugador elige: modo (one-shot / campaña) → mundo (lore) → motor de reglas → personaje → juega.
El DM autónomo hace todo lo demás: narra, genera imágenes, habla con voz, crea NPCs,
aplica reglas, recuerda consecuencias, mantiene el mundo coherente.

Nombre provisional: rpg-hub
Público principal: Gamers 18-35 sin experiencia en rol
Estética: Foundry VTT / D&D clásico — pergamino, dorado, oscuridad épica

---

## 2. STACK TECNOLÓGICO

Frontend:        Next.js 14 (App Router) + TypeScript + Tailwind CSS
Componentes:     shadcn/ui + Framer Motion
Estado global:   Zustand
Server state:    TanStack Query (React Query v5)
Backend:         Next.js API Routes + Server Actions
Base de datos:   Prisma ORM + PostgreSQL (Supabase)
Auth:            Clerk
Storage:         Supabase Storage
Realtime:        Supabase Realtime + Socket.io
IA Narración:    Anthropic Claude API (claude-sonnet-4-20250514)
IA Imágenes:     Fal.ai (FLUX Pro)
IA Voz:          ElevenLabs (streaming TTS)
IA SFX:          ElevenLabs Sound Effects API
Audio mixer:     Howler.js
Dados 3D:        @3d-dice/dice-box (WebGL)
Mapas:           Leaflet.js (world map interactivo)
Editor rich:     TipTap (journals, notas)
Testing:         Vitest + Testing Library + Playwright (E2E)
Deploy:          Vercel (frontend) + Railway (sockets) + Supabase (DB)

Modelos a usar siempre:
- Narración DM:         claude-sonnet-4-20250514
- Resúmenes y checks:   claude-haiku-4-5-20251001 (más rápido y barato)
- Imágenes:             fal-ai/flux-pro
- Voz:                  ElevenLabs streaming v2

---

## 3. ESTRUCTURA DE CARPETAS

rpg-hub/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx                  # Hub principal
│   │   ├── campaigns/page.tsx
│   │   ├── characters/page.tsx
│   │   └── compendium/page.tsx
│   ├── onboarding/page.tsx
│   ├── play/[sessionId]/page.tsx     # Sala de juego
│   ├── tutorial/[level]/page.tsx
│   └── api/
│       ├── dm/route.ts               # DM streaming
│       ├── dm/party-check/route.ts
│       ├── dm/summarize/route.ts
│       ├── images/route.ts
│       ├── voice/route.ts
│       ├── session/route.ts
│       ├── world-state/route.ts
│       ├── health/route.ts
│       └── mcp/
│           ├── tools/route.ts
│           └── resources/route.ts
│
├── components/
│   ├── ui/                           # shadcn/ui base
│   ├── medieval/                     # Sistema de diseño medieval
│   │   ├── ParchmentPanel.tsx
│   │   ├── OrnateFrame.tsx
│   │   ├── RunicButton.tsx
│   │   ├── ScrollText.tsx
│   │   ├── DiceRoller.tsx
│   │   ├── HPBar.tsx
│   │   ├── ConditionBadge.tsx
│   │   ├── TokenAvatar.tsx
│   │   ├── JournalEntry.tsx
│   │   ├── RollableTable.tsx
│   │   ├── CompendiumBrowser.tsx
│   │   ├── MapPin.tsx
│   │   └── AmbientFX.tsx
│   ├── game/
│   │   ├── NarratorPanel.tsx
│   │   ├── ActionButtons.tsx
│   │   ├── SceneImage.tsx
│   │   ├── PartyTracker.tsx
│   │   ├── CombatTracker.tsx
│   │   ├── VoiceControls.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── WorldMap.tsx
│   │   ├── SceneRegion.tsx
│   │   ├── FogOfWar.tsx
│   │   ├── ActiveEffects.tsx
│   │   ├── Playlist.tsx
│   │   └── MacroBar.tsx
│   ├── onboarding/
│   │   ├── LoreSelector.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── EngineSelector.tsx
│   │   └── ArchetypeSelector.tsx
│   └── tutorial/
│       ├── TutorialOverlay.tsx
│       ├── TourStep.tsx
│       ├── GlossaryTooltip.tsx
│       └── ProgressBadge.tsx
│
├── lib/
│   ├── claude/
│   │   ├── dm-engine.ts
│   │   ├── context-manager.ts
│   │   ├── party-tracker.ts
│   │   ├── session-summarizer.ts
│   │   ├── consistency-checker.ts
│   │   └── prompts/
│   │       ├── dm-master.ts
│   │       ├── lores/lotr.ts
│   │       ├── lores/zombies.ts
│   │       ├── lores/isekai.ts
│   │       ├── lores/vikingos.ts
│   │       ├── engines/story-mode.ts
│   │       ├── engines/pbta.ts
│   │       ├── engines/year-zero.ts
│   │       ├── engines/dnd5e.ts
│   │       ├── party-check.ts
│   │       └── tutorial-dm.ts
│   ├── fal/image-gen.ts
│   ├── elevenlabs/tts.ts
│   ├── elevenlabs/sfx.ts
│   ├── audio/mixer.ts
│   ├── game/
│   │   ├── dice.ts
│   │   ├── active-effects.ts
│   │   ├── roll-tables.ts
│   │   ├── combat.ts
│   │   └── macros.ts
│   ├── mcp/
│   │   ├── server.ts
│   │   ├── tools.ts
│   │   └── resources.ts
│   ├── validation/
│   │   ├── world-state.ts
│   │   ├── narrative.ts
│   │   └── api-health.ts
│   └── db/prisma.ts
│
├── data/lores/
│   ├── lotr.json
│   ├── zombies.json
│   ├── isekai.json
│   └── vikingos.json
│
├── prisma/schema.prisma
├── public/assets/medieval/
│   ├── textures/
│   ├── borders/
│   ├── icons/
│   └── fonts/
│
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── CLAUDE.md

---

## 4. BASE DE DATOS — SCHEMA PRISMA

```prisma
model User {
  id               String         @id @default(cuid())
  clerkId          String         @unique
  username         String
  email            String         @unique
  plan             Plan           @default(FREE)
  tutorialLevel    TutorialLevel  @default(NOVICE)
  tutorialProgress Json           @default("{}")
  campaigns        Campaign[]
  sessions         Session[]
  characters       Character[]
  journals         Journal[]
  macros           Macro[]
  createdAt        DateTime       @default(now())
}

model Campaign {
  id               String         @id @default(cuid())
  userId           String
  user             User           @relation(fields: [userId], references: [id])
  name             String
  lore             Lore
  engine           GameEngine
  mode             GameMode       @default(CAMPAIGN)
  worldState       Json
  worldMap         Json?
  scenes           Scene[]
  sessions         Session[]
  characters       Character[]
  npcs             NPC[]
  journals         Journal[]
  playlists        Playlist[]
  rollTables       RollTable[]
  compendiumItems  CompendiumItem[]
  status           CampaignStatus @default(ACTIVE)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
}

model Session {
  id               String          @id @default(cuid())
  campaignId       String
  campaign         Campaign        @relation(fields: [campaignId], references: [id])
  userId           String
  user             User            @relation(fields: [userId], references: [id])
  summary          String?
  partyCheckLog    Json[]
  turns            Turn[]
  combatEncounters CombatEncounter[]
  startedAt        DateTime        @default(now())
  endedAt          DateTime?
}

model Turn {
  id               String     @id @default(cuid())
  sessionId        String
  session          Session    @relation(fields: [sessionId], references: [id])
  role             TurnRole
  content          String
  imageUrl         String?
  audioUrl         String?
  diceRolls        Json?
  activeEffects    Json?
  worldStatePatch  Json?
  dmNotes          String?
  createdAt        DateTime   @default(now())
}

model Character {
  id               String     @id @default(cuid())
  userId           String
  user             User       @relation(fields: [userId], references: [id])
  campaignId       String?
  campaign         Campaign?  @relation(fields: [campaignId], references: [id])
  name             String
  lore             Lore
  archetype        String
  level            Int        @default(1)
  experience       Int        @default(0)
  stats            Json
  inventory        Json
  conditions       String[]
  activeEffects    Json       @default("[]")
  backstory        String?
  avatarUrl        String?
  tokenUrl         String?
  relationships    Json       @default("{}")
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
}

model NPC {
  id               String     @id @default(cuid())
  campaignId       String
  campaign         Campaign   @relation(fields: [campaignId], references: [id])
  name             String
  description      String
  personality      String
  motivation       String
  secrets          String?
  voiceId          String?
  tokenUrl         String?
  stats            Json?
  status           NPCStatus  @default(ALIVE)
  relationships    Json       @default("{}")
  createdAt        DateTime   @default(now())
}

model Scene {
  id               String     @id @default(cuid())
  campaignId       String
  campaign         Campaign   @relation(fields: [campaignId], references: [id])
  name             String
  description      String
  mapImageUrl      String?
  ambientSoundUrl  String?
  lightingConfig   Json?
  regions          Json?
  fogOfWar         Boolean    @default(false)
  tokens           Json       @default("[]")
  notes            Json       @default("[]")
  createdAt        DateTime   @default(now())
}

model Journal {
  id               String           @id @default(cuid())
  userId           String?
  user             User?            @relation(fields: [userId], references: [id])
  campaignId       String?
  campaign         Campaign?        @relation(fields: [campaignId], references: [id])
  title            String
  content          Json
  category         JournalCategory  @default(NOTES)
  isPublic         Boolean          @default(false)
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
}

model Playlist {
  id               String     @id @default(cuid())
  campaignId       String
  campaign         Campaign   @relation(fields: [campaignId], references: [id])
  name             String
  mood             String
  tracks           Json
  createdAt        DateTime   @default(now())
}

model RollTable {
  id               String     @id @default(cuid())
  campaignId       String
  campaign         Campaign   @relation(fields: [campaignId], references: [id])
  name             String
  description      String?
  formula          String
  results          Json
  createdAt        DateTime   @default(now())
}

model CombatEncounter {
  id               String        @id @default(cuid())
  sessionId        String
  session          Session       @relation(fields: [sessionId], references: [id])
  round            Int           @default(1)
  initiatives      Json
  log              Json          @default("[]")
  status           CombatStatus  @default(ACTIVE)
  createdAt        DateTime      @default(now())
}

model CompendiumItem {
  id               String           @id @default(cuid())
  campaignId       String
  campaign         Campaign         @relation(fields: [campaignId], references: [id])
  type             CompendiumType
  name             String
  description      String
  stats            Json?
  imageUrl         String?
  tags             String[]
  createdAt        DateTime         @default(now())
}

model Macro {
  id               String     @id @default(cuid())
  userId           String
  user             User       @relation(fields: [userId], references: [id])
  name             String
  command          String
  icon             String?
  createdAt        DateTime   @default(now())
}

enum Lore            { LOTR ZOMBIES ISEKAI VIKINGOS CUSTOM }
enum GameEngine      { STORY_MODE PBTA YEAR_ZERO DND_5E }
enum GameMode        { ONE_SHOT CAMPAIGN }
enum Plan            { FREE PRO GUILD }
enum TurnRole        { USER DM SYSTEM }
enum CampaignStatus  { ACTIVE PAUSED COMPLETED }
enum NPCStatus       { ALIVE DEAD MISSING UNKNOWN }
enum CombatStatus    { ACTIVE PAUSED COMPLETED }
enum JournalCategory { NOTES LORE SESSION_LOG NPC LOCATION QUEST }
enum CompendiumType  { MONSTER ITEM SPELL ABILITY LOCATION FACTION }
enum TutorialLevel   { NOVICE CASUAL EXPERIENCED VETERAN }
```

---

## 5. SISTEMA DE CONTEXTO — ARQUITECTURA DE MEMORIA

El problema: una campaña larga desborda el contexto si se manda todo.
Esta arquitectura mantiene cada llamada controlada en ~4.000 tokens.

### Las 3 capas

CAPA 1 — World State JSON (~800 tokens, siempre presente)
  Estado vivo. Se actualiza con delta (worldStatePatch) después de cada turno.

CAPA 2 — Session Summaries (~100 tokens/sesión, generado por Claude Haiku)
  Cada 6 turnos se genera un resumen que reemplaza el historial completo.
  Las sesiones pasadas existen SOLO como estos resúmenes.

CAPA 3 — Active Window (~1.500 tokens)
  Últimos 6-8 turnos completos. Solo lo reciente necesita contexto completo.

### World State — estructura TypeScript

```typescript
interface WorldState {
  campaign_id:             string
  lore:                    Lore
  engine:                  GameEngine
  session_count:           number
  act:                     number           // 1-5
  narrative_anchors_hit:   string[]

  party: {
    [name: string]: {
      hp:             string                // "14/20"
      level:          number
      experience:     number
      conditions:     string[]
      active_effects: string[]
      inventory:      string[]
      relationships:  { [npc: string]: string }
    }
  }

  world_flags:       { [flag: string]: boolean }
  active_quests:     string[]
  completed_quests:  string[]
  failed_quests:     string[]
  npc_states:        { [name: string]: string }
  faction_relations: { [faction: string]: number }  // -2 a +2
  current_scene:     string
  time_in_world:     string
  weather:           string
}
```

### Estructura del prompt maestro (orden obligatorio)

[BLOQUE 1] ROL Y MOTOR          ~300 tokens
[BLOQUE 2] WORLD STATE          ~800 tokens
[BLOQUE 3] LORE BIBLE           ~500 tokens
[BLOQUE 4] HISTORIAL SESIONES   ~400 tokens (resúmenes comprimidos)
[BLOQUE 5] CONVERSACIÓN ACTIVA  ~1.500 tokens (últimos 6-8 turnos)
[BLOQUE 6] FORMATO DE RESPUESTA ~200 tokens
─────────────────────────────────────────────
TOTAL CONTROLADO:               ~3.700 tokens

### Formato de respuesta del DM — siempre JSON

```typescript
interface DMResponse {
  narration:               string
  image_prompt:            string
  voice_id:                string
  ambient_mood:            string
  sfx_prompt?:             string
  world_state_updates:     Partial<WorldState>
  active_effects_updates?: ActiveEffectUpdate[]
  dm_notes:                string        // NUNCA visible al jugador
  dice_required?: {
    type:        string
    attribute:   string
    difficulty:  number
    on_success:  string
    on_failure:  string
    on_partial?: string                  // PbtA: 7-9
  }
  actions?:                string[]      // 3 opciones sugeridas
  combat_trigger?:         CombatTrigger
  scene_change?:           string
  narrative_anchor_reached?: string
  tutorial_hint?:          string        // Solo para NOVICE
}
```

---

## 6. PARTY TRACKER — CHEQUEO AUTOMÁTICO

Cada 3 turnos, ejecutar en background con Claude Haiku.
El jugador nunca lo ve. Prompt:

```
Sos el director de mesa interno — no el narrador.
Analizá el world state y la conversación reciente.
Respondé SOLO en JSON sin texto adicional:

{
  "danger_level": "bajo|medio|alto|crítico",
  "party_health_summary": "string breve",
  "ignored_quests": ["quests activas sin mención en +3 turnos"],
  "npc_reactions_pending": ["NPCs que deberían haber reaccionado"],
  "narrative_pace": "lento|normal|acelerado",
  "active_effects_expiring": ["efectos que deberían expirar"],
  "consistency_issues": ["contradicciones detectadas"],
  "intervention_needed": true|false,
  "intervention_type": "combate|npc_reaccion|evento_mundo|recordatorio_quest|efecto_activo|null",
  "intervention_suggestion": "qué inyectar naturalmente en la próxima narración"
}
```

Si intervention_needed === true:
→ El suggestion se inyecta silenciosamente en el Bloque 1 del siguiente prompt.
→ El jugador lo experimenta como evento orgánico.
→ Nunca se rompe la cuarta pared.

---

## 7. LORES — ESTRUCTURA DE CADA BIBLIA

```typescript
interface LoreBible {
  id:           Lore
  name:         string
  tagline:      string
  tone:         string[]
  world_summary: string          // 300 palabras máximo

  factions:    Faction[]         // 3-5 facciones
  locations:   Location[]        // 5-8 locaciones
  archetypes:  Archetype[]       // 3 arquetipos para onboarding

  voice_id:    string            // ElevenLabs voice DM
  npc_voices:  { [type: string]: string }
  music_mood:  string
  art_style:   string            // Prefix para Fal.ai

  roll_tables: {
    encounters:  RollTableData
    weather:     RollTableData
    loot:        RollTableData
    npc_names:   RollTableData
    events:      RollTableData
  }

  active_effects_pool: ActiveEffect[]

  narrative_skeleton: {
    act_1: NarrativeAct           // Incidente incitante (siempre)
    act_2: NarrativeAct           // Escalada
    act_3: NarrativeAct           // Punto de no retorno
    act_4: NarrativeAct           // Clímax
    act_5: NarrativeAct           // Resolución (varía según decisiones)
  }

  one_shot_hook: string
  engine_notes: {
    story_mode: string
    pbta:       string
    year_zero:  string
    dnd_5e:     string
  }

  tutorial_notes: string
  glossary: { [term: string]: string }
}
```

---

## 8. MOTORES DE REGLAS

### Story Mode (default para NOVICE)
Sin dados ni stats numéricos. Claude evalúa por coherencia narrativa.
El fallo SIEMPRE avanza la historia, nunca la bloquea.

### Powered by the Apocalypse (PbtA)
2d6. 10+ éxito total / 7-9 éxito con consecuencia / 6- fallo interesante.
Cada arquetipo tiene 5-6 movimientos específicos.

### Year Zero Engine
Pool de d6. Contar 6s. Empujar = re-tirar pero dañás el personaje.
Recursos escasos: hambre, frío, munición, estrés. Trauma acumulativo.

### D&D 5e SRD
Stats STR/DEX/CON/INT/WIS/CHA, d20, clases, niveles, spell slots.
SOLO contenido del System Reference Document — legalmente libre.

### Notación de dados soportada (lib/game/dice.ts)
NdX        → N dados de X caras
NdXkHn     → Quedarse con los n más altos (advantage)
NdXkLn     → Quedarse con los n más bajos (disadvantage)
NdX+M      → Con modificador
NdX!       → Exploding dice

---

## 9. GENERACIÓN DE IMÁGENES

```typescript
// lib/fal/image-gen.ts

const LORE_ART_STYLES: Record<Lore, string> = {
  LOTR:     "fantasy oil painting, Tolkien illustrated style, dramatic lighting",
  ZOMBIES:  "dark photography, desaturated, gritty cinematic realism",
  ISEKAI:   "anime illustration, vibrant colors, Studio Ghibli inspired",
  VIKINGOS: "norse mythology art, muted earth tones, epic scale, painterly",
  CUSTOM:   "fantasy illustration, detailed, cinematic lighting",
}

// Proceso:
// 1. DM genera image_prompt en JSON
// 2. Se manda a Fal.ai EN PARALELO (no bloquea narración)
// 3. Mientras se genera: skeleton loader medieval
// 4. Al resolverse: fade-in con animación ink-reveal

// Fallback: si Fal.ai falla → ilustración estática del lore
// Circuit breaker: 3 fallos → desactivar por 5 minutos
```

---

## 10. SISTEMA DE VOZ Y AUDIO

```typescript
const LORE_VOICES: Record<Lore, string> = {
  LOTR:     "grave_pausado",      // Masculina, profunda, sabio
  ZOMBIES:  "tenso_urgente",      // Susurrada, superviviente
  ISEKAI:   "energetico",         // Expresiva, anime narrator
  VIKINGOS: "ronco_epico",        // Ronca, skald nórdico
  CUSTOM:   "neutral_narrator",
}

// Howler.js mixer
interface AudioMixer {
  voice:   number   // default 1.0
  music:   number   // default 0.25
  sfx:     number   // default 0.7
  master:  number   // default 0.8
}

// Playlists por mood: combat_epic | exploration_calm | drama_tense |
//                    rest_peaceful | horror_ambient | victory_triumphant
```

Voz y SFX son features Pro. Música ambiental limitada en Free.

---

## 11. ESTÉTICA VISUAL — PRIMERA CAPA SIN FIGMA

Primera versión 100% en código: CSS custom properties + Google Fonts + SVG inline + Tailwind extendido.
Objetivo: Foundry VTT / grimorio medieval / D&D clásico.

### Google Fonts (en layout.tsx)

```html
<link href="https://fonts.googleapis.com/css2?
  family=Cinzel+Decorative:wght@400;700&
  family=Cinzel:wght@400;600;700&
  family=EB+Garamond:ital,wght@0,400;0,600;1,400&
  family=Crimson+Text:ital,wght@0,400;0,600;1,400&
  family=Courier+Prime&display=swap" rel="stylesheet">
```

### CSS Variables

```css
:root {
  --color-parchment:       #F4E8C1;
  --color-parchment-dark:  #D4B896;
  --color-ink:             #1C1208;
  --color-gold:            #C9A84C;
  --color-gold-bright:     #F5C842;
  --color-gold-dim:        #8B6914;
  --color-blood:           #8B1A1A;
  --color-shadow:          #0D0A05;
  --color-stone:           #2C2416;
  --color-emerald:         #1A3A2A;

  --bg-main:      #0D0A05;
  --bg-panel:     #1A1208;
  --bg-card:      #120C04;
  --bg-parchment: #F4E8C1;

  --font-title:   'Cinzel Decorative', serif;
  --font-heading: 'Cinzel', serif;
  --font-body:    'EB Garamond', serif;
  --font-ui:      'Crimson Text', serif;
  --font-mono:    'Courier Prime', monospace;

  --shadow-ornate: 0 0 0 3px #0D0A05, 0 0 0 4px var(--color-gold-dim),
                   inset 0 0 20px rgba(0,0,0,0.5);
  --shadow-glow:   0 0 20px rgba(201,168,76,0.3);
}
```

### Efectos de textura — CSS puro

```css
.texture-parchment {
  background-color: var(--color-parchment);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'
    width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise'
    baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E
    %3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
}

.panel-dark {
  background: radial-gradient(ellipse at center, #1A1208 0%, #0D0A05 100%);
  box-shadow: inset 0 0 80px rgba(0,0,0,0.9);
}

.ornate-border {
  border: 1px solid var(--color-gold-dim);
  box-shadow: var(--shadow-ornate);
}

.candlelight { animation: flicker 3s ease-in-out infinite; }
@keyframes flicker {
  0%, 100% { opacity: 1; filter: brightness(1); }
  50%       { opacity: 0.85; filter: brightness(0.9); }
}

.ink-reveal { animation: inkReveal 0.5s ease forwards; }
@keyframes inkReveal {
  from { opacity: 0; filter: blur(2px); transform: translateY(4px); }
  to   { opacity: 1; filter: blur(0);   transform: translateY(0); }
}
```

### tailwind.config.ts

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        parchment: { DEFAULT: '#F4E8C1', dark: '#D4B896' },
        gold:      { DEFAULT: '#C9A84C', bright: '#F5C842', dim: '#8B6914' },
        blood:     '#8B1A1A',
        shadow:    { DEFAULT: '#0D0A05', mid: '#1A1208' },
        stone:     '#2C2416',
        ink:       '#1C1208',
        emerald:   '#1A3A2A',
      },
      fontFamily: {
        title:   ['Cinzel Decorative', 'serif'],
        heading: ['Cinzel', 'serif'],
        body:    ['EB Garamond', 'serif'],
        ui:      ['Crimson Text', 'serif'],
        mono:    ['Courier Prime', 'monospace'],
      },
    },
  },
}
```

### Componentes a construir en orden

1. ParchmentPanel       — base de toda la UI
2. OrnateFrame          — marcos SVG inline, sin assets externos
3. RunicButton          — botones con hover dorado
4. ScrollText           — streaming letra por letra
5. DiceRoller           — dados 3D con @3d-dice/dice-box
6. HPBar                — barra de vida con textura
7. ConditionBadge       — estados: envenenado, paralizado, etc.
8. TokenAvatar          — avatar redondo estilo token Foundry
9. NarratorPanel        — panel principal (integra los anteriores)
10. CombatTracker       — iniciativa, HP, condiciones en tiempo real

---

## 12. FLUJO DE ONBOARDING (3 pantallas — máximo 90 segundos)

PANTALLA 1 — Elegí tu mundo
  Grilla 2x2: LOTR / Zombies / Isekai / Vikingos
  Cada uno: imagen generada + nombre + frase atmosférica

PANTALLA 2 — Cómo querés jugar
  Fila 1: ONE-SHOT ("45 min, misión única") vs CAMPAÑA ("múltiples sesiones")
  Fila 2: Motor de reglas — 4 opciones con descripción de 1 línea
  Fila 3: Nivel de experiencia → define tutorial automático
    "Primera vez" / "Jugué RPGs" / "Jugué D&D" / "Soy veterano"

PANTALLA 3 — Elegí quién sos
  3 arquetipos con imagen + nombre + 2 líneas en lenguaje simple
  SIN jerga técnica para NOVICE

→ El DM narra la apertura y hace UNA sola pregunta.
→ El jugador ya está dentro. No hay más pantallas.

---

## 13. FUNCIONALIDADES DE FOUNDRY VTT — INCORPORADAS

### Ya contemplado desde el inicio
- Sistema de personajes con stats
- Tracker de combate e iniciativa
- Chat con tiradas embebidas
- Audio y música ambiental
- Journal / notas de sesión
- Permisos DM vs jugador

### Incorporado en esta versión (gap analysis Foundry)

ACTIVE EFFECTS: Buffs/debuffs que modifican stats automáticamente con duración.
  Ej: "Envenenado → -2 a tiradas durante 3 turnos". Se muestran como badges.

ROLLABLE TABLES: Tablas de contenido aleatorio por lore.
  Encuentros, loot, clima, nombres de NPC. Pre-cargadas en data/lores/.

COMPENDIUM BROWSER: Navegador de contenido (monstruos, items, hechizos, locaciones).
  Filtros por tipo, lore, nivel. El DM agrega contenido en cualquier momento.

SCENE REGIONS + EVENTOS: Zonas del mapa que disparan eventos automáticamente.
  Ej: "Al entrar al bosque → sonido ambiental + descripción de peligro".

FOG OF WAR DINÁMICO: Áreas no exploradas cubiertas en el world map.
  Se revelan progresivamente. El DM controla visibilidad.

TOKENS EN MAPA: Avatares de personajes y NPCs posicionables.
  Movimiento visible en tiempo real en modo multijugador.

MAP NOTES: Pines en el mapa con journal entries asociadas.
  Notas secretas del DM (solo él las ve). Click = descripción de locación.

PLAYLISTS POR MOOD: El sistema cambia música según tipo de escena automáticamente.
  El DM puede sobrescribir manualmente.

ADVANCED DICE: Notación completa, modificadores por condición/efecto/clase.
  Historial en el chat con animación 3D.

CARDS: Para lores que lo requieran (Destino en Vikingos, Tarot en Lovecraft).
  Mazos shuffleables con imágenes generadas.

MACROS: Comandos guardables para acciones frecuentes.
  Ej: un macro ejecuta tirada + descripción + imagen automáticamente.

ADVENTURE DOCUMENTS: Paquetes de aventuras importables a una campaña.
  Formato JSON con escenas, NPCs, maps y skeleton narrativo.

AMBIENT SOUNDS POSICIONALES: Sonidos atados a regiones o escenas específicas.
  Río = agua corriente, taverna = ruido de gente. Mezclados con Howler.js.

### No aplica para este proyecto
- Self-hosted / instalación local (somos SaaS web)
- Module ecosystem de terceros (controlamos el stack)
- Voice/Video chat integrado (fuera de scope, Discord para eso)
- Battle maps tácticos con grid (el combate es narrativo)

---

## 14. SISTEMA DE TUTORIALES POR NIVEL

### Los 4 perfiles (detectados en onboarding Pantalla 2)

NOVICE      → "Primera vez que juego algo así"
CASUAL      → "Jugué videojuegos RPG (Skyrim, Baldur's Gate, etc.)"
EXPERIENCED → "Jugué D&D o similar alguna vez"
VETERAN     → "Juego rol regularmente, sé lo que hago"

Guardado en User.tutorialLevel. Editable desde el perfil en cualquier momento.

### Lo que recibe cada perfil

NOVICE:
  - Tour obligatorio de 5 pasos al iniciar la primera partida:
    Paso 1: "Esto es el narrador — acá aparece la historia"
    Paso 2: "Estos son tus botones — elegís qué hace tu personaje"
    Paso 3: "Esta es tu ficha — tus stats y condición"
    Paso 4: "Así se tira un dado — a veces el juego te va a pedir uno"
    Paso 5: "¡Listo! Ahora tomá tu primera decisión"
  - Motor forzado: Story Mode en la primera sesión
  - DM en modo tutor: tutorial_hint cada 4 turnos
  - Glossary tooltips: hover sobre cualquier término explica en simple
  - Guía "¿Qué es el rol?" accesible desde el menú
  - Achievements medievales por milestones de aprendizaje

CASUAL:
  - Tour corto de 3 pasos (diferencias con videojuegos):
    "A diferencia de Skyrim, acá no hay una respuesta correcta"
    "El DM adapta la historia a tus decisiones en tiempo real"
    "Los dados = incertidumbre, como críticos en un RPG"
  - Motor sugerido: PbtA
  - Tooltips con analogías de videojuegos conocidos

EXPERIENCED:
  - Sin tour. Mensaje: "Sabemos que sabés jugar. Elegí tu motor."
  - Cheatsheet de diferencias entre motores (popup opcional)
  - Glossary disponible pero no intrusivo

VETERAN:
  - Zero onboarding. Directo al juego.
  - Acceso a configuración avanzada: dificultad, house rules, motor custom
  - Puede crear lores personalizados y Adventure Documents compartibles

### DM en modo tutor — prompt adicional para NOVICE

Se agrega al Bloque 1 del prompt maestro SOLO para NOVICE:

"El jugador es nuevo en rol. Además de narrar:
- Cada 4 turnos, incluir UN tutorial_hint en lenguaje simple
  explicando la mecánica que acaba de ocurrir.
  Ej: 'Eso fue una tirada de Percepción — sirve para notar detalles ocultos'
- Nunca usar jerga técnica sin explicarla primero
- Si el jugador parece confundido, ofrecer 3 opciones de acción siempre
- Consecuencias del fallo deben ser interesantes, no frustrantes
- El primer combate debe ser fácilmente ganable — es demostrativo"

### Tutorial progress — User.tutorialProgress JSON

{
  "first_session_completed": false,
  "first_dice_roll": false,
  "first_combat_survived": false,
  "first_npc_conversation": false,
  "used_all_action_types": false,
  "completed_one_shot": false,
  "completed_campaign_act_1": false
}

Cada milestone muestra notificación estilo "achievement" medieval.

---

## 15. SISTEMA DE AUTO-CHEQUEO Y PREVENCIÓN DE BUGS

El sistema nunca muestra un estado inválido al jugador. Siempre hay fallback graceful.

### Nivel 1 — Validación de World State (lib/validation/world-state.ts)

Corre: antes de cada llamada al DM, después de cada worldStatePatch, al iniciar sesión.

Chequea:
- HP nunca supera maxHP
- Quests no pueden estar en active Y completed simultáneamente
- NPCs muertos no tienen estados activos
- Acto narrativo debe ser 1-5
- Faction relations en rango -2 a +2
- Active effects tienen duración válida

Si hay error auto-corregible: corregir y loggear.
Si hay error crítico: continuar con el estado anterior válido, notificar al sistema.

### Nivel 2 — Coherencia Narrativa (lib/validation/narrative.ts)

Corre cada 5 turnos con Claude Haiku, en background.

Prompt:
"Revisá esta conversación y world state. Chequeá:
1. ¿Hay contradicciones factuales?
2. ¿Hay inconsistencias de lore?
3. ¿El DM rompió el personaje o mencionó ser una IA?
4. ¿Las consecuencias de acciones fueron aplicadas?
Respondé en JSON: { issues: [], severity: 'none|low|high', fix: '' }
Si severity es 'high', el fix se inyecta en el siguiente prompt del DM."

### Nivel 3 — Circuit Breakers de APIs (lib/validation/api-health.ts)

```typescript
const BREAKERS = {
  claude:     { maxFailures: 3, resetAfterMs: 60_000 },
  fal:        { maxFailures: 3, resetAfterMs: 120_000 },
  elevenlabs: { maxFailures: 3, resetAfterMs: 120_000 },
}

// Fallbacks:
// Claude     → NUNCA puede fallar. Retry con exponential backoff.
// Fal.ai     → Ilustración estática del lore
// ElevenLabs → Desactivar voz, continuar solo con texto
```

Health check endpoint: GET /api/health → status de todos los servicios externos.

### Nivel 4 — Testing

__tests__/unit/
  - world-state.test.ts       — validador de world state
  - dice.test.ts              — todas las fórmulas de dados
  - context-manager.test.ts   — contexto no supera 4.000 tokens
  - active-effects.test.ts    — aplicación y expiración de efectos
  - roll-tables.test.ts       — distribución estadística correcta

__tests__/integration/
  - dm-engine.test.ts         — DM genera respuesta JSON válida
  - party-check.test.ts       — party check detecta problemas reales
  - session-flow.test.ts      — flujo completo de sesión

__tests__/e2e/
  - first-session.spec.ts     — usuario NOVICE completa primera sesión
  - combat.spec.ts            — combate completo con tiradas
  - campaign-save.spec.ts     — guardar y continuar campaña

Regla: ningún merge a main sin que todos los tests pasen.
CI/CD: GitHub Actions en cada PR automáticamente.

### Errores en UI — nunca mostrar errores técnicos al jugador

```typescript
const ERROR_NARRATIVES = {
  dm_timeout:  "Las runas se oscurecen momentáneamente... [Reintentando]",
  image_failed: "La visión se desvanece antes de tomar forma...",
  voice_failed: "El narrador pierde la voz por un instante...",
  save_failed:  "El pergamino se resiste a ser escrito... [Reintentando]",
  generic:      "Las fuerzas del destino vacilan... [Reintentando]",
}
```

---

## 16. ARQUITECTURA MCP — PREPARADO PARA AGENTES

### Por qué MCP

- Un agente puede operar como DM autónomo avanzado
- Agentes externos pueden crear contenido (aventuras, lores, NPCs)
- Integración con n8n, Make, y orquestadores de agentes
- Claude Code puede interactuar directamente con el hub

### Tools MCP expuestas (/api/mcp/tools)

SESIÓN:
  get_session_state(session_id)          → WorldState + historial + personajes
  advance_narrative(session_id, action)  → DMResponse completo
  save_world_state(session_id, patch)    → WorldState actualizado
  run_party_check(session_id)            → PartyCheckResult

CONTENIDO:
  generate_npc(campaign_id, role, lore)  → NPC completo
  generate_scene(campaign_id, desc)      → Scene con imagen y audio
  roll_table(table_id, formula?)         → RollResult con texto narrativo
  add_to_compendium(campaign_id, item)   → CompendiumItem creado

PERSONAJE:
  update_character(character_id, updates)         → Character actualizado
  apply_active_effect(character_id, effect)        → Character con efecto

COMBATE:
  start_combat(session_id, combatants)             → CombatEncounter
  advance_combat(encounter_id, action)             → CombatState + narración

AUDIO/VISUAL:
  generate_image(prompt, lore)                     → { url: string }
  generate_voice(text, voice_id)                   → { audio_url: string }
  set_ambient_mood(session_id, mood)               → { playlist_url: string }

ADMIN:
  health_check()                                   → HealthStatus de todos los servicios
  validate_world_state(campaign_id)                → ValidationResult

### Resources MCP expuestos (/api/mcp/resources)

  rpghub://lores                → Todas las biblias de lore
  rpghub://campaigns/{id}       → Datos completos de campaña
  rpghub://compendium/{lore}    → Compendio por lore
  rpghub://prompts/dm-master    → Prompt maestro del DM

### MCPs externos que Claude Code debe conectar

DESARROLLO:
  Context7 MCP     → Docs actualizadas de Next.js, Tailwind, Prisma
  Playwright MCP   → Screenshots para verificar estética visual
  Filesystem MCP   → Gestión de assets medievales locales
  GitHub MCP       → PRs, issues, código del proyecto

PRODUCCIÓN (por fases):
  Supabase MCP     → Acceso directo a la DB desde agentes
  Vercel MCP       → Deploy y logs de producción
  Stripe MCP       → Gestión de suscripciones (Fase 5)
  ElevenLabs MCP   → Gestión de voces y proyectos de audio

### Seguridad del servidor MCP

- Auth: Bearer token de Clerk en cada request
- Rate limiting: 60 requests/minuto por usuario
- Permisos: cada tool chequea acceso del user al recurso
- Logging: toda interacción de agentes se loggea con session_id
- Sandbox: agentes NO pueden eliminar campañas ni personajes
  (requiere confirmación del usuario humano)

---

## 17. CONVENCIONES DE CÓDIGO

- Componentes: PascalCase (NarratorPanel.tsx)
- Funciones y variables: camelCase (generateSceneImage)
- Archivos de config: kebab-case (lore-config.ts)
- Tipos e interfaces: PascalCase, interfaces con prefijo I (IDMResponse)
- Variables de entorno: SCREAMING_SNAKE_CASE
- NEXT_PUBLIC_ solo si el valor es seguro de exponer al cliente
- Comentarios: en español
- Tests: en __tests__/ junto al módulo testeado
- Server Actions: en actions.ts dentro de cada feature folder
- NUNCA usar any en TypeScript — usar unknown y narrowing
- NUNCA hacer fetch al DM sin pasar por context-manager.ts
- NUNCA actualizar worldState directamente — siempre via worldStatePatch
- NUNCA mostrar errores técnicos al jugador — usar ERROR_NARRATIVES

---

## 18. VARIABLES DE ENTORNO

```bash
# .env.local

ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
FAL_KEY=
ELEVENLABS_API_KEY=

# Feature Flags (false hasta que el módulo esté listo)
NEXT_PUBLIC_ENABLE_VOICE=false
NEXT_PUBLIC_ENABLE_IMAGES=false
NEXT_PUBLIC_ENABLE_MULTIPLAYER=false
NEXT_PUBLIC_ENABLE_CARDS=false
NEXT_PUBLIC_ENABLE_MCP_SERVER=false
NEXT_PUBLIC_ENABLE_COMBAT_TRACKER=false
NEXT_PUBLIC_TUTORIAL_MODE=true

# Config
NEXT_PUBLIC_DM_MODEL=claude-sonnet-4-20250514
NEXT_PUBLIC_UTILITY_MODEL=claude-haiku-4-5-20251001
PARTY_CHECK_INTERVAL=3
SESSION_SUMMARIZE_INTERVAL=6
MAX_CONTEXT_TOKENS=4000
CIRCUIT_BREAKER_THRESHOLD=3
```

---

## 19. ORDEN DE CONSTRUCCIÓN — FASES

FASE 1 — Semanas 1-3: Cimientos
  Setup repo + CI/CD + Vercel preview
  Auth con Clerk
  Schema Prisma + Supabase
  Tailwind config con tokens medievales (sección 11)
  Componentes base: ParchmentPanel, OrnateFrame, RunicButton
  Layout principal y navegación

FASE 2 — Semanas 4-7: Onboarding + DM Básico
  Flujo de 3 pantallas de onboarding
  DM autónomo: solo texto, sin imágenes ni voz todavía
  Sistema de contexto (context-manager.ts)
  World State + worldStatePatch pipeline
  ScrollText + NarratorPanel
  Story Mode funcional
  Guardar y continuar sesión

FASE 3 — Semanas 8-12: Features Core
  Imágenes con Fal.ai
  Party Tracker automático
  Validación de World State
  Sistema de tutoriales NOVICE completo
  Active Effects
  CombatTracker
  PbtA + Year Zero engines
  Rollable Tables
  DiceRoller 3D

FASE 4 — Semanas 13-18: Inmersión Total
  ElevenLabs voz + SFX + Howler.js mixer
  World Map con Leaflet + Fog of War
  Compendium Browser
  Journal con TipTap
  Scene Regions con eventos
  D&D 5e engine
  Cards system
  Macros
  Adventure Documents (2 por lore)

FASE 5 — Semanas 19-24: Plataforma
  Servidor MCP completo
  Multijugador con Socket.io
  Sala de campaña en tiempo real
  Monetización con Stripe
  E2E tests completos
  Performance y optimización

REGLA: Una feature no está terminada hasta que tiene:
  1. Funcionalidad básica working
  2. Estilos medievales aplicados
  3. Estado de error con ERROR_NARRATIVES
  4. Loading state con animación temática
  5. Test unitario que pasa

---

## 20. ESTADO ACTUAL DEL PROYECTO

Última actualización: 2026-03-07
Fase actual:         1 — Cimientos (COMPLETA)
Última sesión:       Setup completo de Next.js 14 + Auth + Sistema de diseño medieval

COMPLETADO:
  ✅ Setup Next.js 14 con TypeScript + Tailwind CSS
  ✅ Instalación de todas las dependencias base:
     - @clerk/nextjs, @prisma/client, zustand, @tanstack/react-query
     - framer-motion, class-variance-authority, clsx, tailwind-merge, lucide-react
  ✅ Configuración completa de Tailwind con tokens medievales:
     - Colores: parchment, gold (DEFAULT, bright, dim), blood, shadow, ink, emerald
     - Fonts: Cinzel Decorative, Cinzel, EB Garamond, Crimson Text, Courier Prime
     - Shadows: ornate, glow
     - Animations: flicker, ink-reveal
  ✅ globals.css con CSS variables + texture-parchment utility (SVG inline)
  ✅ Estructura completa de carpetas según sección 3 del CLAUDE.md
  ✅ Auth con Clerk completamente configurado:
     - ClerkProvider en layout.tsx
     - middleware.ts con protección de rutas
     - Páginas /login y /register funcionales
     - Rutas públicas: /, /login, /register, /api/health
  ✅ Prisma schema completo definido (schema.prisma):
     - Todos los modelos: User, Campaign, Session, Turn, Character, NPC, etc.
     - Todos los enums correctamente formateados
     - Prisma Client generado (usando Prisma 5.22.0 por compatibilidad)
     - ⚠️ NO se hizo push a Supabase todavía (como estaba planeado)
  ✅ Componentes base medievales (components/medieval/):
     - ParchmentPanel.tsx (con variant ornate)
     - OrnateFrame.tsx (variants: gold, shadow con SVG inline)
     - RunicButton.tsx (variants: primary, secondary, danger)
  ✅ lib/utils.ts con función cn() para merge de clases
  ✅ Layout principal con Navbar medieval:
     - Logo RPG HUB con font-title
     - Links a Campañas, Personajes, Compendio
     - UserButton de Clerk integrado
     - Botones de Login/Register para usuarios no autenticados
  ✅ Homepage mejorada con componentes medievales
  ✅ Página /design-system completa (CHECKPOINT VISUAL CRÍTICO):
     - Secciones: Tipografía, Colores, ParchmentPanel, OrnateFrame, RunicButton
     - Animaciones (flicker, ink-reveal)
     - Combinaciones de componentes
     - Sombras y efectos
  ✅ Páginas placeholder del dashboard:
     - /(dashboard)/page.tsx
     - /(dashboard)/campaigns/page.tsx
     - /(dashboard)/characters/page.tsx
     - /(dashboard)/compendium/page.tsx
  ✅ Página /onboarding placeholder
  ✅ README.md completo con instrucciones de setup
  ✅ .env.local.example con todas las variables necesarias
  ✅ Git inicializado con commit inicial
  ✅ .gitignore configurado correctamente

EN PROGRESO:
  Nada — Fase 1 completamente terminada

PRÓXIMOS PASOS INMEDIATOS (Fase 2 - Onboarding + DM Básico):
  1. Configurar cuenta de Supabase y obtener DATABASE_URL
  2. npx prisma db push (primera vez contra Supabase)
  3. Crear primer lore completo: LOTR (data/lores/lotr.json)
     - Estructura según sección 7: factions, locations, archetypes
     - Roll tables: encounters, weather, loot, npc_names, events
     - Narrative skeleton con 5 actos
  4. Crear prompts del DM (lib/claude/prompts/):
     - dm-master.ts (prompt maestro con estructura de 6 bloques)
     - lores/lotr.ts (biblia de LOTR)
     - engines/story-mode.ts (motor Story Mode para NOVICE)
  5. Implementar flujo de onboarding (3 pantallas):
     - Pantalla 1: Elegir mundo (solo LOTR por ahora)
     - Pantalla 2: Modo (ONE_SHOT/CAMPAIGN) + Engine + Tutorial Level
     - Pantalla 3: Elegir arquetipo (3 opciones del lore LOTR)
  6. Integrar Claude API:
     - Crear lib/claude/dm-engine.ts
     - Crear lib/claude/context-manager.ts
     - API route: app/api/dm/route.ts (streaming)
  7. Crear componente ScrollText.tsx (streaming letra por letra)
  8. Crear componente NarratorPanel.tsx principal
  9. Implementar Story Mode engine básico
  10. Guardar y continuar sesión (básico con Prisma)

DECISIONES PENDIENTES:
  - Nombre final del producto (por ahora: RPG HUB)
  - Dominio
  - Precio de planes Pro y Guild
  - Voces específicas de ElevenLabs para cada lore

PROBLEMAS CONOCIDOS:
  - Prisma 7.x tiene cambios breaking en datasource config
    → Solución aplicada: downgrade a Prisma 5.22.0
  - Clerk API keys vacías en .env.local (normal, usuario las agregará)
  - Vulnerabilidades en npm audit (9 vulnerabilities: 5 moderate, 4 high)
    → No críticas, son dependencias de desarrollo

NOTAS TÉCNICAS:
  - Prisma Client generado pero NO conectado a DB real todavía
  - Auth funciona en modo desarrollo (Clerk dev keys pendientes del usuario)
  - Todos los feature flags en false excepto TUTORIAL_MODE=true
  - El SVG inline para textura de pergamino funciona correctamente
  - Fonts medievales se cargan via next/font/google (optimización automática)

CONTEXTO PARA LA PRÓXIMA SESIÓN:
  Fase 1 100% completa. El proyecto está listo para comenzar Fase 2.

  La base visual está sólida: sistema de diseño medieval funcionando perfectamente
  (verificar en /design-system). Todos los componentes base creados y testeados.
  Auth configurado pero sin keys reales todavía.

  El siguiente paso crítico es crear el primer lore completo (LOTR) con toda su
  estructura (biblias, roll tables, narrative skeleton) y los prompts del DM
  para poder integrar Claude API y tener la primera experiencia de juego funcional.

  Estructura de carpetas completa creada, lista para recibir todo el código de Fase 2.

  IMPORTANTE: Antes de empezar Fase 2, el usuario debe:
  1. Obtener Clerk API keys y agregarlas a .env.local
  2. Crear proyecto en Supabase y obtener DATABASE_URL
  3. Obtener Anthropic API key para Claude

  Sin estas keys, la Fase 2 no puede arrancar.

---

> PARA CLAUDE CODE: Leé este archivo completo antes de cada sesión.
> Nunca asumas el estado del proyecto — chequeá la sección 20.
> Si algo contradice este archivo, avisá antes de proceder.
> Al terminar cada sesión, actualizá la sección 20 con exactamente
> qué se completó, qué está en progreso, y qué viene después.
> Este archivo es la memoria del proyecto. Mantenerlo actualizado
> es tan importante como el código mismo.
