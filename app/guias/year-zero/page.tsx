import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Skull, Dice1, AlertTriangle, CheckCircle, Heart, Droplets, Thermometer, Brain, Battery, Radiation, RefreshCw, Flame } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Year Zero Engine: Guia del Sistema de Supervivencia | RolHub',
  description: 'Aprende Year Zero Engine, el sistema de dados pool donde empujar tiradas tiene consecuencias. Gestion de recursos, trauma y supervivencia brutal.',
  keywords: [
    'Year Zero Engine',
    'sistema supervivencia rol',
    'pool de dados',
    'empujar tiradas',
    'Mutant Year Zero',
    'Forbidden Lands sistema'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/year-zero',
  },
  openGraph: {
    title: 'Year Zero Engine: Supervivencia Brutal | RolHub',
    description: 'El sistema donde cada tirada puede costarte algo. Empuja tus dados... si te atreves.',
    type: 'article',
    publishedTime: '2024-01-15',
    authors: ['RolHub'],
  },
}

const resources = [
  {
    name: 'Hambre',
    icon: Heart,
    description: 'Tu necesidad de comida. Al maximo, empiezas a debilitarte.',
    maxValue: 6,
  },
  {
    name: 'Sed',
    icon: Droplets,
    description: 'Tu necesidad de agua. Mas urgente que el hambre.',
    maxValue: 6,
  },
  {
    name: 'Frio',
    icon: Thermometer,
    description: 'Exposicion a temperaturas bajas. Mata lento pero seguro.',
    maxValue: 6,
  },
  {
    name: 'Estres',
    icon: Brain,
    description: 'Tu estado mental. Demasiado estres y empiezas a cometer errores.',
    maxValue: 6,
  },
  {
    name: 'Fatiga',
    icon: Battery,
    description: 'Tu agotamiento fisico. Necesitas descansar.',
    maxValue: 6,
  },
  {
    name: 'Radiacion',
    icon: Radiation,
    description: 'Exposicion a zonas contaminadas. Permanente y letal.',
    maxValue: 6,
  },
]

const pushExamples = [
  {
    situation: 'Necesitas abrir una puerta antes de que lleguen los zombies',
    firstRoll: 'Tiras 4 dados. Resultado: 3, 4, 5, 2. Ningun 6. Fallo.',
    decision: 'Decidis EMPUJAR la tirada porque tu vida depende de ello.',
    pushRoll: 'Re-tiras los que no eran 6: nuevo resultado 1, 6, 4, 1.',
    consequence: 'Conseguis un 6 — la puerta cede! Pero sacaste dos 1s. Esos son daño: tu Fatiga sube 2 puntos. Pasaste, pero quedaste agotado.',
  },
  {
    situation: 'Intentas negociar con un comerciante hostil',
    firstRoll: 'Tiras 3 dados. Resultado: 2, 5, 3. Fallo.',
    decision: 'Decidis NO empujar. El riesgo no vale la pena.',
    pushRoll: null,
    consequence: 'El comerciante rechaza tu oferta. No conseguis lo que querias, pero tampoco perdiste nada. Buscaras otro camino.',
  },
]

export default function YearZeroPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/guias/sistemas-reglas"
          className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Sistemas de Reglas
        </Link>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-blood px-2 py-1 rounded">
            Moderado
          </span>
          <span className="text-xs font-ui font-semibold text-parchment">
            12 min lectura
          </span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold">
            <Skull className="h-8 w-8 text-shadow" />
          </div>
          <div>
            <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
              Year Zero Engine
            </h1>
            <p className="font-ui text-parchment text-lg">Supervivencia Brutal — Pool de D6</p>
          </div>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          El sistema donde cada recurso importa y cada tirada puede costarte algo.
          Tiras un pool de dados de seis caras, contas los 6s, y si fallas...
          podes <strong className="text-gold-bright">empujar</strong> la tirada.
          Pero empujar tiene consecuencias.
        </p>
      </header>

      {/* Quick Facts */}
      <ParchmentPanel className="p-6 mb-12 border border-gold-dim">
        <h2 className="font-heading text-lg text-ink mb-4">Datos Rapidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">Pool d6</p>
            <p className="font-ui text-sm text-ink">Tipo de dados</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">6 = Exito</p>
            <p className="font-ui text-sm text-ink">Objetivo</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">6</p>
            <p className="font-ui text-sm text-ink">Recursos a trackear</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl text-ink">1 = Daño</p>
            <p className="font-ui text-sm text-ink">Al empujar</p>
          </div>
        </div>
      </ParchmentPanel>

      {/* The Core Mechanic */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-3">
          <Dice1 className="h-6 w-6" />
          La Mecanica Central
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            En Year Zero, armas un <strong className="text-gold-bright">pool de dados</strong>
            basado en tu atributo + habilidad. Tiras todos esos dados y contas cuantos
            muestran un <strong>6</strong>. Cada 6 es un exito.
          </p>

          <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
            <h3 className="font-heading text-xl text-ink mb-4 text-center">La Formula</h3>
            <p className="font-heading text-2xl text-ink text-center mb-4">
              Atributo + Habilidad = Cantidad de dados
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-lg bg-emerald/20 border border-emerald">
                <p className="font-heading text-emerald text-xl mb-1">Al menos un 6</p>
                <p className="font-ui text-ink text-sm">Exito</p>
              </div>
              <div className="p-4 rounded-lg bg-blood/20 border border-blood">
                <p className="font-heading text-blood text-xl mb-1">Ningun 6</p>
                <p className="font-ui text-ink text-sm">Fallo (pero podes empujar)</p>
              </div>
            </div>
          </ParchmentPanel>

          <p>
            Ejemplo: Si tenes <strong>Fuerza 3</strong> y <strong>Pelear 2</strong>,
            tiras <strong>5 dados</strong>. Si al menos uno muestra 6, tuviste exito.
            Multiples 6s pueden dar efectos adicionales.
          </p>
        </div>
      </section>

      {/* Pushing */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-3">
          <RefreshCw className="h-6 w-6" />
          Empujar Tiradas
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            Aca esta lo que hace unico a Year Zero: si fallas una tirada,
            podes <strong className="text-gold-bright">empujar</strong>.
            Re-tiras todos los dados que no mostraron 6.
          </p>

          <ParchmentPanel className="p-6 border-2 border-blood">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-blood mt-1" />
              <div>
                <h3 className="font-heading text-lg text-blood mb-2">El Costo de Empujar</h3>
                <p className="font-body text-ink">
                  Al empujar, cada <strong>1</strong> que saques en la nueva tirada
                  te hace daño. Segun la situacion, puede ser daño fisico, estres mental,
                  o desgaste de equipo. <em>Empujar siempre cuesta algo.</em>
                </p>
              </div>
            </div>
          </ParchmentPanel>

          <p>
            La decision de empujar es el corazon del sistema. A veces vale la pena arriesgarse.
            A veces es mejor aceptar el fallo y conservar tu salud.
          </p>

          {/* Push Examples */}
          <div className="space-y-6">
            <h3 className="font-heading text-xl text-gold-bright">Ejemplos de Empujar</h3>
            {pushExamples.map((ex, index) => (
              <ParchmentPanel key={index} className="p-6 border border-gold-dim">
                <h4 className="font-heading text-lg text-ink mb-3">
                  Situacion: {ex.situation}
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="font-heading text-gold-dim">1.</span>
                    <p className="font-body text-ink">{ex.firstRoll}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-heading text-gold-dim">2.</span>
                    <p className="font-body text-ink">{ex.decision}</p>
                  </div>
                  {ex.pushRoll && (
                    <div className="flex gap-3">
                      <span className="font-heading text-gold-dim">3.</span>
                      <p className="font-body text-ink">{ex.pushRoll}</p>
                    </div>
                  )}
                  <div className="p-3 bg-shadow/5 rounded-lg border-l-4 border-gold">
                    <p className="font-body text-ink">{ex.consequence}</p>
                  </div>
                </div>
              </ParchmentPanel>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Gestion de Recursos
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            Year Zero simula la supervivencia trackando varios recursos.
            Cada uno tiene un maximo de <strong>6</strong>. Cuando llegas al maximo,
            empezas a sufrir penalizaciones severas.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <ParchmentPanel key={resource.name} className="p-4 border border-gold-dim">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blood/20">
                    <resource.icon className="h-5 w-5 text-blood" />
                  </div>
                  <div>
                    <h3 className="font-heading text-ink">{resource.name}</h3>
                    <p className="font-ui text-xs text-ink">Max: {resource.maxValue}</p>
                  </div>
                </div>
                <p className="font-body text-ink text-base">{resource.description}</p>
              </ParchmentPanel>
            ))}
          </div>

          <ParchmentPanel className="p-5 border border-gold-dim mt-6">
            <div className="flex items-start gap-3">
              <Flame className="h-5 w-5 text-gold-dim mt-1" />
              <div>
                <p className="font-heading text-ink mb-1">La Tension de la Escasez</p>
                <p className="font-body text-ink">
                  Estos recursos no son solo numeros — son decisiones. Usas tu ultima
                  racion ahora o la guardas para mas adelante? Descansas para recuperar
                  Fatiga pero gastas tiempo valioso? La supervivencia es elegir entre males.
                </p>
              </div>
            </div>
          </ParchmentPanel>
        </div>
      </section>

      {/* Combat & Damage */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Combate y Daño
        </h2>

        <div className="font-body text-parchment space-y-6 text-lg leading-relaxed">
          <p>
            El combate en Year Zero es rapido y letal. No hay puntos de vida abstractos —
            el daño se traduce en condiciones reales que afectan tu capacidad.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <ParchmentPanel className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-3">Daño Fisico</h3>
              <p className="font-body text-ink text-base mb-3">
                Cada punto de daño reduce temporalmente un atributo.
                Si un atributo llega a 0, quedas Quebrado (incapacitado).
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-ink text-base">
                  <span className="font-bold">•</span>
                  <span>1-2 daño: herida menor, te duele</span>
                </li>
                <li className="flex items-start gap-2 text-ink text-base">
                  <span className="font-bold">•</span>
                  <span>3-4 daño: herida seria, necesitas atencion</span>
                </li>
                <li className="flex items-start gap-2 text-ink text-base">
                  <span className="font-bold">•</span>
                  <span>5+ daño: critico, riesgo de muerte</span>
                </li>
              </ul>
            </ParchmentPanel>

            <ParchmentPanel className="p-5 border border-gold-dim">
              <h3 className="font-heading text-lg text-ink mb-3">Trauma Mental</h3>
              <p className="font-body text-ink text-base mb-3">
                El horror y el estres acumulado pueden quebrarte mentalmente.
                El Estres funciona igual que el daño fisico.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-ink text-base">
                  <span className="font-bold">•</span>
                  <span>Ver algo horrible: +1 Estres</span>
                </li>
                <li className="flex items-start gap-2 text-ink text-base">
                  <span className="font-bold">•</span>
                  <span>Fallar algo importante: +1 Estres</span>
                </li>
                <li className="flex items-start gap-2 text-ink text-base">
                  <span className="font-bold">•</span>
                  <span>Estres maximo: panico o colapso</span>
                </li>
              </ul>
            </ParchmentPanel>
          </div>

          <p className="mt-4">
            La clave es que <strong>evitar el combate suele ser la mejor opcion</strong>.
            Cada pelea tiene un costo, incluso si ganas.
          </p>
        </div>
      </section>

      {/* Tips */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Consejos para Year Zero
        </h2>

        <div className="space-y-4">
          {[
            {
              title: 'No empujes todo',
              desc: 'Evalua cada situacion. A veces es mejor fallar y conservar tu salud para cuando realmente importa.',
            },
            {
              title: 'Los recursos son tu historia',
              desc: 'Tu Hambre a 4 no es solo un numero — es que llevas dos dias sin comer bien. Rolealo.',
            },
            {
              title: 'Evita peleas innecesarias',
              desc: 'Cada combate te cuesta algo. Negocia, huye, o encuentra otra solucion cuando sea posible.',
            },
            {
              title: 'Coopera con otros',
              desc: 'Compartir recursos y ayudarse mutuamente es clave para sobrevivir. Solos es mucho mas dificil.',
            },
            {
              title: 'Acepta las consecuencias',
              desc: 'Los 1s al empujar no son castigos, son parte de la historia. Tu personaje pago un precio. Eso lo hace mas interesante.',
            },
          ].map((tip) => (
            <ParchmentPanel key={tip.title} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{tip.title}</h4>
              <p className="font-body text-ink text-base">{tip.desc}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      {/* Who is it for */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Para Quien es Year Zero
        </h2>

        <ParchmentPanel className="p-6 border border-gold-dim">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-heading text-emerald mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Ideal Si...
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-emerald font-bold">+</span>
                  <span>Te gustan los juegos de supervivencia</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-emerald font-bold">+</span>
                  <span>Disfrutas la tension y el riesgo</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-emerald font-bold">+</span>
                  <span>Queres que cada decision importa</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-emerald font-bold">+</span>
                  <span>Te atraen los mundos post-apocalipticos</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading text-blood mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Quizas No Si...
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-blood font-bold">-</span>
                  <span>Preferis historias heroicas y optimistas</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-blood font-bold">-</span>
                  <span>Te frustra perder recursos o fallar</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-blood font-bold">-</span>
                  <span>No te gusta trackear muchas cosas</span>
                </li>
                <li className="flex items-start gap-2 text-ink">
                  <span className="text-blood font-bold">-</span>
                  <span>Queres combates epicos sin consecuencias</span>
                </li>
              </ul>
            </div>
          </div>
        </ParchmentPanel>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <ParchmentPanel variant="ornate" className="p-8 text-center border-2 border-gold">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Listo para Sobrevivir?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            El mundo es hostil. Los recursos escasean. Cada tirada puede costarte algo.
            Te atreves a empujar?
          </p>
          <Link
            href="/onboarding"
            className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold"
          >
            Jugar con Year Zero
          </Link>
        </ParchmentPanel>
      </section>

      {/* Navigation */}
      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link
            href="/guias/pbta"
            className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior: PbtA
          </Link>
          <Link
            href="/guias/dnd-5e"
            className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold"
          >
            Siguiente: D&D 5e
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
            "headline": "Year Zero Engine: Guia del Sistema de Supervivencia",
            "description": "Aprende Year Zero Engine, el sistema de dados pool donde empujar tiradas tiene consecuencias.",
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
              "@id": "https://rol-hub.com/guias/year-zero"
            }
          })
        }}
      />
    </article>
  )
}
