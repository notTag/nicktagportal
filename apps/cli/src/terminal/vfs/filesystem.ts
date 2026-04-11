import type { VfsDirectory, VfsNode } from './types'
import { buildResumeTree } from './resumeData'
import { applyOverlay, loadUserOverlay } from './persistence'

export const HOME_DIR = '/home/nick'

/**
 * Normalize a path by resolving `.` and `..` segments.
 * Returns an absolute path starting with `/`.
 */
export function normalizePath(path: string): string {
  const segments = path.split('/').filter(Boolean)
  const resolved: string[] = []

  for (const seg of segments) {
    if (seg === '.') {
      continue
    } else if (seg === '..') {
      resolved.pop()
    } else {
      resolved.push(seg)
    }
  }

  return '/' + resolved.join('/')
}

/**
 * Resolve a path relative to cwd.
 * Handles ~, absolute, and relative paths.
 */
export function resolvePath(cwd: string, input: string): string {
  if (input === '~' || input.startsWith('~/')) {
    return normalizePath(HOME_DIR + input.slice(1))
  }
  if (input.startsWith('/')) {
    return normalizePath(input)
  }
  return normalizePath(cwd + '/' + input)
}

/**
 * Walk the VFS tree from root following an absolute path.
 * Returns the node at the path, or null if not found.
 */
export function getNode(
  root: VfsDirectory,
  absolutePath: string,
): VfsNode | null {
  const segments = absolutePath.split('/').filter(Boolean)
  let current: VfsNode = root

  for (const seg of segments) {
    if (current.type !== 'directory') return null
    const child = current.children.get(seg)
    if (!child) return null
    current = child
  }

  return current
}

/**
 * Get the parent directory and final name for an absolute path.
 * Used by mkdir and touch to insert new nodes.
 */
export function getParentAndName(
  root: VfsDirectory,
  absolutePath: string,
): { parent: VfsDirectory; name: string } | null {
  const segments = absolutePath.split('/').filter(Boolean)
  if (segments.length === 0) return null

  const name = segments.pop()!
  const parentPath = '/' + segments.join('/')
  const parentNode = getNode(root, parentPath)

  if (!parentNode || parentNode.type !== 'directory') return null
  return { parent: parentNode, name }
}

/**
 * Create the full VFS tree with resume data and user overlay.
 * Returns the root `/` directory containing /home/nick with resume content.
 */
export function createFilesystem(): VfsDirectory {
  // Create root
  const root: VfsDirectory = {
    type: 'directory',
    name: '/',
    children: new Map(),
    readonly: true,
  }

  // Create /home directory
  const homeDir: VfsDirectory = {
    type: 'directory',
    name: 'home',
    children: new Map(),
    readonly: true,
  }

  // Create /home/nick directory with resume tree
  const nickDir: VfsDirectory = {
    type: 'directory',
    name: 'nick',
    children: buildResumeTree(),
    readonly: true,
  }

  homeDir.children.set('nick', nickDir)
  root.children.set('home', homeDir)

  // Apply user overlay from localStorage
  const overlay = loadUserOverlay()
  applyOverlay(root, overlay)

  return root
}
