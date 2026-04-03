import { vi } from 'vitest'

// Mock IntersectionObserver (not available in happy-dom)
const MockIntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

// Clear localStorage between tests to prevent state leakage
beforeEach(() => {
  localStorage.clear()
})
