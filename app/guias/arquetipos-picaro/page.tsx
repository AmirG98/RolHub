import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Eye, Key, MessageCircle, Moon, Target, Users } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Arquetipos de Picaro: Ladrones, Espias y Caras | RolHub',
  description: 'Variantes del picaro en juegos de rol. Desde el ladron hasta el espia, todas las formas de operar en las sombras.',
  keywords: [
    'picaro D&D',
    'arquetipos ladron',
    'variantes rogue RPG',
    'espia asesino',
    'picaro rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/arquetipos-picaro',
  },
  openGraph: {
    title: 'Arquetipos de Picaro | RolHub',
    description: 'Todas las formas de operar en las sombras.',
    type: 'article',
  },
}

const archetypes = [
  {
    name: 'El Ladron',
    focus: 'Robar, infiltrar, escapar.',
    skills: 'Cerraduras, trampas, sigilo, parkour.',
    motivation: 'Dinero, desafio, supervivencia.',
    weakness: 'La codicia puede superar la prudencia.',
    examples: ['Bilbo', 'Flynn Rider', 'Catwoman'],
  },
  {
    name: 'El Asesino',
    focus: 'Eliminar objetivos con precision.',
    skills: 'Venenos, emboscadas, anatomia, anonimato.',
    motivation: 'Contrato, venganza, ideologia.',
    weakness: 'La violencia deja marcas. Cuantos rostros lo persiguen?',
    examples: ['Arya Stark', 'Agent 47', 'John Wick'],
  },
  {
    name: 'El Espia',
    focus: 'Obtener y usar informacion.',
    skills: 'Disfraz, engano, lectura de gente, redes.',
    motivation: 'Lealtad a una causa, nacion, o patron.',
    weakness: 'Vivir entre mentiras borra la identidad propia.',
    examples: ['James Bond', 'Natasha Romanoff', 'Varys'],
  },
  {
    name: 'La Cara',
    focus: 'Manipular, negociar, persuadir.',
    skills: 'Carisma, intimidacion, actuación, lectura.',
    motivation: 'Influencia, relaciones, supervivencia social.',
    weakness: 'Las palabras pueden volverse contra uno.',
    examples: ['Littlefinger', 'Lando Calrissian', 'Irene Adler'],
  },
  {
    name: 'El Scout',
    focus: 'Reconocimiento, exploracion, supervivencia.',
    skills: 'Rastreo, navegacion, percepcion, primeros auxilios.',
    motivation: 'Guiar al grupo, encontrar el camino.',
    weakness: 'Adelantarse significa estar solo cuando algo sale mal.',
    examples: ['Aragorn (parcialmente)', 'Legolas', 'Sam Fisher'],
  },
  {
    name: 'El Estafador',
    focus: 'Enganos elaborados, juegos de confianza.',
    skills: 'Actuación, falsificacion, lectura de marcas.',
    motivation: 'El juego, la venganza, el dinero.',
    weakness: 'El que vive de mentiras puede perder la verdad.',
    examples: ['Danny Ocean', 'Neal Caffrey', 'El Zorro'],
  },
]

const operationStyles = [
  {
    style: 'Solo',
    desc: 'Trabaja mejor sin depender de nadie.',
    pros: 'Control total, sin cabos sueltos.',
    cons: 'Sin backup, todo depende de vos.',
  },
  {
    style: 'En Equipo',
    desc: 'Parte de un grupo especializado.',
    pros: 'Roles complementarios, mas opciones.',
    cons: 'Dependencia, secretos compartidos.',
  },
  {
    style: 'Doble Agente',
    desc: 'Trabaja para multiples partes.',
    pros: 'Acceso a todo, informacion privilegiada.',
    cons: 'Todos son enemigos potenciales.',
  },
]

const moralSpectrums = [
  {
    type: 'Robin Hood',
    desc: 'Roba a los ricos, ayuda a los pobres.',
    tension: 'Donde esta la linea de "los ricos lo merecen"?',
  },
  {
    type: 'Profesional',
    desc: 'Un trabajo es un trabajo. Sin juicios.',
    tension: 'Que contrato es demasiado?',
  },
  {
    type: 'Superviviente',
    desc: 'Hace lo que debe para seguir vivo.',
    tension: 'Cuando la supervivencia deja de justificar todo?',
  },
  {
    type: 'Reformado',
    desc: 'Intenta dejar el pasado atras.',
    tension: 'El pasado siempre vuelve?',
  },
]

const backstoryHooks = [
  {
    hook: 'El Gremio',
    prompt: 'A que organizacion perteneces (o perteneciste)?',
  },
  {
    hook: 'El Trabajo que Salio Mal',
    prompt: 'Que operación te cambio? Que perdiste?',
  },
  {
    hook: 'La Deuda',
    prompt: 'A quien le debes? Por que?',
  },
  {
    hook: 'La Marca',
    prompt: 'Alguien te busca. Por que?',
  },
]

const commonTraps = [
  {
    trap: 'El lobo solitario',
    issue: 'Se separa del grupo, hace todo solo.',
    fix: 'El picaro necesita al grupo tanto como ellos a el.',
  },
  {
    trap: 'Robar a los companeros',
    issue: 'Rompe la confianza del grupo.',
    fix: 'El picaro puede ser ladron sin robar a sus aliados.',
  },
  {
    trap: 'Secretos que nunca se revelan',
    issue: 'El misterio sin payoff es frustrante.',
    fix: 'Los secretos deben emerger eventualmente.',
  },
]

const teamRoles = [
  'El que entra primero (reconocimiento)',
  'El que abre las puertas (cerraduras, trampas)',
  'El que obtiene informacion (interrogatorio, espionaje)',
  'El que negocia (contratos, alianzas)',
  'El que tiene un plan B (escape, contingencias)',
]

export default function ArquetiposPicaroPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-stone px-2 py-1 rounded">Arquetipos</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-stone"><Eye className="h-8 w-8 text-gold" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Arquetipos: Picaro
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El picaro no es solo "el que abre cerraduras". Es el que opera donde
          otros no pueden o no quieren. Ladrones, espias, estafadores, asesinos:
          todos comparten la habilidad de navegar las sombras.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Pregunta Central</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Que lineas no cruzarias?</strong>
          <br /><br />
          El picaro vive en zonas grises. Lo que lo hace interesante
          no es lo que PUEDE hacer, sino lo que ELIGE no hacer.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Arquetipos Clasicos
        </h2>
        <div className="space-y-4">
          {archetypes.map((arch) => (
            <ParchmentPanel key={arch.name} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">{arch.name}</h3>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="font-body text-ink text-sm"><strong>Foco:</strong> {arch.focus}</p>
                  <p className="font-body text-ink text-sm"><strong>Skills:</strong> {arch.skills}</p>
                </div>
                <div>
                  <p className="font-body text-ink text-sm"><strong>Motivacion:</strong> {arch.motivation}</p>
                </div>
              </div>
              <div className="p-2 bg-stone/30 rounded mb-2">
                <span className="font-ui text-xs text-gold-dim">Debilidad narrativa:</span>
                <p className="font-body text-ink text-sm">{arch.weakness}</p>
              </div>
              <p className="font-ui text-xs text-gold-dim">Ejemplos: {arch.examples.join(', ')}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Moon className="h-6 w-6" /> Estilos de Operacion
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {operationStyles.map((style) => (
            <ParchmentPanel key={style.style} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{style.style}</h4>
              <p className="font-body text-ink text-sm mb-2">{style.desc}</p>
              <div className="text-xs">
                <span className="font-ui text-emerald">Pro: </span>
                <span className="font-body text-ink">{style.pros}</span>
              </div>
              <div className="text-xs">
                <span className="font-ui text-blood">Con: </span>
                <span className="font-body text-ink">{style.cons}</span>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> Espectros Morales
        </h2>
        <div className="space-y-3">
          {moralSpectrums.map((type) => (
            <ParchmentPanel key={type.type} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{type.type}</h4>
              <p className="font-body text-ink text-sm mb-1">{type.desc}</p>
              <p className="font-ui text-xs text-gold-dim">Tension: {type.tension}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Key className="h-6 w-6" /> Hooks de Backstory
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {backstoryHooks.map((hook) => (
              <div key={hook.hook} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm">{hook.hook}</h4>
                <p className="font-body text-ink text-sm italic">"{hook.prompt}"</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Target className="h-6 w-6" /> Rol en el Equipo
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <ul className="font-body text-ink space-y-2">
            {teamRoles.map((role, i) => (
              <li key={i} className="p-2 bg-gold/5 rounded">• {role}</li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Trampas Comunes
        </h2>
        <div className="space-y-3">
          {commonTraps.map((trap, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">{trap.trap}</span>
                  <p className="font-body text-ink text-sm">{trap.issue}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Solucion</span>
                  <p className="font-body text-ink text-sm">{trap.fix}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>El picaro mas interesante es el que tiene un codigo.</strong>
            <br /><br />
            Sin limites morales, es solo un psicopata. Con ellos,
            es un personaje complejo navegando un mundo gris.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Explorar Otros Arquetipos
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Los personajes de apoyo mantienen al grupo funcionando.
          </p>
          <Link href="/guias/arquetipos-apoyo" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Arquetipos: Apoyo
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/arquetipos-mago" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Mago
          </Link>
          <Link href="/guias/arquetipos-apoyo" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Apoyo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
