// @vitest-environment jsdom
/**
 * Muro de cupo dentro de la partida: ofrece el plan siguiente, pide
 * CONFIRMAR antes de cobrar, y devuelve el control al juego si el upgrade
 * dejó cupo disponible.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

vi.mock('next/link', () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }))
vi.mock('@/lib/i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/i18n')>()
  return { ...actual, useTranslations: () => actual.translations.en }
})

import { QuotaWall, type WallInfo } from '@/components/billing/QuotaWall'

const fetchMock = vi.fn()
beforeEach(() => { vi.clearAllMocks(); global.fetch = fetchMock as unknown as typeof fetch })

const quotaWall: WallInfo = { kind: 'quota', tier: 'adventurer', limit: 150, used: 150, remaining: 0, nextTier: 'hero', resetsAt: '2026-11-12T00:00:00Z' }

describe('QuotaWall', () => {
  it('cupo agotado: muestra cuándo se renueva y ofrece Héroe con precio', () => {
    render(<QuotaWall wall={quotaWall} locale="en" onUpgraded={() => {}} />)
    expect(screen.getByText(/used your 150 turns for this month/i)).toBeTruthy()
    expect(screen.getByText(/renew on November 1[12]/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Upgrade to Hero — \$24\.99\/mo/i })).toBeTruthy()
  })

  it('el primer clic NO cobra: pide confirmación; al confirmar llama a upgrade y avisa al juego', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true, tier: 'hero', quota: { enforced: true, limit: 400, used: 150, remaining: 250 } }) })
    const onUpgraded = vi.fn()
    render(<QuotaWall wall={quotaWall} locale="en" onUpgraded={onUpgraded} />)
    fireEvent.click(screen.getByRole('button', { name: /Upgrade to Hero/i }))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByText(/charged the prorated difference now/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^Confirm$/i }))
    await waitFor(() => expect(onUpgraded).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith('/api/billing/upgrade', expect.objectContaining({ body: JSON.stringify({ action: 'upgrade', tier: 'hero' }) }))
  })

  it('cancelar la confirmación no llama a nada', () => {
    render(<QuotaWall wall={quotaWall} locale="en" onUpgraded={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Upgrade to Hero/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Cancel$/i }))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Upgrade to Hero/i })).toBeTruthy()
  })

  it('si Polar falla, muestra error y NO libera el juego', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: 'upgrade_failed' }) })
    const onUpgraded = vi.fn()
    render(<QuotaWall wall={quotaWall} locale="en" onUpgraded={onUpgraded} />)
    fireEvent.click(screen.getByRole('button', { name: /Upgrade to Hero/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Confirm$/i }))
    expect(await screen.findByText(/couldn't change your plan/i)).toBeTruthy()
    expect(onUpgraded).not.toHaveBeenCalled()
  })

  it('upgrade OK pero sin cupo disponible → no libera el juego', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true, tier: 'hero', quota: { enforced: true, limit: 400, used: 400, remaining: 0 } }) })
    const onUpgraded = vi.fn()
    render(<QuotaWall wall={quotaWall} locale="en" onUpgraded={onUpgraded} />)
    fireEvent.click(screen.getByRole('button', { name: /Upgrade to Hero/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Confirm$/i }))
    expect(await screen.findByText(/couldn't change your plan/i)).toBeTruthy()
    expect(onUpgraded).not.toHaveBeenCalled()
  })

  it('Leyenda agotado: sin botón de upgrade, solo la fecha de renovación', () => {
    render(<QuotaWall wall={{ ...quotaWall, tier: 'legend', limit: 1000, used: 1000, nextTier: null }} locale="en" onUpgraded={() => {}} />)
    expect(screen.getByText(/already on our biggest plan/i)).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('trial de la suscripción agotado: ofrece empezar el plan ahora (start_now)', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true, tier: 'adventurer', quota: { enforced: true, limit: 150, used: 0, remaining: 150 } }) })
    const onUpgraded = vi.fn()
    render(<QuotaWall wall={{ kind: 'sub_trial', tier: 'adventurer', limit: 60, used: 60, remaining: 0, nextTier: 'hero', resetsAt: '2026-10-07T00:00:00Z' }} locale="en" onUpgraded={onUpgraded} />)
    expect(screen.getByText(/used the 60 turns of your free trial/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Start my plan now — \$8\.99\/mo/i }))
    expect(screen.getByText(/charged \$8\.99 now/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^Confirm$/i }))
    await waitFor(() => expect(onUpgraded).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith('/api/billing/upgrade', expect.objectContaining({ body: JSON.stringify({ action: 'start_now' }) }))
  })
})
