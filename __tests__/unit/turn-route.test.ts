import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Turn Route Safety Checks', () => {
  const routeFile = fs.readFileSync(
    path.resolve(__dirname, '../../app/api/session/turn/route.ts'),
    'utf-8'
  )

  it('has maxDuration >= 60 for Vercel Pro', () => {
    const match = routeFile.match(/export const maxDuration\s*=\s*(\d+)/)
    expect(match).toBeTruthy()
    const duration = parseInt(match![1])
    expect(duration).toBeGreaterThanOrEqual(60)
    expect(duration).toBeLessThanOrEqual(300) // Vercel Pro max
  })

  it('uses NextResponse.json (NOT ReadableStream)', () => {
    expect(routeFile).toContain('NextResponse.json')
    expect(routeFile).not.toContain('new ReadableStream')
    expect(routeFile).not.toContain('controller.enqueue')
  })

  it('uses standard response.json() on client (not stream reader)', () => {
    const clientFile = fs.readFileSync(
      path.resolve(__dirname, '../../components/game/GameSession.tsx'),
      'utf-8'
    )
    expect(clientFile).toContain('response.json()')
    expect(clientFile).not.toContain('response.body?.getReader()')
  })

  it('exports POST function', () => {
    expect(routeFile).toContain('export async function POST')
  })

  it('includes error handling with try-catch', () => {
    expect(routeFile).toContain('} catch (')
    expect(routeFile).toContain("status: 500")
  })

  it('uses Sonnet model (not Opus)', () => {
    // Opus es 5x más caro y no necesario con buen contexto
    expect(routeFile).not.toContain('claude-opus')
    expect(routeFile).toContain('claude-sonnet')
  })
})

describe('Character Create Route Safety', () => {
  const routeFile = fs.readFileSync(
    path.resolve(__dirname, '../../app/api/character/create/route.ts'),
    'utf-8'
  )

  it('uses $transaction for atomic creation', () => {
    expect(routeFile).toContain('$transaction')
  })

  it('creates all required entities in transaction', () => {
    // Debe crear: user, campaign, character, campaignParticipant, session, turn
    expect(routeFile).toContain('tx.user.')
    expect(routeFile).toContain('tx.campaign.create')
    expect(routeFile).toContain('tx.character.create')
    expect(routeFile).toContain('tx.campaignParticipant.create')
    expect(routeFile).toContain('tx.session.create')
    expect(routeFile).toContain('tx.turn.create')
  })
})
