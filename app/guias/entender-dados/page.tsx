import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Dice6, Target, TrendingUp, HelpCircle, Sparkles } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Entender los Dados: Probabilidades y Mecanicas | RolHub',
  description: 'Domina el sistema de dados en juegos de rol. Probabilidades, cuando tirar, interpretar resultados y tipos de dados.',
  keywords: [
    'dados juegos de rol',
    'probabilidades D&D',
    'd20 mecanicas',
    'tirar dados RPG',
    'tipos de dados rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/entender-dados',
  },
  openGraph: {
    title: 'Entender los Dados | RolHub',
    description: 'Todo sobre dados en juegos de rol narrativo.',
    type: 'article',
  },
}

const diceTypes = [
  { name: 'd4', sides: 4, shape: 'Piramide', use: 'Daño de daga, hechizos menores.' },
  { name: 'd6', sides: 6, shape: 'Cubo', use: 'Daño de espada corta, bolas de fuego, sistemas PbtA.' },
  { name: 'd8', sides: 8, shape: 'Octaedro', use: 'Daño de armas medianas, espada larga.' },
  { name: 'd10', sides: 10, shape: 'Decaedro', use: 'Daño de armas grandes, porcentajes.' },
  { name: 'd12', sides: 12, shape: 'Dodecaedro', use: 'Daño de hacha grande, barbaro.' },
  { name: 'd20', sides: 20, shape: 'Icosaedro', use: 'Acciones principales en D&D. El dado rey.' },
  { name: 'd100', sides: 100, shape: '2x d10', use: 'Tablas aleatorias, porcentajes exactos.' },
]

const whenToRoll = [
  {
    situation: 'El resultado es incierto',
    roll: true,
    example: 'Saltar un precipicio peligroso.',
  },
  {
    situation: 'Hay algo en juego',
    roll: true,
    example: 'Mentirle al guardia para pasar.',
  },
  {
    situation: 'El exito no esta garantizado',
    roll: true,
    example: 'Derribar una puerta reforzada.',
  },
  {
    situation: 'Es una accion trivial',
    roll: false,
    example: 'Caminar por un pasillo vacio.',
  },
  {
    situation: 'No hay consecuencias de fallo',
    roll: false,
    example: 'Intentar abrir una puerta sin llave (podés reintentar infinitamente).',
  },
  {
    situation: 'Es imposible',
    roll: false,
    example: 'Convencer al dragon de que sos su madre.',
  },
]

const probabilities = [
  { target: 5, percent: '80%', desc: 'Muy facil. Fallar es mala suerte.' },
  { target: 10, percent: '55%', desc: 'Normal. Posible pero no seguro.' },
  { target: 15, percent: '30%', desc: 'Dificil. Necesitas habilidad o suerte.' },
  { target: 20, percent: '5%', desc: 'Muy dificil. Solo con modificadores altos.' },
  { target: 25, percent: '<5%', desc: 'Casi imposible sin ayuda magica.' },
]

const interpretResults = [
  {
    result: 'Exito Total',
    meaning: 'Logras lo que querias y quizas algo mas.',
    example: 'Abris la cerradura silenciosamente y encontras un pasaje secreto.',
  },
  {
    result: 'Exito con Costo',
    meaning: 'Lo logras, pero algo sale mal.',
    example: 'Abris la cerradura pero haces ruido. Los guardias vienen a investigar.',
  },
  {
    result: 'Fallo Parcial',
    meaning: 'No lo logras, pero algo interesante pasa.',
    example: 'La ganzua se rompe dentro de la cerradura, pero escuchas voces del otro lado.',
  },
  {
    result: 'Fallo Total',
    meaning: 'No funciono y hay consecuencias.',
    example: 'La cerradura tiene una trampa. Tomas daño y activas la alarma.',
  },
]

const modifiers = [
  { type: 'Ventaja', effect: 'Tiras 2 dados y quedas con el mas alto.', when: 'Situacion favorable, ayuda de aliado.' },
  { type: 'Desventaja', effect: 'Tiras 2 dados y quedas con el mas bajo.', when: 'Situacion desfavorable, condiciones adversas.' },
  { type: 'Bonificador', effect: 'Sumas un numero al resultado.', when: 'Tu habilidad, equipo, o magia te ayudan.' },
  { type: 'Penalizador', effect: 'Restas un numero al resultado.', when: 'Heridas, condiciones negativas, equipo roto.' },
]

const tips = [
  {
    tip: 'Describe Antes de Tirar',
    desc: 'Decile al DM QUE intentas y COMO lo intentas. El decide que dado tiras.',
  },
  {
    tip: 'Acepta los Resultados',
    desc: 'Un 1 natural es un fallo epico. Disfrutalo. Los mejores momentos vienen de fallos.',
  },
  {
    tip: 'Los Dados No Son Todo',
    desc: 'Un buen plan puede evitar tiradas. Persuadir con un argumento solido no siempre necesita dados.',
  },
  {
    tip: 'Pregunta Consecuencias',
    desc: 'Si no sabes que pasa si fallas, pregunta antes de tirar. Asi podes decidir si vale el riesgo.',
  },
]

export default function EntenderDadosPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">Mecanicas</span>
          <span className="text-xs font-ui font-semibold text-parchment">8 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Dice6 className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Entender los Dados
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Los dados son el corazon de muchos juegos de rol. No son solo numeros
          aleatorios — son la incertidumbre que hace el juego emocionante.
          Entender como funcionan te hace mejor jugador.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tipos de Dados
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {diceTypes.map((dice) => (
              <div key={dice.name} className="text-center p-3 bg-gold/5 rounded">
                <div className="text-2xl font-title text-gold-bright mb-1">{dice.name}</div>
                <p className="font-ui text-xs text-ink">{dice.sides} caras</p>
                <p className="font-body text-xs text-ink mt-1">{dice.use}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <HelpCircle className="h-6 w-6" /> Cuando se Tira?
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-3">
            {whenToRoll.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-gold/5 rounded">
                <span className={`text-xs font-ui font-bold px-2 py-1 rounded ${
                  item.roll ? 'bg-emerald/20 text-emerald' : 'bg-blood/20 text-blood'
                }`}>
                  {item.roll ? 'TIRAR' : 'NO TIRAR'}
                </span>
                <div>
                  <p className="font-body text-ink text-sm">{item.situation}</p>
                  <p className="font-ui text-xs text-ink">Ejemplo: {item.example}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" /> Probabilidades (d20)
        </h2>
        <ParchmentPanel className="p-6 border-2 border-gold">
          <p className="font-body text-ink mb-4">
            En un d20, cada numero tiene 5% de probabilidad. La dificultad (DC) determina que necesitas:
          </p>
          <div className="space-y-2">
            {probabilities.map((p) => (
              <div key={p.target} className="flex items-center gap-4 p-2 bg-gold/5 rounded">
                <div className="w-16 text-center">
                  <span className="font-heading text-lg text-gold-bright">DC {p.target}</span>
                </div>
                <div className="w-16 text-center">
                  <span className="font-ui font-bold text-ink">{p.percent}</span>
                </div>
                <p className="font-body text-ink text-sm flex-1">{p.desc}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Target className="h-6 w-6" /> Interpretar Resultados
        </h2>
        <div className="space-y-3">
          {interpretResults.map((r) => (
            <ParchmentPanel key={r.result} className="p-4 border border-gold-dim/50">
              <div className="flex items-start gap-3">
                <span className={`text-xs font-ui font-bold px-2 py-1 rounded flex-shrink-0 ${
                  r.result === 'Exito Total' ? 'bg-emerald/20 text-emerald' :
                  r.result === 'Exito con Costo' ? 'bg-gold/20 text-gold-dim' :
                  r.result === 'Fallo Parcial' ? 'bg-gold/30 text-gold-dim' :
                  'bg-blood/20 text-blood'
                }`}>
                  {r.result}
                </span>
                <div>
                  <p className="font-body text-ink text-sm mb-1">{r.meaning}</p>
                  <p className="font-ui text-xs text-ink italic">{r.example}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Modificadores
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {modifiers.map((m) => (
            <ParchmentPanel key={m.type} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-2">{m.type}</h4>
              <p className="font-body text-ink text-sm mb-2">{m.effect}</p>
              <p className="font-ui text-xs text-gold-dim">Cuando: {m.when}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Tips
        </h2>
        <div className="space-y-3">
          {tips.map((t) => (
            <ParchmentPanel key={t.tip} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{t.tip}</h4>
              <p className="font-body text-ink text-sm">{t.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">La Magia de los Dados</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>Los dados no cuentan la historia. Vos la contas.</strong>
            <br /><br />
            Un 1 natural no es "fallaste". Es "algo salio terriblemente mal de una forma
            interesante". Un 20 natural no es "ganaste". Es "algo increible paso".
            Los dados son el catalizador. La narrativa es tuya.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Listo para Jugar?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Ya entendés las mecanicas. Ahora aprendé a crear un personaje memorable.
          </p>
          <Link href="/guias/escribir-backstory" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Escribir Backstory
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/interaccion-social" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Interaccion Social
          </Link>
          <Link href="/guias" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Ver Todas las Guias
          </Link>
        </div>
      </nav>
    </article>
  )
}
