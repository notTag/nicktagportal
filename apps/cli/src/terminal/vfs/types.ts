export interface VfsFile {
  type: 'file'
  name: string
  content: string // May contain ANSI escape codes
  readonly: boolean
}

export interface VfsDirectory {
  type: 'directory'
  name: string
  children: Map<string, VfsNode>
  readonly: boolean
}

export type VfsNode = VfsFile | VfsDirectory
