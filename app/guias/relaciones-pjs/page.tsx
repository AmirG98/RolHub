import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Users, Heart, Swords, MessageCircle, Sparkles, AlertTriangle } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Relaciones entre Personajes: Vinculos y Dinamicas | RolHub',
  description: 'Crea vinculos interesantes entre personajes jugadores. Amistades, rivalidades, romances, y como manejar conflictos de forma sana.',
  keywords: [
    'relaciones entre PJs',
    'vinculos personajes RPG',
    'dinamica de grupo rol',
    'conflicto entre personajes',
    'romance en D&D'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/relaciones-pjs',
  },
  openGraph: {
    title: 'Relaciones entre PJs | RolHub',
    description: 'Los mejores momentos vienen de las conexiones.',
    type: 'article',
  },
}

const relationshipTypes = [
  {
    type: 'Amistad',
    icon: Heart,
    desc: 'El vinculo mas comun y poderoso. Confianza mutua y apoyo.',
    prompts: ['Que admiras del otro PJ?', 'Que momento los unio?', 'Que harias por el/ella?'],
  },
  {
    type: 'Rivalidad',
    icon: Swords,
    desc: 'Competencia que empuja a ambos a mejorar. No es odio.',
    prompts: ['En que compiten?', 'Que respetas aunque compitas?', 'Podrias contar con el/ella en una crisis?'],
  },
  {
    type: 'Mentor/Aprendiz',
    icon: Users,
    desc: 'Uno enseña, el otro aprende. Puede evolucionar a iguales.',
    prompts: ['Que te enseña?', 'Por que elegiste a esta persona?', 'Cuando el aprendiz supera al mentor?'],
  },
  {
    type: 'Romance',
    icon: Sparkles,
    desc: 'Atraccion romantica. Requiere consentimiento de ambos jugadores.',
    prompts: ['Que te atrajo?', 'Como manejan el peligro juntos?', 'Que pasaria si perdés a esta persona?'],
  },
  {
    type: 'Desconfianza',
    icon: AlertTriangle,
    desc: 'No confias por alguna razon. Puede evolucionar a confianza.',
    prompts: ['Que hizo para generar desconfianza?', 'Que necesitarias para confiar?', 'Es justificada tu desconfianza?'],
  },
]

const buildingTips = [
  {
    tip: 'Habla Fuera de Partida',
    desc: 'Coordina con el otro jugador. "Quiero que nuestros personajes tengan rivalidad amistosa — te parece?"',
  },
  {
    tip: 'Busca Conexiones de Backstory',
    desc: 'Venian del mismo pueblo? Conocen a la misma persona? Trabajan para la misma organizacion?',
  },
  {
    tip: 'Crea Momentos Compartidos',
    desc: 'Ofrecé escenas entre personajes. "Te invito a tomar algo en la taberna y hablar de tu pasado".',
  },
  {
    tip: 'Reacciona a Sus Acciones',
    desc: 'Cuando otro PJ hace algo importante, tu personaje deberia tener una opinion.',
  },
  {
    tip: 'Deja Espacio',
    desc: 'No todo tiene que ser sobre tu relacion. Deja que otros tambien brillen.',
  },
]

const conflictRules = [
  {
    rule: 'Conflicto de Personajes, No de Jugadores',
    desc: 'Si tu personaje odia al otro, vos como jugador deberias colaborar para que sea divertido para ambos.',
  },
  {
    rule: 'El Conflicto Tiene que Ser Interesante',
    desc: 'Discutir sobre quien lleva la antorcha no es interesante. Discutir sobre matar o perdonar al villano si.',
  },
  {
    rule: 'Busca Resolucion',
    desc: 'El conflicto eterno aburre. Deja que evolucione, se resuelva, o escale a algo nuevo.',
  },
  {
    rule: 'Nunca Fuerces a Otro Jugador',
    desc: 'Si tu accion afecta negativamente a otro PJ, preguntá primero. "Esta bien si mi personaje roba algo tuyo para el drama?"',
  },
  {
    rule: 'Comunicacion es Clave',
    desc: 'Si algo te molesta como jugador, decilo. El rol es para divertirse, no para incomodarse.',
  },
]

const sceneIdeas = [
  { scene: 'Charla de Guardia', desc: 'Dos PJs hacen guardia de noche. Que hablan cuando los demas duermen?' },
  { scene: 'Entrenamiento', desc: 'Un PJ enseña algo al otro. Que aprenden el uno del otro?' },
  { scene: 'Celebracion', desc: 'Despues de una victoria, como celebran juntos?' },
  { scene: 'Herida', desc: 'Un PJ esta herido y el otro lo cuida. Que se dicen?' },
  { scene: 'Confrontacion', desc: 'Un PJ hizo algo que molestó al otro. Como lo resuelven?' },
  { scene: 'Secreto Revelado', desc: 'Un PJ revela algo importante de su pasado. Como reacciona el otro?' },
]

const groupDynamics = [
  {
    dynamic: 'El Lider Natural',
    desc: 'Alguien que toma decisiones cuando el grupo duda. No tiene que ser siempre el mismo.',
  },
  {
    dynamic: 'El Mediador',
    desc: 'Quien resuelve conflictos y mantiene al grupo unido.',
  },
  {
    dynamic: 'El Corazon',
    desc: 'Quien recuerda por que luchan y mantiene la moral.',
  },
  {
    dynamic: 'El Experto',
    desc: 'Quien sabe de un tema especifico que otros no.',
  },
]

export default function RelacionesPJsPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">Personaje</span>
          <span className="text-xs font-ui font-semibold text-parchment">10 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Users className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Relaciones entre PJs
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Los personajes jugadores no existen en un vacio. Las relaciones entre
          ellos — amistades, rivalidades, romances, conflictos — son lo que
          transforma un grupo de aventureros en algo memorable.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">Por Que Importa</h2>
        <p className="font-body text-ink text-center leading-relaxed">
          <strong>Los mejores momentos de rol vienen de las conexiones entre personajes.</strong>
          <br /><br />
          Matar al dragon es epico. Matar al dragon mientras proteges a tu mejor
          amigo es inolvidable.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tipos de Relaciones
        </h2>
        <div className="space-y-4">
          {relationshipTypes.map((rel) => (
            <ParchmentPanel key={rel.type} className="p-6 border border-gold-dim">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gold-dim flex-shrink-0">
                  <rel.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-xl text-ink mb-2">{rel.type}</h3>
                  <p className="font-body text-ink mb-3">{rel.desc}</p>
                  <div className="p-3 bg-gold/10 rounded">
                    <p className="font-ui text-xs text-ink font-bold mb-1">Preguntas para definirla:</p>
                    <ul className="font-body text-ink text-sm">
                      {rel.prompts.map((p, i) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Heart className="h-6 w-6" /> Como Construir Vinculos
        </h2>
        <div className="space-y-3">
          {buildingTips.map((t) => (
            <ParchmentPanel key={t.tip} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{t.tip}</h4>
              <p className="font-body text-ink text-sm">{t.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> Ideas de Escenas
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            Estas escenas entre sesiones de accion ayudan a desarrollar relaciones:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {sceneIdeas.map((s) => (
              <div key={s.scene} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm mb-1">{s.scene}</h4>
                <p className="font-body text-ink text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Swords className="h-6 w-6" /> Reglas del Conflicto Sano
        </h2>
        <ParchmentPanel className="p-6 border-2 border-blood">
          <div className="space-y-4">
            {conflictRules.map((r, i) => (
              <div key={i} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm mb-1">{r.rule}</h4>
                <p className="font-body text-ink text-sm">{r.desc}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Dinamicas de Grupo
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {groupDynamics.map((d) => (
            <ParchmentPanel key={d.dynamic} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{d.dynamic}</h4>
              <p className="font-body text-ink text-sm">{d.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>Jugas CON otras personas, no CONTRA ellas.</strong>
            <br /><br />
            El objetivo es que todos se diviertan. Las mejores relaciones entre
            personajes nacen cuando los jugadores colaboran para crear drama
            interesante, no cuando compiten por protagonismo.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Jugar bien en grupo requiere ciertas normas sociales.
          </p>
          <Link href="/guias/etiqueta-mesa" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Etiqueta de Mesa
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/arcos-personaje" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Arcos de Personaje
          </Link>
          <Link href="/guias" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Ver Todas las Guias
          </Link>
        </div>
      </nav>
    </article>
  )
}
