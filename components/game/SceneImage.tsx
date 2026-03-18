'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageIcon, RefreshCw, AlertCircle, Maximize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Lore, getMapConfig } from '@/lib/maps/map-config'

interface SceneImageProps {
  imageUrl: string | null
  isLoading: boolean
  lore: Lore
  alt?: string
  onRetry?: () => void
  error?: string | null
  className?: string
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9'
  showFullscreenButton?: boolean
}

// Placeholders por lore cuando no hay imagen
const LORE_PLACEHOLDERS: Record<string, string> = {
  lotr: '/assets/placeholders/fantasy-landscape.jpg',
  zombies: '/assets/placeholders/apocalypse-ruins.jpg',
  isekai: '/assets/placeholders/anime-world.jpg',
  vikingos: '/assets/placeholders/nordic-fjord.jpg',
  star_wars: '/assets/placeholders/space-station.jpg',
  cyberpunk: '/assets/placeholders/neon-city.jpg',
  lovecraft: '/assets/placeholders/cosmic-horror.jpg',
}

// Fallback universal
const DEFAULT_PLACEHOLDER = '/assets/placeholders/default-scene.jpg'

// Aspect ratio classes
const ASPECT_CLASSES = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '21:9': 'aspect-[21/9]',
}

export function SceneImage({
  imageUrl,
  isLoading,
  lore,
  alt = 'Escena actual',
  onRetry,
  error,
  className = '',
  aspectRatio = '16:9',
  showFullscreenButton = true,
}: SceneImageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasLoadError, setHasLoadError] = useState(false)
  const config = getMapConfig(lore)

  // Reset error state when URL changes
  useEffect(() => {
    setHasLoadError(false)
  }, [imageUrl])

  const handleImageError = () => {
    setHasLoadError(true)
  }

  const placeholderUrl = LORE_PLACEHOLDERS[lore] || DEFAULT_PLACEHOLDER
  const displayUrl = hasLoadError || !imageUrl ? placeholderUrl : imageUrl

  return (
    <>
      <div
        className={cn(
          'relative overflow-hidden rounded-lg',
          'bg-shadow border border-gold-dim',
          ASPECT_CLASSES[aspectRatio],
          className
        )}
        style={{
          boxShadow: `inset 0 0 30px rgba(0,0,0,0.8), 0 0 20px ${config.primaryColor}20`,
        }}
      >
        {/* Loading State */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-shadow z-10"
            >
              <SceneImageSkeleton lore={lore} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-shadow/90 z-10">
            <AlertCircle className="w-10 h-10 text-blood mb-3" />
            <p className="text-sm text-parchment/70 text-center mb-3 font-body italic max-w-[200px]">
              La visión se desvanece antes de tomar forma...
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-gold-dim/20 hover:bg-gold-dim/40 text-gold text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
            )}
          </div>
        )}

        {/* Image */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            {displayUrl.startsWith('/') ? (
              // Placeholder local
              <Image
                src={displayUrl}
                alt={alt}
                fill
                className="object-cover"
                onError={handleImageError}
                priority
              />
            ) : (
              // URL remota (Fal.ai)
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt={alt}
                className="absolute inset-0 w-full h-full object-cover"
                onError={handleImageError}
              />
            )}

            {/* Vignette overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/30" />

            {/* Frame decorativo */}
            <div
              className="absolute inset-0 pointer-events-none border-4 border-transparent"
              style={{
                borderImage: `linear-gradient(45deg, ${config.primaryColor}40, transparent, ${config.primaryColor}40) 1`,
              }}
            />
          </motion.div>
        )}

        {/* Fullscreen button */}
        {showFullscreenButton && !isLoading && imageUrl && (
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-2 right-2 p-1.5 rounded bg-black/50 hover:bg-black/70 text-parchment/70 hover:text-parchment transition-colors z-20"
            title="Ver en pantalla completa"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {/* No image indicator */}
        {!imageUrl && !isLoading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-parchment/40">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span className="text-sm font-body italic">Sin imagen de escena</span>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-parchment/70 hover:text-parchment transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />

              {/* Frame decorativo */}
              <div
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{
                  boxShadow: `0 0 60px ${config.primaryColor}30, inset 0 0 0 2px ${config.primaryColor}50`,
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Skeleton loader con estética medieval
function SceneImageSkeleton({ lore }: { lore: Lore }) {
  const config = getMapConfig(lore)

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Runas animadas */}
      <div className="flex gap-2">
        {['⚔', '🗡', '🛡'].map((rune, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className="text-3xl"
            style={{ color: config.primaryColor }}
          >
            {rune}
          </motion.span>
        ))}
      </div>

      {/* Texto */}
      <p className="text-sm font-body italic text-parchment/60">
        Conjurando visión...
      </p>

      {/* Barra de progreso estilizada */}
      <div className="w-48 h-1 bg-shadow-mid rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: config.primaryColor }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  )
}

// Galería de imágenes de escena (para historial)
interface SceneGalleryProps {
  images: Array<{
    url: string
    timestamp: Date
    description?: string
  }>
  lore: Lore
  onImageClick?: (url: string) => void
  className?: string
}

export function SceneGallery({
  images,
  lore,
  onImageClick,
  className = '',
}: SceneGalleryProps) {
  const config = getMapConfig(lore)

  if (images.length === 0) {
    return (
      <div className={cn('text-center py-8 text-parchment/50', className)}>
        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm font-body italic">No hay imágenes de la sesión</p>
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-3', className)}>
      {images.map((img, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onImageClick?.(img.url)}
          className="relative aspect-video rounded-lg overflow-hidden border border-gold-dim/30 hover:border-gold-dim transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={img.description || `Escena ${index + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Overlay con descripción */}
          {img.description && (
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-xs text-parchment/80 truncate">
                {img.description}
              </p>
            </div>
          )}

          {/* Timestamp */}
          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-parchment/60">
            {img.timestamp.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </motion.button>
      ))}
    </div>
  )
}

// Componente de imagen con prompt visible (para debug/DM view)
interface SceneImageWithPromptProps extends SceneImageProps {
  prompt?: string
  showPrompt?: boolean
}

export function SceneImageWithPrompt({
  prompt,
  showPrompt = false,
  ...props
}: SceneImageWithPromptProps) {
  const [isPromptVisible, setIsPromptVisible] = useState(showPrompt)

  return (
    <div className="space-y-2">
      <SceneImage {...props} />

      {prompt && (
        <div className="flex items-start gap-2">
          <button
            onClick={() => setIsPromptVisible(!isPromptVisible)}
            className="text-xs text-parchment/50 hover:text-parchment/70 transition-colors"
          >
            {isPromptVisible ? 'Ocultar prompt' : 'Ver prompt'}
          </button>

          {isPromptVisible && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-parchment/40 font-mono bg-shadow-mid rounded px-2 py-1"
            >
              {prompt}
            </motion.p>
          )}
        </div>
      )}
    </div>
  )
}
