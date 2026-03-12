import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Users, Sparkles, BookOpen, Dice6, MessageCircle, Heart } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Que es el Juego de Rol | Guia Completa para Principiantes',
  description: 'Descubre que son los juegos de rol, como funcionan y por que millones de personas los disfrutan. Guia definitiva para principiantes que quieren empezar a jugar.',
  keywords: ['que es juego de rol', 'RPG significado', 'como funciona el rol', 'juegos de mesa narrativos', 'dungeons and dragons explicado'],
  alternates: {
    canonical: 'https://rolhub.com/guias/que-es-rol',
  },
  openGraph: {
    title: 'Que es el Juego de Rol | RolHub',
    description: 'Descubre que son los juegos de rol y por que millones de personas los disfrutan.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const sections = [
  {
    id: 'definicion',
    title: 'La Definicion Mas Simple',
    icon: BookOpen,
  },
  {
    id: 'como-funciona',
    title: 'Como Funciona una Partida',
    icon: Dice6,
  },
  {
    id: 'elementos',
    title: 'Los Elementos Clave',
    icon: Users,
  },
  {
    id: 'por-que',
    title: 'Por Que Jugar Rol',
    icon: Heart,
  },
  {
    id: 'mitos',
    title: 'Mitos y Realidades',
    icon: MessageCircle,
  },
  {
    id: 'empezar',
    title: 'Como Empezar',
    icon: Sparkles,
  },
]

export default function QueEsRolPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/guias"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-bright transition-colors font-ui"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Guias
        </Link>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui text-emerald bg-emerald/20 px-2 py-0.5 rounded">
            Principiante
          </span>
          <span className="text-xs font-ui text-parchment/50">
            8 min lectura
          </span>
        </div>
        <h1 className="font-title text-3xl md:text-4xl text-gold mb-4">
          Que es el Juego de Rol
        </h1>
        <p className="font-body text-xl text-parchment/80 leading-relaxed">
          Imagina poder vivir una aventura donde TU decides que hacer. Donde no hay un guion
          fijo y cada decision cambia el rumbo de la historia. Eso es el juego de rol.
        </p>
      </header>

      {/* Table of Contents */}
      <ParchmentPanel className="p-6 mb-12">
        <h2 className="font-heading text-lg text-gold mb-4">En esta guia</h2>
        <nav>
          <ul className="grid md:grid-cols-2 gap-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex items-center gap-2 text-parchment/80 hover:text-gold transition-colors font-ui text-sm"
                >
                  <section.icon className="h-4 w-4 text-gold/60" />
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </ParchmentPanel>

      {/* Content */}
      <div className="prose prose-invert prose-gold max-w-none">

        {/* Section 1 */}
        <section id="definicion" className="mb-16">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <BookOpen className="h-6 w-6" />
            La Definicion Mas Simple
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              Un <strong className="text-gold">juego de rol</strong> (o RPG, por sus siglas en ingles)
              es una actividad donde los participantes crean y controlan personajes ficticios
              en una historia colaborativa.
            </p>

            <p>
              Piensalo como una mezcla entre <em>teatro improvisado</em>, <em>narracion de cuentos</em>
              y <em>juegos de mesa</em>. No hay ganadores ni perdedores en el sentido tradicional.
              El objetivo es vivir una aventura juntos.
            </p>

            <ParchmentPanel variant="ornate" className="p-6 my-8">
              <p className="font-body text-parchment/90 italic text-center">
                &ldquo;En el rol, tu imaginacion es el limite.
                Puedes ser un guerrero que salva reinos, un detective que resuelve misterios,
                o un superviviente en un apocalipsis zombie.&rdquo;
              </p>
            </ParchmentPanel>

            <p>
              La diferencia con un videojuego es que no hay limitaciones tecnicas.
              Si quieres intentar algo creativo o inesperado, puedes hacerlo.
              La historia se adapta a tus decisiones en tiempo real.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="como-funciona" className="mb-16">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <Dice6 className="h-6 w-6" />
            Como Funciona una Partida
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              Una partida tipica tiene dos roles principales:
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <ParchmentPanel className="p-6">
                <h3 className="font-heading text-lg text-gold mb-3">El Director de Juego (DM)</h3>
                <p className="font-body text-parchment/80 text-base">
                  Es quien narra la historia, controla a los personajes secundarios (NPCs)
                  y describe el mundo. En RolHub, este rol lo cumple nuestra IA.
                </p>
              </ParchmentPanel>

              <ParchmentPanel className="p-6">
                <h3 className="font-heading text-lg text-gold mb-3">Los Jugadores</h3>
                <p className="font-body text-parchment/80 text-base">
                  Cada jugador controla un personaje protagonista.
                  Toman decisiones, interactuan con el mundo y viven la aventura.
                </p>
              </ParchmentPanel>
            </div>

            <h3 className="font-heading text-xl text-parchment mb-4">El flujo basico:</h3>

            <ol className="space-y-4 list-none pl-0">
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl">1.</span>
                <div>
                  <strong className="text-parchment">El DM describe la escena:</strong>
                  <p className="text-parchment/70 mt-1">
                    &ldquo;Estan frente a una taberna en ruinas. La puerta chirria con el viento.
                    Escuchan voces adentro.&rdquo;
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl">2.</span>
                <div>
                  <strong className="text-parchment">El jugador decide que hacer:</strong>
                  <p className="text-parchment/70 mt-1">
                    &ldquo;Quiero acercarme sigilosamente a la ventana para espiar.&rdquo;
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl">3.</span>
                <div>
                  <strong className="text-parchment">Se resuelve la accion:</strong>
                  <p className="text-parchment/70 mt-1">
                    A veces se usan dados para determinar si tienes exito.
                    Otras veces, el DM simplemente narra el resultado.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-heading text-gold text-xl">4.</span>
                <div>
                  <strong className="text-parchment">La historia continua:</strong>
                  <p className="text-parchment/70 mt-1">
                    El DM describe que pasa como consecuencia de tu accion,
                    y el ciclo se repite.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Section 3 */}
        <section id="elementos" className="mb-16">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <Users className="h-6 w-6" />
            Los Elementos Clave
          </h2>

          <div className="font-body text-parchment/90 space-y-6 text-lg leading-relaxed">

            <div>
              <h3 className="font-heading text-xl text-parchment mb-3">Tu Personaje</h3>
              <p>
                Creas un personaje con nombre, historia personal, habilidades y personalidad.
                Este personaje es tu avatar en el mundo de ficcion.
                Puedes ser quien quieras: un mago misterioso, un guerrero honorable,
                un picaro encantador...
              </p>
            </div>

            <div>
              <h3 className="font-heading text-xl text-parchment mb-3">El Mundo</h3>
              <p>
                La historia ocurre en un universo con sus propias reglas.
                Puede ser fantasia medieval, ciencia ficcion, horror moderno,
                o cualquier otro escenario que imagines. En RolHub ofrecemos varios
                mundos pre-construidos para que elijas.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-xl text-parchment mb-3">Las Reglas (Opcionales)</h3>
              <p>
                Algunos juegos usan dados y estadisticas para agregar tension e incertidumbre.
                Otros prefieren un enfoque mas narrativo sin mecanicas.
                Ambos estilos son validos y divertidos.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-xl text-parchment mb-3">La Improvisacion</h3>
              <p>
                No hay guion. La historia se construye en el momento,
                basada en las decisiones de los jugadores y las respuestas del DM.
                Cada partida es unica e irrepetible.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="por-que" className="mb-16">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <Heart className="h-6 w-6" />
            Por Que Jugar Rol
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              Millones de personas en todo el mundo disfrutan del juego de rol.
              Estas son algunas razones:
            </p>

            <div className="grid gap-4 my-8">
              {[
                {
                  title: 'Creatividad sin limites',
                  desc: 'Puedes intentar cualquier cosa que imagines. No hay botones predefinidos ni opciones limitadas.',
                },
                {
                  title: 'Historias memorables',
                  desc: 'Vivieras aventuras que recordaras por anos. Momentos epicos, giros inesperados, victorias agridulces.',
                },
                {
                  title: 'Conexion social',
                  desc: 'Es una actividad que se disfruta mejor con amigos. Construir historias juntos crea vinculos unicos.',
                },
                {
                  title: 'Escapismo positivo',
                  desc: 'Por unas horas, puedes ser alguien mas en un mundo diferente. Una pausa del estres cotidiano.',
                },
                {
                  title: 'Desarrollo personal',
                  desc: 'Mejora la empatia (al ponerte en la piel de otros), la improvisacion y la resolucion de problemas.',
                },
              ].map((item) => (
                <ParchmentPanel key={item.title} className="p-4">
                  <h4 className="font-heading text-gold mb-1">{item.title}</h4>
                  <p className="font-body text-parchment/70 text-base">{item.desc}</p>
                </ParchmentPanel>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="mitos" className="mb-16">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <MessageCircle className="h-6 w-6" />
            Mitos y Realidades
          </h2>

          <div className="font-body text-parchment/90 space-y-6 text-lg leading-relaxed">

            <div className="border-l-2 border-blood pl-4">
              <p className="text-blood font-heading">&ldquo;Es solo para nerds&rdquo;</p>
              <p className="text-parchment/70 mt-2">
                Falso. Hoy juegan rol personas de todas las edades y backgrounds.
                Actores como Vin Diesel y Joe Manganiello son fans declarados de D&D.
                El estigma del pasado ya no existe.
              </p>
            </div>

            <div className="border-l-2 border-blood pl-4">
              <p className="text-blood font-heading">&ldquo;Necesitas muchas horas&rdquo;</p>
              <p className="text-parchment/70 mt-2">
                No necesariamente. Existen formatos cortos (one-shots) de 1-2 horas.
                En RolHub puedes jugar sesiones de 45 minutos cuando tengas tiempo.
              </p>
            </div>

            <div className="border-l-2 border-blood pl-4">
              <p className="text-blood font-heading">&ldquo;Es complicado aprender&rdquo;</p>
              <p className="text-parchment/70 mt-2">
                Depende del sistema. Algunos tienen reglas extensas,
                pero otros (como Story Mode en RolHub) no requieren aprender nada.
                Solo describes lo que quieres hacer.
              </p>
            </div>

            <div className="border-l-2 border-blood pl-4">
              <p className="text-blood font-heading">&ldquo;Necesitas un grupo de amigos&rdquo;</p>
              <p className="text-parchment/70 mt-2">
                Tradicionalmente si, pero ahora existen opciones para jugar solo
                con un DM con IA (como RolHub) o encontrar grupos online.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="empezar" className="mb-16">
          <h2 className="font-heading text-2xl text-gold mb-6 flex items-center gap-3">
            <Sparkles className="h-6 w-6" />
            Como Empezar
          </h2>

          <div className="font-body text-parchment/90 space-y-4 text-lg leading-relaxed">
            <p>
              La mejor forma de entender el rol es jugando.
              No necesitas leer manuales ni preparar nada.
            </p>

            <p>
              En RolHub, nuestra IA actua como Director de Juego.
              Tu solo eliges un mundo, creas tu personaje en 2 minutos,
              y la aventura comienza. El sistema te guia si es tu primera vez.
            </p>

            <ParchmentPanel variant="ornate" className="p-8 my-8 text-center">
              <h3 className="font-heading text-xl text-gold mb-4">
                Listo para tu primera aventura?
              </h3>
              <p className="font-body text-parchment/80 mb-6">
                No necesitas experiencia previa. En 3 clics estaras jugando.
              </p>
              <Link
                href="/onboarding"
                className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors"
              >
                Empezar a Jugar Gratis
              </Link>
            </ParchmentPanel>
          </div>
        </section>

      </div>

      {/* Navigation */}
      <nav className="border-t border-gold/20 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link
            href="/guias"
            className="flex items-center gap-2 text-parchment/60 hover:text-gold transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Todas las guias
          </Link>
          <Link
            href="/guias/como-jugar"
            className="flex items-center gap-2 text-gold hover:text-gold-bright transition-colors font-ui"
          >
            Siguiente: Como Jugar en RolHub
            <ArrowRight className="h-4 w-4" />
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
            "headline": "Que es el Juego de Rol: Guia Completa para Principiantes",
            "description": "Descubre que son los juegos de rol, como funcionan y por que millones de personas los disfrutan.",
            "author": {
              "@type": "Organization",
              "name": "RolHub"
            },
            "publisher": {
              "@type": "Organization",
              "name": "RolHub",
              "url": "https://rolhub.com"
            },
            "datePublished": "2024-01-15",
            "dateModified": "2024-01-15",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://rolhub.com/guias/que-es-rol"
            },
            "articleSection": "Guias",
            "keywords": ["juego de rol", "RPG", "que es rol", "como jugar rol", "principiantes"]
          })
        }}
      />
    </article>
  )
}
