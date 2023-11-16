import { Class, ClassArray, InstanceArray, UndefinedArray } from './types'

class Component {}

abstract class System<C extends Component[] = Component[]> {
  *query(iterator: IterableIterator<Entity>) {
    for (const entity of iterator) {
      const components = entity.get(...this.components)
      if (components.every(c => c !== undefined)) yield [...components, entity]
    }
  }

  abstract readonly components: Readonly<ClassArray<C>>

  abstract update(
    iterator: Generator<[...C, Entity], void>,
  ): void | (() => void)
}

class Entity {
  private readonly components = new Map<Class<Component>, Component>()

  constructor(
    public readonly name = '',
    ...components: Component[]
  ) {
    this.add(...components)
  }

  add(...components: Component[]) {
    components.forEach(component =>
      this.components.set(component.constructor as Class<Component>, component),
    )
    return this
  }

  has(...Components: Class<Component>[]) {
    return Components.every(Component => this.components.has(Component))
  }

  remove(...Components: Class<Component>[]) {
    Components.forEach(Component => this.components.delete(Component))
    return this
  }

  get<CA extends Class<Component>[]>(...Components: CA) {
    return Components.map(Component =>
      this.components.get(Component),
    ) as UndefinedArray<InstanceArray<CA>>
  }
}

interface Coord<T = number> {
  x: T
  y: T
}

class PosComponent extends Component implements Coord {
  constructor(
    public x: number,
    public y: number,
    public size: number,
  ) {
    super()
  }
}

class ElementComponent extends Component {
  constructor(
    public readonly element: HTMLElement = document.createElement('div'),
  ) {
    super()
  }
}

class PhysicComponent extends Component {
  f: Coord
  v: Coord
  m: number
  fr: [number, number][]
  constructor({
    m = 1,
    fr = [],
    f = { x: 0, y: 0 },
    v = { x: 0, y: 0 },
  }: Partial<PhysicComponent> = {}) {
    super()
    this.f = f
    this.v = v
    this.m = m
    this.fr = fr
  }
}

class SpringComponent extends Component {
  l: number
  k: [number, number]
  to: Entity
  static: boolean
  constructor(
    to: Entity,
    {
      l = 0,
      k = [1, 0],
      static: s = true,
    }: Partial<Omit<SpringComponent, 'to'>> = {},
  ) {
    super()
    this.to = to
    this.static = s
    this.k = k
    this.l = l
  }
}

class RenderSystem extends System<[ElementComponent, PosComponent]> {
  components = [ElementComponent, PosComponent] as const

  update(
    iterator: Generator<[ElementComponent, PosComponent, Entity], void>,
  ): void {
    for (const [{ element }, { x, y, size }] of iterator) {
      element.attributeStyleMap.set('--x', `${x}`)
      element.attributeStyleMap.set('--y', `${y}`)
      element.attributeStyleMap.set('--size', `${size}`)
    }
  }
}

class SpringSystem extends System<
  [SpringComponent, PhysicComponent, PosComponent]
> {
  components = [SpringComponent, PhysicComponent, PosComponent] as const

  update(
    iterator: Generator<
      [SpringComponent, PhysicComponent, PosComponent, Entity],
      void
    >,
  ) {
    const shouldClear: [PhysicComponent, number, number][] = []
    for (const [s, ph1, pos1] of iterator) {
      const [ph2, pos2] = s.to.get(PhysicComponent, PosComponent)
      if (ph2 === undefined || pos2 === undefined) throw new Error('绑定错误')
      const dx = pos1.x - pos2.x,
        dy = pos1.y - pos2.y,
        d = Math.sqrt(dx * dx + dy * dy),
        f = Math.pow(Math.abs(d - s.l), s.k[1]) * s.k[0]

      if (f < Number.EPSILON) continue

      const r = Math.abs(Math.atan(dy / dx)),
        fx = f * Math.cos(r) * (d < s.l ? 1 : -1) * (dx < 0 ? -1 : 1),
        fy = f * Math.sin(r) * (d < s.l ? 1 : -1) * (dy < 0 ? -1 : 1)

      ph1.f.x += fx
      ph1.f.y += fy
      shouldClear.push([ph1, fx, fy])
      if (!s.static) {
        ph2.f.x -= fx
        ph2.f.y -= fy
        shouldClear.push([ph2, -fx, -fy])
      }
    }
    return () =>
      shouldClear.splice(0).forEach(([c, fx, fy]) => {
        c.f.x -= fx
        c.f.y -= fy
      })
  }
}

class PhysicSystem extends System<[PhysicComponent, PosComponent]> {
  components = [PhysicComponent, PosComponent] as const
  constructor(public t = 1 / 60) {
    super()
  }

  update(
    iterator: Generator<[PhysicComponent, PosComponent, Entity], void>,
  ): void {
    for (const [ph, pos] of iterator) {
      const a: Coord = { x: ph.f.x / ph.m, y: ph.f.y / ph.m }

      ;(ph.v.x || ph.v.y) &&
        ph.fr.forEach(([f, p]) => {
          ph.v.x &&
            (a.x -= f * Math.pow(Math.abs(ph.v.x), p) * (ph.v.x < 0 ? -1 : 1))
          ph.v.y &&
            (a.y -= f * Math.pow(Math.abs(ph.v.y), p) * (ph.v.y < 0 ? -1 : 1))
        })

      const vx = ph.v.x + a.x * this.t,
        vy = ph.v.y + a.y * this.t
      ph.v.x = ph.v.x * vx < 0 ? 0 : vx
      ph.v.y = ph.v.y * vy < 0 ? 0 : vy

      pos.x += ph.v.x * this.t
      pos.y += ph.v.y * this.t
    }
  }
}

export { PhysicSystem, RenderSystem, SpringSystem }

export {
  Component,
  PosComponent,
  ElementComponent,
  PhysicComponent,
  SpringComponent,
  System,
  Entity,
}

export type { Coord }
