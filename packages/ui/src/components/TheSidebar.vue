<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useDragToDock, type SidebarStore } from '../composables/useDragToDock'
import ThemeDropdown from './ThemeDropdown.vue'

/**
 * TheSidebar is a standalone shared-library component. It does NOT import
 * any app-specific store — the consuming app passes a store that implements
 * the `SidebarStore` contract. This keeps `packages/ui` portable toward an
 * eventual extraction into its own repo.
 */
const props = defineProps<{
  store: SidebarStore
}>()

const headerRef = ref<HTMLElement | null>(null)

const dragApi = useDragToDock({ handle: headerRef, store: props.store })

function onHeaderClick() {
  if (dragApi.wasDragging()) {
    dragApi.resetWasDragging()
    return
  }
  props.store.toggle()
}

function onCloseClick(e: MouseEvent) {
  e.stopPropagation()
  props.store.close()
}

function onHamburgerClick() {
  props.store.toggle()
}

const hamburgerSideClass = computed(() =>
  props.store.dockedSide === 'left' ? 'right-4' : 'left-4',
)

const isMobile = ref(false)
const mql =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(max-width: 639px)')
    : null

function syncMobile() {
  if (mql) isMobile.value = mql.matches
}

onMounted(() => {
  syncMobile()
  mql?.addEventListener('change', syncMobile)
})

onUnmounted(() => {
  mql?.removeEventListener('change', syncMobile)
})

const showAside = computed(() => !isMobile.value || props.store.isOpen)

/**
 * Follow-the-pointer transform during drag. Snap animation resumes on
 * release because dragOffsetX resets to 0 and the `.sidebar.is-dragging`
 * class no longer matches.
 */
const dragStyle = computed(() =>
  props.store.isDragging
    ? { transform: `translateX(${dragApi.dragOffsetX.value}px)` }
    : {},
)

// Active-route pill classes — applied in both rail and card modes so NAV-05
// works identically for icon-only and full-width link presentations.
const activePillClass = 'bg-[var(--color-accent-soft)] !text-accent'
const navLinkClass =
  'text-text-muted hover:bg-hover hover:text-text flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors'
const navLabelClass =
  'nav-label overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
const navIconClass = 'h-4 w-4 flex-shrink-0'
</script>

<template>
  <!-- Hamburger trigger — visible ONLY below 640px (sm breakpoint). Sits opposite docked side. -->
  <button
    type="button"
    class="bg-surface-raised border-border text-text-muted hover:text-accent fixed top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-md border shadow-[var(--shadow-md)] transition-colors sm:hidden"
    :class="hamburgerSideClass"
    :aria-label="props.store.isOpen ? 'Close menu' : 'Open menu'"
    :aria-expanded="props.store.isOpen"
    @click="onHamburgerClick"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  </button>

  <!-- Sidebar — rail at 56px, card at 260px when is-open. Hidden on mobile unless open.
       bottom uses --sidebar-bottom-inset to reserve TheFooter clearance. -->
  <aside
    v-show="showAside"
    class="sidebar bg-surface-raised border-border fixed top-4 z-40 flex flex-col overflow-hidden rounded-[14px] border shadow-[var(--shadow-md)] transition-[width,box-shadow,transform] duration-[360ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
    :class="{
      'is-open w-[var(--sidebar-width)] shadow-[var(--shadow-xl)]':
        props.store.isOpen,
      'w-[var(--sidebar-rail)]': !props.store.isOpen,
      'is-dragging': props.store.isDragging,
      'left-4': props.store.dockedSide === 'left',
      'right-4': props.store.dockedSide === 'right',
    }"
    :style="[{ bottom: 'var(--sidebar-bottom-inset)' }, dragStyle]"
    :data-side="props.store.dockedSide"
  >
    <!-- Header: drag handle + grip icon (rail mode) + brand (card mode) + close button (card mode) -->
    <div
      ref="headerRef"
      data-drag-handle
      class="border-border flex cursor-grab items-center justify-between border-b px-4 py-4 select-none"
      :class="{ 'cursor-grabbing': props.store.isDragging }"
      @click="onHeaderClick"
    >
      <!-- Grip icon: visible in rail mode as a draggability affordance. Fades out when card opens. -->
      <svg
        aria-hidden="true"
        data-testid="sidebar-grip"
        class="text-text-muted flex-shrink-0 transition-[max-width,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        :class="
          props.store.isOpen
            ? 'max-w-0 opacity-0'
            : 'max-w-6 opacity-100 delay-[120ms]'
        "
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="20" y2="17" />
      </svg>
      <span
        class="text-text overflow-hidden text-sm font-semibold whitespace-nowrap transition-[max-width,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        :class="
          props.store.isOpen
            ? 'max-w-[200px] opacity-100 delay-[120ms]'
            : 'max-w-0 opacity-0'
        "
      >
        Nick Tagliasacchi
      </span>
      <button
        type="button"
        class="text-text-muted hover:text-text hover:bg-hover inline-flex h-6 w-0 items-center justify-center overflow-hidden rounded-sm opacity-0 transition-[width,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        :class="props.store.isOpen ? 'w-6 opacity-100 delay-[120ms]' : ''"
        aria-label="Close sidebar"
        @click="onCloseClick"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- Body: section label + nav list -->
    <div class="flex flex-1 flex-col py-2">
      <div
        class="text-text-muted overflow-hidden px-3 text-xs font-semibold tracking-wider uppercase transition-[max-height,margin,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        :class="
          props.store.isOpen
            ? 'my-2 max-h-10 opacity-100 delay-[120ms]'
            : 'my-0 max-h-0 opacity-0'
        "
      >
        Navigate
      </div>
      <ul class="flex flex-col gap-0.5 px-2">
        <li>
          <RouterLink
            to="/"
            title="Home"
            :class="navLinkClass"
            :exact-active-class="activePillClass"
          >
            <svg
              :class="navIconClass"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 12l9-9 9 9M5 10v10h14V10" />
            </svg>
            <span
              :class="[
                navLabelClass,
                props.store.isOpen
                  ? 'max-w-[180px] opacity-100 delay-[120ms]'
                  : 'max-w-0 opacity-0',
              ]"
            >
              Home
            </span>
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/skills"
            title="Skills"
            :class="navLinkClass"
            :active-class="activePillClass"
          >
            <svg
              :class="navIconClass"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
            <span
              :class="[
                navLabelClass,
                props.store.isOpen
                  ? 'max-w-[180px] opacity-100 delay-[120ms]'
                  : 'max-w-0 opacity-0',
              ]"
            >
              Skills
            </span>
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/cli"
            title="CLI"
            :class="navLinkClass"
            :active-class="activePillClass"
          >
            <svg
              :class="navIconClass"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span
              :class="[
                navLabelClass,
                props.store.isOpen
                  ? 'max-w-[180px] opacity-100 delay-[120ms]'
                  : 'max-w-0 opacity-0',
              ]"
            >
              CLI
            </span>
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/playground"
            title="Playground"
            :class="navLinkClass"
            :active-class="activePillClass"
          >
            <svg
              :class="navIconClass"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 9h6v6H9z" />
            </svg>
            <span
              :class="[
                navLabelClass,
                props.store.isOpen
                  ? 'max-w-[180px] opacity-100 delay-[120ms]'
                  : 'max-w-0 opacity-0',
              ]"
            >
              Playground
            </span>
          </RouterLink>
        </li>
      </ul>
    </div>

    <!-- Footer: ThemeDropdown, visible only in card mode via max-height collapse -->
    <div
      class="border-border overflow-hidden border-t px-3 transition-[max-height,padding,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      :class="
        props.store.isOpen
          ? 'max-h-20 py-3 opacity-100 delay-[120ms]'
          : 'max-h-0 py-0 opacity-0'
      "
    >
      <ThemeDropdown />
    </div>
  </aside>
</template>
