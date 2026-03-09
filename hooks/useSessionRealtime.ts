'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Turn {
  id: string
  sessionId: string
  role: 'USER' | 'DM' | 'SYSTEM'
  content: string
  imageUrl?: string
  audioUrl?: string
  diceRoll?: { formula: string; result: number; rolls: number[] }
  diceRolls?: any
  activeEffects?: any
  worldStatePatch?: any
  participantId?: string
  characterId?: string
  characterName?: string
  playerName?: string
  createdAt: string
}

interface Participant {
  id: string
  campaignId: string
  userId: string
  characterId?: string
  role: 'OWNER' | 'DM' | 'PLAYER' | 'SPECTATOR'
  isOnline: boolean
  lastSeenAt: string
  user?: {
    id: string
    username: string
  }
  character?: {
    id: string
    name: string
    archetype: string
  }
}

interface UseSessionRealtimeReturn {
  turns: Turn[]
  participants: Participant[]
  isConnected: boolean
  addTurn: (turn: Turn) => void
  refreshTurns: () => Promise<void>
  refreshParticipants: () => Promise<void>
}

export function useSessionRealtime(
  sessionId: string,
  campaignId: string
): UseSessionRealtimeReturn {
  const [turns, setTurns] = useState<Turn[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // Fetch initial turns
  const refreshTurns = useCallback(async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}/turns`)
      if (response.ok) {
        const data = await response.json()
        setTurns(data.turns || [])
      }
    } catch (error) {
      console.error('Error fetching turns:', error)
    }
  }, [sessionId])

  // Fetch initial participants
  const refreshParticipants = useCallback(async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/participants`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data.participants || [])
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
    }
  }, [campaignId])

  // Add a turn locally (optimistic update)
  const addTurn = useCallback((turn: Turn) => {
    setTurns(prev => [...prev, turn])
  }, [])

  useEffect(() => {
    // Load initial data
    refreshTurns()
    refreshParticipants()

    // Only subscribe to realtime if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase not configured, realtime features disabled')
      return
    }

    // Subscribe to realtime updates for this session
    const sessionChannel = supabase.channel(`session:${sessionId}`, {
      config: {
        broadcast: {
          self: true,
        },
      },
    })

    sessionChannel
      .on('broadcast', { event: 'new_turn' }, (payload) => {
        const newTurn = payload.payload as Turn
        setTurns(prev => {
          // Avoid duplicates
          if (prev.some(t => t.id === newTurn.id)) {
            return prev
          }
          return [...prev, newTurn]
        })
      })
      .on('broadcast', { event: 'participant_update' }, (payload) => {
        const updatedParticipant = payload.payload as Participant
        setParticipants(prev =>
          prev.map(p =>
            p.id === updatedParticipant.id ? { ...p, ...updatedParticipant } : p
          )
        )
      })
      .on('broadcast', { event: 'participant_joined' }, (payload) => {
        const newParticipant = payload.payload as Participant
        setParticipants(prev => {
          if (prev.some(p => p.id === newParticipant.id)) {
            return prev
          }
          return [...prev, newParticipant]
        })
      })
      .on('broadcast', { event: 'world_state_update' }, () => {
        // Refresh turns to get updated world state
        refreshTurns()
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    setChannel(sessionChannel)

    return () => {
      sessionChannel.unsubscribe()
    }
  }, [sessionId, campaignId, refreshTurns, refreshParticipants])

  return {
    turns,
    participants,
    isConnected,
    addTurn,
    refreshTurns,
    refreshParticipants,
  }
}

// Helper function to broadcast a new turn
export async function broadcastTurn(sessionId: string, turn: Turn) {
  if (!isSupabaseConfigured() || !supabase) {
    return // Silently skip if Supabase not configured
  }
  const channel = supabase.channel(`session:${sessionId}`)
  await channel.send({
    type: 'broadcast',
    event: 'new_turn',
    payload: turn,
  })
}

// Helper function to broadcast participant update
export async function broadcastParticipantUpdate(
  sessionId: string,
  participant: Partial<Participant>
) {
  if (!isSupabaseConfigured() || !supabase) {
    return // Silently skip if Supabase not configured
  }
  const channel = supabase.channel(`session:${sessionId}`)
  await channel.send({
    type: 'broadcast',
    event: 'participant_update',
    payload: participant,
  })
}

// Helper function to broadcast world state update
export async function broadcastWorldStateUpdate(sessionId: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return // Silently skip if Supabase not configured
  }
  const channel = supabase.channel(`session:${sessionId}`)
  await channel.send({
    type: 'broadcast',
    event: 'world_state_update',
    payload: {},
  })
}
