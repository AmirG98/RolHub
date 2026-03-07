import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export default function DashboardPage() {
  return (
    <ParchmentPanel variant="ornate" className="max-w-4xl mx-auto">
      <h1 className="font-title text-3xl text-ink mb-4">Dashboard</h1>
      <p className="font-body text-ink mb-2">
        Bienvenido a tu hub personal de aventuras.
      </p>
      <p className="font-ui text-ink/60 text-sm">
        Implementación completa en Fase 2
      </p>
    </ParchmentPanel>
  )
}
