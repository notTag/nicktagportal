/**
 * Motion preference check, guarded for non-browser and test environments where
 * `matchMedia` may be absent.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
