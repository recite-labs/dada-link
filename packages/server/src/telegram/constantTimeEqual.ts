/**
 * Compares two secrets without short-circuiting on the first differing
 * character, so response timing does not reveal how much of a guess matched.
 */
export const constantTimeEqual = (a: string, b: string): boolean => {
  const left = new TextEncoder().encode(a)
  const right = new TextEncoder().encode(b)
  let diff = left.length ^ right.length
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0)
  }
  return diff === 0
}
