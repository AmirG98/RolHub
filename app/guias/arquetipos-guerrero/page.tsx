import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Sword, Shield, Zap, Heart, Target, Users } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Arquetipos de Guerrero: Mas alla del Tanque | RolHub',
  description: 'Variantes del guerrero en juegos de rol. Desde el caballero hasta el barbaro, todas las formas de ser un combatiente.',
  keywords: [
    'guerrero D&D',
    'arquetipos luchador',
    'variantes fighter RPG',
    'barbaro paladin',
    'combatiente rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/arquetipos-guerrero',
  },
  openGraph: {
    title: 'Arquetipos de Guerrero | RolHub',
    description: 'Todas las formas de ser un combatiente.',
    type: 'article',
  },
}

const archetypes = [
  {
    name: 'El Caballero',
    core: 'Honor, deber, proteccion de los debiles.',
    combat: 'Armadura pesada, escudo, combate defensivo.',
    roleplay: 'Codigo de conducta estricto, conflictos morales.',
    weakness: 'El honor puede ser una cadena. Que pasa cuando el deber contradice lo correcto?',
    examples: ['Brienne de Tarth', 'Capitán America', 'Sir Gawain'],
  },
  {
    name: 'El Barbaro',
    core: 'Furia, instinto, conexión primal.',
    combat: 'Armas grandes, poca armadura, rage.',
    roleplay: 'Forastero en la civilización, codigo tribal.',
    weakness: 'La furia es poder pero tambien peligro. Puede herir a aliados?',
    examples: ['Conan', 'Drax', 'Guts'],
  },
  {
    name: 'El Mercenario',
    core: 'Pragmatismo, profesionalismo, supervivencia.',
    combat: 'Versatil, usa lo que funciona.',
    roleplay: 'Todo tiene un precio. Lealtad al contrato.',
    weakness: 'Cuando el dinero no alcanza para comprar la lealtad?',
    examples: ['Bronn', 'Geralt (parcialmente)', 'Han Solo'],
  },
  {
    name: 'El Duelista',
    core: 'Precision, honor personal, maestria del arte.',
    combat: 'Armas ligeras, finesse, uno contra uno.',
    roleplay: 'Orgullo en la habilidad, busca oponentes dignos.',
    weakness: 'El uno contra uno no siempre es una opcion. Puede trabajar en equipo?',
    examples: ['Inigo Montoya', 'Syrio Forel', 'Zorro'],
  },
  {
    name: 'El Guardian',
    core: 'Proteger algo o alguien, a cualquier costo.',
    combat: 'Tanquear, interponerse, aguantar.',
    roleplay: 'Devotion a una causa, persona, o lugar.',
    weakness: 'Que pasa cuando lo que protege esta en peligro y no puede estar ahi?',
    examples: ['Hodor', 'Samwise', 'The Mountain (corrupto)'],
  },
  {
    name: 'El Veterano',
    core: 'Experiencia, cicatrices, sabiduria de batalla.',
    combat: 'Tactico, sabe cuando pelear y cuando retirarse.',
    roleplay: 'Trauma de guerra, mentoria, desencanto.',
    weakness: 'El pasado siempre vuelve. Puede escapar de sus fantasmas?',
    examples: ['Barristan Selmy', 'Mad-Eye Moody', 'Cable'],
  },
]

const combatStyles = [
  {
    style: 'Tanque',
    approach: 'Absorber dano, proteger aliados.',
    mechanics: 'Alta AC/HP, habilidades de taunt, resistencias.',
    teamRole: 'Linea frontal, control de espacio.',
  },
  {
    style: 'Damage Dealer',
    approach: 'Maximizar dano por turno.',
    mechanics: 'Ataques multiples, criticos, burst.',
    teamRole: 'Eliminar amenazas rapidamente.',
  },
  {
    style: 'Controlador',
    approach: 'Manipular el campo de batalla.',
    mechanics: 'Empujar, derribar, agarrar, area denial.',
    teamRole: 'Crear ventajas tacticas.',
  },
  {
    style: 'Skirmisher',
    approach: 'Movilidad, ataques de oportunidad.',
    mechanics: 'Velocidad, hit and run, flanqueo.',
    teamRole: 'Presionar backline enemiga.',
  },
]

const backstoryHooks = [
  {
    hook: 'La Guerra',
    prompt: 'En que conflicto peleaste? Por que lado? Como termino?',
    conflict: 'Los enemigos de ayer son los aliados de hoy.',
  },
  {
    hook: 'El Maestro',
    prompt: 'Quien te enseno a pelear? Donde estan ahora?',
    conflict: 'Las ensenanzas del maestro se ponen a prueba.',
  },
  {
    hook: 'La Cicatriz',
    prompt: 'Cual es tu peor herida? Como la conseguiste?',
    conflict: 'La persona que te la dio reaparece.',
  },
  {
    hook: 'El Juramento',
    prompt: 'Que prometiste? A quien? Por que?',
    conflict: 'Cumplir el juramento requiere traicionar algo mas.',
  },
]

const commonTraps = [
  {
    trap: 'Solo peleo',
    issue: 'El personaje no tiene personalidad fuera del combate.',
    fix: 'Dale hobbies, miedos, relaciones fuera de la batalla.',
  },
  {
    trap: 'Edgy y solitario',
    issue: 'No hay razon para estar con el grupo.',
    fix: 'El guerrero necesita al grupo tanto como ellos a el.',
  },
  {
    trap: 'Estupido porque es fuerte',
    issue: 'Fuerza no significa poca inteligencia.',
    fix: 'Puede ser tactico, sabio, o culto en su campo.',
  },
]

const developmentArcs = [
  'De mercenario a protector',
  'De vengador a pacificador',
  'De lider a seguidor (humildad)',
  'De cobarde a heroe',
  'De arrogante a humilde',
  'De solitario a parte de una familia',
]

export default function ArquetiposGuerreroPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-blood px-2 py-1 rounded">Arquetipos</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-blood"><Sword className="h-8 w-8 text-white" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Arquetipos: Guerrero
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El guerrero es mas que "el que pega fuerte". Desde el caballero honorable
          hasta el barbaro salvaje, hay infinitas formas de ser un combatiente.
          Cada una trae sus propias historias.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">La Pregunta Central</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>Por que peleas?</strong>
          <br /><br />
          La respuesta define al guerrero. Dinero, honor, venganza, proteccion,
          deber, supervivencia... cada motivacion crea un personaje diferente.
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
                  <p className="font-body text-ink text-sm"><strong>Core:</strong> {arch.core}</p>
                  <p className="font-body text-ink text-sm"><strong>Combate:</strong> {arch.combat}</p>
                </div>
                <div>
                  <p className="font-body text-ink text-sm"><strong>Roleplay:</strong> {arch.roleplay}</p>
                </div>
              </div>
              <div className="p-2 bg-blood/10 rounded mb-2">
                <span className="font-ui text-xs text-blood">Debilidad narrativa:</span>
                <p className="font-body text-ink text-sm">{arch.weakness}</p>
              </div>
              <p className="font-ui text-xs text-gold-dim">Ejemplos: {arch.examples.join(', ')}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6" /> Estilos de Combate
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {combatStyles.map((style) => (
            <ParchmentPanel key={style.style} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{style.style}</h4>
              <p className="font-body text-ink text-sm mb-1">{style.approach}</p>
              <p className="font-ui text-xs text-gold-dim">Mecanicas: {style.mechanics}</p>
              <p className="font-ui text-xs text-gold-dim">Rol en equipo: {style.teamRole}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Heart className="h-6 w-6" /> Hooks de Backstory
        </h2>
        <div className="space-y-3">
          {backstoryHooks.map((hook) => (
            <ParchmentPanel key={hook.hook} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{hook.hook}</h4>
              <p className="font-body text-ink text-sm mb-1 italic">"{hook.prompt}"</p>
              <p className="font-ui text-xs text-gold-dim">Conflicto potencial: {hook.conflict}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6" /> Trampas Comunes
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
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Target className="h-6 w-6" /> Arcos de Desarrollo
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
            <strong>El guerrero mas interesante es el que tiene algo que perder.</strong>
            <br /><br />
            La fuerza sin vulnerabilidad es aburrida.
            Dale al guerrero algo que le importe mas que ganar.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Explorar Otros Arquetipos
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Los usuarios de magia tienen sus propias variantes.
          </p>
          <Link href="/guias/arquetipos-mago" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Arquetipos: Mago
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/jugar-solo" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Jugar Solo
          </Link>
          <Link href="/guias/arquetipos-mago" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Mago <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
