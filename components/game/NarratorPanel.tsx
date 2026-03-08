import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'

interface Turn {
  id: string
  role: 'USER' | 'DM' | 'SYSTEM'
  content: string
  imageUrl?: string | null
  createdAt: Date
}

interface NarratorPanelProps {
  turns: Turn[]
  campaignName: string
  lore: string
}

export default function NarratorPanel({ turns, campaignName, lore }: NarratorPanelProps) {
  return (
    <OrnateFrame variant="gold">
      <ParchmentPanel variant="ornate" className="min-h-[600px]">
        <h2 className="font-title text-3xl text-ink text-center mb-6">
          El Narrador
        </h2>

        <div className="space-y-4">
          {turns.map((turn) => (
            <div
              key={turn.id}
              className={`p-4 rounded-lg glass-panel ${
                turn.role === 'DM'
                  ? 'border-l-4 border-gold'
                  : turn.role === 'USER'
                  ? 'border-l-4 border-emerald'
                  : 'border-l-4 border-gold-dim'
              }`}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="font-heading text-xs text-gold-dim uppercase tracking-wide">
                  {turn.role === 'DM' ? 'Narrador' : turn.role === 'USER' ? 'Jugador' : 'Sistema'}
                </div>
              </div>
              <p className="font-body text-parchment leading-relaxed ink-reveal whitespace-pre-wrap">
                {turn.content}
              </p>
              {turn.imageUrl && (
                <img
                  src={turn.imageUrl}
                  alt="Scene"
                  className="mt-4 rounded-lg w-full ink-reveal"
                />
              )}
            </div>
          ))}
        </div>
      </ParchmentPanel>
    </OrnateFrame>
  )
}
