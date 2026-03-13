import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Compass, Search, Map, Eye, Footprints, Sparkles } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Guia de Exploracion: Investigar y Descubrir | RolHub',
  description: 'Como explorar en juegos de rol. Investigar escenas, buscar pistas, viajar, y descubrir secretos del mundo.',
  keywords: [
    'exploracion juegos de rol',
    'investigar escenas RPG',
    'buscar pistas rol',
    'viajar RPG',
    'descubrir secretos D&D'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/exploracion',
  },
  openGraph: {
    title: 'Guia de Exploracion | RolHub',
    description: 'Descubri los secretos del mundo en juegos de rol.',
    type: 'article',
  },
}

const explorationTypes = [
  {
    type: 'Investigacion de Escena',
    icon: Search,
    desc: 'Examinar un lugar en busca de pistas, objetos, o informacion.',
    examples: ['Revisar la escena del crimen', 'Buscar trampas', 'Encontrar pasajes secretos'],
    tip: 'Se especifico sobre donde buscas. "Reviso debajo de la alfombra" es mejor que "busco pistas".',
  },
  {
    type: 'Viaje y Travesia',
    icon: Footprints,
    desc: 'Moverte de un lugar a otro, enfrentando los peligros del camino.',
    examples: ['Cruzar el bosque maldito', 'Navegar el desierto', 'Seguir el mapa del tesoro'],
    tip: 'El viaje puede ser una aventura en si mismo. Pregunta que pasa en el camino.',
  },
  {
    type: 'Reconocimiento',
    icon: Eye,
    desc: 'Observar desde la distancia para entender una situacion antes de actuar.',
    examples: ['Espiar el campamento enemigo', 'Contar guardias', 'Identificar rutas de escape'],
    tip: 'La informacion previa puede hacer la diferencia entre exito y desastre.',
  },
  {
    type: 'Busqueda de Recursos',
    icon: Compass,
    desc: 'Encontrar lo que necesitas para sobrevivir o avanzar.',
    examples: ['Forrajear comida', 'Buscar refugio', 'Encontrar materiales para craftear'],
    tip: 'Los recursos son parte de la historia. Gestionalos como tal.',
  },
]

const investigationTips = [
  {
    tip: 'Usa tus Sentidos',
    desc: 'No solo "miro la habitacion". Que ves? Que hueles? Que escuchas? Que sentis bajo tus pies?',
  },
  {
    tip: 'Interactua con Objetos',
    desc: 'Podes tocar, mover, abrir, oler. Los objetos revelan historias si les prestas atencion.',
  },
  {
    tip: 'Pregunta al DM',
    desc: 'Si algo te parece raro, pregunta. "Hay algo inusual en las paredes?" puede revelar secretos.',
  },
  {
    tip: 'Toma Notas',
    desc: 'Las pistas de hace 3 sesiones pueden ser relevantes ahora. Anota lo que encontras.',
  },
  {
    tip: 'Conecta los Puntos',
    desc: 'Las pistas solas no resuelven misterios. Tu trabajo es conectarlas en una teoria.',
  },
]

const travelElements = [
  { element: 'Preparacion', desc: 'Que llevas? Comida, agua, equipo de campamento? Prepararse importa.' },
  { element: 'Ruta', desc: 'El camino corto puede ser peligroso. El largo, agotador. Elegi bien.' },
  { element: 'Descanso', desc: 'Donde acampas? Quien hace guardia? El peligro no duerme.' },
  { element: 'Encuentros', desc: 'El mundo esta vivo. Mercaderes, bandidos, o criaturas pueden aparecer.' },
  { element: 'Clima', desc: 'Lluvia, nieve, tormenta — afectan el viaje y la moral.' },
]

const questions = [
  { question: 'Que veo?', purpose: 'Lo obvio a primera vista. Tamaño, iluminacion, elementos principales.' },
  { question: 'Que escucho?', purpose: 'Sonidos ambientales, voces, ruidos sospechosos.' },
  { question: 'Que huelo?', purpose: 'Olores pueden revelar peligros (gas, fuego) o pistas (perfume, sangre).' },
  { question: 'Que puedo tocar?', purpose: 'Texturas, temperatura, objetos movibles.' },
  { question: 'Que parece fuera de lugar?', purpose: 'Detectar anomalias, cosas que no pertenecen.' },
  { question: 'Quien estuvo aca?', purpose: 'Huellas, marcas, objetos dejados — todo cuenta una historia.' },
]

const commonMistakes = [
  {
    mistake: 'Solo buscar "pistas"',
    fix: 'Decir exactamente QUE buscas y DONDE. "Reviso el escritorio" > "busco pistas".',
  },
  {
    mistake: 'Ignorar lo mundano',
    fix: 'A veces la pista esta en lo obvio. Una carta sin abrir, una silla movida.',
  },
  {
    mistake: 'Apurarse',
    fix: 'La exploracion tiene su ritmo. Deja que las escenas respiren.',
  },
  {
    mistake: 'No preguntar a NPCs',
    fix: 'La gente sabe cosas. Taberneros, guardias, niños — todos pueden tener informacion.',
  },
]

export default function ExploracionPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">Mecanicas</span>
          <span className="text-xs font-ui font-semibold text-parchment">10 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-emerald"><Compass className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Guia de Exploracion
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          No todo es combate. Explorar el mundo, investigar escenas, y descubrir
          secretos es una parte fundamental del rol. Las mejores aventuras tienen
          momentos donde la curiosidad es tu mejor arma.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tipos de Exploracion
        </h2>
        <div className="space-y-4">
          {explorationTypes.map((type) => (
            <ParchmentPanel key={type.type} className="p-6 border border-gold-dim">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-emerald flex-shrink-0">
                  <type.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-xl text-ink mb-2">{type.type}</h3>
                  <p className="font-body text-ink mb-2">{type.desc}</p>
                  <ul className="font-ui text-sm text-ink mb-3">
                    {type.examples.map((ex, i) => (
                      <li key={i}>• {ex}</li>
                    ))}
                  </ul>
                  <p className="font-ui text-xs text-gold-dim">
                    <Sparkles className="h-3 w-3 inline mr-1" /> {type.tip}
                  </p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Search className="h-6 w-6" /> Preguntas para Investigar
        </h2>
        <ParchmentPanel className="p-6 border-2 border-gold">
          <p className="font-body text-ink mb-4">
            Cuando llegues a una escena nueva, estas preguntas te ayudan a no perderte nada:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {questions.map((q) => (
              <div key={q.question} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm mb-1">{q.question}</h4>
                <p className="font-body text-ink text-sm">{q.purpose}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tips de Investigacion
        </h2>
        <div className="space-y-3">
          {investigationTips.map((item) => (
            <ParchmentPanel key={item.tip} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{item.tip}</h4>
              <p className="font-body text-ink text-sm">{item.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Map className="h-6 w-6" /> Elementos del Viaje
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            Viajar no es solo "llegamos al destino". Estos elementos hacen el viaje interesante:
          </p>
          <div className="space-y-3">
            {travelElements.map((item, i) => (
              <div key={item.element} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-shadow text-sm font-bold">{i + 1}</span>
                </div>
                <div>
                  <h4 className="font-heading text-ink text-sm">{item.element}</h4>
                  <p className="font-body text-ink text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Errores Comunes
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
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">La Mentalidad del Explorador</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>La curiosidad es tu mejor herramienta.</strong>
            <br /><br />
            El mundo del DM esta lleno de secretos esperando ser descubiertos.
            Cada puerta cerrada, cada NPC misterioso, cada simbolo extraño
            puede ser una pista. Pregunta, investiga, conecta.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            A veces la mejor forma de obtener informacion es hablar con alguien.
          </p>
          <Link href="/guias/interaccion-social" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Interaccion Social
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/combate" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Combate
          </Link>
          <Link href="/guias/interaccion-social" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Interaccion Social <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
