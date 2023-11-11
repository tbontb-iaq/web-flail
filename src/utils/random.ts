// [0, max)
function int(max: number): number
// [min, max)
function int(min: number, max: number): number

function int(arg1: number, arg2?: number): number {
  return arg2 ? Math.floor(Math.random() * (arg2 - arg1) + arg1) : int(0, arg1)
}

const defaultChars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function char(chars = defaultChars) {
  return chars.charAt(int(chars.length))
}

function str(length = 8, chars?: string): string {
  return Array.from({ length }, () => char(chars)).join('')
}

const random = { int, char, str }
export { int, char, str }
export default random
