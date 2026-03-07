import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export default function CharactersPage() {
  return (
    <ParchmentPanel ornate className="max-w-4xl mx-auto">
      <h1 className="font-title text-3xl text-ink mb-4">Personajes</h1>
      <p className="font-body text-ink mb-2">
        Crea y gestiona tus personajes para diferentes campañas.
      </p>
      <p className="font-ui text-ink/60 text-sm">
        Implementación completa en Fase 2
      </p>
    </ParchmentPanel>
  )
}
