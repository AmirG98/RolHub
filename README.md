# RPG Hub - Digital Dungeon Master

Hub de rol narrativo con DM autónomo powered by Claude API.

## 🎮 ¿Qué es esto?

Un hub digital de juego de rol narrativo con DM autónomo. Pensado para gamers que nunca jugaron rol — la experiencia se siente como un videojuego RPG narrativo, no como una sesión de D&D tradicional.

El jugador elige: modo (one-shot / campaña) → mundo (lore) → motor de reglas → personaje → juega.

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Componentes**: shadcn/ui patterns + Framer Motion
- **Estado**: Zustand + TanStack Query
- **Backend**: Next.js API Routes + Server Actions
- **Base de datos**: Prisma ORM + PostgreSQL (Supabase)
- **Auth**: Clerk
- **IA**: Anthropic Claude API (narración), Fal.ai (imágenes), ElevenLabs (voz)

## 📦 Instalación Local

1. Clonar el repositorio:
```bash
git clone <url-del-repo>
cd RolHub
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.local.example .env.local
```

4. Editar `.env.local` con tus API keys:
   - Clerk (Auth) - obligatorio
   - Supabase (DB) - obligatorio para Fase 2+
   - Anthropic, Fal.ai, ElevenLabs - para Fase 2+

5. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

6. Abrir [http://localhost:3000](http://localhost:3000)

## 🎨 Sistema de Diseño

Accede a `/design-system` para ver todos los componentes medievales base:
- Tipografía medieval (Cinzel, EB Garamond)
- Paleta de colores (parchment, gold, blood, shadow)
- Componentes: ParchmentPanel, OrnateFrame, RunicButton
- Animaciones: flicker, ink-reveal

## 📁 Estructura del Proyecto

```
rpg-hub/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Dashboard protegido
│   ├── design-system/     # Sistema de diseño visual
│   └── api/               # API routes
├── components/
│   ├── medieval/          # Componentes con estética medieval
│   ├── game/              # Componentes de juego (Fase 2+)
│   └── ui/                # shadcn/ui base
├── lib/
│   ├── claude/            # DM engine y prompts (Fase 2+)
│   ├── db/                # Prisma client
│   └── utils.ts           # Utilidades
├── prisma/
│   └── schema.prisma      # Schema de base de datos
└── CLAUDE.md              # 📖 ARCHIVO MAESTRO - leer antes de cada sesión
```

## 🚀 Estado Actual

**Fase Actual**: Fase 1 - Cimientos (COMPLETA)

**Completado**:
- ✅ Setup Next.js 14 con TypeScript
- ✅ Configuración Tailwind con tokens medievales
- ✅ Google Fonts medievales
- ✅ Estructura completa de carpetas
- ✅ Auth con Clerk + middleware
- ✅ Prisma schema definido (sin push a DB)
- ✅ Componentes base: ParchmentPanel, OrnateFrame, RunicButton
- ✅ Layout principal con Navbar medieval
- ✅ Página /design-system funcional
- ✅ Navegación básica del dashboard

**Próximos Pasos** (Fase 2):
1. Pushear schema Prisma a Supabase
2. Implementar flujo de onboarding (3 pantallas)
3. Integrar Claude API para DM básico (solo texto)
4. Sistema de contexto (context-manager.ts)
5. ScrollText component con streaming
6. NarratorPanel principal
7. Story Mode engine básico

## 📖 Documentación

**IMPORTANTE**: El archivo `CLAUDE.md` es el archivo maestro del proyecto. Contiene:
- Arquitectura completa
- Stack tecnológico detallado
- Sistema de contexto para el DM
- Estructura de lores
- Motores de reglas
- Plan de fases completo
- **Sección 20: Estado actual** (actualizar al final de cada sesión)

## 🎯 Público Objetivo

Gamers 18-35 sin experiencia en rol de mesa. La experiencia se siente como Baldur's Gate o Skyrim, pero con un DM que adapta la historia en tiempo real.

## 🏗️ Fases del Proyecto

1. **Fase 1 - Cimientos** ✅ (semanas 1-3): Setup, Auth, Diseño medieval
2. **Fase 2 - Onboarding + DM Básico** (semanas 4-7): Claude API, flujo inicial
3. **Fase 3 - Features Core** (semanas 8-12): Imágenes, Party Tracker, Active Effects
4. **Fase 4 - Inmersión Total** (semanas 13-18): Voz, Mapas, Compendio
5. **Fase 5 - Plataforma** (semanas 19-24): MCP, Multiplayer, Monetización

## 📄 Licencia

Proyecto en desarrollo - Licencia por definir

## 🤝 Contribución

Este proyecto está siendo desarrollado por el equipo de RPG Hub. Para contribuir, consulta el archivo CLAUDE.md para entender la arquitectura completa.

---

**Nota para desarrolladores**: Leer `CLAUDE.md` completo antes de cada sesión de desarrollo. Es la memoria del proyecto.
