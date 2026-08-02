/**
 * Motion preference check, guarded for non-browser and test environments where
 * `matchMedia` may be absent.
 *
 * This gates *continuous, involuntary* motion only — the scrolling marquee and
 * the page entrance. Brief user-initiated feedback (a hover lift, a tooltip
 * fade) stays on, because removing it leaves interactive elements with no
 * response at all, which is its own accessibility problem.
 */
// ponytail: read at animation start, so flipping the OS setting mid-session
// does not stop animations already running. Add a `change` listener and a
// cancel path in each consumer if that matters.
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
