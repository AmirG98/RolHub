import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Ghost, Eye, Clock, Volume2, Moon, AlertTriangle } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Jugar Horror en Rol: Crear Miedo y Tension | RolHub',
  description: 'Guia para crear horror efectivo en juegos de rol. Atmosfera, pacing, lo desconocido, y como asustar sin traumar.',
  keywords: [
    'horror juegos de rol',
    'crear miedo RPG',
    'atmosfera horror D&D',
    'tension en rol',
    'lovecraft rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/genero-horror',
  },
  openGraph: {
    title: 'Genero Horror en Rol | RolHub',
    description: 'Crear miedo efectivo en tus partidas de rol.',
    type: 'article',
  },
}

const horrorTypes = [
  {
    type: 'Horror Cosmico',
    desc: 'Lo incomprensible. Entidades mas alla del entendimiento humano.',
    examples: ['Lovecraft', 'Cthulhu', 'Call of Cthulhu'],
    key: 'El miedo viene de la insignificancia. Los humanos no importan.',
  },
  {
    type: 'Horror Gotico',
    desc: 'Atmosfera opresiva, castillos, secretos familiares, maldiciones.',
    examples: ['Dracula', 'Ravenloft', 'Curse of Strahd'],
    key: 'El pasado persigue al presente. Los pecados tienen consecuencias.',
  },
  {
    type: 'Horror de Supervivencia',
    desc: 'Recursos escasos, peligro constante, cualquiera puede morir.',
    examples: ['Resident Evil', 'Alien', 'zombies'],
    key: 'La amenaza es tangible y siempre presente.',
  },
  {
    type: 'Horror Psicologico',
    desc: 'La mente es el enemigo. Alucinaciones, paranoia, locura.',
    examples: ['Silent Hill', 'Jacob\'s Ladder'],
    key: 'No podes confiar en tus sentidos ni en tu memoria.',
  },
]

const techniques = [
  {
    technique: 'Menos es Mas',
    icon: Eye,
    desc: 'No describas al monstruo completamente. Deja que la imaginacion haga el trabajo.',
    example: '"Algo se mueve en la oscuridad. Ves demasiadas extremidades."',
  },
  {
    technique: 'Pacing Lento',
    icon: Clock,
    desc: 'El horror efectivo construye tension gradualmente. No apures el susto.',
    example: 'Escenas tranquilas antes de la revelacion. El contraste amplifica el miedo.',
  },
  {
    technique: 'Sonido y Silencio',
    icon: Volume2,
    desc: 'Describe sonidos extraños. Usa el silencio como herramienta de tension.',
    example: '"Escuchas pasos... y de repente, silencio absoluto."',
  },
  {
    technique: 'Oscuridad',
    icon: Moon,
    desc: 'Limita la vision. Lo que no ves es mas aterrador que lo que ves.',
    example: '"Tu antorcha ilumina 3 metros. Mas alla, solo negro."',
  },
]

const dosAndDonts = [
  {
    do: 'Construi atmosfera antes del susto',
    dont: 'Tires el monstruo de una sin preparacion',
  },
  {
    do: 'Deja que los jugadores imaginen lo peor',
    dont: 'Describas cada detalle del horror',
  },
  {
    do: 'Usa los miedos de los personajes',
    dont: 'Uses fobias reales de los jugadores sin permiso',
  },
  {
    do: 'Permite victorias pequeñas antes de quitarlas',
    dont: 'Hagas que todo sea desesperanza constante',
  },
  {
    do: 'Respeta los limites establecidos',
    dont: 'Cruces lineas de seguridad por "el horror"',
  },
]

const pacing = [
  { phase: 'Normalidad', desc: 'Todo parece bien. Establece lo cotidiano para que el contraste sea mayor.' },
  { phase: 'Señales', desc: 'Pequeñas cosas raras. Algo no esta bien pero no sabes que.' },
  { phase: 'Escalada', desc: 'Las cosas empeoran. Ya no podes ignorar que algo anda mal.' },
  { phase: 'Revelacion', desc: 'Ves la amenaza (o parte de ella). El horror tiene nombre.' },
  { phase: 'Confrontacion', desc: 'Enfrentar o huir. Las consecuencias son reales.' },
  { phase: 'Resolucion', desc: 'Sobreviviste... pero a que costo? Deja cicatrices.' },
]

const safetyReminder = [
  'El horror es subjetivo - lo que asusta a uno puede traumar a otro',
  'Usa las herramientas de seguridad (Lineas, Velos, Carta X)',
  'Chequea con los jugadores ANTES de incluir temas sensibles',
  'Esta bien parar si alguien se siente mal',
  'El objetivo es diversion, no trauma real',
]

export default function GeneroHorrorPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-blood px-2 py-1 rounded">Genero</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-blood"><Ghost className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Genero: Horror
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El horror en rol no es solo monstruos y sangre. Es atmosfera,
          anticipacion, y la sensacion de que algo terrible esta por pasar.
          Bien hecho, es inolvidable. Mal hecho, es ridiculo o traumatico.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-blood">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Regla de Oro del Horror</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>El miedo viene de lo que NO sabes, no de lo que ves.</strong>
          <br /><br />
          La imaginacion del jugador siempre crea algo mas aterrador
          que cualquier descripcion que puedas dar.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tipos de Horror
        </h2>
        <div className="space-y-4">
          {horrorTypes.map((type) => (
            <ParchmentPanel key={type.type} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">{type.type}</h3>
              <p className="font-body text-ink text-sm mb-2">{type.desc}</p>
              <p className="font-ui text-xs text-gold-dim mb-2">Ejemplos: {type.examples.join(', ')}</p>
              <p className="font-body text-ink text-sm italic bg-gold/10 p-2 rounded">
                Clave: {type.key}
              </p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tecnicas de Horror
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {techniques.map((tech) => (
            <ParchmentPanel key={tech.technique} className="p-5 border border-gold-dim">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blood flex-shrink-0">
                  <tech.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-ink mb-1">{tech.technique}</h3>
                  <p className="font-body text-ink text-sm mb-2">{tech.desc}</p>
                  <p className="font-ui text-xs text-ink italic">"{tech.example}"</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Pacing del Horror
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {pacing.map((p, i) => (
              <div key={p.phase} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blood flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-white font-bold text-sm">{i + 1}</span>
                </div>
                <div>
                  <h4 className="font-heading text-ink text-sm">{p.phase}</h4>
                  <p className="font-body text-ink text-sm">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Que Hacer y Que Evitar
        </h2>
        <div className="space-y-3">
          {dosAndDonts.map((item, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Hace</span>
                  <p className="font-body text-ink text-sm">{item.do}</p>
                </div>
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Evita</span>
                  <p className="font-body text-ink text-sm">{item.dont}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" /> Seguridad en el Horror
        </h2>
        <ParchmentPanel className="p-6 border-2 border-blood">
          <ul className="font-body text-ink space-y-2">
            {safetyReminder.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-blood flex-shrink-0 mt-1" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>El mejor horror deja cicatrices en el personaje, no en el jugador.</strong>
            <br /><br />
            Si los jugadores se van de la sesion pensando "eso fue intenso"
            en vez de "eso fue incomodo", hiciste un buen trabajo.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Explorar Otros Generos
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            El misterio comparte muchas tecnicas con el horror.
          </p>
          <Link href="/guias/genero-misterio" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Genero: Misterio
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Todas las Guias
          </Link>
          <Link href="/guias/genero-misterio" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Misterio <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
