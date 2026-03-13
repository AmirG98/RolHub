import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Zap, BookOpen, Clock, Target, Users, CheckCircle, XCircle } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'One-shot vs Campana: Cual Elegir | RolHub',
  description: 'Diferencias entre one-shots y campanas en juegos de rol. Cual es mejor para principiantes? Ventajas y desventajas de cada formato.',
  keywords: [
    'one shot vs campana',
    'diferencia one shot campana',
    'que es one shot rol',
    'campanas D&D',
    'formato juego de rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/oneshot-vs-campana',
  },
  openGraph: {
    title: 'One-shot vs Campana: Cual Elegir | RolHub',
    description: 'Entiende las diferencias y elige el formato ideal para vos.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

export default function OneShotVsCampanaPage() {
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
            5 min lectura
          </span>
        </div>
        <h1 className="font-title text-3xl md:text-4xl text-gold-bright mb-4">
          One-shot vs Campana
        </h1>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Antes de empezar, tenes que elegir: una aventura corta que termina en una sesion,
          o una historia larga que se desarrolla con el tiempo. Cual es mejor para vos?
        </p>
      </header>

      {/* Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* One-shot */}
        <ParchmentPanel className="p-6 border-2 border-gold">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gold">
              <Zap className="h-6 w-6 text-shadow" />
            </div>
            <div>
              <h2 className="font-heading text-2xl text-ink">One-shot</h2>
              <p className="font-ui text-ink text-sm">Aventura Unica</p>
            </div>
          </div>

          <p className="font-body text-ink mb-4">
            Una historia autocontenida que empieza y termina en una sola sesion.
            Generalmente dura entre 45 minutos y 2 horas.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-ink text-sm">
              <Clock className="h-4 w-4 text-gold-dim" />
              <span>45 min - 2 horas</span>
            </div>
            <div className="flex items-center gap-2 text-ink text-sm">
              <Target className="h-4 w-4 text-gold-dim" />
              <span>Mision unica con final</span>
            </div>
            <div className="flex items-center gap-2 text-ink text-sm">
              <Users className="h-4 w-4 text-gold-dim" />
              <span>Personaje pre-armado o rapido</span>
            </div>
          </div>

          <h3 className="font-heading text-emerald mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Ventajas
          </h3>
          <ul className="space-y-1 mb-4">
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-emerald font-bold">+</span>
              <span>Perfecto para probar el juego</span>
            </li>
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-emerald font-bold">+</span>
              <span>Sin compromiso de tiempo largo</span>
            </li>
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-emerald font-bold">+</span>
              <span>Satisfaccion inmediata de completar</span>
            </li>
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-emerald font-bold">+</span>
              <span>Podes probar diferentes mundos</span>
            </li>
          </ul>

          <h3 className="font-heading text-blood mb-2 flex items-center gap-2">
            <XCircle className="h-4 w-4" /> Desventajas
          </h3>
          <ul className="space-y-1">
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-blood font-bold">-</span>
              <span>Menos desarrollo de personaje</span>
            </li>
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-blood font-bold">-</span>
              <span>Historia mas superficial</span>
            </li>
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-blood font-bold">-</span>
              <span>Sin consecuencias a largo plazo</span>
            </li>
          </ul>
        </ParchmentPanel>

        {/* Campana */}
        <ParchmentPanel className="p-6 border-2 border-gold">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gold">
              <BookOpen className="h-6 w-6 text-shadow" />
            </div>
            <div>
              <h2 className="font-heading text-2xl text-ink">Campana</h2>
              <p className="font-ui text-ink text-sm">Historia Continua</p>
            </div>
          </div>

          <p className="font-body text-ink mb-4">
            Una historia larga que se desarrolla a lo largo de multiples sesiones.
            Puede durar semanas, meses, o incluso mas.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-ink text-sm">
              <Clock className="h-4 w-4 text-gold-dim" />
              <span>Multiples sesiones</span>
            </div>
            <div className="flex items-center gap-2 text-ink text-sm">
              <Target className="h-4 w-4 text-gold-dim" />
              <span>Arco narrativo completo</span>
            </div>
            <div className="flex items-center gap-2 text-ink text-sm">
              <Users className="h-4 w-4 text-gold-dim" />
              <span>Personaje que crece y evoluciona</span>
            </div>
          </div>

          <h3 className="font-heading text-emerald mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Ventajas
          </h3>
          <ul className="space-y-1 mb-4">
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-emerald font-bold">+</span>
              <span>Historia profunda y envolvente</span>
            </li>
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-emerald font-bold">+</span>
              <span>Tu personaje crece y cambia</span>
            </li>
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-emerald font-bold">+</span>
              <span>Decisiones con consecuencias reales</span>
            </li>
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-emerald font-bold">+</span>
              <span>Relaciones con NPCs desarrolladas</span>
            </li>
          </ul>

          <h3 className="font-heading text-blood mb-2 flex items-center gap-2">
            <XCircle className="h-4 w-4" /> Desventajas
          </h3>
          <ul className="space-y-1">
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-blood font-bold">-</span>
              <span>Requiere compromiso de tiempo</span>
            </li>
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-blood font-bold">-</span>
              <span>Puede quedar inconclusa</span>
            </li>
            <li className="flex items-start gap-2 text-ink text-sm">
              <span className="text-blood font-bold">-</span>
              <span>Inicio mas lento</span>
            </li>
          </ul>
        </ParchmentPanel>
      </div>

      {/* Recommendation */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Cual Elegir?
        </h2>

        <div className="space-y-4">
          <ParchmentPanel className="p-5 border border-gold-dim">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-gold-dim flex-shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-heading text-ink mb-1">Elegi One-shot si...</h3>
                <ul className="font-body text-ink space-y-1">
                  <li>• Es tu primera vez jugando rol</li>
                  <li>• Queres probar el juego sin compromiso</li>
                  <li>• Tenes poco tiempo disponible</li>
                  <li>• Queres experimentar con diferentes mundos</li>
                  <li>• Preferis gratificacion inmediata</li>
                </ul>
              </div>
            </div>
          </ParchmentPanel>

          <ParchmentPanel className="p-5 border border-gold-dim">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-gold-dim flex-shrink-0">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-heading text-ink mb-1">Elegi Campana si...</h3>
                <ul className="font-body text-ink space-y-1">
                  <li>• Ya probaste un one-shot y te gusto</li>
                  <li>• Queres invertir en un personaje a largo plazo</li>
                  <li>• Te gustan las historias con desarrollo</li>
                  <li>• Podes dedicar tiempo regularmente</li>
                  <li>• Queres que tus decisiones importen</li>
                </ul>
              </div>
            </div>
          </ParchmentPanel>
        </div>
      </section>

      {/* For Beginners */}
      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h2 className="font-heading text-xl text-ink mb-4 text-center">
            Nuestra Recomendacion para Principiantes
          </h2>
          <p className="font-body text-ink text-center text-lg leading-relaxed">
            <strong>Empeza con un one-shot.</strong>
            <br /><br />
            Es la forma ideal de probar el juego sin presion. Si te gusta,
            siempre podes empezar una campana despues. Y lo que aprendas
            en el one-shot te va a servir para disfrutar mas la campana.
          </p>
        </ParchmentPanel>
      </section>

      {/* Can I switch */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Puedo Cambiar Despues?
        </h2>

        <div className="font-body text-parchment space-y-4 text-lg leading-relaxed">
          <p>
            <strong className="text-gold-bright">Si, totalmente.</strong> No estas atado a tu eleccion.
          </p>

          <ParchmentPanel className="p-5 border border-gold-dim">
            <ul className="space-y-3 text-ink">
              <li className="flex items-start gap-2">
                <span className="text-gold-bright font-bold">•</span>
                <span>Podes hacer multiples one-shots antes de comprometerte con una campana</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-bright font-bold">•</span>
                <span>Podes abandonar una campana si no te engancha</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-bright font-bold">•</span>
                <span>Podes tener una campana activa y hacer one-shots con otros personajes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-bright font-bold">•</span>
                <span>Tu progreso se guarda — podes pausar y continuar cuando quieras</span>
              </li>
            </ul>
          </ParchmentPanel>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Ya Decidiste?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Cualquier opcion que elijas esta bien. Lo importante es empezar.
          </p>
          <Link
            href="/onboarding"
            className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold"
          >
            Elegir y Empezar
          </Link>
        </ParchmentPanel>
      </section>

      {/* Navigation */}
      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link
            href="/guias"
            className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Todas las Guias
          </Link>
          <Link
            href="/guias/como-jugar"
            className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
          >
            Siguiente: Como Jugar
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
            "headline": "One-shot vs Campana: Cual Elegir",
            "description": "Diferencias entre one-shots y campanas en juegos de rol.",
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
            "dateModified": new Date().toISOString().split('T')[0],
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://rol-hub.com/guias/oneshot-vs-campana"
            }
          })
        }}
      />
    </article>
  )
}
