export interface Skill {
  name: string
  displayName: string
  iconPath: string
  category: string
  years: number
  invertInDark?: boolean
  invertInLight?: boolean
}

/** Format years for display — caps at "10+" for values over 10 */
export function formatYears(years: number): string {
  return years > 10 ? '10+' : String(years)
}

export type ProficiencyMode = 'uniform' | 'glow' | 'size' | 'fill'

export const PROFICIENCY_MODES: { id: ProficiencyMode; label: string }[] = [
  { id: 'uniform', label: 'Uniform' },
  { id: 'glow', label: 'Glow' },
  { id: 'size', label: 'Size' },
  { id: 'fill', label: 'Fill' },
]
