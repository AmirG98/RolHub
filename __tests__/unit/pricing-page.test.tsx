// @vitest-environment jsdom
/**
 * /pricing: el camino paywall → suscripción. Desde el cambio del 13/09
 * (plan status + "Gestionar suscripción") 0 de 4 usuarios que llegaron al
 * paywall completaron un checkout → verificar que un FREE sigue viendo el
 * botón de suscribirse y que dispara create-checkout.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import React from 'react'

const mockPush = vi.fn()
let mockSignedIn = true
vi.mock('@clerk/nextjs', () => ({ useUser: () => ({ isSignedIn: mockSignedIn, isLoaded: true }) }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }))
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('@/lib/i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/i18n')>()
  return { ...actual, useTranslations: () => actual.translations.en, useLanguage: () => ({ locale: 'en', setLocale: () => {} }) }
})

import PricingPage from '@/app/pricing/page'

const fetchMock = vi.fn()
beforeEach(() => {
  vi.clearAllMocks()
  mockSignedIn = true
  global.fetch = fetchMock as unknown as typeof fetch
  Object.defineProperty(window, 'location', { value: { href: '' }, writable: true })
})

const planResponse = (body: unknown) => ({ ok: true, json: async () => body })

describe('/pricing', () => {
  it('FREE con trial agotado → botón "Choose Adventurer" → POST create-checkout → redirige a Polar', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url === '/api/user/plan') return planResponse({ plan: 'FREE', status: 'trial_used' })
      if (url === '/api/billing/create-checkout') return { ok: true, json: async () => ({ url: 'https://polar.sh/checkout/abc' }) }
      throw new Error('unexpected ' + url)
    })
    render(<PricingPage />)
    const btn = await screen.findByRole('button', { name: /Choose Adventurer/i })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/user/plan'))
    expect(screen.queryByText(/Manage subscription/i)).toBeNull()
    fireEvent.click(btn)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/billing/create-checkout', expect.objectContaining({ method: 'POST', body: JSON.stringify({ tier: 'adventurer' }) })))
    await waitFor(() => expect(window.location.href).toBe('https://polar.sh/checkout/abc'))
  })

  it('FREE en trial (status trial) también ve el botón de suscribirse', async () => {
    fetchMock.mockImplementation(async (url: string) => url === '/api/user/plan' ? planResponse({ plan: 'FREE', status: 'trial' }) : { ok: true, json: async () => ({}) })
    render(<PricingPage />)
    expect(await screen.findByRole('button', { name: /Choose Adventurer/i })).toBeTruthy()
  })

  it('si /api/user/plan falla, el botón de suscribirse igual aparece', async () => {
    fetchMock.mockImplementation(async (url: string) => url === '/api/user/plan' ? { ok: false, json: async () => ({}) } : { ok: true, json: async () => ({}) })
    render(<PricingPage />)
    expect(await screen.findByRole('button', { name: /Choose Adventurer/i })).toBeTruthy()
  })

  it('PRO vigente → "Manage subscription" → portal; PRO vencido → suscribirse', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url === '/api/user/plan') return planResponse({ plan: 'PRO', status: 'pro' })
      if (url === '/api/billing/portal') return { ok: true, json: async () => ({ customerPortalUrl: 'https://polar.sh/portal/x' }) }
      throw new Error('unexpected ' + url)
    })
    const { unmount } = render(<PricingPage />)
    const manage = await screen.findByRole('button', { name: /Manage subscription/i })
    fireEvent.click(manage)
    await waitFor(() => expect(window.location.href).toBe('https://polar.sh/portal/x'))
    unmount()
    fetchMock.mockImplementation(async (url: string) => url === '/api/user/plan' ? planResponse({ plan: 'PRO', status: 'pro_expired' }) : { ok: true, json: async () => ({}) })
    render(<PricingPage />)
    expect(await screen.findByRole('button', { name: /Choose Adventurer/i })).toBeTruthy()
  })

  it('muestra los tres planes con su cupo de turnos', async () => {
    fetchMock.mockImplementation(async (url: string) => url === '/api/user/plan' ? planResponse({ plan: 'FREE', status: 'trial' }) : { ok: true, json: async () => ({}) })
    render(<PricingPage />)
    expect(await screen.findByRole('button', { name: /Choose Hero/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Choose Legend/i })).toBeTruthy()
    expect(screen.getByText('150 turns per month')).toBeTruthy()
    expect(screen.getByText('400 turns per month')).toBeTruthy()
    expect(screen.getByText('1,000 turns per month')).toBeTruthy()
    expect(screen.getByText('$24.99')).toBeTruthy()
    expect(screen.queryByText(/unlimited/i)).toBeNull()
  })

  it('elegir Héroe manda ese plan al checkout', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url === '/api/user/plan') return planResponse({ plan: 'FREE', status: 'trial' })
      return { ok: true, json: async () => ({ url: 'https://polar.sh/checkout/hero' }) }
    })
    render(<PricingPage />)
    fireEvent.click(await screen.findByRole('button', { name: /Choose Hero/i }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/billing/create-checkout', expect.objectContaining({ body: JSON.stringify({ tier: 'hero' }) })))
  })

  it('suscriptor Aventurero: Héroe es "Switch", pide CONFIRMAR antes de cobrar y llama a upgrade', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url === '/api/user/plan') return planResponse({ plan: 'PRO', status: 'pro', tier: 'adventurer', quota: { enforced: true, limit: 150, used: 150 } })
      if (url === '/api/billing/upgrade') return { ok: true, json: async () => ({ ok: true, tier: 'hero' }) }
      throw new Error('unexpected ' + url)
    })
    render(<PricingPage />)
    fireEvent.click(await screen.findByRole('button', { name: /Switch to Hero/i }))
    // primer clic NO cobra: aparece la confirmación
    expect(fetchMock).not.toHaveBeenCalledWith('/api/billing/upgrade', expect.anything())
    expect(screen.getByText(/charged the prorated difference/i)).toBeTruthy()
    expect(screen.getByText(/used 150 of 150 turns/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^Confirm$/i }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/billing/upgrade', expect.objectContaining({ body: JSON.stringify({ action: 'upgrade', tier: 'hero' }) })))
  })

  it('deslogueado → el botón manda a /register sin llamar al checkout', async () => {
    mockSignedIn = false
    fetchMock.mockImplementation(async () => ({ ok: true, json: async () => ({}) }))
    render(<PricingPage />)
    fireEvent.click(await screen.findByRole('button', { name: /Choose Adventurer/i }))
    expect(mockPush).toHaveBeenCalledWith('/register')
    expect(fetchMock).not.toHaveBeenCalledWith('/api/billing/create-checkout', expect.anything())
  })
})
