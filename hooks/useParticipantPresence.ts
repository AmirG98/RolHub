'use client'

import { useEffect, useRef, useCallback } from 'react'

const HEARTBEAT_INTERVAL = 30000 // 30 seconds

interface UseParticipantPresenceOptions {
  enabled?: boolean
}

export function useParticipantPresence(
  campaignId: string,
  options: UseParticipantPresenceOptions = {}
) {
  const { enabled = true } = options
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const isOnlineRef = useRef(false)

  const updatePresence = useCallback(async (isOnline: boolean) => {
    try {
      await fetch(`/api/campaigns/${campaignId}/participants`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline }),
      })
      isOnlineRef.current = isOnline
    } catch (error) {
      console.error('Error updating presence:', error)
    }
  }, [campaignId])

  useEffect(() => {
    if (!enabled || !campaignId) return

    // Mark as online immediately
    updatePresence(true)

    // Set up heartbeat
    heartbeatRef.current = setInterval(() => {
      updatePresence(true)
    }, HEARTBEAT_INTERVAL)

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence(true)
      }
    }

    // Handle before unload
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable delivery
      const data = JSON.stringify({ isOnline: false })
      navigator.sendBeacon(
        `/api/campaigns/${campaignId}/participants/presence`,
        new Blob([data], { type: 'application/json' })
      )
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      // Clear heartbeat
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }

      // Mark as offline
      updatePresence(false)

      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [campaignId, enabled, updatePresence])

  return {
    setOnline: () => updatePresence(true),
    setOffline: () => updatePresence(false),
  }
}
