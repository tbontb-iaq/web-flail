import {
  world,
  Coord,
  PosComponent,
  ElementComponent,
  PhysicComponent,
  SpringComponent,
  EnemyComponent,
  Entity,
} from '@/game'
import style from './index.module.scss'
import { useRef, useEffect } from 'react'
import random from '@/utils/random'
import { CollisionComponent } from '@/game/collision'

export default function Index() {
  const containerRef = useRef<HTMLDivElement>(null),
    playerRef = useRef<HTMLDivElement>(null),
    hammerRef = useRef<HTMLDivElement>(null),
    enemyRef = useRef<HTMLDivElement>(null),
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
      new PhysicComponent({
        fr: [
          [0.05, 2],
          [0.05, 0],
        ],
      }),
    )

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
          [0.2, 1],
          [0.01, 0],
        ],
      }),
      new SpringComponent(playerEntity.current, {
        k: [0.008, 2],
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
    const maxEnemy = 100
    setInterval(() => {
      if (
        Array.from(world.entities.values()).filter(e => e.has(EnemyComponent))
          .length < maxEnemy
      ) {
        const { offsetWidth: w, offsetHeight: h } = containerRef.current!,
          r = random.int(4),
          enemy = world.createEntity(
            'enemy',
            new PhysicComponent(),
            new ElementComponent(),
            new PosComponent(
              r % 2 === 0
                ? r === 0
                  ? random.int(w * 0.1)
                  : random.int(w * 0.9, w)
                : random.int(w),
              r % 2 !== 0
                ? r === 1
                  ? random.int(h * 0.1)
                  : random.int(h * 0.9, h)
                : random.int(h),
              10,
            ),
          )
        enemyRef.current?.appendChild(enemy.get(ElementComponent)[0]!.element)

        setTimeout(
          () =>
            enemy.add(
              new EnemyComponent(playerEntity.current!, { v: 5 }),
              new CollisionComponent([
                [
                  hammerEntity.current!,
                  enemy => {
                    const [el] = enemy.get(ElementComponent)
                    el?.element.remove()
                    world.entities.delete(enemy)
                  },
                ],
                [
                  playerEntity.current!,
                  () => {
                    world.end = true
                    alert('You die!')
                  },
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
      if (i++ % 60 === 0) console.time()
      world.loop()
      if (i % 60 === 59) console.timeEnd()
      if (notEnd) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)

    return () => void (notEnd = false)
  }, [])

  return (
    <div className={style.container} ref={containerRef} tabIndex={0}>
      <div ref={enemyRef} className={style.enemy} />
      <div ref={hammerRef} className={style.hammer} />
      <div ref={playerRef} className={style.player} />
    </div>
  )
}
