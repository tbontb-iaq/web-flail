import './index.scss'

import useMap from '@/hooks/useMap'
import random from '@/utils/random'
import React, { JSX, useCallback, useEffect, useRef } from 'react'

type MButtonProps = Omit<JSX.IntrinsicElements['button'], 'ref'>

interface RippleInfo {
  x: number
  y: number
  scale: number
  end?: boolean
}

export default function MButton(props: MButtonProps) {
  const holding = useRef(false),
    shouldEnd = useRef<string[]>([]),
    rippleMap = useMap<string, RippleInfo>(),
    buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(
    () =>
      (['pointerleave', 'pointerup'] as (keyof HTMLElementEventMap)[]).forEach(
        e =>
          buttonRef.current?.addEventListener(e, () => {
            holding.current = false
            shouldEnd.current
              .splice(0)
              .forEach(k => (rippleMap.get(k)!.end = true))
          }),
      ),
    [rippleMap],
  )

  const onAnimationEnd = useCallback<
      React.AnimationEventHandler<HTMLDivElement>
    >(
      ev => {
        const el = ev.currentTarget,
          k = el.dataset.key!,
          r = rippleMap.get(k)!

        if (r.end) rippleMap.delete(k)
        else if (!holding.current) r.end = true
        else shouldEnd.current.push(k)
      },
      [rippleMap],
    ),
    onPointerDown = useCallback<React.PointerEventHandler<HTMLButtonElement>>(
      ev => {
        props.onPointerDown?.(ev)

        holding.current = true
        if (buttonRef.current === null) return

        const { left, right, top, bottom } =
            buttonRef.current.getBoundingClientRect(),
          { clientX, clientY } = ev,
          wx = clientX < (left + right) / 2 ? right - clientX : clientX - left,
          wy = clientY < (top + bottom) / 2 ? bottom - clientY : clientY - top

        rippleMap.set(random.str(), {
          x: clientX - left,
          y: clientY - top,
          scale: Math.sqrt(wx * wx + wy * wy),
        })
      },
      [props, rippleMap],
    )

  const ripples = Array.from(rippleMap.entries()).map(([k, r]) => (
    <div
      key={k}
      data-key={k}
      onAnimationEnd={onAnimationEnd}
      className={`ripple ${r.end ? 'end' : ''}`}
      style={{ '--x': r.x, '--y': r.y, '--scale': r.scale }}
    />
  ))

  return (
    <button
      {...props}
      ref={buttonRef}
      onPointerDown={onPointerDown}
      className={`material-button ${props.className ?? ''}`}
    >
      <div className='ripple-container' children={ripples} />
      {props.children}
    </button>
  )
}
