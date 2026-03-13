'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import {
  Users,
  Swords,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Crown,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Activity
} from 'lucide-react'

interface Stats {
  overview: {
    totalUsers: number
    totalCampaigns: number
    totalSessions: number
    totalTurns: number
    totalCharacters: number
    activeCampaigns: number
    usersWithSessions: number
    conversionRate: string
    avgSessionsPerUser: string
    avgTurnsPerSession: string
  }
  distributions: {
    usersByPlan: { plan: string; count: number }[]
    usersByTutorialLevel: { level: string; count: number }[]
    campaignsByLore: { lore: string; count: number }[]
    campaignsByEngine: { engine: string; count: number }[]
  }
  recentUsers: {
    id: string
    username: string
    email: string
    plan: string
    createdAt: string
    _count: {
      campaigns: number
      sessions: number
      characters: number
    }
  }[]
}

interface User {
  id: string
  username: string
  email: string
  plan: string
  tutorialLevel: string
  createdAt: string
  _count: {
    campaigns: number
    sessions: number
    characters: number
  }
  campaigns: {
    id: string
    name: string
    lore: string
    status: string
    updatedAt: string
  }[]
  sessions: {
    startedAt: string
    _count: { turns: number }
  }[]
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const LORE_LABELS: Record<string, string> = {
  LOTR: 'Tierra Media',
  ZOMBIES: 'Apocalipsis Zombie',
  ISEKAI: 'Mundo Isekai',
  VIKINGOS: 'Saga Vikinga',
  STAR_WARS: 'Star Wars',
  CYBERPUNK: 'Cyberpunk',
  LOVECRAFT_HORROR: 'Horrores Cosmicos',
  CUSTOM: 'Custom',
}

const ENGINE_LABELS: Record<string, string> = {
  STORY_MODE: 'Story Mode',
  PBTA: 'PbtA',
  YEAR_ZERO: 'Year Zero',
  DND_5E: 'D&D 5e',
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userDetail, setUserDetail] = useState<any>(null)

  // Cargar stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats')
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Error cargando stats')
        }
        const data = await res.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      }
    }
    fetchStats()
  }, [])

  // Cargar usuarios
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '15',
          search,
        })
        const res = await fetch(`/api/admin/users?${params}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Error cargando usuarios')
        }
        const data = await res.json()
        setUsers(data.users)
        setPagination(data.pagination)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [page, search])

  // Cargar detalle de usuario
  useEffect(() => {
    async function fetchUserDetail() {
      if (!selectedUser) {
        setUserDetail(null)
        return
      }
      try {
        const res = await fetch(`/api/admin/users/${selectedUser}`)
        if (!res.ok) throw new Error('Error cargando usuario')
        const data = await res.json()
        setUserDetail(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchUserDetail()
  }, [selectedUser])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <ParchmentPanel className="p-8 text-center border-2 border-blood">
          <h1 className="font-heading text-2xl text-ink mb-4">Acceso Denegado</h1>
          <p className="font-body text-ink">{error}</p>
          <Link href="/" className="inline-block mt-4 font-ui text-gold-bright hover:text-gold">
            Volver al inicio
          </Link>
        </ParchmentPanel>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-lg bg-gold">
            <Crown className="h-8 w-8 text-shadow" />
          </div>
          <h1 className="font-title text-3xl text-gold-bright">Panel de Admin</h1>
        </div>
        <p className="font-body text-parchment">
          Monitorea usuarios, campanas y estadisticas de RolHub
        </p>
      </header>

      {/* Overview Stats */}
      {stats && (
        <section className="mb-8">
          <h2 className="font-heading text-xl text-gold-bright mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" /> Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <ParchmentPanel className="p-4 border border-gold-dim">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-ink/50" />
                <div>
                  <p className="font-title text-2xl text-ink">{stats.overview.totalUsers}</p>
                  <p className="font-ui text-xs text-ink/70">Usuarios</p>
                </div>
              </div>
            </ParchmentPanel>
            <ParchmentPanel className="p-4 border border-gold-dim">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-ink/50" />
                <div>
                  <p className="font-title text-2xl text-ink">{stats.overview.totalCampaigns}</p>
                  <p className="font-ui text-xs text-ink/70">Campanas</p>
                </div>
              </div>
            </ParchmentPanel>
            <ParchmentPanel className="p-4 border border-gold-dim">
              <div className="flex items-center gap-3">
                <Swords className="h-8 w-8 text-ink/50" />
                <div>
                  <p className="font-title text-2xl text-ink">{stats.overview.totalSessions}</p>
                  <p className="font-ui text-xs text-ink/70">Sesiones</p>
                </div>
              </div>
            </ParchmentPanel>
            <ParchmentPanel className="p-4 border border-gold-dim">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-ink/50" />
                <div>
                  <p className="font-title text-2xl text-ink">{stats.overview.totalTurns}</p>
                  <p className="font-ui text-xs text-ink/70">Turnos</p>
                </div>
              </div>
            </ParchmentPanel>
            <ParchmentPanel className="p-4 border border-gold-dim">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-ink/50" />
                <div>
                  <p className="font-title text-2xl text-ink">{stats.overview.conversionRate}%</p>
                  <p className="font-ui text-xs text-ink/70">Conversion</p>
                </div>
              </div>
            </ParchmentPanel>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
            <div className="p-3 rounded bg-shadow-mid border border-gold-dim/30">
              <p className="font-heading text-lg text-gold-bright">{stats.overview.activeCampaigns}</p>
              <p className="font-ui text-xs text-parchment/70">Activas</p>
            </div>
            <div className="p-3 rounded bg-shadow-mid border border-gold-dim/30">
              <p className="font-heading text-lg text-gold-bright">{stats.overview.usersWithSessions}</p>
              <p className="font-ui text-xs text-parchment/70">Jugaron</p>
            </div>
            <div className="p-3 rounded bg-shadow-mid border border-gold-dim/30">
              <p className="font-heading text-lg text-gold-bright">{stats.overview.totalCharacters}</p>
              <p className="font-ui text-xs text-parchment/70">Personajes</p>
            </div>
            <div className="p-3 rounded bg-shadow-mid border border-gold-dim/30">
              <p className="font-heading text-lg text-gold-bright">{stats.overview.avgSessionsPerUser}</p>
              <p className="font-ui text-xs text-parchment/70">Sesiones/User</p>
            </div>
            <div className="p-3 rounded bg-shadow-mid border border-gold-dim/30">
              <p className="font-heading text-lg text-gold-bright">{stats.overview.avgTurnsPerSession}</p>
              <p className="font-ui text-xs text-parchment/70">Turnos/Sesion</p>
            </div>
          </div>
        </section>
      )}

      {/* Distributions */}
      {stats && (
        <section className="mb-8">
          <h2 className="font-heading text-xl text-gold-bright mb-4">Distribuciones</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* By Plan */}
            <ParchmentPanel className="p-4 border border-gold-dim">
              <h3 className="font-heading text-ink mb-3">Por Plan</h3>
              <div className="space-y-2">
                {stats.distributions.usersByPlan.map(p => (
                  <div key={p.plan} className="flex justify-between items-center">
                    <span className="font-ui text-sm text-ink">{p.plan}</span>
                    <span className="font-heading text-ink">{p.count}</span>
                  </div>
                ))}
              </div>
            </ParchmentPanel>

            {/* By Tutorial Level */}
            <ParchmentPanel className="p-4 border border-gold-dim">
              <h3 className="font-heading text-ink mb-3">Por Nivel</h3>
              <div className="space-y-2">
                {stats.distributions.usersByTutorialLevel.map(t => (
                  <div key={t.level} className="flex justify-between items-center">
                    <span className="font-ui text-sm text-ink">{t.level}</span>
                    <span className="font-heading text-ink">{t.count}</span>
                  </div>
                ))}
              </div>
            </ParchmentPanel>

            {/* By Lore */}
            <ParchmentPanel className="p-4 border border-gold-dim">
              <h3 className="font-heading text-ink mb-3">Por Mundo</h3>
              <div className="space-y-2">
                {stats.distributions.campaignsByLore.map(l => (
                  <div key={l.lore} className="flex justify-between items-center">
                    <span className="font-ui text-sm text-ink">{LORE_LABELS[l.lore] || l.lore}</span>
                    <span className="font-heading text-ink">{l.count}</span>
                  </div>
                ))}
              </div>
            </ParchmentPanel>

            {/* By Engine */}
            <ParchmentPanel className="p-4 border border-gold-dim">
              <h3 className="font-heading text-ink mb-3">Por Sistema</h3>
              <div className="space-y-2">
                {stats.distributions.campaignsByEngine.map(e => (
                  <div key={e.engine} className="flex justify-between items-center">
                    <span className="font-ui text-sm text-ink">{ENGINE_LABELS[e.engine] || e.engine}</span>
                    <span className="font-heading text-ink">{e.count}</span>
                  </div>
                ))}
              </div>
            </ParchmentPanel>
          </div>
        </section>
      )}

      {/* Users List */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl text-gold-bright flex items-center gap-2">
            <Users className="h-5 w-5" /> Usuarios
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-parchment/50" />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-10 pr-4 py-2 bg-shadow-mid border border-gold-dim/50 rounded font-ui text-sm text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Users Table */}
          <div className="lg:col-span-2">
            <ParchmentPanel className="border border-gold-dim overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone/30 border-b border-gold-dim">
                      <th className="font-heading text-ink text-left p-3">Usuario</th>
                      <th className="font-heading text-ink text-center p-3">Plan</th>
                      <th className="font-heading text-ink text-center p-3">Campanas</th>
                      <th className="font-heading text-ink text-center p-3">Sesiones</th>
                      <th className="font-heading text-ink text-center p-3">Registro</th>
                      <th className="font-heading text-ink text-center p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr
                        key={user.id}
                        className={`border-b border-gold-dim/30 hover:bg-gold/5 cursor-pointer transition-colors ${selectedUser === user.id ? 'bg-gold/10' : ''}`}
                        onClick={() => setSelectedUser(user.id)}
                      >
                        <td className="p-3">
                          <p className="font-heading text-ink">{user.username}</p>
                          <p className="font-ui text-xs text-ink/60">{user.email}</p>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-ui text-xs px-2 py-1 rounded ${
                            user.plan === 'PRO' ? 'bg-gold text-shadow' :
                            user.plan === 'GUILD' ? 'bg-emerald text-white' :
                            'bg-stone text-parchment'
                          }`}>
                            {user.plan}
                          </span>
                        </td>
                        <td className="p-3 text-center font-body text-ink">{user._count.campaigns}</td>
                        <td className="p-3 text-center font-body text-ink">{user._count.sessions}</td>
                        <td className="p-3 text-center font-ui text-xs text-ink/70">
                          {new Date(user.createdAt).toLocaleDateString('es-AR')}
                        </td>
                        <td className="p-3 text-center">
                          <button className="text-gold-dim hover:text-gold">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-3 border-t border-gold-dim/30">
                  <span className="font-ui text-xs text-ink/70">
                    {pagination.total} usuarios totales
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1 text-gold-dim hover:text-gold disabled:opacity-30"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="font-ui text-sm text-ink">
                      {page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                      className="p-1 text-gold-dim hover:text-gold disabled:opacity-30"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </ParchmentPanel>
          </div>

          {/* User Detail */}
          <div>
            {userDetail ? (
              <ParchmentPanel className="p-4 border border-gold-dim sticky top-4">
                <h3 className="font-heading text-lg text-ink mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {userDetail.user.username}
                </h3>

                <div className="space-y-3 mb-4">
                  <div>
                    <span className="font-ui text-xs text-ink/50">Email</span>
                    <p className="font-body text-ink text-sm">{userDetail.user.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="font-ui text-xs text-ink/50">Plan</span>
                      <p className="font-heading text-ink">{userDetail.user.plan}</p>
                    </div>
                    <div>
                      <span className="font-ui text-xs text-ink/50">Nivel</span>
                      <p className="font-heading text-ink">{userDetail.user.tutorialLevel}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 bg-stone/30 rounded text-center">
                    <p className="font-heading text-lg text-ink">{userDetail.stats.totalCampaigns}</p>
                    <p className="font-ui text-xs text-ink/50">Campanas</p>
                  </div>
                  <div className="p-2 bg-stone/30 rounded text-center">
                    <p className="font-heading text-lg text-ink">{userDetail.stats.totalSessions}</p>
                    <p className="font-ui text-xs text-ink/50">Sesiones</p>
                  </div>
                  <div className="p-2 bg-stone/30 rounded text-center">
                    <p className="font-heading text-lg text-ink">{userDetail.stats.totalTurns}</p>
                    <p className="font-ui text-xs text-ink/50">Turnos</p>
                  </div>
                  <div className="p-2 bg-stone/30 rounded text-center">
                    <p className="font-heading text-lg text-ink">{userDetail.stats.totalCharacters}</p>
                    <p className="font-ui text-xs text-ink/50">Personajes</p>
                  </div>
                </div>

                {userDetail.stats.lastSessionAt && (
                  <div className="flex items-center gap-2 text-xs text-ink/50 mb-4">
                    <Calendar className="h-3 w-3" />
                    <span>Ultima sesion: {new Date(userDetail.stats.lastSessionAt).toLocaleDateString('es-AR')}</span>
                  </div>
                )}

                {userDetail.user.campaigns.length > 0 && (
                  <div>
                    <h4 className="font-heading text-sm text-ink mb-2">Campanas</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userDetail.user.campaigns.map((c: any) => (
                        <div key={c.id} className="p-2 bg-gold/5 rounded text-xs">
                          <p className="font-heading text-ink">{c.name}</p>
                          <p className="font-ui text-ink/50">{LORE_LABELS[c.lore]} • {c.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ParchmentPanel>
            ) : (
              <ParchmentPanel className="p-8 border border-gold-dim/50 text-center">
                <Eye className="h-12 w-12 text-ink/20 mx-auto mb-3" />
                <p className="font-body text-ink/50">
                  Selecciona un usuario para ver detalles
                </p>
              </ParchmentPanel>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
