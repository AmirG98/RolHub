'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from '@/lib/i18n'

// Latencia percibida: un turno tarda 15-30s sin streaming. Un mensaje fijo
// durante 25s se siente "colgado" (dato de prod: dobles submit mientras
// esperaban). Tres fases hacen visible que algo avanza.
export function NarratorThinking() {
  const t = useTranslations()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const started = Date.now()
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  const label = elapsed >= 16 ? t.game.narratorThinking3 : elapsed >= 6 ? t.game.narratorThinking2 : t.game.narratorThinking
  return <span key={label} className="ink-reveal inline-block">{label}</span>
}
