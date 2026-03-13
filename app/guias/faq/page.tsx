import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, HelpCircle, Sparkles, Users, Zap, Shield, MessageCircle } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes sobre RolHub | FAQ',
  description: 'Respuestas a las preguntas mas comunes sobre RolHub. Como funciona, que necesito, y como empezar a jugar.',
  keywords: [
    'FAQ RolHub',
    'preguntas frecuentes rol',
    'como funciona RolHub',
    'DM con IA',
    'jugar rol online'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/faq',
  },
  openGraph: {
    title: 'FAQ | RolHub',
    description: 'Todo lo que necesitas saber sobre RolHub.',
    type: 'article',
  },
}

const generalFaqs = [
  {
    q: 'Que es RolHub?',
    a: 'RolHub es una plataforma para jugar juegos de rol narrativo con un DM (Director de Mesa) potenciado por inteligencia artificial. Te permite vivir aventuras epicas sin necesidad de encontrar un grupo o DM humano.',
  },
  {
    q: 'Necesito experiencia previa en juegos de rol?',
    a: 'No. RolHub esta diseñado para gamers que nunca jugaron rol. Tenemos tutoriales, guias, y el DM adapta su estilo a tu nivel de experiencia.',
  },
  {
    q: 'Es gratis?',
    a: 'RolHub tiene un plan gratuito con acceso a funcionalidades basicas. Los planes de pago desbloquean voz, generacion de imagenes, y mas mundos.',
  },
  {
    q: 'Puedo jugar con amigos?',
    a: 'Actualmente RolHub es para jugador individual con el DM IA. El multijugador esta en desarrollo para futuras versiones.',
  },
]

const gameplayFaqs = [
  {
    q: 'Como funciona el DM con IA?',
    a: 'El DM esta potenciado por Claude, un modelo de IA avanzado. Narra la historia, controla NPCs, aplica reglas, y adapta el mundo a tus decisiones. Es como tener un DM humano disponible 24/7.',
  },
  {
    q: 'Que puedo hacer en el juego?',
    a: 'Casi cualquier cosa que se te ocurra. Explorar, combatir, negociar, investigar, crear alianzas... El DM responde a tus acciones y adapta la historia.',
  },
  {
    q: 'Las decisiones realmente importan?',
    a: 'Si. El sistema guarda el "estado del mundo" y tus acciones tienen consecuencias. El NPC que salvaste puede volver a ayudarte. El pueblo que ignoraste puede caer.',
  },
  {
    q: 'Puedo morir?',
    a: 'Si, tu personaje puede morir. Pero la muerte siempre es dramatica y significativa, nunca injusta. Y podes crear un nuevo personaje y continuar.',
  },
  {
    q: 'Cuanto dura una sesion?',
    a: 'Una sesion tipica dura 30-60 minutos. Los one-shots pueden completarse en una sesion. Las campanas se dividen en multiples sesiones.',
  },
]

const technicalFaqs = [
  {
    q: 'Funciona en movil?',
    a: 'Si, RolHub es responsive y funciona en navegadores moviles. Recomendamos tablet o desktop para la mejor experiencia.',
  },
  {
    q: 'Necesito descargar algo?',
    a: 'No. RolHub funciona completamente en el navegador. Solo necesitas una cuenta y conexion a internet.',
  },
  {
    q: 'Mis partidas se guardan?',
    a: 'Si. Todas tus campanas, personajes, y progreso se guardan automaticamente en la nube.',
  },
  {
    q: 'Que navegadores soportan?',
    a: 'Chrome, Firefox, Safari, y Edge en sus versiones recientes. Recomendamos Chrome para la mejor experiencia.',
  },
]

const worldsFaqs = [
  {
    q: 'Que mundos estan disponibles?',
    a: 'Actualmente: Tierra Media (fantasia epica), Apocalipsis Zombie, Mundo Isekai (anime), Saga Vikinga, Star Wars, Cyberpunk, y Horrores Cosmicos (Lovecraft). Constantemente agregamos mas.',
  },
  {
    q: 'Puedo crear mi propio mundo?',
    a: 'La creacion de mundos personalizados esta planificada para versiones futuras. Por ahora podes elegir entre los mundos predefinidos.',
  },
  {
    q: 'Que sistemas de reglas hay?',
    a: 'Story Mode (sin dados, pura narrativa), PbtA (Powered by the Apocalypse), Year Zero, y D&D 5e SRD. Cada uno cambia como se resuelven las acciones.',
  },
]

const supportFaqs = [
  {
    q: 'Como reporto un bug?',
    a: 'Podes reportar bugs en nuestro GitHub o usando el boton de feedback en la aplicacion. Incluí descripcion del problema y pasos para reproducirlo.',
  },
  {
    q: 'Como contacto a soporte?',
    a: 'Para soporte general, usa el formulario de contacto en la pagina principal. Para urgencias, contactá via Discord.',
  },
  {
    q: 'Puedo sugerir funcionalidades?',
    a: 'Absolutamente! Las sugerencias son bienvenidas en nuestro GitHub o Discord. Leemos todo.',
  },
]

const quickLinks = [
  { title: 'Empezar a Jugar', href: '/onboarding', icon: Zap },
  { title: 'Guias para Principiantes', href: '/guias/que-es-rol', icon: HelpCircle },
  { title: 'Mundos Disponibles', href: '/guias', icon: Sparkles },
  { title: 'Comunidad Discord', href: '#', icon: Users },
]

export default function FAQPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-stone px-2 py-1 rounded">Comunidad</span>
          <span className="text-xs font-ui font-semibold text-parchment">5 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-stone"><HelpCircle className="h-8 w-8 text-parchment" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Preguntas Frecuentes
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Todo lo que necesitas saber sobre RolHub en un solo lugar.
          Si tu pregunta no esta aca, contactanos.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> General
        </h2>
        <div className="space-y-3">
          {generalFaqs.map((faq, i) => (
            <ParchmentPanel key={i} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{faq.q}</h3>
              <p className="font-body text-ink text-sm">{faq.a}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6" /> Gameplay
        </h2>
        <div className="space-y-3">
          {gameplayFaqs.map((faq, i) => (
            <ParchmentPanel key={i} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{faq.q}</h3>
              <p className="font-body text-ink text-sm">{faq.a}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6" /> Tecnico
        </h2>
        <div className="space-y-3">
          {technicalFaqs.map((faq, i) => (
            <ParchmentPanel key={i} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{faq.q}</h3>
              <p className="font-body text-ink text-sm">{faq.a}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Mundos y Sistemas
        </h2>
        <div className="space-y-3">
          {worldsFaqs.map((faq, i) => (
            <ParchmentPanel key={i} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{faq.q}</h3>
              <p className="font-body text-ink text-sm">{faq.a}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> Soporte
        </h2>
        <div className="space-y-3">
          {supportFaqs.map((faq, i) => (
            <ParchmentPanel key={i} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{faq.q}</h3>
              <p className="font-body text-ink text-sm">{faq.a}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Links Rapidos
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.title} href={link.href}>
              <ParchmentPanel className="p-5 border border-gold-dim hover:border-gold transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gold-dim">
                    <link.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-heading text-ink">{link.title}</span>
                </div>
              </ParchmentPanel>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">No Encontras lo que Buscas?</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            Si tu pregunta no esta respondida aca, contactanos via Discord
            o usa el formulario de contacto. Respondemos dentro de 24 horas.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Listo para Empezar?
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            Ya tenes todas las respuestas. Ahora a jugar.
          </p>
          <Link href="/onboarding" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Comenzar Aventura
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/seguridad-juego" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Seguridad
          </Link>
          <Link href="/guias" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Ver Todas las Guias
          </Link>
        </div>
      </nav>
    </article>
  )
}
