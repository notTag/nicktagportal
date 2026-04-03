import type { CommandHandler } from './types'
import { resolvePath, getNode, getParentAndName } from '../vfs/filesystem'
import { loadUserOverlay, saveUserOverlay } from '../vfs/persistence'
import { ansi } from '../ansi'

export const catCommand: CommandHandler = (args, ctx) => {
  if (!args[0]) {
    ctx.terminal.writeln(ansi.red('cat: missing operand'))
    return
  }

  const resolved = resolvePath(ctx.cwd, args[0])
  const node = getNode(ctx.root, resolved)

  if (!node) {
    ctx.terminal.writeln(
      ansi.red('cat: ' + args[0] + ': No such file or directory'),
    )
    return
  }
  if (node.type === 'directory') {
    ctx.terminal.writeln(ansi.red('cat: ' + args[0] + ': Is a directory'))
    return
  }

  ctx.terminal.writeln(node.content)
}

export const touchCommand: CommandHandler = (args, ctx) => {
  if (!args[0]) {
    ctx.terminal.writeln(ansi.red('touch: missing operand'))
    return
  }

  const resolved = resolvePath(ctx.cwd, args[0])
  const existing = getNode(ctx.root, resolved)

  // No-op if file already exists
  if (existing && existing.type === 'file') return

  if (existing && existing.type === 'directory') {
    // touch on existing directory is a no-op in real shells
    return
  }

  const result = getParentAndName(ctx.root, resolved)
  if (!result) {
    ctx.terminal.writeln(
      ansi.red(
        "touch: cannot touch '" + args[0] + "': No such file or directory",
      ),
    )
    return
  }

  const { parent, name } = result

  parent.children.set(name, {
    type: 'file',
    name,
    content: '',
    readonly: false,
  })

  // Persist to localStorage
  const overlay = loadUserOverlay()
  overlay.files[resolved] = ''
  saveUserOverlay(overlay)
}

export const mkdirCommand: CommandHandler = (args, ctx) => {
  if (!args[0]) {
    ctx.terminal.writeln(ansi.red('mkdir: missing operand'))
    return
  }

  const resolved = resolvePath(ctx.cwd, args[0])
  const existing = getNode(ctx.root, resolved)

  if (existing) {
    ctx.terminal.writeln(
      ansi.red(
        "mkdir: cannot create directory '" + args[0] + "': File exists",
      ),
    )
    return
  }

  const result = getParentAndName(ctx.root, resolved)
  if (!result) {
    ctx.terminal.writeln(
      ansi.red(
        "mkdir: cannot create directory '" +
          args[0] +
          "': No such file or directory",
      ),
    )
    return
  }

  const { parent, name } = result

  parent.children.set(name, {
    type: 'directory',
    name,
    children: new Map(),
    readonly: false,
  })

  // Persist to localStorage
  const overlay = loadUserOverlay()
  overlay.directories.push(resolved)
  saveUserOverlay(overlay)
}
