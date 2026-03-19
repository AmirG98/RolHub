/**
 * Asset Cache Service
 *
 * Cachea imágenes y otros assets generados para evitar regenerarlos
 * Usa PostgreSQL via Prisma para persistencia
 */

import { prisma } from '@/lib/db/prisma'
import { type Lore, type AssetType } from '@prisma/client'

export interface CachedAsset {
  url: string
  prompt?: string
  createdAt: Date
}

/**
 * Genera una key única para un asset
 */
export function generateAssetKey(
  type: 'location' | 'portrait' | 'scene',
  ...parts: string[]
): string {
  return `${type}:${parts.join(':')}`
}

/**
 * Busca un asset en caché
 */
export async function getCachedAsset(
  type: AssetType,
  key: string
): Promise<CachedAsset | null> {
  try {
    const asset = await prisma.generatedAsset.findUnique({
      where: {
        type_key: { type, key }
      }
    })

    if (!asset) return null

    // Verificar expiración
    if (asset.expiresAt && asset.expiresAt < new Date()) {
      // Asset expirado, eliminarlo
      await prisma.generatedAsset.delete({
        where: { id: asset.id }
      })
      return null
    }

    return {
      url: asset.url,
      prompt: asset.prompt || undefined,
      createdAt: asset.createdAt
    }
  } catch (error) {
    console.error('Error getting cached asset:', error)
    return null
  }
}

/**
 * Guarda un asset en caché
 */
export async function setCachedAsset(
  type: AssetType,
  key: string,
  url: string,
  options?: {
    prompt?: string
    lore?: Lore
    metadata?: object
    expiresInDays?: number
  }
): Promise<void> {
  try {
    const expiresAt = options?.expiresInDays
      ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
      : null

    const metadataValue = options?.metadata ?? {}

    await prisma.generatedAsset.upsert({
      where: {
        type_key: { type, key }
      },
      create: {
        type,
        key,
        url,
        prompt: options?.prompt,
        lore: options?.lore,
        metadata: metadataValue,
        expiresAt
      },
      update: {
        url,
        prompt: options?.prompt,
        metadata: metadataValue,
        expiresAt
      }
    })
  } catch (error) {
    console.error('Error caching asset:', error)
  }
}

/**
 * Elimina un asset del caché
 */
export async function deleteCachedAsset(
  type: AssetType,
  key: string
): Promise<void> {
  try {
    await prisma.generatedAsset.delete({
      where: {
        type_key: { type, key }
      }
    })
  } catch (error) {
    // Ignorar si no existe
  }
}

/**
 * Busca imagen de ubicación en caché
 */
export async function getCachedLocationImage(
  lore: string,
  locationId: string
): Promise<string | null> {
  const key = generateAssetKey('location', lore, locationId)
  const cached = await getCachedAsset('IMAGE', key)
  return cached?.url || null
}

/**
 * Guarda imagen de ubicación en caché
 */
export async function cacheLocationImage(
  lore: string,
  locationId: string,
  url: string,
  prompt?: string
): Promise<void> {
  const key = generateAssetKey('location', lore, locationId)
  await setCachedAsset('IMAGE', key, url, {
    prompt,
    lore: lore as Lore,
    expiresInDays: 30 // Las ubicaciones expiran en 30 días
  })
}

/**
 * Busca retrato de personaje en caché
 */
export async function getCachedCharacterPortrait(
  characterId: string
): Promise<string | null> {
  const key = generateAssetKey('portrait', characterId)
  const cached = await getCachedAsset('IMAGE', key)
  return cached?.url || null
}

/**
 * Guarda retrato de personaje en caché
 */
export async function cacheCharacterPortrait(
  characterId: string,
  url: string,
  prompt?: string
): Promise<void> {
  const key = generateAssetKey('portrait', characterId)
  await setCachedAsset('IMAGE', key, url, {
    prompt,
    // Sin expiración para retratos
  })

  // También actualizar el Character.avatarUrl
  try {
    await prisma.character.update({
      where: { id: characterId },
      data: { avatarUrl: url }
    })
  } catch (error) {
    console.error('Error updating character avatar:', error)
  }
}

/**
 * Limpia assets expirados
 */
export async function cleanupExpiredAssets(): Promise<number> {
  try {
    const result = await prisma.generatedAsset.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
    return result.count
  } catch (error) {
    console.error('Error cleaning up expired assets:', error)
    return 0
  }
}
