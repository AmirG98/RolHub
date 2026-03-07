import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export default function CompendiumPage() {
  return (
    <ParchmentPanel ornate className="max-w-4xl mx-auto">
      <h1 className="font-title text-3xl text-ink mb-4">Compendio</h1>
      <p className="font-body text-ink mb-2">
        Explora monstruos, items, hechizos y locaciones de tus mundos favoritos.
      </p>
      <p className="font-ui text-ink/60 text-sm">
        Implementación completa en Fase 4
      </p>
    </ParchmentPanel>
  )
}
