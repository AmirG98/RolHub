'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import { SkillTreeView } from '@/components/skills/SkillTreeView'
import { SkillTreeTeaser } from '@/components/skills/SkillTreeTeaser'
import type { SkillNodeCardData } from '@/components/skills/SkillNodeCard'

interface SkillTreeData {
  available: boolean
  teaser?: boolean
  registerRequired?: boolean
  tree: any
  nodes?: SkillNodeCardData[]
  milestones?: Record<string, unknown>
  characterLevel?: number
}

export default function SkillsPage() {
  const params = useParams()
  const characterId = params.id as string
  const { locale } = useLanguage()

  const [data, setData] = useState<SkillTreeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/characters/${characterId}/skill-tree`)
      if (!res.ok) {
        setError(res.status === 403 ? 'forbidden' : res.status === 404 ? 'notfound' : 'error')
        return
      }
      setData(await res.json())
    } catch {
      setError('error')
    } finally {
      setLoading(false)
    }
  }, [characterId])

  useEffect(() => {
    load()
  }, [load])

  const handleLearn = useCallback(
    async (nodeId: string) => {
      const res = await fetch(`/api/characters/${characterId}/skill-tree/learn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId }),
      })
      if (res.ok) {
        await load() // refrescar estados (learned + nuevos unlockables por prerequisitos)
      }
    },
    [characterId, load]
  )

  const t = {
    back: locale === 'en' ? 'Back to characters' : 'Volver a personajes',
    loading: locale === 'en' ? 'Loading skill tree…' : 'Cargando árbol…',
    none: locale === 'en' ? "This archetype doesn't have a skill tree yet." : 'Este arquetipo aún no tiene árbol de habilidades.',
    err: locale === 'en' ? 'Could not load the skill tree.' : 'No se pudo cargar el árbol.',
  }

  return (
    <div className="min-h-screen bg-shadow px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/characters"
          className="inline-flex items-center gap-2 text-parchment/60 hover:text-gold font-ui text-sm mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>

        {loading && <p className="text-center text-parchment/60 font-body py-20">{t.loading}</p>}

        {!loading && error && (
          <p className="text-center text-parchment/60 font-body py-20">{t.err}</p>
        )}

        {!loading && data && !data.available && (
          <p className="text-center text-parchment/60 font-body py-20">{t.none}</p>
        )}

        {!loading && data?.available && data.teaser && data.tree && (
          <SkillTreeTeaser tree={data.tree} locale={locale as 'es' | 'en'} />
        )}

        {!loading && data?.available && !data.teaser && data.nodes && (
          <SkillTreeView
            treeName={data.tree?.name}
            nodes={data.nodes}
            locale={locale as 'es' | 'en'}
            onLearn={handleLearn}
          />
        )}
      </div>
    </div>
  )
}
