'use client'

import { useState } from 'react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { RunicButton } from '@/components/medieval/RunicButton'

interface ActionInputProps {
  sessionId: string
  campaignId: string
}

export default function ActionInput({ sessionId, campaignId }: ActionInputProps) {
  const [action, setAction] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!action.trim()) {
      setError('Debes escribir una acción')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/session/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          campaignId,
          action: action.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la acción')
      }

      // Recargar la página para mostrar los nuevos turnos
      window.location.reload()
    } catch (err) {
      setError((err as Error).message)
      setIsSubmitting(false)
    }
  }

  return (
    <ParchmentPanel variant="ornate" className="mt-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="action" className="font-heading text-ink text-lg mb-2 block">
            ¿Qué haces?
          </label>
          <textarea
            id="action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            disabled={isSubmitting}
            placeholder="Describe tu acción..."
            className="w-full h-32 p-4 bg-parchment-dark/50 border-2 border-gold-dim/30 rounded-lg
                     font-body text-ink placeholder:text-stone/50
                     focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     resize-none"
          />
        </div>

        {error && (
          <div className="p-3 bg-blood/10 border border-blood/30 rounded-lg">
            <p className="font-ui text-blood text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <RunicButton
            type="submit"
            disabled={isSubmitting || !action.trim()}
            variant="primary"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Acción'}
          </RunicButton>
        </div>
      </form>
    </ParchmentPanel>
  )
}
