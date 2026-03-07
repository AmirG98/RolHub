import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'

export default function OnboardingPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <OrnateFrame className="max-w-4xl">
        <ParchmentPanel ornate className="text-center">
          <h1 className="font-title text-3xl text-ink mb-4">Onboarding</h1>
          <p className="font-body text-ink mb-2">
            Flujo de 3 pantallas para elegir mundo, modo de juego y personaje.
          </p>
          <p className="font-ui text-ink/60 text-sm">
            Implementación completa en Fase 2
          </p>
        </ParchmentPanel>
      </OrnateFrame>
    </div>
  )
}
