'use client'

import { useEffect, useRef, useState } from 'react'

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    // Ensure video plays on mount
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked, that's ok
      })
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Fallback image - shows while video loads or if video fails */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: 'url(/assets/backgrounds/rol-background.png)',
          filter: 'brightness(0.4)',
        }}
      />

      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ filter: 'brightness(0.4)' }}
      >
        <source src="/assets/backgrounds/background-video.mp4" type="video/mp4" />
      </video>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(13, 10, 5, 0.7) 100%)'
        }}
      />
    </div>
  )
}
