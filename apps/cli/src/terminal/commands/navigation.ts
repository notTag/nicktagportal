import type { CommandHandler } from './types'
import type { VfsDirectory } from '../vfs/types'
import { resolvePath, getNode, HOME_DIR } from '../vfs/filesystem'
import { ansi } from '../ansi'

export const cdCommand: CommandHandler = (args, ctx) => {
  const target = args[0] || '~'
  const resolved = resolvePath(ctx.cwd, target)
  const node = getNode(ctx.root, resolved)

  if (!node) {
    ctx.terminal.writeln(ansi.red('cd: no such file or directory: ' + args[0]))
    return
  }
  if (node.type === 'file') {
    ctx.terminal.writeln(ansi.red('cd: not a directory: ' + args[0]))
    return
  }

  ctx.setCwd(resolved)
}

export const lsCommand: CommandHandler = (args, ctx) => {
  const target = args[0] || ctx.cwd
  const resolved = args[0] ? resolvePath(ctx.cwd, args[0]) : ctx.cwd
  const node = getNode(ctx.root, resolved)

  if (!node) {
    ctx.terminal.writeln(
      ansi.red("ls: cannot access '" + target + "': No such file or directory"),
    )
    return
  }
  if (node.type === 'file') {
    ctx.terminal.writeln(node.name)
    return
  }

  const entries = Array.from(node.children.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  for (const entry of entries) {
    if (entry.type === 'directory') {
      ctx.terminal.writeln(ansi.cyan(entry.name + '/'))
    } else {
      ctx.terminal.writeln(entry.name)
    }
  }
}

export const pwdCommand: CommandHandler = (_args, ctx) => {
  ctx.terminal.writeln(ctx.cwd)
}

export const treeCommand: CommandHandler = (args, ctx) => {
  const target = args[0] ? resolvePath(ctx.cwd, args[0]) : ctx.cwd
  const node = getNode(ctx.root, target)

  if (!node) {
    ctx.terminal.writeln(
      ansi.red("tree: '" + (args[0] || ctx.cwd) + "': No such file or directory"),
    )
    return
  }
  if (node.type === 'file') {
    ctx.terminal.writeln(node.name)
    return
  }

  // Print root directory name
  ctx.terminal.writeln(ansi.cyan('.'))

  let dirCount = 0
  let fileCount = 0

  function walk(dir: VfsDirectory, prefix: string): void {
    const entries = Array.from(dir.children.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    )

    entries.forEach((entry, i) => {
      const isLast = i === entries.length - 1
      const connector = isLast ? '\u2514\u2500\u2500 ' : '\u251C\u2500\u2500 '
      const continuation = isLast ? '    ' : '\u2502   '

      if (entry.type === 'directory') {
        dirCount++
        ctx.terminal.writeln(prefix + connector + ansi.cyan(entry.name + '/'))
        walk(entry, prefix + continuation)
      } else {
        fileCount++
        ctx.terminal.writeln(prefix + connector + entry.name)
      }
    })
  }

  walk(node, '')
  ctx.terminal.writeln('')
  ctx.terminal.writeln(`${dirCount} directories, ${fileCount} files`)
}
