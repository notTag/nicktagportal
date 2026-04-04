import { vi, beforeEach } from 'vitest'

// Mock IntersectionObserver (not available in happy-dom)
// Stub with a real class so `new IntersectionObserver(...)` works correctly
const MockIntersectionObserver = vi.fn(function (this: {
  observe: ReturnType<typeof vi.fn>
  unobserve: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
}) {
  this.observe = vi.fn()
  this.unobserve = vi.fn()
  this.disconnect = vi.fn()
})
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

// Mock localStorage (not fully available in happy-dom)
const localStorageStore: Record<string, string> = {}
const localStorageMock: Storage = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key]
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(localStorageStore)) {
      delete localStorageStore[key]
    }
  }),
  key: vi.fn((index: number) => Object.keys(localStorageStore)[index] ?? null),
  get length() {
    return Object.keys(localStorageStore).length
  },
}
vi.stubGlobal('localStorage', localStorageMock)

// Clear localStorage between tests to prevent state leakage
beforeEach(() => {
  localStorage.clear()
  vi.mocked(localStorage.getItem).mockClear()
  vi.mocked(localStorage.setItem).mockClear()
  vi.mocked(localStorage.removeItem).mockClear()
})
