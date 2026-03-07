import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export default function CampaignsPage() {
  return (
    <ParchmentPanel ornate className="max-w-4xl mx-auto">
      <h1 className="font-title text-3xl text-ink mb-4">Campañas</h1>
      <p className="font-body text-ink mb-2">
        Gestiona tus campañas activas, pausadas y completadas.
      </p>
      <p className="font-ui text-ink/60 text-sm">
        Implementación completa en Fase 2
      </p>
    </ParchmentPanel>
  )
}
