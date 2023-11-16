type Class<C> = new (...args: never) => C

type InstanceArray<CA extends Class<unknown>[]> = CA extends [
  infer C extends Class<unknown>,
  ...infer R extends Class<unknown>[],
]
  ? [InstanceType<C>, ...InstanceArray<R>]
  : []

type UndefinedArray<A extends unknown[]> = A extends [
  infer T,
  ...infer R extends unknown[],
]
  ? [T | undefined, ...UndefinedArray<R>]
  : []

type ClassArray<CA extends unknown[]> = CA extends [
  infer C,
  ...infer R extends unknown[],
]
  ? [Class<C>, ...ClassArray<R>]
  : []

export type { Class, InstanceArray, UndefinedArray, ClassArray }
