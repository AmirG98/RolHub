import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Search, Eye, FileQuestion, Users, Lightbulb, AlertTriangle } from 'lucide-react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export const metadata: Metadata = {
  title: 'Como Jugar Misterio en Rol: Pistas e Investigacion | RolHub',
  description: 'Guia para crear misterios satisfactorios en juegos de rol. Pistas, sospechosos, revelaciones y como evitar que se atasque.',
  keywords: [
    'misterio juegos de rol',
    'investigacion RPG',
    'crear misterio D&D',
    'pistas rol',
    'detective rol'
  ],
  alternates: {
    canonical: 'https://rol-hub.com/guias/genero-misterio',
  },
  openGraph: {
    title: 'Genero Misterio en Rol | RolHub',
    description: 'Crear misterios satisfactorios en tus partidas.',
    type: 'article',
  },
}

const clueTypes = [
  {
    type: 'Pistas Fisicas',
    desc: 'Objetos, huellas, marcas que pueden examinarse.',
    examples: ['Carta quemada', 'Huellas de barro', 'Arma del crimen', 'Simbolo extrano'],
  },
  {
    type: 'Testimonios',
    desc: 'Lo que dicen testigos y sospechosos.',
    examples: ['El mayordomo vio algo', 'Contradicciones en historias', 'Rumores del pueblo'],
  },
  {
    type: 'Registros',
    desc: 'Documentos, libros, historial.',
    examples: ['Diario de la victima', 'Registros financieros', 'Cartas amenazantes'],
  },
  {
    type: 'Conocimiento',
    desc: 'Lo que los personajes ya saben o pueden deducir.',
    examples: ['Reconocer un veneno', 'Saber de rivalidades locales', 'Conocer el terreno'],
  },
]

const threeClueRule = {
  title: 'La Regla de las 3 Pistas',
  desc: 'Para cada conclusion importante, siempre ten al menos 3 pistas diferentes que lleven a ella.',
  why: 'Los jugadores no van a encontrar todas las pistas. Van a malinterpretar algunas. Van a ignorar otras. Tres te da margen de error.',
  example: 'Conclusion: El mayordomo es el asesino. Pista 1: Guante con sangre en su habitacion. Pista 2: Testigo lo vio cerca del lugar. Pista 3: Tenia motivo (lo despidieron).',
}

const revelationTechniques = [
  {
    technique: 'Capa por Capa',
    desc: 'Revela informacion gradualmente. Cada pista lleva a otra.',
    tip: 'El primer misterio resuelto revela uno mas profundo.',
  },
  {
    technique: 'El Giro',
    desc: 'Lo que creian saber es incorrecto. Nueva luz sobre todo.',
    tip: 'El giro debe ser sorprendente pero justo. Las pistas estaban ahi.',
  },
  {
    technique: 'La Confrontacion',
    desc: 'Enfrentar al culpable con la evidencia.',
    tip: 'Deja que los jugadores expongan su teoria. Es su momento.',
  },
  {
    technique: 'El Momento Eureka',
    desc: 'Las piezas encajan de repente. Todo tiene sentido.',
    tip: 'No expliques todo. Deja que los jugadores conecten los puntos.',
  },
]

const commonMistakes = [
  {
    mistake: 'Una sola pista lleva a la solucion',
    fix: 'Usa la Regla de 3. Siempre multiples caminos a la verdad.',
  },
  {
    mistake: 'Tirada fallida = no hay pista',
    fix: 'La tirada determina COMO se obtiene la info, no SI se obtiene.',
  },
  {
    mistake: 'El DM espera una solucion especifica',
    fix: 'Si la teoria de los jugadores es razonable y encaja, dejala ser correcta.',
  },
  {
    mistake: 'Pistas demasiado oscuras',
    fix: 'La pista debe ser clara. La conexion puede ser sutil.',
  },
  {
    mistake: 'El misterio se atasca',
    fix: 'Si estan perdidos, un NPC puede dar un empujon. O la amenaza escala.',
  },
]

const suspectDesign = [
  { element: 'Motivo', desc: 'Por que querria hacerlo? Dinero, venganza, amor, poder.' },
  { element: 'Medios', desc: 'Como pudo haberlo hecho? Acceso, habilidades, recursos.' },
  { element: 'Oportunidad', desc: 'Cuando pudo hacerlo? Coartada o falta de ella.' },
  { element: 'Secreto', desc: 'Que oculta? Puede ser culpa o algo no relacionado.' },
]

const playerTips = [
  'Toma notas. Los detalles importan.',
  'Habla con todos los NPCs. Todos saben algo.',
  'Compara testimonios. Las contradicciones son pistas.',
  'Pregunta "por que?" siempre. El motivo es clave.',
  'No descartes nada hasta tener prueba.',
  'Comparte teorias con el grupo. Dos cabezas piensan mejor.',
]

export default function GeneroMisterioPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link href="/guias" className="inline-flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a Guias
        </Link>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui font-bold text-white bg-gold-dim px-2 py-1 rounded">Genero</span>
          <span className="text-xs font-ui font-semibold text-parchment">12 min lectura</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-lg bg-gold"><Search className="h-8 w-8 text-shadow" /></div>
          <h1 className="font-title text-3xl md:text-4xl text-gold-bright">
            Genero: Misterio
          </h1>
        </div>
        <p className="font-body text-xl text-parchment leading-relaxed">
          Un buen misterio hace que los jugadores se sientan inteligentes cuando
          lo resuelven. La clave no es esconder la solucion sino sembrar las pistas
          para que el descubrimiento sea satisfactorio.
        </p>
      </header>

      <section className="mb-12">
        <ParchmentPanel className="p-6 border-2 border-gold">
          <h2 className="font-heading text-xl text-ink mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-gold-dim" />
            {threeClueRule.title}
          </h2>
          <p className="font-body text-ink mb-3">{threeClueRule.desc}</p>
          <p className="font-ui text-sm text-gold-dim mb-3">{threeClueRule.why}</p>
          <div className="p-3 bg-gold/10 rounded">
            <p className="font-body text-ink text-sm italic">{threeClueRule.example}</p>
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <FileQuestion className="h-6 w-6" /> Tipos de Pistas
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {clueTypes.map((type) => (
            <ParchmentPanel key={type.type} className="p-5 border border-gold-dim">
              <h3 className="font-heading text-ink mb-2">{type.type}</h3>
              <p className="font-body text-ink text-sm mb-2">{type.desc}</p>
              <ul className="font-ui text-xs text-ink">
                {type.examples.map((ex, i) => (
                  <li key={i}>• {ex}</li>
                ))}
              </ul>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Disenar Sospechosos
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <p className="font-body text-ink mb-4">
            Todo buen sospechoso necesita estos elementos:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {suspectDesign.map((s) => (
              <div key={s.element} className="p-3 bg-gold/5 rounded">
                <h4 className="font-heading text-ink text-sm mb-1">{s.element}</h4>
                <p className="font-body text-ink text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <Eye className="h-6 w-6" /> Tecnicas de Revelacion
        </h2>
        <div className="space-y-3">
          {revelationTechniques.map((tech) => (
            <ParchmentPanel key={tech.technique} className="p-4 border border-gold-dim/50">
              <h4 className="font-heading text-ink mb-1">{tech.technique}</h4>
              <p className="font-body text-ink text-sm mb-2">{tech.desc}</p>
              <p className="font-ui text-xs text-gold-dim">Tip: {tech.tip}</p>
            </ParchmentPanel>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl text-gold-bright mb-6 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" /> Errores Comunes
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
        <h2 className="font-heading text-2xl text-gold-bright mb-6">
          Tips para Jugadores
        </h2>
        <ParchmentPanel className="p-6 border border-gold-dim">
          <ul className="font-body text-ink space-y-2">
            {playerTips.map((tip, i) => (
              <li key={i} className="p-2 bg-gold/5 rounded">• {tip}</li>
            ))}
          </ul>
        </ParchmentPanel>
      </section>

      <section className="mb-12">
        <ParchmentPanel variant="ornate" className="p-6 border-2 border-gold">
          <h3 className="font-heading text-xl text-ink mb-4 text-center">La Clave del Misterio</h3>
          <p className="font-body text-ink text-center leading-relaxed">
            <strong>Un buen misterio se siente imposible al principio e inevitable al final.</strong>
            <br /><br />
            Cuando los jugadores resuelven el caso, deben sentir que fueron
            ellos quienes lo lograron, no que el DM les regalo la solucion.
          </p>
        </ParchmentPanel>
      </section>

      <section className="mt-16">
        <ParchmentPanel className="p-8 text-center border border-gold-dim">
          <h2 className="font-heading text-2xl text-ink mb-4">
            Explorar Otros Generos
          </h2>
          <p className="font-body text-ink mb-6 max-w-xl mx-auto text-lg">
            La comedia es el opuesto del misterio... o no?
          </p>
          <Link href="/guias/genero-comedia" className="inline-block font-heading text-lg bg-gold text-shadow px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors font-bold">
            Genero: Comedia
          </Link>
        </ParchmentPanel>
      </section>

      <nav className="border-t border-gold/30 pt-8 mt-12">
        <div className="flex justify-between items-center">
          <Link href="/guias/genero-horror" className="flex items-center gap-2 text-parchment hover:text-gold-bright transition-colors font-ui">
            <ArrowLeft className="h-4 w-4" /> Anterior: Horror
          </Link>
          <Link href="/guias/genero-comedia" className="flex items-center gap-2 text-gold-bright hover:text-gold transition-colors font-ui font-semibold">
            Siguiente: Comedia <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </article>
  )
}
