import {
  Entity,
  System,
  SpringSystem,
  EnemySystem,
  PhysicSystem,
  RenderSystem,
  Component,
} from '.'
import { CollisionSystem } from './collision'

class World {
  entities = new Set<Entity>()

  constructor(
    public readonly systems: Record<
      string,
      System<
        [Component] | [Component, Component] | [Component, Component, Component]
      >
    >,
  ) {}

  createEntity(name = '', ...components: Component[]) {
    const entity = new Entity(name, ...components)
    this.entities.add(entity)
    return entity
  }

  end = false

  loop() {
    if (this.end) return
    Object.values(this.systems)
      .map(s => s.update(s.query(this.entities.values()) as never))
      .reverse()
      .forEach(f => f?.())
  }
}

const world = new World({
  spring: new SpringSystem(),
  enemy: new EnemySystem(),
  collision: new CollisionSystem(),
  physic: new PhysicSystem(1 / 6),
  render: new RenderSystem(),
})

export { world }
