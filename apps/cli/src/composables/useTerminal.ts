import { onMounted, onUnmounted, type Ref, watch } from 'vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { Shell } from '@/terminal/Shell'
import { useTerminalThemeStore } from '@/stores/terminal'

export function useTerminal(containerRef: Ref<HTMLElement | null>) {
  const terminalThemeStore = useTerminalThemeStore()
  let terminal: Terminal | null = null
  let shell: Shell | null = null
  let fitAddon: FitAddon | null = null
  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    if (!containerRef.value) return

    fitAddon = new FitAddon()

    terminal = new Terminal({
      fontSize: 14,
      lineHeight: 1.2,
      fontFamily: "'Menlo', 'DejaVu Sans Mono', 'Courier New', monospace",
      cursorBlink: true,
      cursorStyle: 'block',
      convertEol: true,
      scrollback: 1000,
      theme: { ...terminalThemeStore.xtermTheme },
    })

    terminal.loadAddon(fitAddon)
    terminal.open(containerRef.value)
    fitAddon.fit()

    // Click-anywhere focus per D-03
    containerRef.value.addEventListener('click', () => terminal?.focus())

    // Responsive resize per D-04 -- use ResizeObserver
    resizeObserver = new ResizeObserver(() => {
      if (terminal?.element) {
        fitAddon?.fit()
      }
    })
    resizeObserver.observe(containerRef.value)

    // Create and init Shell
    shell = new Shell(terminal, terminalThemeStore)
    shell.init()

    // Auto-focus terminal on mount
    terminal.focus()

    // Watch for external theme changes
    watch(
      () => terminalThemeStore.xtermTheme,
      (newTheme) => {
        if (terminal) {
          terminal.options.theme = { ...newTheme }
        }
      },
    )
  })

  onUnmounted(() => {
    // Disconnect ResizeObserver BEFORE dispose per Pitfall 2
    resizeObserver?.disconnect()
    resizeObserver = null
    shell?.dispose()
    shell = null
    terminal?.dispose()
    terminal = null
    fitAddon = null
  })
}
