# 🚀 Roadmap para Launch - RPG Hub

## ✅ COMPLETADO HOY (2026-03-08)

### Sistema Base
- ✅ Next.js 14 + TypeScript + Tailwind configurado
- ✅ Prisma + PostgreSQL (Supabase) configurado
- ✅ Deploy a Vercel funcionando

### Autenticación
- ✅ Clerk integrado y funcionando
- ✅ Login/Register con tema medieval
- ✅ Middleware protegiendo rutas
- ✅ Keys configuradas en producción

### Lores (Mundos de Juego)
- ✅ 7 lores completos con JSON estructurado:
  - 🏰 Tierra Media (LOTR)
  - ☠️ Apocalipsis Zombie
  - ⭐ Mundo Isekai
  - ⚔️ Saga Vikinga
  - 🚀 Star Wars
  - 🏙️ Cyberpunk
  - 👁️ Horrores Cósmicos (Lovecraft)
- ✅ Cada lore incluye:
  - 3 arquetipos jugables con stats completos
  - 5-8 locaciones
  - 4-5 facciones
  - Roll tables (encuentros, clima, loot)
  - 5 actos narrativos
  - Glosario de términos

### UI/UX
- ✅ Sistema de diseño medieval (colores, fuentes, efectos)
- ✅ LoreSelector funcionando con 7 lores
- ✅ Onboarding flow (3 pantallas)
- ✅ Componentes base (ParchmentPanel, OrnateFrame, RunicButton)

---

## 🔴 CRÍTICO - MAÑANA (PARA LANZAR)

### 1. **Sala de Juego (Play Screen)** - PRIORIDAD MÁXIMA
**Tiempo estimado: 3-4 horas**

**Componentes necesarios:**
- [ ] `/play/[sessionId]/page.tsx` funcional
- [ ] NarratorPanel mostrando narración del DM
- [ ] ActionButtons para que el jugador elija acciones
- [ ] ChatPanel para el historial de la sesión
- [ ] Integración real con Claude API (Anthropic)

**API Endpoints:**
- [ ] `/api/dm/route.ts` - Llamada a Claude para generar narración
- [ ] `/api/session/[id]/route.ts` - Obtener datos de sesión
- [ ] `/api/session/turn/route.ts` - Crear nuevo turno del jugador

**Flujo completo:**
1. Usuario crea personaje → Se crea Campaign + Session + Character
2. Usuario es redirigido a `/play/[sessionId]`
3. Sistema muestra el primer turno (SYSTEM) con el hook narrativo
4. Usuario escribe acción o elige de las sugeridas
5. Sistema llama a Claude API con contexto (world state + historial)
6. Claude genera:
   - Narración
   - Consecuencias
   - Updates al world state
   - 3 acciones sugeridas para el jugador
7. Sistema guarda el turno y actualiza UI
8. Loop continúa

**Prompt del DM** (archivo crítico):
- [ ] `lib/claude/prompts/dm-master.ts` - Prompt maestro
- [ ] Cargar lore correcto según la campaña
- [ ] Cargar reglas del motor seleccionado
- [ ] Incluir world state en cada llamada
- [ ] Parsear respuesta JSON del DM

---

### 2. **Sistema de Dados (Dice Roller)**
**Tiempo estimado: 1-2 horas**

**Componentes:**
- [ ] `components/medieval/DiceRoller.tsx` con @3d-dice/dice-box
- [ ] Integrar en la sala de juego
- [ ] Mostrar resultados y aplicar consecuencias
- [ ] Soporte para notación: `1d20`, `2d6+3`, `1d20kH` (advantage)

**Implementación:**
- [ ] `lib/game/dice.ts` - Lógica de tiradas
- [ ] Animación 3D de dados
- [ ] Historial de tiradas en chat
- [ ] Auto-aplicar modificadores de stats

---

### 3. **Página de Campañas (Dashboard)**
**Tiempo estimado: 2 horas**

**Componentes necesarios:**
- [ ] `/campaigns/page.tsx` - Lista de campañas del usuario
- [ ] CampaignCard con thumbnail, nombre, progreso
- [ ] Botón "Continuar" para campañas existentes
- [ ] Botón "Nueva Campaña" redirige a /onboarding

**Funcionalidad:**
```typescript
// Obtener campañas del usuario
GET /api/campaigns → Campaign[]

// Continuar campaña
- Obtener última sesión activa
- Redirigir a /play/[sessionId]
- Si no hay sesión activa, crear nueva
```

---

### 4. **Generación de Imágenes (Opcional pero recomendado)**
**Tiempo estimado: 2 horas**

**Setup:**
- [ ] Configurar Fal.ai API key
- [ ] `lib/fal/image-gen.ts` funcional
- [ ] Integrar en sala de juego
- [ ] Generar imagen de escena en cada turno del DM

**Fallback:**
- Si falla generación → mostrar placeholder con descripción textual
- Circuit breaker: 3 fallos consecutivos → desactivar por 5 minutos

---

### 5. **Testing End-to-End**
**Tiempo estimado: 1-2 horas**

**Flujo completo a testear:**
1. ✅ Login/Register funciona
2. ✅ Onboarding funciona (crear personaje)
3. [ ] Sala de juego funciona (jugar partida completa)
4. [ ] Guardado automático funciona (refrescar página y continuar)
5. [ ] Dashboard muestra campañas correctamente
6. [ ] Cerrar sesión y volver a entrar funciona

---

## ⚠️ BUGS CONOCIDOS A ARREGLAR

### 1. ✅ Login en producción no funciona
**Estado:** RESUELTO
- Clerk keys configuradas en Vercel
- Middleware actualizado correctamente

### 2. ✅ Error al crear personaje con lores diferentes a LOTR
**Estado:** RESUELTO
- Implementado carga dinámica de lores
- Todos los 7 lores ahora funcionan

### 3. ⚠️ Falta conectar Claude API
**Estado:** PENDIENTE
- Variable `ANTHROPIC_API_KEY` ya está en `.env.local`
- Falta implementar `/api/dm/route.ts`

---

## 🎯 MVP MÍNIMO VIABLE (Lo que DEBE funcionar)

### Usuario puede:
1. ✅ Registrarse/Login
2. ✅ Elegir un lore (mundo)
3. ✅ Elegir modo (One-shot / Campaña)
4. ✅ Elegir motor de reglas (Story Mode, PbtA, etc.)
5. ✅ Crear un personaje con un arquetipo
6. [ ] **JUGAR** una partida completa (esto es lo crítico)
   - Ver narración del DM
   - Escribir/elegir acciones
   - Ver consecuencias
   - Stats actualizados
   - HP tracking
7. [ ] Guardar progreso automáticamente
8. [ ] Continuar partidas guardadas desde dashboard
9. [ ] Cerrar sesión y volver sin perder progreso

---

## 📦 FEATURES PARA DESPUÉS DEL LAUNCH (NO BLOQUEANTES)

### Fase Post-Launch (semana 1-2)
- [ ] Generación de voz con ElevenLabs
- [ ] Música ambiental por mood
- [ ] Sistema de combate avanzado con CombatTracker
- [ ] Generación de NPCs con Claude
- [ ] Sistema de inventory visual
- [ ] Fog of War en mapas

### Fase 2 (semana 3-4)
- [ ] Multiplayer (varios jugadores, un DM)
- [ ] Chat de voz entre jugadores
- [ ] Marketplace de aventuras pre-hechas
- [ ] Editor de lores custom
- [ ] Sistema de achievements

### Monetización (cuando haya usuarios)
- [ ] Plan FREE: 10 sesiones/mes
- [ ] Plan PRO ($9.99/mes): Ilimitado + voz + imágenes
- [ ] Plan GUILD ($29.99/mes): Multiplayer + features avanzadas

---

## 🔧 CONFIGURACIÓN PENDIENTE

### Clerk Dashboard
- [ ] Agregar dominio de producción a allowed domains
- [ ] Configurar URLs de redirect correctamente
- [ ] Personalizar emails de verificación (opcional)

### Vercel
- ✅ Variables de entorno configuradas
- [ ] Configurar custom domain cuando lo tengamos
- [ ] Configurar analytics (opcional)

### Supabase
- [ ] Verificar que la base de datos esté optimizada
- [ ] Crear índices para queries frecuentes
- [ ] Configurar políticas de RLS si es necesario
- [ ] Configurar backups automáticos

---

## 🚨 ORDEN DE IMPLEMENTACIÓN MAÑANA

### Sesión de Mañana (6-8 horas)

**Bloque 1 (2 horas): Sala de Juego Base**
1. Crear `/play/[sessionId]/page.tsx`
2. NarratorPanel básico mostrando turnos
3. Input para acciones del jugador
4. Guardar turnos en DB

**Bloque 2 (2 horas): Integración Claude API**
1. Implementar `/api/dm/route.ts`
2. Cargar contexto completo (lore + world state + historial)
3. Parsear respuesta JSON del DM
4. Actualizar world state con cambios
5. Generar 3 acciones sugeridas

**Bloque 3 (1.5 horas): Sistema de Dados**
1. Implementar `lib/game/dice.ts`
2. Crear DiceRoller component con animación
3. Integrar en sala de juego
4. Mostrar resultados en chat

**Bloque 4 (1.5 horas): Dashboard + Testing**
1. Crear página de campañas
2. Botón "Continuar" funcional
3. Testing completo del flujo
4. Fix de bugs encontrados

**Bloque 5 (1 hora): Polish + Deploy**
1. Verificar que todo funcione en producción
2. Agregar loading states
3. Agregar error handling
4. Deploy final

---

## ✅ CHECKLIST PRE-LAUNCH

Antes de considerar la app "lista para lanzar":

### Funcionalidad Core
- [ ] Usuario puede crear cuenta
- [ ] Usuario puede crear personaje
- [ ] Usuario puede jugar partida completa (mínimo 10 turnos)
- [ ] Narración del DM tiene sentido y es coherente
- [ ] Stats se actualizan correctamente
- [ ] Progreso se guarda automáticamente
- [ ] Usuario puede continuar partida después de cerrar sesión

### UX/UI
- [ ] No hay errores visibles al usuario (usar ERROR_NARRATIVES)
- [ ] Loading states en todas las acciones
- [ ] Tema medieval consistente en toda la app
- [ ] Responsive en mobile (al menos básico)

### Rendimiento
- [ ] Página carga en < 3 segundos
- [ ] Respuesta del DM llega en < 10 segundos
- [ ] No hay memory leaks evidentes

### Seguridad
- [ ] Rutas protegidas correctamente
- [ ] No se exponen API keys al cliente
- [ ] Validación de inputs del usuario

---

## 📊 MÉTRICAS POST-LAUNCH

Una vez lanzado, monitorear:
- Usuarios registrados por día
- Sesiones de juego completadas
- Tasa de abandono (usuarios que no terminan onboarding)
- Tiempo promedio de sesión
- Errores más comunes
- Feedback de usuarios

---

## 💡 NOTAS FINALES

**Lo más importante:**
La experiencia de juego (sala de juego + Claude API) es lo ÚNICO que realmente importa mañana. Todo lo demás es secundario.

**Prioridad absoluta:**
1. Que el DM (Claude) funcione y narre coherentemente
2. Que el jugador pueda interactuar y ver consecuencias
3. Que el progreso se guarde

**Si falta tiempo:**
- Dados 3D → Usar botón simple con resultado numérico
- Imágenes → Desactivar por ahora
- Dashboard fancy → Lista simple de campañas
- Polish visual → Dejar para iteración 2

**Filosofía:**
Better to launch with less features that work perfectly than with many features that are buggy.

---

## 🎬 CUANDO ESTÉ LISTO

1. Deploy final a producción
2. Verificar que funcione en https://rolhub-...vercel.app
3. Crear landing page simple (opcional)
4. Post en redes sociales / comunidades RPG
5. Recolectar feedback inicial
6. Iterar basado en uso real

---

**URL Actual de Producción:**
https://rolhub-fj2sm8neb-amirs-projects-608e61a1.vercel.app

**Estado:**
- ✅ Login funciona
- ✅ Onboarding funciona
- ✅ Creación de personajes funciona (con fix de hoy)
- ❌ Sala de juego NO existe todavía
- ❌ Claude API NO está integrado

**Prioridad #1 mañana:** Sala de juego + Claude API
