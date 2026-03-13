import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Wand2, BookOpen, Sparkles, AlertTriangle, Flame, Moon } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Arquetipos de Mago: Estilos de Usuario de Magia | RolHub',
  description: 'Variantes del mago en juegos de rol. Desde el erudito hasta el hechicero salvaje, todas las formas de canalizar magia.',
  keywords: [
    'mago D&D',
    'arquetipos hechicero',
    'variantes wizard RPG',
    'warlock brujo',
    'usuario magia rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/arquetipos-mago',
  },
  openGraph: {
    title: 'Arquetipos de Mago | RolHub',
    description: 'Todas las formas de canalizar magia.',
    type: 'article',
  },
}

const archetypes = [
  {
    name: 'El Erudito',
    source: 'Estudio, libros, investigacion.',
    magic: 'Metodica, preparada, versatil.',
    personality: 'Curioso, analitico, a veces distante.',
    weakness: 'El conocimiento tiene limites. Que no puede aprender de los libros?',
    examples: ['Gandalf (parcialmente)', 'Hermione', 'Doctor Strange'],
  },
  {
    name: 'El Hechicero Natural',
    source: 'Poder innato, linaje, don.',
    magic: 'Intuitiva, emocional, impredecible.',
    personality: 'Confiado o asustado por su propio poder.',
    weakness: 'El poder sin control es peligroso. Que pasa cuando pierde el control?',
    examples: ['Jean Grey', 'Elsa', 'Eleven'],
  },
  {
    name: 'El Brujo/Warlock',
    source: 'Pacto con entidad poderosa.',
    magic: 'Prestada, con condiciones, con costo.',
    personality: 'Desesperado, ambicioso, o manipulado.',
    weakness: 'El patron siempre cobra. Que va a pedir a cambio?',
    examples: ['Fausto', 'Davy Jones', 'Maleficent'],
  },
  {
    name: 'El Druida/Chaman',
    source: 'Naturaleza, espiritus, el mundo.',
    magic: 'Organica, ciclica, conectada.',
    personality: 'En armonia con el mundo natural, alienado del civilizado.',
    weakness: 'La naturaleza es indiferente. El balance puede requerir sacrificio.',
    examples: ['Radagast', 'Pocahontas', 'Avatar Kyoshi'],
  },
  {
    name: 'El Nigromante',
    source: 'Muerte, almas, entropia.',
    magic: 'Oscura, tabú, poderosa.',
    personality: 'Obsesionado con la muerte, el duelo, o la inmortalidad.',
    weakness: 'La muerte siempre gana. El precio de desafiarla es alto.',
    examples: ['The Lich King', 'Sauron', 'Voldemort'],
  },
  {
    name: 'El Artificer',
    source: 'Magia canalizada a traves de objetos.',
    magic: 'Mecanica, replicable, creativa.',
    personality: 'Inventor, practico, obsesionado con crear.',
    weakness: 'La creacion puede superar al creador. Y si tu obra se vuelve contra vos?',
    examples: ['Tony Stark', 'Hephaestus', 'Howl'],
  },
]

const magicFlavors = [
  {
    flavor: 'Elemental',
    desc: 'Fuego, agua, tierra, aire. Clasico y visual.',
    feel: 'Poderoso, directo, espectacular.',
  },
  {
    flavor: 'Ilusionista',
    desc: 'Engano, percepcion, realidad alterada.',
    feel: 'Sutil, creativo, manipulador.',
  },
  {
    flavor: 'Evocador',
    desc: 'Explosiones, dano masivo, destruccion.',
    feel: 'Violento, satisfactorio, peligroso.',
  },
  {
    flavor: 'Abjurador',
    desc: 'Proteccion, barreras, contrahechizos.',
    feel: 'Defensivo, tactico, preventivo.',
  },
  {
    flavor: 'Transmutador',
    desc: 'Cambiar la forma de las cosas.',
    feel: 'Versatil, creativo, philosophico.',
  },
  {
    flavor: 'Divinador',
    desc: 'Ver el futuro, el pasado, lo oculto.',
    feel: 'Misterioso, sabio, a veces tragico.',
  },
]

const relationships = [
  {
    with: 'El Poder',
    question: 'Es la magia un don o una responsabilidad?',
    conflict: 'Cuanto poder es demasiado?',
  },
  {
    with: 'Los Mundanos',
    question: 'Como ve a los que no tienen magia?',
    conflict: 'Superioridad, proteccion, o envidia?',
  },
  {
    with: 'El Conocimiento',
    question: 'Hay algo que no deberia saberse?',
    conflict: 'Los limites de la curiosidad.',
  },
  {
    with: 'La Mortalidad',
    question: 'Puede la magia vencer a la muerte?',
    conflict: 'El precio de la inmortalidad.',
  },
]

const commonTraps = [
  {
    trap: 'El mago omnisciente',
    issue: 'Sabe todo, resuelve todo con magia.',
    fix: 'La magia tiene limites claros y costos.',
  },
  {
    trap: 'El mago debil fisicamente',
    issue: 'Estereotipo de que magia = debil.',
    fix: 'La constitucion es independiente de la magia.',
  },
  {
    trap: 'El mago antisocial',
    issue: 'Se aisla para estudiar, no conecta.',
    fix: 'La magia puede ser una razon para conectar.',
  },
]

const developmentArcs = [
  'De aprendiz a maestro',
  'De teorico a practico',
  'De poderoso a humilde',
  'De aislado a conectado',
  'De obsesionado a equilibrado',
  'De temeroso de su poder a en control',
]

const backstoryHooks = [
  {
    hook: 'El Accidente',
    prompt: 'Que paso la primera vez que usaste magia sin querer?',
  },
  {
    hook: 'El Maestro',
    prompt: 'Quien te enseno? Que te prohibieron aprender?',
  },
  {
    hook: 'El Precio',
    prompt: 'Que perdiste por tu magia? Valió la pena?',
  },
  {
    hook: 'El Tabu',
    prompt: 'Que tipo de magia juraste nunca usar?',
  },
]

export default function ArquetiposMagoPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">Arquetipos</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-emerald"><Wand2 className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Arquetipos: Mago
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          La magia puede venir de mil fuentes: estudio, sangre, pactos, naturaleza.
          Cada origen trae un tipo diferente de usuario magico, con sus propias
          fortalezas, debilidades, y preguntas existenciales.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Pregunta Central</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>De donde viene tu poder, y que te cuesta?</strong>
          <br /><br />
          La magia gratuita es aburrida. El mago interesante es el que
          paga un precio por su poder — y se pregunta si vale la pena.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> Arquetipos por Origen
        </h2>
        <div className="space-y-4">
          {archetypes.map((arch) => (
            <ParchmentPanel key={arch.name} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-2">{arch.name}</h3>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="font-body text-ink text-sm"><strong>Fuente:</strong> {arch.source}</p>
                  <p className="font-body text-ink text-sm"><strong>Magia:</strong> {arch.magic}</p>
                </div>
                <div>
                  <p className="font-body text-ink text-sm"><strong>Personalidad:</strong> {arch.personality}</p>
                </div>
              </div>
              <div className="p-2 bg-emerald/10 rounded mb-2">
                <span className="font-ui text-xs text-emerald">Debilidad narrativa:</span>
                <p className="font-body text-ink text-sm">{arch.weakness}</p>
              </div>
              <p className="font-ui text-xs text-gold-dim">Ejemplos: {arch.examples.join(', ')}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Sabores de Magia
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {magicFlavors.map((flavor) => (
            <ParchmentPanel key={flavor.flavor} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{flavor.flavor}</h4>
              <p className="font-body text-ink text-sm mb-1">{flavor.desc}</p>
              <p className="font-ui text-xs text-gold-dim">Feel: {flavor.feel}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Moon className="h-6 w-6" /> Relaciones Tematicas
        </h2>
        <div className="space-y-3">
          {relationships.map((rel) => (
            <ParchmentPanel key={rel.with} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">Con {rel.with}</h4>
              <p className="font-body text-ink text-sm mb-1 italic">"{rel.question}"</p>
              <p className="font-ui text-xs text-gold-dim">Conflicto: {rel.conflict}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Flame className="h-6 w-6" /> Hooks de Backstory
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
          <AlertTriangle className="h-6 w-6" /> Trampas Comunes
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
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Arcos de Desarrollo
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="grid md:grid-cols-2 gap-2">
            {developmentArcs.map((arc, i) => (
              <div key={i} className="p-2 bg-gold/5 rounded">
                <span className="font-body text-ink text-sm">{arc}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>La magia mas interesante es la que tiene reglas y limites.</strong>
            <br /><br />
            Sin limites, la magia lo resuelve todo y nada tiene stakes.
            Define que puede hacer tu magia — y mas importante, que NO puede.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Explorar Otros Arquetipos
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Los picaros operan en las sombras.
          </p>
          <Link href="/guias/arquetipos-picaro" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Arquetipos: Picaro
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/arquetipos-guerrero" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Guerrero
          </Link>
          <Link href="/guias/arquetipos-picaro" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Picaro <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
