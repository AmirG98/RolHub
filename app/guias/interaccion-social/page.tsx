import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, MessageCircle, Users, Heart, AlertTriangle, Sparkles, Scale } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Interaccion Social: Negociar, Persuadir, Engañar | RolHub',
  description: 'Domina las interacciones sociales en juegos de rol. Persuasion, intimidacion, engaño, y como hablar con NPCs efectivamente.',
  keywords: [
    'interaccion social RPG',
    'persuasion juegos de rol',
    'negociar en D&D',
    'engañar NPCs',
    'roleplay social'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/interaccion-social',
  },
  openGraph: {
    title: 'Interaccion Social | RolHub',
    description: 'Como hablar tu camino a traves de cualquier situacion.',
    type: 'article',
  },
}

const approaches = [
  {
    approach: 'Persuasion',
    icon: Heart,
    desc: 'Convencer a alguien apelando a la razon, emociones, o intereses mutuos.',
    when: 'El NPC no tiene motivo para negarse pero necesita un empujon.',
    example: '"Entiendo que el baron te paga bien, pero si nos ayudas, el pueblo entero te recordara como heroe."',
  },
  {
    approach: 'Intimidacion',
    icon: AlertTriangle,
    desc: 'Usar miedo, amenazas, o presencia imponente para lograr lo que queres.',
    when: 'Tenes ventaja clara o el NPC es cobarde. OJO: tiene consecuencias.',
    example: '"Mira, puedo hacerlo de la forma facil o la dificil. Tu elijes."',
  },
  {
    approach: 'Engaño',
    icon: Sparkles,
    desc: 'Mentir, manipular, o actuar para que el NPC crea algo falso.',
    when: 'La verdad no te conviene y podes sostener la mentira.',
    example: '"Venimos de parte del rey. Tiene que haber algun malentendido con el impuesto."',
  },
  {
    approach: 'Negociacion',
    icon: Scale,
    desc: 'Llegar a un acuerdo donde ambas partes ganen algo.',
    when: 'El NPC tiene algo que queres y vos tenes algo que ofrecer.',
    example: '"Te damos la ubicacion del tesoro a cambio de paso libre por tus tierras."',
  },
]

const npcReactions = [
  { attitude: 'Amigable', behavior: 'Dispuesto a ayudar, da informacion gratis.', tip: 'No presiones demasiado. Ya te quiere bien.' },
  { attitude: 'Indiferente', behavior: 'No le importas. Necesitas darle una razon.', tip: 'Ofrece algo o apela a sus intereses.' },
  { attitude: 'Hostil', behavior: 'Desconfia, no quiere hablar.', tip: 'Intimidacion puede funcionar, pero persuasion es mas segura a largo plazo.' },
  { attitude: 'Desconfiado', behavior: 'Sospecha de tus intenciones.', tip: 'Sé honesto o muy bueno mintiendo. A medias tintas no funciona.' },
]

const tips = [
  {
    tip: 'Escucha Primero',
    desc: 'Antes de hablar, averigua que quiere el NPC. Sus motivaciones son la llave.',
  },
  {
    tip: 'No Todo es Tirada',
    desc: 'Un buen argumento puede convencer sin dados. Roleplay bien hecho tiene peso.',
  },
  {
    tip: 'Ofrece, No Solo Pidas',
    desc: '"Dame informacion" es menos efectivo que "Te doy X si me das informacion".',
  },
  {
    tip: 'Lee el Contexto',
    desc: 'Intimidar al capitan de la guardia frente a sus hombres? Mala idea.',
  },
  {
    tip: 'Acepta el No',
    desc: 'A veces el NPC no va a ceder. Busca otra forma o vuelve mas tarde.',
  },
  {
    tip: 'Las Consecuencias Importan',
    desc: 'Un NPC que engañaste puede volver. Uno que intimidaste querra venganza.',
  },
]

const commonMistakes = [
  {
    mistake: 'Tratar a todos los NPCs igual',
    fix: 'Cada NPC tiene personalidad. Adapta tu approach.',
  },
  {
    mistake: 'Solo usar tu stat mas alto',
    fix: 'La habilidad que uses debe tener sentido para la situacion.',
  },
  {
    mistake: 'Esperar que 20 natural resuelva todo',
    fix: 'Un 20 te da lo mejor posible, no lo imposible. No podes convencer al rey de darte su corona.',
  },
  {
    mistake: 'Ser solo "el que habla" del grupo',
    fix: 'Otros jugadores pueden aportar. Deja espacio.',
  },
  {
    mistake: 'Ignorar el lenguaje corporal',
    fix: 'Describe como habla tu personaje, no solo que dice.',
  },
]

const dialogueTips = [
  {
    category: 'Abrir Conversacion',
    examples: [
      '"Disculpe, busco informacion sobre..."',
      '"Me dijeron que usted es la persona indicada para..."',
      '"Tenemos un problema en comun..."',
    ],
  },
  {
    category: 'Obtener Informacion',
    examples: [
      '"Escuche rumores sobre X, es cierto?"',
      '"Que puede decirme sobre...?"',
      '"Parece que sabe mas de lo que dice..."',
    ],
  },
  {
    category: 'Cerrar Trato',
    examples: [
      '"Entonces estamos de acuerdo?"',
      '"Que necesitas para que esto funcione?"',
      '"Tenemos un trato?"',
    ],
  },
]

export default function InteraccionSocialPage() {
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
          <span className="text-xs font-ui font-semibold text-parchment">10 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><MessageCircle className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Interaccion Social
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          No todo se resuelve con espadas. Las palabras pueden abrir puertas,
          conseguir aliados, y evitar combates innecesarios.
          Dominar las interacciones sociales te hace un jugador completo.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tipos de Approach
        </h2>
        <div className="space-y-4">
          {approaches.map((a) => (
            <ParchmentPanel key={a.approach} className="p-6 border border-gold-dim">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gold-dim flex-shrink-0">
                  <a.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-xl text-ink mb-2">{a.approach}</h3>
                  <p className="font-body text-ink mb-2">{a.desc}</p>
                  <p className="font-ui text-sm text-gold-dim mb-3">Cuando usar: {a.when}</p>
                  <div className="p-3 bg-gold/10 rounded">
                    <p className="font-body text-ink text-sm italic">"{a.example}"</p>
                  </div>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Actitudes de NPCs
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            Los NPCs no son robots. Tienen actitudes que afectan como responden:
          </p>
          <div className="space-y-3">
            {npcReactions.map((r) => (
              <div key={r.attitude} className="p-3 bg-gold/5 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-ui font-bold px-2 py-0.5 rounded ${
                    r.attitude === 'Amigable' ? 'bg-emerald/20 text-emerald' :
                    r.attitude === 'Hostil' ? 'bg-blood/20 text-blood' :
                    'bg-gold/20 text-gold-dim'
                  }`}>{r.attitude}</span>
                </div>
                <p className="font-body text-ink text-sm mb-1">{r.behavior}</p>
                <p className="font-ui text-xs text-ink"><strong>Tip:</strong> {r.tip}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Frases Utiles
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {dialogueTips.map((cat) => (
            <ParchmentPanel key={cat.category} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-3 text-center">{cat.category}</h4>
              <ul className="font-body text-ink text-sm space-y-2">
                {cat.examples.map((ex, i) => (
                  <li key={i} className="italic">"{ex}"</li>
                ))}
              </ul>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tips Generales
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {tips.map((t) => (
            <ParchmentPanel key={t.tip} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{t.tip}</h4>
              <p className="font-body text-ink text-sm">{t.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
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
          <h3 className="font-heading text-xl text-ink mb-4 text-center">El Arte de la Conversacion</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>La mejor interaccion social no se siente como una mecanica.</strong>
            <br /><br />
            Se siente como una conversacion real entre dos personas con motivaciones propias.
            Cuando olvidas que estas "haciendo una tirada de persuasion" y simplemente
            hablas como tu personaje, estas haciendo buen roleplay.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Los dados son parte del juego. Aprendé a usarlos.
          </p>
          <Link href="/guias/entender-dados" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Entender los Dados
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/exploracion" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Exploracion
          </Link>
          <Link href="/guias/entender-dados" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Entender Dados <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
