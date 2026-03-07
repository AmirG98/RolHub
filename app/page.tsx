import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { RunicButton } from '@/components/medieval/RunicButton'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <OrnateFrame className="max-w-2xl">
        <ParchmentPanel ornate className="text-center">
          <h1 className="font-title text-5xl text-ink mb-6">
            Bienvenido al Hub
          </h1>
          <p className="font-body text-lg text-ink/80 mb-8">
            Embárcate en aventuras épicas guiadas por un Dungeon Master autónomo.
            Elige tu mundo, crea tu héroe, y deja que la historia se escriba.
          </p>
          <Link href="/onboarding">
            <RunicButton variant="primary" className="text-lg px-8 py-4">
              Comenzar Aventura
            </RunicButton>
          </Link>
        </ParchmentPanel>
      </OrnateFrame>
    </div>
  );
}
