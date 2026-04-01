export interface Skill {
  name: string
  displayName: string
  iconPath: string
  category: string
  years: number
}

export type ProficiencyMode = 'uniform' | 'glow' | 'size' | 'fill'

export const PROFICIENCY_MODES: { id: ProficiencyMode; label: string }[] = [
  { id: 'uniform', label: 'Uniform' },
  { id: 'glow', label: 'Glow' },
  { id: 'size', label: 'Size' },
  { id: 'fill', label: 'Fill' },
]
