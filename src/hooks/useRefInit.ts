import { MutableRefObject, useEffect, useRef } from 'react'

export default function useRefInit<T>(init: () => T) {
  const ref = useRef<T>()

  useEffect(
    () => void (ref.current === undefined && (ref.current = init())),
    [init],
  )

  return ref as MutableRefObject<T>
}
