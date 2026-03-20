/**
 * Configuración de ambientes 3D por Lore
 * Define skybox, niebla, iluminación y texturas para cada mundo
 */

import { type Lore } from '@/lib/maps/map-config'

export interface LoreEnvironment {
  // Ambiente general
  skybox: 'sunset' | 'night' | 'dawn' | 'warehouse' | 'forest' | 'city' | 'apartment' | 'studio' | 'park'
  backgroundColor: string

  // Niebla atmosférica
  fog: {
    color: string
    near: number
    far: number
  }

  // Iluminación
  ambientLight: {
    intensity: number
    color?: string
  }
  directionalLight: {
    intensity: number
    color?: string
    position: [number, number, number]
  }

  // Terreno
  terrain: {
    color: string
    roughness: number
    metalness: number
    wireframe?: boolean
    displacement?: number
  }

  // Marcadores
  markers: {
    defaultColor: string
    visitedColor: string
    currentColor: string
    glowColor: string
  }

  // Efectos post-procesado
  postProcessing: {
    bloom?: { intensity: number; threshold: number }
    vignette?: { darkness: number }
    chromaticAberration?: { offset: number }
  }
}

export const LORE_ENVIRONMENTS: Record<Lore, LoreEnvironment> = {
  LOTR: {
    skybox: 'sunset',
    backgroundColor: '#1a2f1a',
    fog: { color: '#2d4a1c', near: 80, far: 400 },
    ambientLight: { intensity: 0.4, color: '#ffeedd' },
    directionalLight: { intensity: 1.2, color: '#fff5e0', position: [50, 100, 50] },
    terrain: {
      color: '#3d5c3d',
      roughness: 0.9,
      metalness: 0.1,
      displacement: 15,
    },
    markers: {
      defaultColor: '#c9a84c',
      visitedColor: '#7a9a4a',
      currentColor: '#f5c842',
      glowColor: '#ffd700',
    },
    postProcessing: {
      bloom: { intensity: 0.3, threshold: 0.8 },
      vignette: { darkness: 0.4 },
    },
  },

  ZOMBIES: {
    skybox: 'warehouse',
    backgroundColor: '#0a0a0a',
    fog: { color: '#1a1a1a', near: 30, far: 200 },
    ambientLight: { intensity: 0.15, color: '#88aacc' },
    directionalLight: { intensity: 0.4, color: '#aaccee', position: [0, 80, 30] },
    terrain: {
      color: '#2a2a2a',
      roughness: 1.0,
      metalness: 0.2,
      displacement: 5,
    },
    markers: {
      defaultColor: '#666666',
      visitedColor: '#8b1a1a',
      currentColor: '#ff4444',
      glowColor: '#ff0000',
    },
    postProcessing: {
      bloom: { intensity: 0.2, threshold: 0.9 },
      vignette: { darkness: 0.7 },
      chromaticAberration: { offset: 0.002 },
    },
  },

  ISEKAI: {
    skybox: 'park',
    backgroundColor: '#1a1a3a',
    fog: { color: '#3a2a5a', near: 60, far: 350 },
    ambientLight: { intensity: 0.5, color: '#eeddff' },
    directionalLight: { intensity: 1.0, color: '#ffddee', position: [60, 120, 40] },
    terrain: {
      color: '#4a6a4a',
      roughness: 0.7,
      metalness: 0.0,
      displacement: 20,
    },
    markers: {
      defaultColor: '#ff88cc',
      visitedColor: '#88ccff',
      currentColor: '#ffcc00',
      glowColor: '#ff00ff',
    },
    postProcessing: {
      bloom: { intensity: 0.5, threshold: 0.6 },
      vignette: { darkness: 0.3 },
    },
  },

  VIKINGOS: {
    skybox: 'dawn',
    backgroundColor: '#1a1a2a',
    fog: { color: '#2a3a4a', near: 50, far: 300 },
    ambientLight: { intensity: 0.3, color: '#ccddee' },
    directionalLight: { intensity: 0.9, color: '#ffeedd', position: [40, 60, 60] },
    terrain: {
      color: '#3a4a3a',
      roughness: 0.95,
      metalness: 0.05,
      displacement: 25,
    },
    markers: {
      defaultColor: '#8b6914',
      visitedColor: '#5a7a5a',
      currentColor: '#c9a84c',
      glowColor: '#ff8800',
    },
    postProcessing: {
      bloom: { intensity: 0.25, threshold: 0.85 },
      vignette: { darkness: 0.5 },
    },
  },

  STAR_WARS: {
    skybox: 'night',
    backgroundColor: '#050510',
    fog: { color: '#0a0a20', near: 100, far: 500 },
    ambientLight: { intensity: 0.2, color: '#aabbff' },
    directionalLight: { intensity: 0.8, color: '#ffffff', position: [100, 150, 50] },
    terrain: {
      color: '#2a2a3a',
      roughness: 0.6,
      metalness: 0.4,
      displacement: 10,
    },
    markers: {
      defaultColor: '#4488ff',
      visitedColor: '#44ff88',
      currentColor: '#ffff00',
      glowColor: '#00ffff',
    },
    postProcessing: {
      bloom: { intensity: 0.6, threshold: 0.5 },
      vignette: { darkness: 0.6 },
    },
  },

  CYBERPUNK: {
    skybox: 'city',
    backgroundColor: '#0a0515',
    fog: { color: '#0a0a20', near: 40, far: 250 },
    ambientLight: { intensity: 0.2, color: '#ff00ff' },
    directionalLight: { intensity: 0.6, color: '#00ffff', position: [30, 80, 40] },
    terrain: {
      color: '#1a1a2a',
      roughness: 0.3,
      metalness: 0.7,
      displacement: 3,
    },
    markers: {
      defaultColor: '#ff00ff',
      visitedColor: '#00ffff',
      currentColor: '#ffff00',
      glowColor: '#ff00ff',
    },
    postProcessing: {
      bloom: { intensity: 0.8, threshold: 0.4 },
      vignette: { darkness: 0.5 },
      chromaticAberration: { offset: 0.003 },
    },
  },

  LOVECRAFT_HORROR: {
    skybox: 'night',
    backgroundColor: '#050508',
    fog: { color: '#0a0a15', near: 20, far: 150 },
    ambientLight: { intensity: 0.1, color: '#8888aa' },
    directionalLight: { intensity: 0.3, color: '#aaaacc', position: [20, 40, 30] },
    terrain: {
      color: '#1a1a20',
      roughness: 1.0,
      metalness: 0.1,
      displacement: 8,
    },
    markers: {
      defaultColor: '#4a4a6a',
      visitedColor: '#2a4a2a',
      currentColor: '#8a6a8a',
      glowColor: '#6a2a6a',
    },
    postProcessing: {
      bloom: { intensity: 0.15, threshold: 0.95 },
      vignette: { darkness: 0.8 },
      chromaticAberration: { offset: 0.004 },
    },
  },

  CUSTOM: {
    skybox: 'studio',
    backgroundColor: '#1a1a1a',
    fog: { color: '#2a2a2a', near: 60, far: 300 },
    ambientLight: { intensity: 0.4 },
    directionalLight: { intensity: 0.8, position: [50, 100, 50] },
    terrain: {
      color: '#3a3a3a',
      roughness: 0.8,
      metalness: 0.2,
      displacement: 10,
    },
    markers: {
      defaultColor: '#c9a84c',
      visitedColor: '#6a8a6a',
      currentColor: '#f5c842',
      glowColor: '#ffd700',
    },
    postProcessing: {
      bloom: { intensity: 0.3, threshold: 0.8 },
      vignette: { darkness: 0.4 },
    },
  },
}

/**
 * Obtiene el ambiente para un lore específico
 */
export function getLoreEnvironment(lore: Lore): LoreEnvironment {
  return LORE_ENVIRONMENTS[lore] || LORE_ENVIRONMENTS.CUSTOM
}
