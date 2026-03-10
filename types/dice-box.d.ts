/**
 * Type declarations for @3d-dice/dice-box
 * Esta librería no tiene tipos incluidos
 */

declare module '@3d-dice/dice-box' {
  interface DiceBoxConfig {
    assetPath?: string
    theme?: string
    themeColor?: string
    scale?: number
    gravity?: number
    mass?: number
    friction?: number
    restitution?: number
    linearDamping?: number
    angularDamping?: number
    spinForce?: number
    throwForce?: number
    startingHeight?: number
    settleTimeout?: number
    offscreen?: boolean
    delay?: number
  }

  interface DieResult {
    value: number
    sides: number
    groupId?: string
    rollId?: string
  }

  class DiceBox {
    constructor(container: string | HTMLElement, config?: DiceBoxConfig)

    init(): Promise<void>
    roll(notation: string | string[]): Promise<DieResult[]>
    add(notation: string | string[]): Promise<DieResult[]>
    reroll(notation: string | string[]): Promise<DieResult[]>
    clear(): void
    hide(): void
    show(): void

    onRollComplete?: (results: DieResult[]) => void
    onRemoveComplete?: (results: DieResult[]) => void
    onDieComplete?: (result: DieResult) => void
  }

  export default DiceBox
}
