import { createRegExp, charIn, global } from 'magic-regexp'

export default function (id?: string): string | undefined {
  return id?.replace(createRegExp(charIn('-'), [global]), '')
}
