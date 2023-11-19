import { Component, Entity, System } from './core'

class HealthComponent extends Component {
  static onHit(
    this: void,
    entity: Entity,
    health: HealthComponent,
    hit: HitComponent,
  ): void {
    health.hp -= hit.damage
    if (health.hp <= 0) health.onDie(entity)
    else {
      const [health] = entity.get(HealthComponent)
      entity.remove(HealthComponent)
      setTimeout(() => entity.add(health!), hit.inv_dur)
    }
    entity.remove(HitComponent)
  }

  public onHit: (
    entity: Entity,
    health: HealthComponent,
    hit: HitComponent,
  ) => void

  public onDie: (entity: Entity) => void
  public hp: number

  constructor({
    hp = 1,
    onHit = HealthComponent.onHit,
    onDie = entity => entity.destroy(),
  }: Partial<HealthComponent> = {}) {
    super()
    this.hp = hp
    this.onHit = onHit
    this.onDie = onDie
  }
}

class HealthSystem extends System<[HealthComponent]> {
  components = [HealthComponent] as const

  update(iterator: Generator<[HealthComponent, Entity], void, unknown>): void {
    for (const [health, entity] of iterator) {
      const [hit] = entity.get(HitComponent)
      if (hit) health.onHit(entity, health, hit)
    }
  }
}

class HitComponent extends Component {
  constructor(
    public readonly damage = 1,
    public readonly inv_dur = 500,
  ) {
    super()
  }
}

export { HealthComponent, HealthSystem, HitComponent }
