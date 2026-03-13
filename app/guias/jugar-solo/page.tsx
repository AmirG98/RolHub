import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, User, BookOpen, Sparkles, Heart, Clock, Lightbulb } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Jugar Rol en Solitario: Journaling y DM de IA | RolHub',
  description: 'Como disfrutar el rol en solitario. Tecnicas de journaling, usar el DM de IA, y crear historias significativas por tu cuenta.',
  keywords: [
    'rol solitario',
    'solo RPG',
    'journaling rol',
    'jugar rol solo',
    'DM IA solitario'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/jugar-solo',
  },
  openGraph: {
    title: 'Jugar Rol en Solitario | RolHub',
    description: 'Aventuras epicas, solo para vos.',
    type: 'article',
  },
}

const whySolo = [
  {
    reason: 'Horarios Propios',
    desc: 'Jugas cuando queres, cuanto queres, sin coordinar con nadie.',
  },
  {
    reason: 'Historias Personales',
    desc: 'Exploras temas que te importan sin preocuparte por el grupo.',
  },
  {
    reason: 'Ritmo Propio',
    desc: 'Pausas cuando necesitas, aceleras cuando queres.',
  },
  {
    reason: 'Experimentacion',
    desc: 'Probas sistemas, personajes, y estilos sin consecuencias.',
  },
]

const playstyles = [
  {
    style: 'Narrativo Puro',
    desc: 'Enfocado en la historia y el desarrollo del personaje.',
    mechanics: 'Minimas o ninguna. El DM IA guia la narrativa.',
    ideal: 'Escritores, fans de la ficcion interactiva.',
  },
  {
    style: 'Tactico',
    desc: 'Combates, builds, optimizacion.',
    mechanics: 'Sistema completo con tiradas y stats.',
    ideal: 'Fans de los videojuegos tacticos.',
  },
  {
    style: 'Exploratorio',
    desc: 'Descubrir el mundo, sus secretos, su historia.',
    mechanics: 'Variables segun la situacion.',
    ideal: 'Los que aman el worldbuilding.',
  },
  {
    style: 'Journaling',
    desc: 'Escribir un diario desde la perspectiva del personaje.',
    mechanics: 'Prompts y preguntas que guian la escritura.',
    ideal: 'Los que quieren procesar emociones o practicar escritura.',
  },
]

const journalingTechniques = [
  {
    technique: 'Entrada de Diario',
    prompt: '"Querido diario, hoy..."',
    use: 'Reflexion personal del personaje sobre los eventos.',
  },
  {
    technique: 'Carta a Alguien',
    prompt: '"Querido [NPC], te escribo para contarte..."',
    use: 'Explorar relaciones y sentimientos hacia otros.',
  },
  {
    technique: 'Recuerdo',
    prompt: '"Esto me recuerda a cuando..."',
    use: 'Desarrollar backstory durante el juego.',
  },
  {
    technique: 'Confesion',
    prompt: '"Nunca se lo conte a nadie, pero..."',
    use: 'Revelar secretos y motivaciones ocultas.',
  },
  {
    technique: 'Sueno/Pesadilla',
    prompt: '"Anoche sone que..."',
    use: 'Explorar miedos, deseos, y presagios.',
  },
]

const dmAiTips = [
  {
    tip: 'Pensa en Voz Alta',
    how: 'Decile al DM lo que estas pensando, no solo lo que haces.',
    example: '"Estoy nervioso por esta reunion. Que me recomienda mi instinto?"',
  },
  {
    tip: 'Pedi Opciones',
    how: 'Si no sabes que hacer, pedi sugerencias.',
    example: '"Dame 3 formas en que podria abordar este problema."',
  },
  {
    tip: 'Explora Emociones',
    how: 'Pregunta como se siente tu personaje.',
    example: '"Como reacciona mi personaje emocionalmente a esta noticia?"',
  },
  {
    tip: 'Crea NPCs',
    how: 'Pedi que el DM desarrolle personajes secundarios.',
    example: '"Describime al tabernero. Que historia tiene?"',
  },
]

const sessionStructure = [
  {
    phase: 'Preparacion',
    time: '5 min',
    activity: 'Lee el resumen de la sesion anterior. Recorda donde quedaste.',
  },
  {
    phase: 'Inmersion',
    time: '5 min',
    activity: 'Ponete en la mente del personaje. Que quiere lograr hoy?',
  },
  {
    phase: 'Juego',
    time: '30-60 min',
    activity: 'Interactua con el DM IA. Alterna accion y reflexion.',
  },
  {
    phase: 'Journaling',
    time: '10 min',
    activity: 'Escribe una entrada desde la perspectiva del personaje.',
  },
  {
    phase: 'Cierre',
    time: '5 min',
    activity: 'Anota preguntas abiertas y hooks para la proxima sesion.',
  },
]

const commonChallenges = [
  {
    challenge: 'No se que hacer',
    solution: 'Preguntale al DM: "Que opciones tengo?" o "Que haria mi personaje?"',
  },
  {
    challenge: 'Se siente vacio',
    solution: 'Agrega journaling. Escribi los pensamientos de tu personaje.',
  },
  {
    challenge: 'Me aburro',
    solution: 'Cambia de tono. Pedi un giro. Introduce un nuevo conflicto.',
  },
  {
    challenge: 'No hay stakes',
    solution: 'Subi la dificultad. Introduce amenazas personales.',
  },
]

const benefitsOfSolo = [
  'Cero drama social',
  'Exploras a tu ritmo',
  'Historias profundamente personales',
  'Practica de escritura creativa',
  'Escapismo controlado',
  'Conoces mejor a tu personaje',
]

export default function JugarSoloPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-bright px-2 py-1 rounded">RolHub</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><User className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Jugar en Solitario
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          No necesitas un grupo para vivir aventuras epicas. El rol en solitario
          con un DM de IA es una experiencia valida, satisfactoria, y a veces
          mas profunda que el rol grupal. Esta guia te muestra como hacerlo.
        </p>
      </header>

      <ParchmentPanel className="p-6 mb-12 border-2 border-gold">
        <h2 className="font-heading text-xl text-ink mb-3 text-center">Jugar Solo es Valido</h2>
        <p className="font-body text-ink text-lg text-center leading-relaxed">
          <strong>El rol no requiere 4-5 personas alrededor de una mesa.</strong>
          <br /><br />
          Millones de personas disfrutan rol en solitario, journaling RPG,
          y ficcion interactiva. No es "rol de segunda". Es simplemente otra forma.
        </p>
      </ParchmentPanel>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Por Que Jugar Solo
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {whySolo.map((item) => (
            <ParchmentPanel key={item.reason} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{item.reason}</h4>
              <p className="font-body text-ink text-sm">{item.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Estilos de Juego
        </h2>
        <div className="space-y-4">
          {playstyles.map((style) => (
            <ParchmentPanel key={style.style} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{style.style}</h3>
              <p className="font-body text-ink text-sm mb-2">{style.desc}</p>
              <div className="grid md:grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-gold/10 rounded">
                  <span className="font-ui text-gold-dim">Mecanicas:</span>
                  <p className="font-body text-ink">{style.mechanics}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-emerald">Ideal para:</span>
                  <p className="font-body text-ink">{style.ideal}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> Tecnicas de Journaling
        </h2>
        <div className="space-y-3">
          {journalingTechniques.map((tech) => (
            <ParchmentPanel key={tech.technique} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{tech.technique}</h4>
              <p className="font-mono text-ink text-sm bg-gold/10 p-2 rounded mb-2">"{tech.prompt}"</p>
              <p className="font-ui text-xs text-gold-dim">{tech.use}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Lightbulb className="h-6 w-6" /> Usar el DM de IA
        </h2>
        <div className="space-y-4">
          {dmAiTips.map((tip) => (
            <ParchmentPanel key={tip.tip} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{tip.tip}</h3>
              <p className="font-body text-ink text-sm mb-2">{tip.how}</p>
              <div className="p-2 bg-gold/10 rounded">
                <p className="font-mono text-ink text-sm">"{tip.example}"</p>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6" /> Estructura de Sesion
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="space-y-4">
            {sessionStructure.map((phase, i) => (
              <div key={phase.phase} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-shadow font-bold text-sm">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-heading text-ink">{phase.phase}</h4>
                    <span className="font-mono text-xs text-gold bg-gold/10 px-2 py-1 rounded">{phase.time}</span>
                  </div>
                  <p className="font-body text-ink text-sm">{phase.activity}</p>
                </div>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Desafios Comunes
        </h2>
        <div className="space-y-3">
          {commonChallenges.map((item, i) => (
            <ParchmentPanel key={i} className="p-4 border border-gold-dim/50">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-2 bg-blood/10 rounded">
                  <span className="font-ui text-xs text-blood">Desafio</span>
                  <p className="font-body text-ink text-sm">{item.challenge}</p>
                </div>
                <div className="p-2 bg-emerald/10 rounded">
                  <span className="font-ui text-xs text-emerald">Solucion</span>
                  <p className="font-body text-ink text-sm">{item.solution}</p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Heart className="h-6 w-6" /> Beneficios
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="grid md:grid-cols-2 gap-2">
            {benefitsOfSolo.map((benefit, i) => (
              <div key={i} className="p-2 bg-gold/5 rounded flex items-center gap-2">
                <span className="text-gold">✓</span>
                <span className="font-body text-ink text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">Recorda</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>La historia que creas solo para vos es tan valida como cualquier otra.</strong>
            <br /><br />
            No necesitas audiencia. No necesitas aprobacion.
            El rol en solitario es tu espacio para explorar, crear, y escapar.
            Disfruta el viaje.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Seguir Aprendiendo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Explora los diferentes arquetipos de personaje.
          </p>
          <Link href="/guias/arquetipos-guerrero" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Arquetipos: Guerrero
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/personalizar-partida" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Personalizar
          </Link>
          <Link href="/guias/arquetipos-guerrero" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Arquetipos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
