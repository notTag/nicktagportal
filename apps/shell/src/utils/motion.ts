/**
 * Motion preference check, guarded for non-browser and test environments where
 * `matchMedia` may be absent.
 */
// ponytail: read at animation start, so flipping the OS setting mid-session
// does not stop animations already running. Add a `change` listener and a
// cancel path in each consumer if that matters.
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
