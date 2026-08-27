'use client'

import { useEffect, useRef, useState } from 'react'

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  // En móvil NO cargamos el video (15MB): el tráfico principal viene de ads y
  // un phone con datos no debe descargar eso antes de ver la página. El poster
  // en webp (~150KB) alcanza. El video solo se monta en desktop.
  const [allowVideo, setAllowVideo] = useState(false)

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    // Respetar data-saver / conexiones lentas si el browser lo expone.
    const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    const saveData = conn?.saveData === true
    const slow = conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g'
    setAllowVideo(isDesktop && !saveData && !slow)
  }, [])

  useEffect(() => {
    if (allowVideo && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay puede estar bloqueado, no pasa nada: queda el poster.
      })
    }
  }, [allowVideo])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Poster (webp liviano) - se ve siempre en móvil y mientras carga el video */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: 'url(/assets/backgrounds/rol-background.webp)',
          filter: 'brightness(0.4)',
        }}
      />

      {/* Video solo en desktop */}
      {allowVideo && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ filter: 'brightness(0.4)' }}
        >
          <source src="/assets/backgrounds/background-video.mp4" type="video/mp4" />
        </video>
      )}

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
