import type { VfsDirectory, VfsFile, VfsNode } from './types'

const STORAGE_KEY = 'nicksite-cli-userfs'

export interface UserFsOverlay {
  files: Record<string, string> // absolute path -> content
  directories: string[] // absolute paths of user-created dirs
}

export function loadUserOverlay(): UserFsOverlay {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { files: {}, directories: [] }
    const parsed = JSON.parse(raw) as UserFsOverlay
    if (
      parsed &&
      typeof parsed.files === 'object' &&
      Array.isArray(parsed.directories)
    ) {
      return parsed
    }
    return { files: {}, directories: [] }
  } catch {
    return { files: {}, directories: [] }
  }
}

export function saveUserOverlay(overlay: UserFsOverlay): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay))
  } catch {
    // Quota exceeded or other storage error -- silently ignore
  }
}

/**
 * Apply user-created directories and files from the overlay into the VFS tree.
 * All overlay nodes are created with readonly: false.
 */
export function applyOverlay(
  root: VfsDirectory,
  overlay: UserFsOverlay,
): void {
  // Create directories first (parents before children)
  const sortedDirs = [...overlay.directories].sort(
    (a, b) => a.split('/').length - b.split('/').length,
  )

  for (const dirPath of sortedDirs) {
    ensureDirectory(root, dirPath, false)
  }

  // Then create files
  for (const [filePath, content] of Object.entries(overlay.files)) {
    const segments = filePath.split('/').filter(Boolean)
    const fileName = segments.pop()
    if (!fileName) continue

    // Ensure parent directory exists
    const parentPath = '/' + segments.join('/')
    const parent = ensureDirectory(root, parentPath, false)

    if (!parent.children.has(fileName)) {
      const file: VfsFile = {
        type: 'file',
        name: fileName,
        content,
        readonly: false,
      }
      parent.children.set(fileName, file)
    }
  }
}

/**
 * Walk/create directory chain for the given absolute path.
 * Returns the deepest directory.
 */
function ensureDirectory(
  root: VfsDirectory,
  absolutePath: string,
  readonly: boolean,
): VfsDirectory {
  const segments = absolutePath.split('/').filter(Boolean)
  let current: VfsDirectory = root

  for (const seg of segments) {
    const existing = current.children.get(seg)
    if (existing && existing.type === 'directory') {
      current = existing
    } else if (!existing) {
      const dir: VfsDirectory = {
        type: 'directory',
        name: seg,
        children: new Map(),
        readonly,
      }
      current.children.set(seg, dir)
      current = dir
    } else {
      // Segment exists but is a file -- skip
      break
    }
  }

  return current
}
