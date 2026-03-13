import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Sword, Skull, Wand2, Shield, Star, Users, Clock, Sparkles } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Los Mejores Mundos de Fantasia para Empezar a Jugar Rol',
  description: 'Comparativa de los mejores mundos para tu primera partida de rol. Desde fantasia epica hasta apocalipsis zombie. Encuentra el escenario ideal segun tu estilo.',
  keywords: ['mundos de rol', 'escenarios RPG', 'ambientaciones juego de rol', 'fantasia medieval', 'apocalipsis zombie rol', 'isekai'],
  alternates: {
    canonical: 'https://rol-hub.com/guias/mejores-mundos',
  },
  openGraph: {
    title: 'Los Mejores Mundos de Fantasia para Jugar Rol',
    description: 'Comparativa de mundos para tu primera partida de rol.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const worlds = [
  {
    id: 'lotr',
    name: 'Fantasia Epica',
    subtitle: 'Estilo Tierra Media',
    icon: Sword,
    tone: 'Heroico, esperanzador, epico',
    description: 'El genero clasico por excelencia. Reinos medievales, elfos y enanos, magia antigua, y una lucha eterna entre el bien y el mal. Si te gustan El Senor de los Anillos, Juego de Tronos o The Witcher, este es tu mundo.',
    pros: [
      'El mas facil de entender - todos conocemos las reglas del genero',
      'Arquetipos clasicos: guerreros, magos, picaros',
      'Historias epicas de heroismo y sacrificio',
      'Amplio rango de tonos: desde aventura ligera hasta drama oscuro',
    ],
    cons: [
      'Puede sentirse "generico" si buscas algo novedoso',
      'Muchas expectativas previas del genero',
    ],
    idealFor: 'Principiantes absolutos y fans de la fantasia clasica.',
    rating: 5,
    difficulty: 'Muy facil',
    sessionLength: '45-90 min',
  },
  {
    id: 'zombies',
    name: 'Apocalipsis Zombie',
    subtitle: 'Supervivencia y Horror',
    icon: Skull,
    tone: 'Tenso, desesperado, humano',
    description: 'El mundo como lo conocemos ha terminado. Los muertos caminan, los recursos escasean, y la mayor amenaza a veces son otros supervivientes. Drama humano en circunstancias extremas.',
    pros: [
      'Facil de imaginar - el genero es muy popular',
      'Drama intenso y decisiones dificiles',
      'No requiere conocimiento de magia o fantasia',
      'Relaciones humanas en primer plano',
    ],
    cons: [
      'Puede ser emocionalmente pesado',
      'Tono oscuro no apto para todos',
    ],
    idealFor: 'Fans de The Walking Dead, The Last of Us. Quienes buscan drama y tension.',
    rating: 4,
    difficulty: 'Facil',
    sessionLength: '60-90 min',
  },
  {
    id: 'isekai',
    name: 'Isekai Anime',
    subtitle: 'Poderes y Aventura',
    icon: Wand2,
    tone: 'Divertido, fantasioso, empoderador',
    description: 'Despiertas en un mundo de fantasia con poderes especiales. Como en los animes donde el protagonista es transportado a otro mundo. Menos serio, mas divertido, y con la posibilidad de ser increiblemente poderoso.',
    pros: [
      'Libertad para ser ridiculamente poderoso',
      'Tono ligero y entretenido',
      'Mezcla fantasia con humor y accion',
      'Menos presion por "hacer las cosas bien"',
    ],
    cons: [
      'Requiere familiaridad con tropos de anime',
      'Puede ser demasiado "over the top" para algunos',
    ],
    idealFor: 'Fans de anime como Sword Art Online, Re:Zero, Konosuba. Quienes quieren divertirse sin tomarselo muy en serio.',
    rating: 4,
    difficulty: 'Facil',
    sessionLength: '45-60 min',
  },
  {
    id: 'vikingos',
    name: 'Vikingos y Mitologia Nordica',
    subtitle: 'Honor y Destino',
    icon: Shield,
    tone: 'Brutal, mitico, fatalista',
    description: 'La era vikinga con su rica mitologia. Dioses caprichosos, el Ragnarok acechando, y guerreros que buscan morir con honor para llegar al Valhalla. Combate visceral y destinos tragicos.',
    pros: [
      'Ambientacion unica y rica',
      'Mitologia fascinante con dioses activos',
      'Combate brutal y significativo',
      'Exploracion, saqueo y gloria',
    ],
    cons: [
      'Requiere algo de conocimiento de la cultura vikinga',
      'Tono puede ser muy serio y fatalista',
    ],
    idealFor: 'Fans de Vikings, God of War, Assassins Creed Valhalla. Quienes quieren batallas epicas y destinos tragicos.',
    rating: 4,
    difficulty: 'Moderada',
    sessionLength: '60-90 min',
  },
]

export default function MejoresMundosPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/guias"
          className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Guias
        </Link>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-emerald px-2 py-1 rounded">
            Principiante
          </span>
          <span className="text-xs font-ui font-semibold text-parchment">
            7 min lectura
          </span>
        </div>
        <h1 className="font-title text-3xl md:text-4xl text-gold-bright mb-4">
          Los Mejores Mundos para Empezar
        </h1>
        <p className="font-body text-xl text-parchment leading-relaxed">
          En RolHub ofrecemos cuatro mundos distintos. Cada uno tiene su propia atmosfera,
          reglas y tipo de historias. Aqui te ayudamos a elegir el ideal para ti.
        </p>
      </header>

      {/* Quick Comparison */}
      <ParchmentPanel className="p-6 mb-12 overflow-x-auto border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-4">Comparacion Rapida</h2>
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-gold-dim">
              <th className="text-left py-2 font-heading text-ink font-bold">Mundo</th>
              <th className="text-left py-2 font-heading text-ink font-bold">Tono</th>
              <th className="text-left py-2 font-heading text-ink font-bold">Dificultad</th>
              <th className="text-left py-2 font-heading text-ink font-bold">Sesion</th>
            </tr>
          </thead>
          <tbody className="font-body text-ink">
            {worlds.map((world) => (
              <tr key={world.id} className="border-b border-gold-dim/40">
                <td className="py-3 flex items-center gap-2 font-semibold text-ink">
                  <world.icon className="h-4 w-4 text-gold-dim" />
                  {world.name}
                </td>
                <td className="py-3">{world.tone.split(',')[0]}</td>
                <td className="py-3">{world.difficulty}</td>
                <td className="py-3">{world.sessionLength}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ParchmentPanel>

      {/* Worlds */}
      <div className="space-y-16">
        {worlds.map((world, index) => (
          <section key={world.id} id={world.id}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-lg bg-gold">
                <world.icon className="h-8 w-8 text-shadow" />
              </div>
              <div>
                <h2 className="font-heading text-2xl text-gold-bright">{world.name}</h2>
                <p className="font-ui text-parchment">{world.subtitle}</p>
              </div>
            </div>

            <div className="font-body text-parchment space-y-4 text-lg leading-relaxed">
              <p>{world.description}</p>

              <div className="flex flex-wrap gap-4 my-6">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-gold-bright" />
                  <span className="font-ui text-parchment font-semibold">Tono: {world.tone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gold-bright" />
                  <span className="font-ui text-parchment font-semibold">Sesion: {world.sessionLength}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gold-bright" />
                  <span className="font-ui text-parchment font-semibold">{world.difficulty}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <ParchmentPanel className="p-4 border border-emerald">
                  <h4 className="font-heading text-emerald mb-3 flex items-center gap-2 font-bold">
                    <Star className="h-4 w-4" /> Puntos Fuertes
                  </h4>
                  <ul className="space-y-2">
                    {world.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink">
                        <span className="text-emerald mt-1 font-bold">+</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </ParchmentPanel>

                <ParchmentPanel className="p-4 border border-blood">
                  <h4 className="font-heading text-blood mb-3 font-bold">Consideraciones</h4>
                  <ul className="space-y-2">
                    {world.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink">
                        <span className="text-blood mt-1 font-bold">-</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </ParchmentPanel>
              </div>

              <ParchmentPanel variant="ornate" className="p-5 mt-6 border-2 border-gold">
                <p className="font-body text-ink">
                  <strong className="text-ink">Ideal para:</strong> {world.idealFor}
                </p>
              </ParchmentPanel>
            </div>

            {index < worlds.length - 1 && (
              <hr className="border-gold/30 mt-12" />
            )}
          </section>
        ))}
      </div>

      {/* Recommendation */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Nuestra Recomendacion para Principiantes
        </h2>

        <div className="font-body text-parchment space-y-4 text-lg leading-relaxed">
          <p>
            Si nunca jugaste rol antes, te recomendamos empezar con
            <strong className="text-gold-bright"> Fantasia Epica</strong>.
          </p>

          <p>
            Es el genero mas intuitivo. Ya conoces las reglas del mundo por peliculas,
            series y videojuegos. No necesitas aprender nada nuevo para sumergirte
            en la historia.
          </p>

          <p>
            Una vez que tengas una o dos sesiones bajo el cinturon, experimenta
            con los otros mundos. Cada uno ofrece una experiencia diferente y
            podrias descubrir que te gusta mas de lo esperado.
          </p>

          <ParchmentPanel className="p-6 my-8 border border-gold-dim">
            <h3 className="font-heading text-lg text-ink mb-3">
              El Secreto para Disfrutar Cualquier Mundo
            </h3>
            <p className="font-body text-ink">
              No importa cual elijas: comprometete con la fantasia. Mete tu personaje
              en problemas, toma decisiones arriesgadas, y deja que la historia
              te sorprenda. El mundo que elijas sera increible si le das la oportunidad.
            </p>
          </ParchmentPanel>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <ParchmentPanel variant="ornate" className="p-8 text-center border-2 border-gold">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Elige tu Mundo
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Ya conoces las opciones. Ahora es momento de elegir donde comenzara
            tu leyenda. Cual sera tu primer mundo?
          </p>
          <Link
            href="/onboarding"
            className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold"
          >
            Empezar mi Aventura
          </Link>
        </ParchmentPanel>
      </section>

      {/* Navigation */}
      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link
            href="/guias/crear-personaje"
            className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior: Como Crear tu Personaje
          </Link>
          <Link
            href="/guias"
            className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
          >
            Ver Todas las Guias
          </Link>
        </div>
      </nav>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Los Mejores Mundos de Fantasia para Empezar a Jugar Rol",
            "description": "Comparativa de los mejores mundos para tu primera partida de rol.",
            "author": {
              "@type": "Organization",
              "name": "RolHub"
            },
            "publisher": {
              "@type": "Organization",
              "name": "RolHub",
              "url": "https://rol-hub.com"
            },
            "datePublished": "2024-01-15",
            "dateModified": "2024-01-15",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://rol-hub.com/guias/mejores-mundos"
            },
            "about": worlds.map(w => ({
              "@type": "Thing",
              "name": w.name,
              "description": w.description
            }))
          })
        }}
      />
    </article>
  )
}
