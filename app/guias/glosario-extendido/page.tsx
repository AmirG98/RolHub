import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Dices, Users, Swords, Sparkles, MessageCircle, Map } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Glosario Extendido de Rol: Terminos Avanzados | RolHub',
  description: 'Diccionario completo de terminos de rol de mesa. Desde basicos hasta jerga avanzada de la comunidad.',
  keywords: [
    'glosario rol',
    'terminos D&D',
    'vocabulario RPG',
    'jerga rol de mesa',
    'diccionario TTRPG'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/glosario-extendido',
  },
  openGraph: {
    title: 'Glosario Extendido de Rol | RolHub',
    description: 'Todos los terminos que necesitas saber.',
    type: 'article',
  },
}

const basicTerms = [
  { term: 'DM / GM', def: 'Dungeon Master / Game Master. Quien narra la historia y controla el mundo.' },
  { term: 'PC', def: 'Player Character. Personaje controlado por un jugador.' },
  { term: 'NPC', def: 'Non-Player Character. Personaje controlado por el DM.' },
  { term: 'Campana', def: 'Serie de sesiones conectadas con los mismos personajes.' },
  { term: 'One-shot', def: 'Aventura autoconclusiva en una sola sesion.' },
  { term: 'Sesion', def: 'Una instancia de juego, tipicamente 2-4 horas.' },
  { term: 'Turno', def: 'Momento en que un jugador o NPC actua.' },
  { term: 'Ronda', def: 'Cuando todos los participantes tomaron un turno.' },
]

const diceTerms = [
  { term: 'd20, d6, etc.', def: 'Dado de X caras. d20 = dado de 20 caras.' },
  { term: 'Tirada', def: 'Accion de lanzar dados para resolver algo.' },
  { term: 'Modificador', def: 'Numero que se suma o resta al resultado del dado.' },
  { term: 'DC / Dificultad', def: 'Numero que hay que igualar o superar para tener exito.' },
  { term: 'Critico (Crit)', def: 'Resultado maximo natural (ej: 20 en d20). Exito excepcional.' },
  { term: 'Pifia (Fumble)', def: 'Resultado minimo natural (ej: 1 en d20). Fallo catastrofico.' },
  { term: 'Ventaja/Desventaja', def: 'Tirar 2 dados y quedarse con el mejor/peor.' },
  { term: 'Pool de dados', def: 'Varios dados tirados juntos, contando exitos o sumando.' },
  { term: 'Exploding dice', def: 'Si sacas el maximo, tiras de nuevo y sumas.' },
  { term: 'Reroll', def: 'Volver a tirar un dado, descartando el resultado anterior.' },
]

const characterTerms = [
  { term: 'Atributos/Stats', def: 'Caracteristicas numericas (Fuerza, Destreza, etc.).' },
  { term: 'Habilidades/Skills', def: 'Capacidades especificas (Sigilo, Persuasion, etc.).' },
  { term: 'Clase', def: 'Arquetipo de personaje (Guerrero, Mago, Picaro).' },
  { term: 'Raza/Ancestro', def: 'Especie del personaje (Humano, Elfo, Enano).' },
  { term: 'Nivel', def: 'Medida de poder y experiencia del personaje.' },
  { term: 'XP', def: 'Puntos de experiencia. Se acumulan para subir de nivel.' },
  { term: 'HP / Vida', def: 'Hit Points. Cuanto dano podes recibir antes de caer.' },
  { term: 'AC / Defensa', def: 'Armor Class. Que tan dificil es golpearte.' },
  { term: 'Backstory', def: 'Historia pasada del personaje, antes de la aventura.' },
  { term: 'Build', def: 'Combinacion especifica de opciones de personaje.' },
]

const combatTerms = [
  { term: 'Iniciativa', def: 'Orden de turnos en combate, usualmente por tirada.' },
  { term: 'Accion', def: 'Lo principal que haces en tu turno (atacar, lanzar hechizo).' },
  { term: 'Accion bonus', def: 'Accion secundaria rapida en el mismo turno.' },
  { term: 'Reaccion', def: 'Respuesta fuera de tu turno (ataque de oportunidad).' },
  { term: 'Movimiento', def: 'Desplazarte en el campo de batalla.' },
  { term: 'Melee / Cuerpo a cuerpo', def: 'Combate a corta distancia (espadas, punos).' },
  { term: 'Ranged / A distancia', def: 'Combate a larga distancia (arcos, magia).' },
  { term: 'AoE', def: 'Area of Effect. Habilidades que afectan una zona.' },
  { term: 'Aggro / Taunt', def: 'Atraer la atencion de los enemigos hacia vos.' },
  { term: 'Burst / Spike', def: 'Mucho dano en poco tiempo.' },
  { term: 'Saving throw', def: 'Tirada para resistir un efecto negativo.' },
]

const narrativeTerms = [
  { term: 'Roleplay / RP', def: 'Actuar como tu personaje, hablar en primera persona.' },
  { term: 'In-character (IC)', def: 'Hablando o actuando como el personaje.' },
  { term: 'Out-of-character (OOC)', def: 'Hablando como el jugador, no el personaje.' },
  { term: 'Metagaming', def: 'Usar info que el jugador sabe pero el personaje no.' },
  { term: 'Retcon', def: 'Cambiar retroactivamente algo que ya paso.' },
  { term: 'Flashback', def: 'Escena del pasado narrada en el presente.' },
  { term: 'Cutscene', def: 'Escena narrada por el DM sin participacion activa.' },
  { term: 'Hook', def: 'Gancho narrativo que atrae a los personajes a la aventura.' },
  { term: 'Plot twist', def: 'Giro inesperado en la historia.' },
  { term: 'Cliffhanger', def: 'Terminar la sesion en un momento de tension.' },
  { term: 'Epilogo', def: 'Escena de cierre despues de resolver la trama.' },
]

const dmTerms = [
  { term: 'Prep', def: 'Preparacion previa a la sesion.' },
  { term: 'Impro / Improv', def: 'Inventar en el momento, sin preparacion.' },
  { term: 'Sandbox', def: 'Mundo abierto sin trama lineal definida.' },
  { term: 'Railroad', def: 'Forzar una trama especifica sin libertad. (Negativo)' },
  { term: 'Session Zero', def: 'Sesion de setup: expectativas, personajes, tono.' },
  { term: 'Fudging', def: 'Modificar tiradas secretamente para la narrativa.' },
  { term: 'Rule of Cool', def: 'Permitir algo poco probable porque es epico.' },
  { term: 'Yes, and...', def: 'Aceptar la idea del jugador y expandirla.' },
  { term: 'BBEG', def: 'Big Bad Evil Guy. Villano principal de la campana.' },
  { term: 'Encounter', def: 'Situacion preparada (combate, puzzle, social).' },
  { term: 'Random encounter', def: 'Encuentro generado al azar.' },
]

const communityTerms = [
  { term: 'TTRPG', def: 'Tabletop Role-Playing Game. Rol de mesa.' },
  { term: 'OSR', def: 'Old School Renaissance. Estilo retro de juego.' },
  { term: 'Crunch', def: 'Cantidad de reglas y mecanicas. "Mucho crunch" = muchas reglas.' },
  { term: 'Fluff', def: 'Contenido narrativo y de ambientacion (vs mecanicas).' },
  { term: 'Homebrew', def: 'Contenido creado por fans, no oficial.' },
  { term: 'RAW', def: 'Rules As Written. Reglas tal como estan escritas.' },
  { term: 'RAI', def: 'Rules As Intended. Reglas segun la intencion del autor.' },
  { term: 'Min-maxing', def: 'Optimizar al maximo stats y builds.' },
  { term: 'Munchkin', def: 'Jugador que abusa de las reglas para ventaja. (Negativo)' },
  { term: 'Murder hobo', def: 'Personaje que mata todo sin razon. (Negativo)' },
  { term: 'That guy', def: 'Jugador problematico que arruina la experiencia.' },
  { term: 'TPK', def: 'Total Party Kill. Todos los personajes mueren.' },
]

const advancedTerms = [
  { term: 'Bleed', def: 'Cuando emociones del personaje afectan al jugador (y viceversa).' },
  { term: 'Lines & Veils', def: 'Limites de contenido: lineas no se cruzan, velos se omiten.' },
  { term: 'X-Card', def: 'Herramienta para pausar si algo es incomodo.' },
  { term: 'Safety tools', def: 'Mecanicas para asegurar comodidad de todos.' },
  { term: 'Player agency', def: 'Capacidad del jugador de afectar la historia.' },
  { term: 'Narrative authority', def: 'Quien tiene derecho a definir que pasa en la ficcion.' },
  { term: 'Fiction first', def: 'Priorizar la narrativa sobre las mecanicas.' },
  { term: 'Procedures', def: 'Pasos definidos para resolver situaciones especificas.' },
  { term: 'Oracle', def: 'Sistema de respuestas para juego en solitario.' },
  { term: 'Emergent narrative', def: 'Historia que surge del juego, no del guion.' },
]

const spanishTerms = [
  { term: 'Tirada', def: 'Dice roll / Check' },
  { term: 'Partida', def: 'Game / Session' },
  { term: 'Master', def: 'DM / GM (mas comun en español)' },
  { term: 'Ficha', def: 'Character sheet' },
  { term: 'Ambientacion', def: 'Setting' },
  { term: 'Trasfondo', def: 'Backstory / Background' },
  { term: 'Golpe critico', def: 'Critical hit' },
  { term: 'Pifia', def: 'Critical fail / Fumble' },
  { term: 'Hechizo', def: 'Spell' },
  { term: 'Conjuro', def: 'Spell (alternativo)' },
]

export default function GlosarioExtendidoPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">Comparativas</span>
          <span className="text-xs font-ui font-semibold text-parchment">15 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-emerald"><BookOpen className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Glosario Extendido
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Todos los terminos que vas a encontrar en el mundo del rol de mesa,
          desde lo basico hasta la jerga de la comunidad.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">Como Usar Este Glosario</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>No necesitas memorizar todo esto.</strong>
          <br /><br />
          Usalo como referencia cuando encuentres un termino que no conoces.
          Con el tiempo, el vocabulario se vuelve natural.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Terminos Basicos
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {basicTerms.map((item) => (
              <div key={item.term} className="p-3 bg-gold/5 rounded flex flex-col md:flex-row md:items-start gap-2">
                <span className="font-heading text-ink text-sm w-32 shrink-0">{item.term}</span>
                <span className="font-body text-ink text-sm">{item.def}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Dices className="h-6 w-6" /> Dados y Tiradas
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {diceTerms.map((item) => (
              <div key={item.term} className="p-3 bg-gold/5 rounded flex flex-col md:flex-row md:items-start gap-2">
                <span className="font-heading text-ink text-sm w-40 shrink-0">{item.term}</span>
                <span className="font-body text-ink text-sm">{item.def}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Personaje
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {characterTerms.map((item) => (
              <div key={item.term} className="p-3 bg-gold/5 rounded flex flex-col md:flex-row md:items-start gap-2">
                <span className="font-heading text-ink text-sm w-32 shrink-0">{item.term}</span>
                <span className="font-body text-ink text-sm">{item.def}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Swords className="h-6 w-6" /> Combate
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {combatTerms.map((item) => (
              <div key={item.term} className="p-3 bg-gold/5 rounded flex flex-col md:flex-row md:items-start gap-2">
                <span className="font-heading text-ink text-sm w-40 shrink-0">{item.term}</span>
                <span className="font-body text-ink text-sm">{item.def}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> Narrativa y Roleplay
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {narrativeTerms.map((item) => (
              <div key={item.term} className="p-3 bg-gold/5 rounded flex flex-col md:flex-row md:items-start gap-2">
                <span className="font-heading text-ink text-sm w-32 shrink-0">{item.term}</span>
                <span className="font-body text-ink text-sm">{item.def}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Map className="h-6 w-6" /> Para el DM
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {dmTerms.map((item) => (
              <div key={item.term} className="p-3 bg-gold/5 rounded flex flex-col md:flex-row md:items-start gap-2">
                <span className="font-heading text-ink text-sm w-36 shrink-0">{item.term}</span>
                <span className="font-body text-ink text-sm">{item.def}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Jerga de la Comunidad
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {communityTerms.map((item) => (
              <div key={item.term} className="p-3 bg-gold/5 rounded flex flex-col md:flex-row md:items-start gap-2">
                <span className="font-heading text-ink text-sm w-32 shrink-0">{item.term}</span>
                <span className="font-body text-ink text-sm">{item.def}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> Terminos Avanzados
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {advancedTerms.map((item) => (
              <div key={item.term} className="p-3 bg-gold/5 rounded flex flex-col md:flex-row md:items-start gap-2">
                <span className="font-heading text-ink text-sm w-40 shrink-0">{item.term}</span>
                <span className="font-body text-ink text-sm">{item.def}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Espanol ↔ Ingles
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4 text-sm">
            Muchos terminos se usan en ingles incluso en comunidades hispanohablantes:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {spanishTerms.map((item) => (
              <div key={item.term} className="p-2 bg-gold/5 rounded flex items-center gap-2">
                <span className="font-heading text-ink text-sm">{item.term}</span>
                <span className="text-gold-dim">=</span>
                <span className="font-body text-ink text-sm">{item.def}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>El vocabulario es una herramienta, no una barrera.</strong>
            <br /><br />
            Si no sabes un termino, pregunta. Todos empezaron sin saber nada.
            La comunidad de rol es generalmente muy receptiva con nuevos jugadores.
            <br /><br />
            Lo importante es jugar, no sonar como un experto.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Listo para Jugar?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Ahora que tenes el vocabulario, es hora de empezar.
          </p>
          <Link href="/onboarding" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Comenzar Aventura
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/tabla-sistemas" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Tabla de Sistemas
          </Link>
          <Link href="/guias" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Volver a Guias
          </Link>
        </div>
      </nav>
    </article>
  )
}
