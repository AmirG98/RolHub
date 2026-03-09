'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import {
  GuestSession,
  GuestCharacter,
  GuestTurn,
  GuestState,
  GUEST_SESSION_KEY,
  GUEST_WARNING_KEY,
  generateGuestId
} from './types'

interface GuestContextValue extends GuestState {
  // Acciones
  startGuestSession: (lore: string, engine: string, mode: 'ONE_SHOT' | 'CAMPAIGN') => void
  setGuestCharacter: (character: GuestCharacter) => void
  addGuestTurn: (turn: Omit<GuestTurn, 'id' | 'createdAt'>) => void
  updateWorldState: (worldState: any) => void
  endGuestSession: () => void
  markWarningShown: () => void
}

const GuestContext = createContext<GuestContextValue | null>(null)

interface GuestProviderProps {
  children: ReactNode
}

export function GuestProvider({ children }: GuestProviderProps) {
  const [state, setState] = useState<GuestState>({
    isGuest: false,
    session: null,
    hasShownWarning: false
  })

  // Cargar sesión de guest desde sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedSession = sessionStorage.getItem(GUEST_SESSION_KEY)
    const warningShown = sessionStorage.getItem(GUEST_WARNING_KEY) === 'true'

    if (savedSession) {
      try {
        const session = JSON.parse(savedSession) as GuestSession
        setState({
          isGuest: true,
          session,
          hasShownWarning: warningShown
        })
      } catch (e) {
        console.error('[Guest] Error loading session:', e)
        sessionStorage.removeItem(GUEST_SESSION_KEY)
      }
    }
  }, [])

  // Guardar sesión en sessionStorage cuando cambia
  const saveSession = useCallback((session: GuestSession | null) => {
    if (typeof window === 'undefined') return

    if (session) {
      sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session))
    } else {
      sessionStorage.removeItem(GUEST_SESSION_KEY)
    }
  }, [])

  // Iniciar sesión de guest
  const startGuestSession = useCallback((lore: string, engine: string, mode: 'ONE_SHOT' | 'CAMPAIGN') => {
    const newSession: GuestSession = {
      id: generateGuestId(),
      createdAt: new Date().toISOString(),
      turns: [],
      lore,
      engine,
      mode
    }

    saveSession(newSession)
    setState(prev => ({
      ...prev,
      isGuest: true,
      session: newSession
    }))
  }, [saveSession])

  // Establecer personaje del guest
  const setGuestCharacter = useCallback((character: GuestCharacter) => {
    setState(prev => {
      if (!prev.session) return prev

      const updatedSession = {
        ...prev.session,
        character
      }

      saveSession(updatedSession)
      return {
        ...prev,
        session: updatedSession
      }
    })
  }, [saveSession])

  // Agregar turno
  const addGuestTurn = useCallback((turn: Omit<GuestTurn, 'id' | 'createdAt'>) => {
    setState(prev => {
      if (!prev.session) return prev

      const newTurn: GuestTurn = {
        ...turn,
        id: `turn_${Date.now()}`,
        createdAt: new Date().toISOString()
      }

      const updatedSession = {
        ...prev.session,
        turns: [...prev.session.turns, newTurn]
      }

      saveSession(updatedSession)
      return {
        ...prev,
        session: updatedSession
      }
    })
  }, [saveSession])

  // Actualizar estado del mundo
  const updateWorldState = useCallback((worldState: any) => {
    setState(prev => {
      if (!prev.session) return prev

      const updatedSession = {
        ...prev.session,
        worldState: {
          ...prev.session.worldState,
          ...worldState
        }
      }

      saveSession(updatedSession)
      return {
        ...prev,
        session: updatedSession
      }
    })
  }, [saveSession])

  // Terminar sesión de guest
  const endGuestSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(GUEST_SESSION_KEY)
      sessionStorage.removeItem(GUEST_WARNING_KEY)
    }

    setState({
      isGuest: false,
      session: null,
      hasShownWarning: false
    })
  }, [])

  // Marcar que se mostró la advertencia
  const markWarningShown = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(GUEST_WARNING_KEY, 'true')
    }

    setState(prev => ({
      ...prev,
      hasShownWarning: true
    }))
  }, [])

  const value: GuestContextValue = {
    ...state,
    startGuestSession,
    setGuestCharacter,
    addGuestTurn,
    updateWorldState,
    endGuestSession,
    markWarningShown
  }

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  )
}

/**
 * Hook para usar el contexto de guest
 */
export function useGuest(): GuestContextValue {
  const context = useContext(GuestContext)
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider')
  }
  return context
}

/**
 * Hook para verificar si el usuario actual es guest
 */
export function useIsGuest(): boolean {
  const context = useContext(GuestContext)
  return context?.isGuest ?? false
}
