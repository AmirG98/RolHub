import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Play, Sparkles, Users, MessageCircle, Target, AlertTriangle } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Primera Sesion de Rol: Como Empezar una Campana | RolHub',
  description: 'Guia para la primera sesion de una campana de rol. Como ganchar jugadores, establecer el tono, y arrancar con fuerza.',
  keywords: [
    'primera sesion rol',
    'empezar campana D&D',
    'inicio aventura RPG',
    'como empezar a jugar rol',
    'sesion inaugural'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/primera-sesion',
  },
  openGraph: {
    title: 'Primera Sesion de Rol | RolHub',
    description: 'Arranca tu campana con el pie derecho.',
    type: 'article',
  },
}

const hookTypes = [
  {
    type: 'In Medias Res',
    desc: 'Arranca en medio de la accion. Los jugadores ya estan en peligro.',
    example: 'La carreta que los transporta es emboscada. Despierten, hay flechas volando.',
    works: 'Perfecto para grupos nuevos. Cero tiempo muerto.',
  },
  {
    type: 'El Misterio Inmediato',
    desc: 'Algo raro pasa frente a ellos. No pueden ignorarlo.',
    example: 'El tabernero cae muerto frente a ustedes. Una nota en su mano dice sus nombres.',
    works: 'Engancha la curiosidad. Los jugadores quieren saber mas.',
  },
  {
    type: 'La Amenaza Personal',
    desc: 'Algo del backstory de un personaje se activa.',
    example: 'El mentor del mago aparece herido, perseguido por la faccion que creen derrotada.',
    works: 'Requiere conocer los personajes. Muy efectivo si lo haces bien.',
  },
  {
    type: 'El Contrato',
    desc: 'Alguien los contrata para algo especifico. Clasico pero efectivo.',
    example: 'Un noble ofrece 500 monedas por recuperar un artefacto de las ruinas.',
    works: 'Simple, claro, deja que los jugadores exploren a su ritmo.',
  },
]

const firstHourStructure = [
  { time: '0-5 min', activity: 'Bienvenida', desc: 'Confirmar que todos tienen personajes, recordar reglas basicas de mesa.' },
  { time: '5-15 min', activity: 'Escena de Apertura', desc: 'Describe donde estan. Deja que se presenten en personaje brevemente.' },
  { time: '15-30 min', activity: 'El Gancho', desc: 'Algo pasa que los obliga a actuar. El incidente incitante.' },
  { time: '30-45 min', activity: 'Primera Decision', desc: 'Los jugadores toman una decision significativa. Ven que sus choices importan.' },
  { time: '45-60 min', activity: 'Primera Consecuencia', desc: 'La decision tiene un resultado visible. Combate corto, NPC reacciona, algo cambia.' },
]

const toneSetters = [
  {
    tone: 'Epico',
    how: 'Descripciones grandiosas, musica orquestal, amenazas a escala mundial.',
    avoid: 'Chistes constantes, amenazas triviales, combates contra ratas.',
  },
  {
    tone: 'Oscuro',
    how: 'Dilemas morales, consecuencias permanentes, descripcion de atmosfera opresiva.',
    avoid: 'Soluciones faciles, NPCs amigables en exceso, comedia.',
  },
  {
    tone: 'Ligero',
    how: 'Humor, personajes excentricos, situaciones absurdas.',
    avoid: 'Trauma, violencia grafica, decisiones imposibles.',
  },
  {
    tone: 'Misterioso',
    how: 'Informacion incompleta, NPCs evasivos, pistas en la descripcion.',
    avoid: 'Explicar todo, combates directos sin motivo, transparencia total.',
  },
]

const playerIntroTips = [
  {
    method: 'Round Robin',
    desc: 'Cada jugador describe a su personaje en 2-3 oraciones. Nombre, apariencia, una cosa memorable.',
    when: 'Grupos nuevos que no se conocen.',
  },
  {
    method: 'En Accion',
    desc: 'Cada personaje se presenta haciendo algo caracteristico cuando la camara lo enfoca.',
    when: 'Grupos que ya se conocen y quieren inmersion.',
  },
  {
    method: 'Flashback',
    desc: 'Antes del inicio, cada personaje tiene una escena de 2 minutos de su pasado.',
    when: 'Campanas dramaticas con backstories elaborados.',
  },
]

const commonMistakes = [
  {
    mistake: 'Empezar en la taberna sin plan',
    fix: 'Si arrancan en la taberna, que algo pase inmediatamente.',
  },
  {
    mistake: 'Leer texto preparado por 10 minutos',
    fix: 'Maximo 2-3 minutos de descripcion. Luego: "Que hacen?"',
  },
  {
    mistake: 'Separar al grupo en la primera sesion',
    fix: 'Mantene al grupo junto. Ya van a tener tiempo de separarse.',
  },
  {
    mistake: 'Combate de 40 minutos contra enemigos triviales',
    fix: 'Primer combate: rapido, 2-3 rondas maximo. Es una demo.',
  },
  {
    mistake: 'No dejar que los jugadores hablen',
    fix: 'Despues de cada descripcion, pregunta: "Que hace [personaje]?"',
  },
]

const checklistPre = [
  'Todos tienen personajes creados y vos los leiste',
  'Tenes el gancho preparado',
  'Conoces los nombres de 3-4 NPCs que pueden aparecer',
  'Sabes que va a pasar si los jugadores no hacen nada',
  'Tenes musica/ambiente listo (opcional)',
  'Repasaste las reglas basicas del motor elegido',
]

const checklistDuring = [
  'Cada jugador tuvo un momento de protagonismo',
  'Al menos una decision significativa fue tomada',
  'Quedo claro cual es el conflicto principal',
  'Hay un gancho para la proxima sesion',
  'Los jugadores hablan entre sus personajes',
]

export default function PrimeraSesionPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">Sesiones</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-emerald"><Play className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            La Primera Sesion
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          La primera sesion es tu trailer de pelicula. Tiene que mostrar que tipo
          de experiencia van a tener, ganchar a los jugadores, y dejarlos con
          ganas de mas. No hay segunda oportunidad para una primera impresion.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de la Primera Sesion</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Si los jugadores no quieren volver despues de la primera sesion, fallaste.</strong>
          <br /><br />
          Todo lo demas es secundario. Prioriza engagement sobre perfeccion.
          Mejor una sesion imperfecta pero emocionante que una tecnica impecable pero aburrida.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Tipos de Gancho
        </h2>
        <div className="space-y-4">
          {hookTypes.map((hook) => (
            <ParchmentPanel key={hook.type} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">{hook.type}</h3>
              <p className="font-body text-ink text-sm mb-2">{hook.desc}</p>
              <div className="p-2 bg-gold/10 rounded mb-2">
                <p className="font-body text-ink text-sm italic">Ejemplo: {hook.example}</p>
              </div>
              <p className="font-ui text-xs text-gold-dim">{hook.works}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Target className="h-6 w-6" /> Estructura de la Primera Hora
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {firstHourStructure.map((step, i) => (
              <div key={step.time} className="flex items-start gap-4">
                <div className="w-20 flex-shrink-0">
                  <span className="font-mono text-gold text-sm">{step.time}</span>
                </div>
                <div>
                  <h4 className="font-heading text-ink text-sm">{step.activity}</h4>
                  <p className="font-body text-ink text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Establecer el Tono
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {toneSetters.map((tone) => (
            <ParchmentPanel key={tone.tone} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{tone.tone}</h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Hace</span>
                  <p className="font-body text-ink">{tone.how}</p>
                </div>
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Evita</span>
                  <p className="font-body text-ink">{tone.avoid}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Presentar a los Personajes
        </h2>
        <div className="space-y-3">
          {playerIntroTips.map((method) => (
            <ParchmentPanel key={method.method} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{method.method}</h4>
              <p className="font-body text-ink text-sm mb-1">{method.desc}</p>
              <p className="font-ui text-xs text-gold-dim">Usar cuando: {method.when}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" /> Errores Comunes
        </h2>
        <div className="space-y-3">
          {commonMistakes.map((item, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Error</span>
                  <p className="font-body text-ink text-sm">{item.mistake}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Solucion</span>
                  <p className="font-body text-ink text-sm">{item.fix}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-heading text-xl text-gold-bright mb-4">Checklist Pre-Sesion</h2>
            <ParchmentPanel className="p-5 border border-gold-dim">
              <ul className="font-body text-ink text-sm space-y-2">
                {checklistPre.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gold">□</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </ParchmentPanel>
          </div>
          <div>
            <h2 className="font-heading text-xl text-gold-bright mb-4">Checklist Durante</h2>
            <ParchmentPanel className="p-5 border border-gold-dim">
              <ul className="font-body text-ink text-sm space-y-2">
                {checklistDuring.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gold">□</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </ParchmentPanel>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>La primera sesion es una promesa de lo que viene.</strong>
            <br /><br />
            Si les prometes misterio, que haya un misterio. Si les prometes accion,
            que haya accion. Lo que muestres en la primera hora es lo que van a
            esperar en las proximas cincuenta.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Antes de la primera sesion viene la sesion cero.
          </p>
          <Link href="/guias/sesion-cero" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Sesion Cero
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/genero-intriga" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Intriga
          </Link>
          <Link href="/guias/sesion-cero" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Sesion Cero <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
