import {
  Component,
  Entity,
  PhysicComponent,
  PosComponent,
  System,
} from './core'

class EnemyComponent extends Component {
  readonly v: number
  constructor(
    public readonly player: Entity,
    { v = 1 }: Partial<Omit<EnemyComponent, 'player'>> = {},
  ) {
    super()
    this.v = v
  }
}

class EnemySystem extends System<
  [EnemyComponent, PhysicComponent, PosComponent]
> {
  components = [EnemyComponent, PhysicComponent, PosComponent] as const

  update(
    iterator: Generator<
      [EnemyComponent, PhysicComponent, PosComponent, Entity],
      void,
      unknown
    >,
  ): void {
    for (const [{ player, v }, ph, { x: x1, y: y1 }] of iterator) {
      const { x: x2, y: y2 } = player.get(PosComponent)[0]!,
        r = Math.atan(Math.abs(y1 - y2) / Math.abs(x1 - x2))
      ph.v.x = Math.cos(r) * v * (x1 > x2 ? -1 : 1)
      ph.v.y = Math.sin(r) * v * (y1 > y2 ? -1 : 1)
    }
  }
}

export { EnemyComponent, EnemySystem }
