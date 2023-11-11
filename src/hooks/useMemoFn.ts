import { useCallback, useRef } from 'react'

export default function useMemoFn<F extends (...args: unknown[]) => unknown>(
  func: F,
) {
  const ref = useRef<F>()
  ref.current = func

  return useCallback((...args: unknown[]) => ref.current!(...args), []) as F
}
