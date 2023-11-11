import { useMemo } from 'react'
import useRerender, { Rerender } from './useRerender'

type MapParam<K, V> = ConstructorParameters<typeof Map<K, V>>

class RMap<K, V> extends Map<K, V> {
  constructor(
    private rerender: Rerender,
    ...args: MapParam<K, V>
  ) {
    super(...args)
  }

  clear(): void {
    return this.rerender(() => super.clear())
  }

  delete(key: K): boolean {
    return this.rerender(() => super.delete(key))
  }

  forEach(
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
    thisArg?: unknown,
  ): void {
    return this.rerender(() => super.forEach(callbackfn, thisArg))
  }

  get(key: K): V | undefined {
    return this.rerender(() => super.get(key))
  }

  set(key: K, value: V): this {
    return this.rerender(() => super.set(key, value))
  }

  // [Symbol.iterator](): IterableIterator<[K, V]> {
  //   return this.rerender(() => super[Symbol.iterator]())
  // }
}

export default function useMap<K, V>(...args: MapParam<K, V>) {
  const rerender = useRerender()

  return useMemo(
    () => new RMap(rerender, ...args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rerender, ...args],
  )
}
