import type { VfsDirectory, VfsFile, VfsNode } from './types'
import { ansi } from '../ansi'
import resumeData from '../../data/resumeData.json'

/**
 * Convert a name to a filesystem-safe slug.
 * Lowercase, replace spaces/special chars with hyphens, collapse multiples.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function makeFile(name: string, content: string): VfsFile {
  return { type: 'file', name, content, readonly: true }
}

function makeDir(
  name: string,
  children: Map<string, VfsNode>,
): VfsDirectory {
  return { type: 'directory', name, children, readonly: true }
}

/**
 * Build the ~/about.txt file from resume about section.
 */
function buildAboutFile(): VfsFile {
  const { name, title, summary } = resumeData.about
  const content = [
    `${ansi.blue('Name:')}     ${name}`,
    `${ansi.blue('Title:')}    ${title}`,
    '',
    `${ansi.blue('Summary:')}`,
    summary,
  ].join('\r\n')

  return makeFile('about.txt', content)
}

/**
 * Build ~/work/ directory with company/role nesting per D-17.
 */
function buildWorkDir(): VfsDirectory {
  const children = new Map<string, VfsNode>()

  for (const company of resumeData.work) {
    const companySlug = slugify(company.company)
    const roleChildren = new Map<string, VfsNode>()

    for (const role of company.roles) {
      const roleSlug = slugify(role.title)
      const lines: string[] = [
        `${ansi.blue('Role:')}       ${role.title}`,
        `${ansi.blue('Period:')}     ${role.period}`,
        `${ansi.blue('Company:')}    ${company.company}`,
        `${ansi.blue('Location:')}   ${company.location}`,
        '',
        `${ansi.blue('Highlights:')}`,
      ]

      for (const h of role.highlights) {
        lines.push(`  - ${h}`)
      }

      const detailsFile = makeFile('details.txt', lines.join('\r\n'))
      const roleDir = makeDir(roleSlug, new Map([['details.txt', detailsFile]]))
      roleChildren.set(roleSlug, roleDir)
    }

    const companyDir = makeDir(companySlug, roleChildren)
    children.set(companySlug, companyDir)
  }

  return makeDir('work', children)
}

/**
 * Build ~/education/ directory.
 */
function buildEducationDir(): VfsDirectory {
  const children = new Map<string, VfsNode>()

  for (const edu of resumeData.education) {
    const schoolSlug = slugify(edu.school)
    const lines = [
      `${ansi.blue('Degree:')}     ${edu.degree}`,
      `${ansi.blue('School:')}     ${edu.school}`,
      `${ansi.blue('Location:')}   ${edu.location}`,
      `${ansi.blue('Year:')}       ${edu.year}`,
    ]

    const detailsFile = makeFile('details.txt', lines.join('\r\n'))
    const schoolDir = makeDir(schoolSlug, new Map([['details.txt', detailsFile]]))
    children.set(schoolSlug, schoolDir)
  }

  return makeDir('education', children)
}

/**
 * Build ~/skills/ directory -- one .txt file per category.
 */
function buildSkillsDir(): VfsDirectory {
  const children = new Map<string, VfsNode>()

  for (const [category, skills] of Object.entries(resumeData.skills)) {
    const fileName = slugify(category) + '.txt'
    const content = [
      `${ansi.blue(category)}`,
      '',
      skills,
    ].join('\r\n')

    children.set(fileName, makeFile(fileName, content))
  }

  return makeDir('skills', children)
}

/**
 * Build ~/projects/ directory -- one .txt file per project.
 */
function buildProjectsDir(): VfsDirectory {
  const children = new Map<string, VfsNode>()

  for (const project of resumeData.projects) {
    const fileName = slugify(project.name) + '.txt'
    const content = [
      `${ansi.blue('Project:')}      ${project.name}`,
      '',
      `${ansi.blue('Description:')}`,
      project.description,
    ].join('\r\n')

    children.set(fileName, makeFile(fileName, content))
  }

  return makeDir('projects', children)
}

/**
 * Build the complete resume tree as children of the home (~) directory.
 * Returns Map<string, VfsNode> to be set on the home directory's children.
 */
export function buildResumeTree(): Map<string, VfsNode> {
  const children = new Map<string, VfsNode>()

  children.set('about.txt', buildAboutFile())
  children.set('work', buildWorkDir())
  children.set('education', buildEducationDir())
  children.set('skills', buildSkillsDir())
  children.set('projects', buildProjectsDir())

  return children
}
