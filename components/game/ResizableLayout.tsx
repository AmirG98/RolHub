'use client'

import { useEffect, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from 'react-resizable-panels'
import { Settings2, RotateCcw, Check } from 'lucide-react'
import {
  useLayoutStore,
  getModulesForColumn,
  type ColumnId,
  type ModuleId,
} from '@/lib/stores/layout-store'
import { DraggableModule, StaticModule } from './DraggableModule'
import { cn } from '@/lib/utils'

interface ResizableLayoutProps {
  leftContent: Record<ModuleId, React.ReactNode>
  centerContent: Record<ModuleId, React.ReactNode>
  rightContent: Record<ModuleId, React.ReactNode>
}

export function ResizableLayout({
  leftContent,
  centerContent,
  rightContent,
}: ResizableLayoutProps) {
  const {
    modules,
    panelSizes,
    isMobile,
    isCustomizing,
    setIsMobile,
    setIsCustomizing,
    setPanelSizes,
    moveModule,
    reorderModulesInColumn,
    resetLayout,
  } = useLayoutStore()

  const [activeId, setActiveId] = useState<ModuleId | null>(null)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsMobile])

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Get modules for each column
  const leftModules = getModulesForColumn(modules, 'left')
  const centerModules = getModulesForColumn(modules, 'center')
  const rightModules = getModulesForColumn(modules, 'right')

  // Content mapping
  const allContent: Record<ModuleId, React.ReactNode> = {
    ...leftContent,
    ...centerContent,
    ...rightContent,
  }

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as ModuleId)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeModuleId = active.id as ModuleId
    const overModuleId = over.id as ModuleId

    if (activeModuleId === overModuleId) return

    // Find the columns of both modules
    const activeModule = modules.find((m) => m.id === activeModuleId)
    const overModule = modules.find((m) => m.id === overModuleId)

    if (!activeModule || !overModule) return

    if (activeModule.column === overModule.column) {
      // Reorder within same column
      const columnModules = modules
        .filter((m) => m.column === activeModule.column)
        .sort((a, b) => a.order - b.order)

      const ids = columnModules.map((m) => m.id)
      const oldIndex = ids.indexOf(activeModuleId)
      const newIndex = ids.indexOf(overModuleId)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newIds = [...ids]
        newIds.splice(oldIndex, 1)
        newIds.splice(newIndex, 0, activeModuleId)
        reorderModulesInColumn(activeModule.column, newIds)
      }
    } else {
      // Move to different column
      const targetColumn = overModule.column
      const targetColumnModules = modules
        .filter((m) => m.column === targetColumn)
        .sort((a, b) => a.order - b.order)
      const newIndex = targetColumnModules.findIndex((m) => m.id === overModuleId)
      moveModule(activeModuleId, targetColumn, newIndex)
    }
  }

  // Panel size change handler
  const handlePanelResize = (layout: { [id: string]: number }) => {
    if (layout.left !== undefined && layout.center !== undefined && layout.right !== undefined) {
      setPanelSizes({
        left: layout.left,
        center: layout.center,
        right: layout.right,
      })
    }
  }

  // Render column content
  const renderColumn = (
    columnId: ColumnId,
    columnModules: typeof leftModules,
    content: Record<ModuleId, React.ReactNode>
  ) => {
    const moduleIds = columnModules.map((m) => m.id)

    return (
      <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 h-full">
          {columnModules.map((module) => {
            const moduleContent = content[module.id]
            if (!moduleContent) return null

            return (
              <DraggableModule
                key={module.id}
                moduleId={module.id}
                collapsed={module.collapsed}
                className="glass-panel"
              >
                {moduleContent}
              </DraggableModule>
            )
          })}
        </div>
      </SortableContext>
    )
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 p-3 h-full overflow-y-auto">
        {/* Narrator always first on mobile */}
        {centerModules.map((module) => (
          <StaticModule
            key={module.id}
            moduleId={module.id}
            collapsed={module.collapsed}
            className="glass-panel"
          >
            {allContent[module.id]}
          </StaticModule>
        ))}

        {/* Then side panels collapsed */}
        {[...leftModules, ...rightModules].map((module) => (
          <StaticModule
            key={module.id}
            moduleId={module.id}
            collapsed={module.collapsed}
            className="glass-panel"
          >
            {allContent[module.id]}
          </StaticModule>
        ))}
      </div>
    )
  }

  // Desktop layout with resizable panels
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-end gap-2 px-3 py-2 border-b border-gold-dim/20">
          {isCustomizing ? (
            <>
              <button
                onClick={resetLayout}
                className="flex items-center gap-1 px-3 py-1 text-xs font-ui text-parchment/60 hover:text-parchment transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
              <button
                onClick={() => setIsCustomizing(false)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-ui bg-emerald/20 text-emerald rounded hover:bg-emerald/30 transition-colors"
              >
                <Check className="h-3 w-3" />
                Listo
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsCustomizing(true)}
              className="flex items-center gap-1 px-3 py-1 text-xs font-ui text-gold-dim hover:text-gold transition-colors"
            >
              <Settings2 className="h-3 w-3" />
              Personalizar
            </button>
          )}
        </div>

        {/* Resizable panels */}
        <PanelGroup
          orientation="horizontal"
          onLayoutChange={handlePanelResize}
          className="flex-1"
        >
          {/* Left panel */}
          <Panel
            id="left"
            defaultSize={panelSizes.left}
            minSize={15}
            maxSize={40}
            className="p-3"
          >
            {renderColumn('left', leftModules, allContent)}
          </Panel>

          <PanelResizeHandle className="w-1 bg-gold-dim/10 hover:bg-gold-dim/30 transition-colors cursor-col-resize" />

          {/* Center panel */}
          <Panel
            id="center"
            defaultSize={panelSizes.center}
            minSize={30}
            className="p-3"
          >
            {renderColumn('center', centerModules, allContent)}
          </Panel>

          <PanelResizeHandle className="w-1 bg-gold-dim/10 hover:bg-gold-dim/30 transition-colors cursor-col-resize" />

          {/* Right panel */}
          <Panel
            id="right"
            defaultSize={panelSizes.right}
            minSize={15}
            maxSize={40}
            className="p-3"
          >
            {renderColumn('right', rightModules, allContent)}
          </Panel>
        </PanelGroup>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeId ? (
          <div className="glass-panel rounded-lg p-4 shadow-xl opacity-80">
            <span className="text-sm text-gold">{activeId}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
