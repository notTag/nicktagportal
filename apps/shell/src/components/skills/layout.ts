/**
 * Each logo sits in a square cell larger than the logo itself, leaving room for
 * the hover lift and glow to render without being clipped by the neighbouring
 * cell. Shared by the wall, the row and the logo so the three never disagree
 * about spacing.
 */
export const LOGO_CELL_RATIO = 1.25

export const LOGO_CELL_GAP_PX = 4

export function cellSizeFor(logoSize: number): number {
  return Math.ceil(logoSize * LOGO_CELL_RATIO)
}
