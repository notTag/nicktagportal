# Phase 7: CLI Terminal Core - Research

**Researched:** 2026-04-03
**Domain:** xterm.js terminal emulation, virtual filesystem, ANSI escape sequences, Vue 3 integration
**Confidence:** HIGH

## Summary

Phase 7 replaces the current HTML-input-based TerminalPanel mock with a real xterm.js v6 terminal at the `/cli` route. The terminal presents a virtual filesystem populated from Nick's resume data (parsed from the LaTeX source), supports core shell commands (cd, ls, cat, pwd, whoami, help, clear, echo, tree, history, mkdir, touch, alias), tab completion, command history, and an independent terminal theme system via the `$CLITHEME` variable.

xterm.js 6.0.0 is the current stable release with significant breaking changes from v5: the canvas renderer addon has been removed (use DOM or WebGL), the package has been renamed to `@xterm/xterm` (scoped), and deprecated options like `windowsMode` and `fastScrollModifier` have been removed. For this project, the default DOM renderer is sufficient -- there is no need for WebGL since we have low-output resume content, not a streaming terminal.

**Primary recommendation:** Use `@xterm/xterm@6.0.0` with `@xterm/addon-fit@0.11.0` for responsive sizing. Build a custom input handler via `terminal.onData()` that accumulates keystrokes into a line buffer, processes commands through a command registry, and writes output via `terminal.write()` with ANSI escape codes for color. The virtual filesystem is a simple in-memory tree (plain TypeScript objects) with localStorage overlay for user-created content.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- D-01: Terminal below header -- site nav stays visible, terminal fills remaining vertical space
- D-02: Site-width with margins -- terminal stays within the same max-width container as other pages
- D-03: Click-anywhere focus -- clicking anywhere in the terminal container focuses xterm.js
- D-04: Reflow to fit on resize -- xterm.js fit addon adjusts columns on window resize
- D-05: Terminal uses "Dark Modern" as its default theme, independent of the site theme
- D-06: Users can change the terminal theme by setting `$CLITHEME` variable
- D-07: `$CLITHEME` accepts any of the site's 9 curated theme names
- D-08: `help` command includes a line item documenting `$CLITHEME`
- D-09: `$CLITHEME` value persisted to localStorage
- D-10: Tech-themed ASCII art banner -- box-drawing characters around "nicktag.tech"
- D-11: Banner uses the terminal theme's accent colors
- D-12: Subtitle line: "interactive resume"
- D-13: After banner: "Type 'help' for commands, or try: ls ~/work"
- D-14: Colored prompt segments: nick (green), @ (gray), nicktag.tech (cyan), path (yellow), $ (white)
- D-15: Prompt colors derived from the active `$CLITHEME`
- D-16: Top-level organized by resume section: ~/work, ~/education, ~/skills, ~/projects, ~/about.txt
- D-17: Inside ~/work: company folders containing role-title subfolders
- D-18: File content uses structured headers with colored section labels
- D-19: Resume data sourced from a single JSON data file
- D-20: Actual resume content parsed from Nick's LaTeX resume file
- D-21: `ssh` Easter egg deferred (requires AWS infrastructure)
- D-22: `resume` formatted summary command deferred to backlog
- D-23: Focus this phase on core filesystem navigation commands (CLI-01 through CLI-18) and VFS

### Claude's Discretion

- xterm.js configuration and addon selection
- Command parser architecture and virtual filesystem implementation approach
- Tab completion algorithm details
- localStorage schema design
- Exact box-drawing art for the welcome banner
- File naming conventions inside company/role directories
- ~/education, ~/skills, ~/projects internal structure
- Terminal font size and line height
- How $CLITHEME maps site theme tokens to xterm.js ITheme properties

### Deferred Ideas (OUT OF SCOPE)

- ssh Easter egg (CLI-20): Requires AWS infrastructure -- defer to future milestone
- resume formatted summary (CLI-19): Formatted resume summary command -- defer to backlog
- Both CLI-19 and CLI-20 remain in REQUIREMENTS.md but are not targeted for Phase 7
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                           | Research Support                                                 |
| ------ | ----------------------------------------------------- | ---------------------------------------------------------------- |
| CLI-01 | xterm.js-powered terminal with responsive fit at /cli | xterm.js v6 + @xterm/addon-fit; FitAddon.fit() on ResizeObserver |
| CLI-02 | Colored prompt displaying cwd                         | ANSI SGR escape sequences (\x1b[32m etc) via terminal.write()    |
| CLI-03 | cd with ., .., ~, relative/absolute paths             | VFS path resolution with normalizePath utility                   |
| CLI-04 | ls directory listing                                  | VFS node children iteration                                      |
| CLI-05 | cat file contents                                     | VFS file node content retrieval                                  |
| CLI-06 | pwd current directory                                 | Return cwd string from shell state                               |
| CLI-07 | whoami output "nick"                                  | Static command returning "nick"                                  |
| CLI-08 | help available commands                               | Command registry iteration with descriptions                     |
| CLI-09 | clear terminal                                        | terminal.clear() + rewrite prompt                                |
| CLI-10 | echo text output                                      | Parse args, write to terminal                                    |
| CLI-11 | tree directory structure                              | Recursive VFS traversal with box-drawing chars                   |
| CLI-12 | history + up/down arrows                              | History array in shell state; onData handler for arrow keys      |
| CLI-13 | Tab-complete commands and paths                       | Prefix matching against command names + VFS child nodes          |
| CLI-14 | Red error text for unknown commands                   | ANSI red (\x1b[31m) for error output                             |
| CLI-15 | mkdir persisted to localStorage                       | VFS mutation + localStorage sync                                 |
| CLI-16 | touch persisted to localStorage                       | VFS mutation + localStorage sync                                 |
| CLI-17 | alias persisted to localStorage                       | Alias map in shell state + localStorage                          |
| CLI-18 | ASCII art welcome banner                              | Box-drawing characters with ANSI color escapes                   |
| CLI-19 | resume formatted summary                              | DEFERRED per D-22                                                |
| CLI-20 | ssh Easter egg                                        | DEFERRED per D-21                                                |
| VFS-01 | Pre-populated resume filesystem                       | resumeData.json parsed from LaTeX source at build time           |
| VFS-02 | File contents display resume info                     | cat reads VFS node content with ANSI-colored headers             |
| VFS-03 | User-created files/dirs persist via localStorage      | localStorage overlay merged with read-only VFS                   |

</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Runtime**: Bun (package manager and runtime) -- verified v1.3.11 available
- **Framework**: Vue 3 with Composition API -- no Options API
- **Language**: TypeScript strict mode -- no plain JavaScript
- **Styling**: TailwindCSS v4 CSS-first config (outer container only; xterm.js interior is canvas-rendered)
- **Build target**: esnext
- **No Vitest mentioned in "What NOT to Use"** but testing infrastructure exists from Phase 999.8

## Standard Stack

### Core

| Library          | Version | Purpose                    | Why Standard                                                                                                                                                                      |
| ---------------- | ------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @xterm/xterm     | 6.0.0   | Terminal emulator          | The standard web terminal emulator. v6 is current stable (scoped @xterm package). Canvas renderer removed; DOM renderer is default and sufficient for low-output resume terminal. |
| @xterm/addon-fit | 0.11.0  | Responsive terminal sizing | Official addon for fitting terminal to container dimensions. Required for D-04 reflow-on-resize.                                                                                  |

### Supporting

| Library                | Version | Purpose                 | When to Use                                                                                             |
| ---------------------- | ------- | ----------------------- | ------------------------------------------------------------------------------------------------------- |
| @xterm/addon-web-links | 0.12.0  | Clickable URL detection | Optional; useful if cat output includes URLs (e.g., LinkedIn, GitHub links in about.txt). Low priority. |

### Alternatives Considered

| Instead of          | Could Use              | Tradeoff                                                                                                                                             |
| ------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| @xterm/addon-webgl  | DOM renderer (default) | WebGL is faster for high-throughput terminals. Zero benefit here -- resume output is <100 lines per command. DOM renderer is simpler, no GPU issues. |
| @xterm/addon-canvas | N/A                    | Removed in xterm.js 6.0.0. Cannot use.                                                                                                               |
| BrowserFS / memfs   | Plain TS objects       | Out of scope per REQUIREMENTS.md. Overkill for ~50 read-only resume files + localStorage overlay.                                                    |

**Installation:**

```bash
cd apps/shell && bun add @xterm/xterm@6.0.0 @xterm/addon-fit@0.11.0
```

**Version verification:** @xterm/xterm@6.0.0 is latest stable (confirmed via npm registry 2026-04-03). @xterm/addon-fit@0.11.0 is latest stable.

## Architecture Patterns

### Recommended Project Structure

```
apps/shell/src/
├── views/
│   └── CliView.vue              # Terminal container view (rewrite)
├── terminal/
│   ├── index.ts                 # Public barrel export
│   ├── Shell.ts                 # Shell orchestrator: input handler, command dispatch, state
│   ├── commandRegistry.ts       # Command name -> handler map
│   ├── commands/
│   │   ├── navigation.ts        # cd, ls, pwd, tree
│   │   ├── files.ts             # cat, touch, mkdir
│   │   ├── info.ts              # help, whoami, echo, history
│   │   ├── terminal.ts          # clear, alias, CLITHEME
│   │   └── types.ts             # CommandHandler interface
│   ├── vfs/
│   │   ├── types.ts             # VfsNode, VfsDirectory, VfsFile interfaces
│   │   ├── filesystem.ts        # VFS tree builder + path resolution
│   │   ├── resumeData.ts        # Resume filesystem generator from JSON
│   │   └── persistence.ts       # localStorage read/write for user content
│   ├── theme/
│   │   └── terminalTheme.ts     # ThemeColors -> ITheme mapping + CLITHEME store
│   ├── ansi.ts                  # ANSI escape code helpers (color, bold, reset)
│   └── banner.ts                # ASCII art welcome banner generator
├── data/
│   └── resumeData.json          # Structured resume data (parsed from LaTeX)
├── stores/
│   └── terminal.ts              # Pinia store for terminal theme (CLITHEME persistence)
└── composables/
    └── useTerminal.ts           # xterm.js lifecycle composable for CliView
```

### Pattern 1: Shell Input Handler (onData loop)

**What:** xterm.js does not provide a built-in line editor. We must handle each keystroke via `terminal.onData()`, accumulate characters into a line buffer, handle special keys (Backspace, Enter, Tab, Arrow Up/Down), and dispatch completed lines to the command parser.
**When to use:** Always -- this is how xterm.js works without a backend PTY.
**Example:**

```typescript
// Source: xterm.js v6 API (verified from typings)
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'

const terminal = new Terminal({
  fontSize: 14,
  lineHeight: 1.2,
  fontFamily: "'Menlo', 'DejaVu Sans Mono', 'Courier New', monospace",
  cursorBlink: true,
  cursorStyle: 'block',
  convertEol: true,
  theme: darkModernTheme, // ITheme object
  scrollback: 1000,
})

const fitAddon = new FitAddon()
terminal.loadAddon(fitAddon)

terminal.open(containerElement)
fitAddon.fit()

// Line buffer input handler
let lineBuffer = ''
let cursorPos = 0

terminal.onData((data: string) => {
  switch (data) {
    case '\r': // Enter
      terminal.writeln('')
      executeCommand(lineBuffer)
      lineBuffer = ''
      cursorPos = 0
      writePrompt()
      break
    case '\x7f': // Backspace
      if (cursorPos > 0) {
        lineBuffer =
          lineBuffer.slice(0, cursorPos - 1) + lineBuffer.slice(cursorPos)
        cursorPos--
        // Rewrite line from cursor position
        terminal.write('\b \b')
      }
      break
    case '\x1b[A': // Up arrow - history
      navigateHistory(-1)
      break
    case '\x1b[B': // Down arrow - history
      navigateHistory(1)
      break
    case '\t': // Tab - autocomplete
      handleTabCompletion()
      break
    default:
      if (data >= ' ') {
        // Printable characters
        lineBuffer =
          lineBuffer.slice(0, cursorPos) + data + lineBuffer.slice(cursorPos)
        cursorPos += data.length
        terminal.write(data)
      }
  }
})
```

### Pattern 2: Virtual Filesystem as Plain Objects

**What:** A tree of TypeScript objects representing files and directories. No external library needed.
**When to use:** Always -- this is the core data structure for the resume filesystem.
**Example:**

```typescript
// VFS types
interface VfsFile {
  type: 'file'
  name: string
  content: string // May contain ANSI escape codes for colored output
  readonly: boolean
}

interface VfsDirectory {
  type: 'directory'
  name: string
  children: Map<string, VfsNode>
  readonly: boolean
}

type VfsNode = VfsFile | VfsDirectory

// Path resolution
function resolvePath(cwd: string, input: string): string {
  if (input.startsWith('~')) input = '/home/nick' + input.slice(1)
  if (input.startsWith('/')) return normalizePath(input)
  return normalizePath(cwd + '/' + input)
}

function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean)
  const resolved: string[] = []
  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') {
      resolved.pop()
      continue
    }
    resolved.push(part)
  }
  return '/' + resolved.join('/')
}
```

### Pattern 3: ANSI Escape Code Helpers

**What:** Utility functions for writing colored text to xterm.js.
**When to use:** All command output, prompt rendering, banner display.
**Example:**

```typescript
// ANSI color helper module
const ESC = '\x1b['
const RESET = `${ESC}0m`

export const ansi = {
  red: (s: string) => `${ESC}31m${s}${RESET}`,
  green: (s: string) => `${ESC}32m${s}${RESET}`,
  yellow: (s: string) => `${ESC}33m${s}${RESET}`,
  blue: (s: string) => `${ESC}34m${s}${RESET}`,
  magenta: (s: string) => `${ESC}35m${s}${RESET}`,
  cyan: (s: string) => `${ESC}36m${s}${RESET}`,
  white: (s: string) => `${ESC}37m${s}${RESET}`,
  brightBlack: (s: string) => `${ESC}90m${s}${RESET}`,
  brightCyan: (s: string) => `${ESC}96m${s}${RESET}`,
  brightWhite: (s: string) => `${ESC}97m${s}${RESET}`,
  bold: (s: string) => `${ESC}1m${s}${RESET}`,
}
```

### Pattern 4: Theme Mapping (ThemeColors -> ITheme)

**What:** Function that converts an existing ThemeColors object to xterm.js ITheme.
**When to use:** On terminal initialization and when $CLITHEME changes.
**Example:**

```typescript
// Source: verified from xterm.js v6 ITheme interface + project ThemeColors type
import type { ITheme } from '@xterm/xterm'
import type { ThemeColors } from '@/themes/types'

export function toXtermTheme(colors: ThemeColors): ITheme {
  return {
    background: colors.surface,
    foreground: colors.text,
    cursor: colors.accentYellow,
    cursorAccent: colors.surface,
    selectionBackground: colors.selection,
    selectionForeground: colors.text,
    // ANSI 16-color palette
    black: colors.surface,
    red: colors.destructive,
    green: colors.accentCyan, // Per UI-SPEC prompt mapping
    yellow: colors.accentYellow,
    blue: colors.accent,
    magenta: colors.link,
    cyan: colors.accentCyan,
    white: colors.text,
    brightBlack: colors.textMuted,
    brightRed: colors.destructive,
    brightGreen: colors.accentCyan,
    brightYellow: colors.accentYellow,
    brightBlue: colors.accent,
    brightMagenta: colors.link,
    brightCyan: colors.accentCyan,
    brightWhite: colors.textOnAccent,
  }
}
```

### Pattern 5: Terminal Theme Persistence via Pinia Store

**What:** A dedicated Pinia store for terminal theme state, separate from the site theme store.
**When to use:** Terminal theme is independent of site theme (D-05). Follows same pattern as existing `useThemeStore`.
**Example:**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { themes } from '@/themes'
import type { ThemeId } from '@/themes/types'

const STORAGE_KEY = 'nicksite-cli-theme'
const DEFAULT_CLI_THEME: ThemeId = 'dark-modern'

export const useTerminalThemeStore = defineStore('terminal-theme', () => {
  const themeId = ref<ThemeId>(loadThemeId())

  const currentTheme = computed(() => themes[themeId.value])

  function loadThemeId(): ThemeId {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored in themes) return stored as ThemeId
    return DEFAULT_CLI_THEME
  }

  function setTheme(id: ThemeId) {
    themeId.value = id
    localStorage.setItem(STORAGE_KEY, id)
  }

  return { themeId, currentTheme, setTheme }
})
```

### Pattern 6: Vue Composable for xterm.js Lifecycle

**What:** Encapsulate xterm.js Terminal creation, addon loading, event wiring, and disposal in a Vue composable.
**When to use:** CliView.vue calls `useTerminal(containerRef)` to get a managed terminal instance.
**Example:**

```typescript
import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'

export function useTerminal(containerRef: Ref<HTMLElement | null>) {
  const terminal = ref<Terminal | null>(null)
  const fitAddon = new FitAddon()
  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    if (!containerRef.value) return
    const term = new Terminal({
      /* options */
    })
    term.loadAddon(fitAddon)
    term.open(containerRef.value)
    fitAddon.fit()
    terminal.value = term

    // Click-anywhere focus (D-03)
    containerRef.value.addEventListener('click', () => term.focus())

    // Responsive resize (D-04)
    resizeObserver = new ResizeObserver(() => fitAddon.fit())
    resizeObserver.observe(containerRef.value)
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
    terminal.value?.dispose()
  })

  return { terminal }
}
```

### Anti-Patterns to Avoid

- **Writing raw escape codes inline:** Use the ansi helper module. Raw `\x1b[31m` scattered through command handlers is unmaintainable.
- **Mutating ITheme in place:** xterm.js v6 uses reference comparison to detect theme changes. Always spread: `terminal.options.theme = { ...newTheme }`.
- **Using terminal.input() for command execution:** `input()` simulates user typing. Use `terminal.write()`/`terminal.writeln()` for programmatic output.
- **Synchronous buffer reads after write:** `terminal.write()` is async. Use the callback parameter if you need to read the buffer after a write.
- **Storing full VFS in localStorage:** Only store user-created content (mkdir/touch/alias). Resume data is read-only and regenerated from JSON on load.

## Don't Hand-Roll

| Problem                    | Don't Build                   | Use Instead                      | Why                                                                                                                                      |
| -------------------------- | ----------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Terminal emulation         | Custom canvas/DOM terminal    | @xterm/xterm                     | Decades of edge cases: cursor positioning, escape sequences, Unicode width, scrollback, clipboard, IME input                             |
| Responsive terminal sizing | Manual cols/rows calculation  | @xterm/addon-fit                 | FitAddon handles font metrics, DPI, subpixel sizing. Manual calculation gets it wrong on HiDPI displays.                                 |
| ANSI escape parsing        | Custom parser for color codes | xterm.js built-in parser         | xterm.js natively interprets all SGR, CSI, OSC sequences. Just write escape codes to terminal.write().                                   |
| Path normalization         | Regex-based path resolver     | Iterative split/filter algorithm | Edge cases: trailing slashes, double slashes, root traversal (/../..), tilde expansion. The 15-line iterative approach handles them all. |

**Key insight:** xterm.js handles all rendering, cursor management, selection, clipboard, and scrollback. Our code only needs to: (1) handle onData keystrokes, (2) maintain a line buffer, (3) dispatch commands, (4) write output. The terminal IS the UI component.

## Common Pitfalls

### Pitfall 1: xterm.js open() called on hidden/zero-size element

**What goes wrong:** Terminal renders as 0x0 or doesn't display at all.
**Why it happens:** xterm.js measures DOM dimensions during `open()`. If the container has no size (display:none, height:0, not yet mounted), measurements fail.
**How to avoid:** Call `terminal.open()` in `onMounted()` and ensure the container has explicit dimensions via CSS. Use `nextTick()` if the container relies on parent layout.
**Warning signs:** Terminal shows but has 0 columns, or the canvas is invisible.

### Pitfall 2: FitAddon.fit() throws on unmounted terminal

**What goes wrong:** ResizeObserver fires after component unmount, calling fit() on a disposed terminal.
**Why it happens:** ResizeObserver callbacks are async and can fire after `onUnmounted`.
**How to avoid:** Disconnect ResizeObserver in `onUnmounted` BEFORE calling `terminal.dispose()`. Guard fit() calls: `if (terminal.element) fitAddon.fit()`.
**Warning signs:** Console errors about accessing properties of disposed objects.

### Pitfall 3: Line buffer not clearing visual characters on backspace

**What goes wrong:** Backspace removes from the internal buffer but leaves characters visible on screen, or leaves ghost characters.
**Why it happens:** Backspace requires writing `\b \b` (move back, overwrite with space, move back again) for each deleted character. If the cursor is mid-line, the entire suffix must be redrawn.
**How to avoid:** For mid-line editing, clear from cursor to end of line (`\x1b[K`), rewrite the suffix, then reposition cursor. For simplicity, Phase 7 can restrict editing to end-of-line only (no left/right arrow cursor movement within line).
**Warning signs:** Extra characters appearing after backspace, cursor in wrong position.

### Pitfall 4: convertEol not set causes missing carriage returns

**What goes wrong:** Output lines stack diagonally instead of starting at column 0.
**Why it happens:** xterm.js by default only moves cursor down on `\n`, not to column 0. Without a real PTY, `\n` doesn't auto-add `\r`.
**How to avoid:** Set `convertEol: true` in Terminal options, OR always write `\r\n` instead of `\n`.
**Warning signs:** Each output line starts one character to the right of the previous.

### Pitfall 5: Theme change not reflected until spread

**What goes wrong:** Calling `terminal.options.theme.background = '#000'` does nothing.
**Why it happens:** xterm.js v6 does reference comparison on the theme object. Mutating properties doesn't trigger a re-render.
**How to avoid:** Always assign a new object: `terminal.options.theme = { ...newTheme }`.
**Warning signs:** Theme values update in state but terminal colors don't change visually.

### Pitfall 6: xterm.css not imported

**What goes wrong:** Terminal renders without proper styling -- scroll bar missing, cursor misaligned, container has no dimensions.
**Why it happens:** @xterm/xterm ships CSS that must be imported separately.
**How to avoid:** Import `@xterm/xterm/css/xterm.css` in the component or composable.
**Warning signs:** Terminal content renders but layout is broken.

### Pitfall 7: localStorage quota exceeded

**What goes wrong:** mkdir/touch silently fails after extensive user content creation.
**Why it happens:** localStorage has a ~5MB limit per origin. Unlikely to hit with resume content, but worth guarding.
**How to avoid:** Wrap localStorage.setItem in try/catch. Log a warning to the terminal if quota is exceeded.
**Warning signs:** User creates content but it disappears on reload.

## Code Examples

### Resume Data JSON Structure

```typescript
// apps/shell/src/data/resumeData.json -- generated from LaTeX source
// Source: /Users/nicktag/Code/Resume/CompletedResumes/DirectorEngineeringResume-31626.tex
{
  "about": {
    "name": "Nick Tagliasacchi",
    "title": "Director of Engineering | SaaS, Platform, and Scale",
    "summary": "Engineering leader with 13 years of software engineering experience and 6 years leading distributed teams building large-scale, security-sensitive SaaS platforms."
  },
  "work": [
    {
      "company": "BlueVoyant",
      "location": "Remote",
      "roles": [
        {
          "title": "Technical Lead, Supply Chain Defense Platform",
          "period": "Nov 2023 -- July 2025",
          "highlights": [
            "Owned technical direction and delivery for a security-critical SaaS supply chain defense platform",
            "Acted as final decision-maker for architectural tradeoffs",
            "Established and enforced engineering standards across multiple teams",
            "Partnered with product, design, and executive leadership"
          ]
        },
        {
          "title": "Technical Lead, Managed Detection & Response",
          "period": "Apr 2023 -- July 2025",
          "highlights": [
            "Led engineering for systems supporting managed detection and response workflows",
            "Served as escalation point for production incidents",
            "Made final architectural decisions for public and internal APIs",
            "Led annual disaster recovery exercises"
          ]
        },
        {
          "title": "Offshore Engineering Team Lead, Client Applications",
          "period": "Apr 2022 -- Apr 2023",
          "highlights": [
            "Built and led an offshore engineering team in Slovakia (3 engineers)",
            "Owned delivery outcomes across multiple workstreams",
            "Implemented agile execution practices"
          ]
        },
        {
          "title": "Senior Full-Stack Engineer, Client Applications",
          "period": "Mar 2020 -- Apr 2022",
          "highlights": [
            "Led development of customer-facing SaaS features for a security platform",
            "Partnered closely with product and design"
          ]
        },
        {
          "title": "MSS Software Engineer",
          "period": "Dec 2018 -- Mar 2020",
          "highlights": [
            "Built and maintained backend services supporting managed security operations",
            "Gained deep exposure to SOC workflows and alert pipelines"
          ]
        }
      ]
    },
    {
      "company": "DOOR3 / AIG",
      "location": "New York, NY",
      "roles": [
        {
          "title": "Senior Software Engineer (Consultant)",
          "period": "May 2017 -- Nov 2018",
          "highlights": [
            "Delivered enterprise-grade financial systems for AIG",
            "Partnered with client stakeholders on complex requirements",
            "Contributed to architectural decisions balancing compliance and scalability"
          ]
        }
      ]
    },
    {
      "company": "Netsmart Technologies",
      "location": "Overland Park, KS",
      "roles": [
        {
          "title": "Software Engineer",
          "period": "Jan 2013 -- June 2016",
          "highlights": [
            "Led migration of a legacy bug tracking system to Jira",
            "Built proof-of-concept Electronic Health Record features",
            "Worked closely with product and engineering leadership"
          ]
        }
      ]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "school": "Stony Brook University",
      "location": "Stony Brook, New York",
      "year": "2012"
    }
  ],
  "skills": {
    "Engineering Leadership": "Distributed teams, cross-functional execution, hiring & mentoring, roadmap execution, stakeholder alignment",
    "Platform & Architecture": "Microservices, distributed systems, cloud infrastructure, API design, GraphQL, event-driven architectures, SaaS",
    "Security & Operations": "Security platforms, incident response, disaster recovery testing, risk management, CI/CD",
    "Technologies": "Golang, Vue, React, PostgreSQL, AWS, Docker, Splunk",
    "Artificial Intelligence": "LLMs, RAG pipelines, AI workflow orchestration, prompt engineering, MCP, secure AI environments"
  }
}
```

### Suggested Filesystem Layout (from Resume Data)

```
~/
├── about.txt                    # Name, title, summary
├── work/
│   ├── bluevoyant/
│   │   ├── tech-lead-supply-chain/
│   │   │   └── details.txt      # Role, Period, Highlights
│   │   ├── tech-lead-mdr/
│   │   │   └── details.txt
│   │   ├── offshore-team-lead/
│   │   │   └── details.txt
│   │   ├── senior-fullstack/
│   │   │   └── details.txt
│   │   └── mss-engineer/
│   │       └── details.txt
│   ├── door3-aig/
│   │   └── senior-engineer/
│   │       └── details.txt
│   └── netsmart/
│       └── software-engineer/
│           └── details.txt
├── education/
│   └── stony-brook/
│       └── details.txt          # Degree, School, Year
├── skills/
│   ├── leadership.txt
│   ├── architecture.txt
│   ├── security.txt
│   ├── technologies.txt
│   └── ai.txt
└── projects/
    └── nicktag-tech.txt         # This portfolio site
```

### xterm.js ITheme Interface (Complete, v6.0.0)

```typescript
// Source: @xterm/xterm@6.0.0 typings/xterm.d.ts (verified from npm package)
interface ITheme {
  foreground?: string
  background?: string
  cursor?: string
  cursorAccent?: string
  selectionBackground?: string
  selectionForeground?: string
  selectionInactiveBackground?: string
  scrollbarSliderBackground?: string
  scrollbarSliderHoverBackground?: string
  scrollbarSliderActiveBackground?: string
  overviewRulerBorder?: string
  // ANSI 16 colors
  black?: string
  red?: string
  green?: string
  yellow?: string
  blue?: string
  magenta?: string
  cyan?: string
  white?: string
  brightBlack?: string
  brightRed?: string
  brightGreen?: string
  brightYellow?: string
  brightBlue?: string
  brightMagenta?: string
  brightCyan?: string
  brightWhite?: string
  extendedAnsi?: string[]
}
```

### localStorage Schema Design

```typescript
// Key: 'nicksite-cli-theme'
// Value: ThemeId string (e.g., 'dark-modern', 'dracula')

// Key: 'nicksite-cli-userfs'
// Value: JSON string of user-created VFS overlay
interface UserFsOverlay {
  files: Record<string, string> // path -> content (for touch)
  directories: string[] // paths of mkdir'd directories
}

// Key: 'nicksite-cli-aliases'
// Value: JSON string of alias map
type AliasMap = Record<string, string> // alias -> command

// Key: 'nicksite-cli-history'
// Value: JSON string of command history
type HistoryStore = string[] // last N commands
```

### Welcome Banner Example

```typescript
// Box-drawing banner using ANSI colors
// Uses bright cyan for border, bright white for title
function generateBanner(ansiColors: {
  brightCyan: string
  brightWhite: string
  reset: string
}): string {
  const { brightCyan, brightWhite, reset } = ansiColors
  return [
    `${brightCyan}╔══════════════════════════════════╗${reset}`,
    `${brightCyan}║${reset}  ${brightWhite}nicktag.tech${reset}                  ${brightCyan}║${reset}`,
    `${brightCyan}║${reset}  interactive resume              ${brightCyan}║${reset}`,
    `${brightCyan}╚══════════════════════════════════╝${reset}`,
    ``,
    `Type 'help' for commands, or try: ls ~/work`,
    ``,
  ].join('\r\n')
}
```

## State of the Art

| Old Approach                   | Current Approach           | When Changed   | Impact                                                                                     |
| ------------------------------ | -------------------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `xterm` (unscoped npm package) | `@xterm/xterm` (scoped)    | xterm.js 5.x+  | Must use `@xterm/xterm` import path. Old `xterm` package is deprecated.                    |
| Canvas renderer as default     | DOM renderer as default    | xterm.js 6.0.0 | `@xterm/addon-canvas` removed entirely. DOM renderer is default. WebGL available as addon. |
| `windowsMode` option           | Removed                    | xterm.js 6.0.0 | Breaking: option no longer exists in ITerminalOptions.                                     |
| `fastScrollModifier` option    | Removed                    | xterm.js 6.0.0 | Breaking: option no longer exists in ITerminalOptions.                                     |
| Alt maps to Ctrl (arrow keys)  | Removed                    | xterm.js 6.0.0 | Breaking: must add custom keybindings if needed. Not relevant for our use case.            |
| Custom EventEmitter            | VS Code base/event Emitter | xterm.js 6.0.0 | Internal change. API events (onData, onKey etc.) work the same.                            |

**Deprecated/outdated:**

- `xterm` (unscoped package): Use `@xterm/xterm` instead
- `@xterm/addon-canvas`: Removed in v6, use DOM or WebGL renderer
- `xterm-addon-fit` (unscoped): Use `@xterm/addon-fit` instead

## Open Questions

1. **$CLITHEME name mapping**
   - What we know: D-07 says "any of the site's 9 curated theme names" like `CLITHEME=dracula`
   - What's unclear: The theme IDs in code use kebab-case (e.g., `synthwave-84`, `dark-modern`). Should $CLITHEME accept display names ("SynthWave '84") or IDs ("synthwave-84")?
   - Recommendation: Accept both -- match by ID first, then case-insensitive display name. Document IDs in help output.

2. **~/projects content**
   - What we know: The LaTeX resume doesn't have a dedicated projects section.
   - What's unclear: What should go in ~/projects/?
   - Recommendation: Include nicktag.tech (this portfolio) as a single project. Can be expanded later.

3. **Line editing scope**
   - What we know: Full readline-style editing (left/right arrow mid-line, Home/End, Ctrl+A/E) is complex.
   - What's unclear: Whether users expect mid-line cursor movement.
   - Recommendation: Phase 7 supports end-of-line editing only (type, backspace from end). Mid-line editing can be added as backlog if users request it.

## Environment Availability

| Dependency       | Required By                 | Available       | Version | Fallback |
| ---------------- | --------------------------- | --------------- | ------- | -------- |
| Bun              | Package management, runtime | Yes             | 1.3.11  | --       |
| Node.js          | Vite dev server             | Yes             | 25.8.1  | --       |
| @xterm/xterm     | Terminal emulation (CLI-01) | No (to install) | 6.0.0   | --       |
| @xterm/addon-fit | Responsive sizing (D-04)    | No (to install) | 0.11.0  | --       |

**Missing dependencies with no fallback:**

- @xterm/xterm and @xterm/addon-fit must be installed via `bun add`

**Missing dependencies with fallback:**

- None

## Sources

### Primary (HIGH confidence)

- @xterm/xterm@6.0.0 npm package typings (`/tmp/package/typings/xterm.d.ts`) -- ITheme, ITerminalOptions, Terminal class API, all verified from actual package
- @xterm/addon-fit@0.11.0 npm package typings -- FitAddon API verified
- xterm.js 6.0.0 GitHub release notes (via `gh api`) -- all breaking changes documented
- Existing project source code -- ThemeColors interface, theme store, useTheme composable, router, CliView.vue, TerminalPanel.vue
- Nick's LaTeX resume (`DirectorEngineeringResume-31626.tex`) -- actual resume content for filesystem population

### Secondary (MEDIUM confidence)

- xterm.js official docs (https://xtermjs.org/) -- referenced for ITheme property list (confirmed against npm package typings)

### Tertiary (LOW confidence)

- None

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- @xterm/xterm is the only serious web terminal library; v6.0.0 verified from npm registry and type definitions extracted
- Architecture: HIGH -- patterns derived from xterm.js official API (onData, write, ITheme) and existing project conventions (Pinia stores, composables, TypeScript strict)
- Pitfalls: HIGH -- derived from xterm.js API behavior verified in type definitions (reference comparison for theme, convertEol requirement, open() DOM measurement requirement)

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (xterm.js v6 is stable; project patterns are established)
