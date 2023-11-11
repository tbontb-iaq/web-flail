import { useCallback, useState } from 'react'

export interface Rerender {
  (): void
  <T>(update: () => T): T
}

export default function useRerender() {
  const [, setCount] = useState(0)

  return useCallback<Rerender>(<T>(update?: () => T) => {
    setCount(c => c + 1)
    return update?.()
  }, [])
}
