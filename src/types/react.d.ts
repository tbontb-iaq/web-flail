import 'react'

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface CSSProperties {
    [index: `--${string}`]: unknown
  }
}
