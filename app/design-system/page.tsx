import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { RunicButton } from '@/components/medieval/RunicButton'
import { DiceRoller } from '@/components/medieval/DiceRoller'

export default function DesignSystemPage() {
  return (
    <div className="space-y-12">
      <h1 className="font-title text-4xl text-gold text-center mb-8">
        Sistema de Diseño Medieval
      </h1>

      {/* Typography */}
      <section>
        <h2 className="font-heading text-2xl text-gold mb-4">Tipografía</h2>
        <ParchmentPanel ornate>
          <div className="space-y-4">
            <p className="font-title text-3xl text-ink">Cinzel Decorative - Títulos</p>
            <p className="font-heading text-2xl text-ink">Cinzel - Headings</p>
            <p className="font-body text-lg text-ink">EB Garamond - Body text para narraciones largas y contenido principal</p>
            <p className="font-ui text-base text-ink">Crimson Text - UI elements y controles de interfaz</p>
            <p className="font-mono text-sm text-ink">Courier Prime - Monospace para código y datos</p>
          </div>
        </ParchmentPanel>
      </section>

      {/* Colors */}
      <section>
        <h2 className="font-heading text-2xl text-gold mb-4">Paleta de Colores</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="h-20 bg-parchment rounded border border-gold-dim" />
            <p className="text-center text-sm font-ui">Parchment</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-gold rounded border border-gold-dim" />
            <p className="text-center text-sm font-ui">Gold</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-blood rounded border border-gold-dim" />
            <p className="text-center text-sm font-ui">Blood</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-shadow rounded border border-gold-dim" />
            <p className="text-center text-sm font-ui">Shadow</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-emerald rounded border border-gold-dim" />
            <p className="text-center text-sm font-ui">Emerald</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-ink rounded border border-gold-dim" />
            <p className="text-center text-sm font-ui">Ink</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-shadow-mid rounded border border-gold-dim" />
            <p className="text-center text-sm font-ui">Shadow Mid</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-gold-bright rounded border border-gold-dim" />
            <p className="text-center text-sm font-ui">Gold Bright</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-gold-dim rounded border border-gold-dim" />
            <p className="text-center text-sm font-ui">Gold Dim</p>
          </div>
        </div>
      </section>

      {/* ParchmentPanel */}
      <section>
        <h2 className="font-heading text-2xl text-gold mb-4">ParchmentPanel</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm mb-2 font-ui">Default</p>
            <ParchmentPanel>
              <p className="text-ink font-body">Panel básico con textura de pergamino. Perfecto para contenido general y bloques de información.</p>
            </ParchmentPanel>
          </div>
          <div>
            <p className="text-sm mb-2 font-ui">Ornate (con borde decorado)</p>
            <ParchmentPanel ornate>
              <p className="text-ink font-body">Panel con borde ornamentado dorado. Ideal para destacar secciones importantes o contenido premium.</p>
            </ParchmentPanel>
          </div>
        </div>
      </section>

      {/* OrnateFrame */}
      <section>
        <h2 className="font-heading text-2xl text-gold mb-4">OrnateFrame</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm mb-2 font-ui">Variant: Gold</p>
            <OrnateFrame variant="gold" className="min-h-32">
              <p className="text-parchment font-body">Marco dorado con ornamentos SVG en las esquinas. Perfecto para envolver contenido destacado.</p>
            </OrnateFrame>
          </div>
          <div>
            <p className="text-sm mb-2 font-ui">Variant: Shadow</p>
            <OrnateFrame variant="shadow" className="min-h-32">
              <p className="text-parchment font-body">Marco oscuro con ornamentos SVG. Ideal para contenido secundario o elementos de UI sobre fondos claros.</p>
            </OrnateFrame>
          </div>
        </div>
      </section>

      {/* RunicButton */}
      <section>
        <h2 className="font-heading text-2xl text-gold mb-4">RunicButton</h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm mb-2 font-ui">Variants</p>
            <div className="flex gap-4 flex-wrap">
              <RunicButton variant="primary">Primary</RunicButton>
              <RunicButton variant="secondary">Secondary</RunicButton>
              <RunicButton variant="danger">Danger</RunicButton>
            </div>
          </div>
          <div>
            <p className="text-sm mb-2 font-ui">States</p>
            <div className="flex gap-4 flex-wrap">
              <RunicButton disabled>Disabled</RunicButton>
              <RunicButton variant="primary" className="text-sm px-4 py-2">Small</RunicButton>
              <RunicButton variant="primary" className="text-lg px-8 py-4">Large</RunicButton>
            </div>
          </div>
        </div>
      </section>

      {/* Animaciones */}
      <section>
        <h2 className="font-heading text-2xl text-gold mb-4">Animaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ParchmentPanel ornate>
            <p className="text-ink font-body animate-flicker">
              Efecto Candlelight (flicker) - Simula el parpadeo de una vela medieval
            </p>
          </ParchmentPanel>
          <ParchmentPanel ornate>
            <p className="text-ink font-body animate-ink-reveal">
              Efecto Ink Reveal - Aparición suave como tinta en pergamino
            </p>
          </ParchmentPanel>
        </div>
      </section>

      {/* Combinaciones */}
      <section>
        <h2 className="font-heading text-2xl text-gold mb-4">Combinaciones</h2>
        <OrnateFrame variant="gold" className="max-w-2xl mx-auto">
          <ParchmentPanel ornate>
            <h3 className="font-title text-2xl text-ink mb-4">Ejemplo Completo</h3>
            <p className="font-body text-ink mb-4">
              Este es un ejemplo de cómo se combinan todos los componentes: un OrnateFrame dorado envuelve un ParchmentPanel ornamentado con tipografía medieval.
            </p>
            <div className="flex gap-4 justify-center">
              <RunicButton variant="secondary">Cancelar</RunicButton>
              <RunicButton variant="primary">Continuar</RunicButton>
            </div>
          </ParchmentPanel>
        </OrnateFrame>
      </section>

      {/* Shadows & Effects */}
      <section>
        <h2 className="font-heading text-2xl text-gold mb-4">Sombras y Efectos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-shadow-mid rounded shadow-ornate">
            <p className="font-ui text-parchment">Shadow Ornate - Sombra con borde múltiple</p>
          </div>
          <div className="p-6 bg-shadow-mid rounded shadow-glow">
            <p className="font-ui text-parchment">Shadow Glow - Resplandor dorado</p>
          </div>
        </div>
      </section>

      {/* Dice Roller */}
      <section>
        <h2 className="font-heading text-2xl text-gold mb-4">Sistema de Dados</h2>
        <div className="max-w-2xl mx-auto">
          <DiceRoller />
        </div>
      </section>

      <div className="text-center py-8">
        <p className="font-ui text-parchment/60 text-sm">
          Sistema de Diseño Medieval - Fase 2
        </p>
      </div>
    </div>
  );
}
