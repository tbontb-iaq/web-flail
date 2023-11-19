import { Component, Coord, Entity, PosComponent, System } from './core'

class CollisionComponent extends Component {
  constructor(public readonly callbacks: [Entity, (entity: Entity) => void][]) {
    super()
  }
}

class CollisionSystem extends System<[CollisionComponent, PosComponent]> {
  components = [CollisionComponent, PosComponent] as const

  private static distance(pos1: Coord, pos2: Coord) {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2),
    )
  }

  update(
    iterator: Generator<[CollisionComponent, PosComponent, Entity], void>,
  ): void | (() => void) {
    for (const [{ callbacks }, pos, entity] of iterator) {
      callbacks.forEach(([target, callback]) => {
        const [target_pos] = target.get(PosComponent)
        if (target_pos === undefined) throw new Error('绑定错误')
        if (
          CollisionSystem.distance(target_pos, pos) <
          pos.size + target_pos.size
        )
          callback(entity)
      })
    }
  }
}

export { CollisionComponent, CollisionSystem }
