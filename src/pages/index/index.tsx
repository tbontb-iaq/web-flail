import {
  world,
  Coord,
  PosComponent,
  ElementComponent,
  PhysicComponent,
  SpringComponent,
  EnemyComponent,
  Entity,
  CollisionComponent,
} from '@/game'
import style from './index.module.scss'
import { useRef, useEffect } from 'react'
import random from '@/utils/random'
import { HealthComponent, HitComponent } from '@/game/health'

export default function Index() {
  const containerRef = useRef<HTMLDivElement>(null),
    playerRef = useRef<HTMLDivElement>(null),
    hammerRef = useRef<HTMLDivElement>(null),
    enemyRef = useRef<HTMLDivElement>(null),
    scoreRef = useRef<HTMLDivElement>(null),
    moveRef = useRef<HTMLDivElement>(null),
    playerEntity = useRef<Entity>(),
    hammerEntity = useRef<Entity>()

  useEffect(() => {
    if (
      playerRef.current === null ||
      hammerRef.current === null ||
      containerRef.current === null
    )
      return

    playerEntity.current = world.createEntity(
      'player',
      new ElementComponent(playerRef.current),
      new PosComponent(
        containerRef.current.offsetWidth / 2,
        containerRef.current.offsetHeight / 2,
        25 / 2,
      ),
      new HealthComponent({
        onDie: () => {
          world.end = true
          alert('Game Over')
        },
      }),
      new PhysicComponent({
        fr: [
          [0.05, 2],
          [1, 0],
        ],
      }),
    )

    // playerEntity.current.get(PhysicComponent)[0]!.f = new (class {
    //   _x = 0
    //   _y = 0
    //   trace = 0
    //   set x(x: number) {
    //     this._x = x
    //     if (this._x === this._y && this._x === 0 && this.trace < 2)
    //       console.trace(this.trace++)
    //   }
    //   get x() {
    //     return this._x
    //   }
    //   set y(y: number) {
    //     this._y = y
    //     if (this._x === this._y && this._x === 0 && this.trace < 2)
    //       console.trace(this.trace++)
    //   }
    //   get y() {
    //     return this._y
    //   }
    // })()

    hammerEntity.current = world.createEntity(
      'hammer',
      new ElementComponent(hammerRef.current),
      new PosComponent(
        containerRef.current.offsetWidth / 2,
        containerRef.current.offsetHeight / 2,
        25,
      ),
      new PhysicComponent({
        fr: [
          [0.0008, 2],
          [0.01, 0],
        ],
      }),
      new SpringComponent(playerEntity.current, {
        k: [0.02, 2],
        l: 0,
      }),
    )
  }, [])

  useEffect(() => {
    if (containerRef.current === null || playerEntity.current === undefined)
      return

    const force = 10,
      ph = playerEntity.current.get(PhysicComponent)[0]!,
      keyMap = new Map<string, [keyof Coord, number, boolean]>([
        ['ArrowUp', ['y', -1, true]],
        ['ArrowDown', ['y', 1, true]],
        ['ArrowLeft', ['x', -1, true]],
        ['ArrowRight', ['x', 1, true]],
      ])

    containerRef.current.addEventListener('keydown', ({ key }) => {
      const a = keyMap.get(key)
      if (a?.[2]) {
        const [k, v] = a
        ph.f[k] += v * force
        a[2] = false
      }
    })
    containerRef.current.addEventListener('keyup', ({ key }) => {
      const a = keyMap.get(key)
      if (a?.[2] === false) {
        const [k, v] = a
        ph.f[k] -= v * force
        a[2] = true
      }
    })
  }, [])

  useEffect(() => {
    if (moveRef.current === null) return
    const mobile = ['Mobile', 'Android', '']
    if (mobile.some(v => navigator.userAgent.includes(v))) {
      moveRef.current.classList.add('show')
      const size = moveRef.current.clientWidth / 2,
        [el, pos] = world
          .createEntity(
            'move',
            new ElementComponent(),
            new PosComponent(size, size, size),
          )
          .get(ElementComponent, PosComponent),
        [ph] = playerEntity.current!.get(PhysicComponent),
        f = 0.35

      moveRef.current.appendChild(el!.element)
      if (pos === undefined || ph === undefined) return

      addEventListener('pointermove', ev => {
        const { left, top } = moveRef.current!.getBoundingClientRect(),
          { clientX, clientY } = ev,
          dx = clientX - left - size,
          dy = clientY - top - size,
          d = Math.sqrt(dx * dx + dy * dy),
          x = d > size ? (size * dx) / d : dx,
          y = d > size ? (size * dy) / d : dy
        pos.x = x + size
        pos.y = y + size
        ph.f.x = x * f
        ph.f.y = y * f
        console.log(ph.f.x, ph.f.y)
      })
      ;(
        ['pointercancel', 'pointerup'] as (keyof HTMLElementEventMap)[]
      ).forEach(e =>
        addEventListener(e, () => {
          pos.x = size
          pos.y = size
          ph.f.x = 0
          ph.f.y = 0
        }),
      )
    }
  }, [])

  // useEffect(() => {
  //   const [ph] = playerEntity.current!.get(PhysicComponent),
  //     f = 5,
  //     freq = 60
  //   if (ph === undefined) return

  //   const la = new LinearAccelerationSensor({ frequency: freq })
  //   la.addEventListener('error', e => console.error(e))
  //   la.addEventListener('reading', () => {
  //     const { x = 0, y = 0 } = la
  //     ph.v.x += x * f
  //     ph.v.y += -y * f
  //   })
  //   la.start()
  //   // const listener: (ev: DeviceMotionEvent) => void = ev => {
  //   //   const { x, y } = ev.acceleration ?? {}
  //   //   ph.f.x = x ?? 0
  //   //   ph.f.y = y ?? 0
  //   // }
  //   // console.log('add event listener')

  //   // addEventListener('devicemotion', listener)
  //   // return () => removeEventListener('devicemotion', listener)
  // }, [])

  useEffect(() => {
    const maxEnemy = 50
    let score = 0
    setInterval(() => {
      if (
        Array.from(world.entities.values()).filter(e => e.has(EnemyComponent))
          .length < maxEnemy
      ) {
        const { offsetWidth: w, offsetHeight: h } = containerRef.current!,
          r = random.int(4),
          life = random.int(100),
          hp = life < 5 ? 3 : life < 15 ? 2 : 1,
          offset = 0.1,
          enemy = world.createEntity(
            'enemy',
            new PhysicComponent(),
            new ElementComponent({ className: `hp-${hp}` }),
            new PosComponent(
              r % 2 === 0
                ? r === 0
                  ? random.int(-w * offset, 0)
                  : random.int(w, w * (1 + offset))
                : random.int(-w * offset, w * (1 + offset)),
              r % 2 !== 0
                ? r === 1
                  ? random.int(-h * offset, 0)
                  : random.int(h, h * (1 + offset))
                : random.int(-h * offset, h * (1 + offset)),
              10,
            ),
          )
        enemyRef.current?.appendChild(enemy.get(ElementComponent)[0]!.element)

        setTimeout(
          () =>
            enemy.add(
              new EnemyComponent(playerEntity.current!, { v: 5 }),
              new HealthComponent({
                hp,
                onDie(entity) {
                  entity.destroy()
                  score += hp
                  scoreRef.current!.textContent = `${score}`
                },
                onHit: (entity, health, hit) => {
                  HealthComponent.onHit(entity, health, hit)
                  const [ph, el] = entity.get(PhysicComponent, ElementComponent)
                  entity.remove(PhysicComponent)
                  el!.element.className = `hp-${health.hp}`
                  setTimeout(() => entity.add(ph!), hit.inv_dur / 2)
                },
              }),
              new CollisionComponent([
                [
                  hammerEntity.current!,
                  enemy =>
                    enemy.has(HealthComponent) && enemy.add(new HitComponent()),
                ],
                [
                  playerEntity.current!,
                  () => playerEntity.current!.add(new HitComponent()),
                ],
              ]),
            ),
          1000,
        )
      }
    }, 1000)
  }, [])

  useEffect(() => {
    let notEnd = true,
      i = 0
    const update = () => {
      if (i++ % 60 === 59) console.time('world loop')
      world.loop()
      if (i % 60 === 0) console.timeEnd('world loop')
      if (notEnd) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)

    return () => void (notEnd = false)
  }, [])

  return (
    <div className={style.container} ref={containerRef} tabIndex={0}>
      <div ref={hammerRef} className={style.hammer} />
      <div ref={playerRef} className={style.player} />
      <div ref={enemyRef} className={style.enemy} />
      <div ref={scoreRef} className={style.score} />
      <div ref={moveRef} className={style.move} />
    </div>
  )
}
