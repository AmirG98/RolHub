/**
 * Layout Store - Gestión de preferencias de layout del usuario
 * Usa Zustand con persistencia en localStorage
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ModuleId =
  | 'party-tracker'
  | 'quest-log'
  | 'narrator'
  | 'action-input'
  | 'map'
  | 'dm-avatar'
  | 'immersion'

export type ColumnId = 'left' | 'center' | 'right'

export interface LayoutModule {
  id: ModuleId
  column: ColumnId
  order: number
  visible: boolean
  collapsed: boolean
}

export interface PanelSizes {
  left: number
  center: number
  right: number
}

interface LayoutState {
  // State
  modules: LayoutModule[]
  panelSizes: PanelSizes
  isMobile: boolean
  isCustomizing: boolean

  // Actions
  setModules: (modules: LayoutModule[]) => void
  setPanelSizes: (sizes: PanelSizes) => void
  setIsMobile: (isMobile: boolean) => void
  setIsCustomizing: (isCustomizing: boolean) => void
  moveModule: (moduleId: ModuleId, toColumn: ColumnId, toIndex: number) => void
  toggleModuleVisibility: (moduleId: ModuleId) => void
  toggleModuleCollapsed: (moduleId: ModuleId) => void
  reorderModulesInColumn: (column: ColumnId, orderedIds: ModuleId[]) => void
  resetLayout: () => void
}

const DEFAULT_MODULES: LayoutModule[] = [
  { id: 'party-tracker', column: 'left', order: 0, visible: true, collapsed: false },
  { id: 'quest-log', column: 'left', order: 1, visible: true, collapsed: false },
  { id: 'narrator', column: 'center', order: 0, visible: true, collapsed: false },
  { id: 'action-input', column: 'center', order: 1, visible: true, collapsed: false },
  { id: 'map', column: 'right', order: 0, visible: true, collapsed: false },
  { id: 'immersion', column: 'right', order: 1, visible: true, collapsed: false },
  { id: 'dm-avatar', column: 'right', order: 2, visible: true, collapsed: false },
]

const DEFAULT_PANEL_SIZES: PanelSizes = {
  left: 20,
  center: 50,
  right: 30,
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      // Initial state
      modules: DEFAULT_MODULES,
      panelSizes: DEFAULT_PANEL_SIZES,
      isMobile: false,
      isCustomizing: false,

      // Actions
      setModules: (modules) => set({ modules }),

      setPanelSizes: (panelSizes) => set({ panelSizes }),

      setIsMobile: (isMobile) => set({ isMobile }),

      setIsCustomizing: (isCustomizing) => set({ isCustomizing }),

      moveModule: (moduleId, toColumn, toIndex) => {
        const { modules } = get()
        const moduleIndex = modules.findIndex((m) => m.id === moduleId)
        if (moduleIndex === -1) return

        const updatedModules = [...modules]
        const [movedModule] = updatedModules.splice(moduleIndex, 1)

        // Update module's column
        movedModule.column = toColumn

        // Get modules in target column and reorder
        const columnModules = updatedModules
          .filter((m) => m.column === toColumn)
          .sort((a, b) => a.order - b.order)

        // Insert at new position
        columnModules.splice(toIndex, 0, movedModule)

        // Update order values
        columnModules.forEach((m, i) => {
          m.order = i
        })

        // Rebuild modules array
        const newModules = updatedModules
          .filter((m) => m.column !== toColumn)
          .concat(columnModules)

        set({ modules: newModules })
      },

      toggleModuleVisibility: (moduleId) => {
        const { modules } = get()
        set({
          modules: modules.map((m) =>
            m.id === moduleId ? { ...m, visible: !m.visible } : m
          ),
        })
      },

      toggleModuleCollapsed: (moduleId) => {
        const { modules } = get()
        set({
          modules: modules.map((m) =>
            m.id === moduleId ? { ...m, collapsed: !m.collapsed } : m
          ),
        })
      },

      reorderModulesInColumn: (column, orderedIds) => {
        const { modules } = get()
        const columnModules = modules.filter((m) => m.column === column)
        const otherModules = modules.filter((m) => m.column !== column)

        const reorderedColumnModules = orderedIds
          .map((id, index) => {
            const module = columnModules.find((m) => m.id === id)
            if (module) {
              return { ...module, order: index }
            }
            return null
          })
          .filter((m): m is LayoutModule => m !== null)

        set({ modules: [...otherModules, ...reorderedColumnModules] })
      },

      resetLayout: () => {
        set({
          modules: DEFAULT_MODULES,
          panelSizes: DEFAULT_PANEL_SIZES,
        })
      },
    }),
    {
      name: 'rolhub-layout-preferences',
      version: 1,
    }
  )
)

// Helper functions
export function getModulesForColumn(
  modules: LayoutModule[],
  column: ColumnId
): LayoutModule[] {
  return modules
    .filter((m) => m.column === column && m.visible)
    .sort((a, b) => a.order - b.order)
}

export function getModuleName(moduleId: ModuleId): string {
  const names: Record<ModuleId, string> = {
    'party-tracker': 'Grupo',
    'quest-log': 'Misiones',
    narrator: 'Narrador',
    'action-input': 'Acciones',
    map: 'Mapa',
    'dm-avatar': 'DM Avatar',
    immersion: 'Inmersión',
  }
  return names[moduleId] || moduleId
}

export function getModuleIcon(moduleId: ModuleId): string {
  const icons: Record<ModuleId, string> = {
    'party-tracker': '👥',
    'quest-log': '📜',
    narrator: '📖',
    'action-input': '⚔️',
    map: '🗺️',
    'dm-avatar': '🧙',
    immersion: '🎭',
  }
  return icons[moduleId] || '📦'
}
