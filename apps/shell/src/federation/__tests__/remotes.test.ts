import { describe, it, expect, vi } from 'vitest'
import { resolveRemoteUrl } from '@/federation/remotes'

describe('resolveRemoteUrl', () => {
  it('is an exported function', () => {
    expect(typeof resolveRemoteUrl).toBe('function')
  })

  it('returns a URL containing localhost in DEV mode', () => {
    // In vitest with happy-dom, import.meta.env.DEV defaults to true
    const url = resolveRemoteUrl('testApp' as never)
    expect(url).toContain('localhost')
    expect(url).toContain('/assets/remoteEntry.js')
  })

  it('returns a URL with the expected dev format', () => {
    const url = resolveRemoteUrl('testApp' as never)
    // Port will be undefined since no remotes are configured
    expect(url).toMatch(/^http:\/\/localhost:.*\/assets\/remoteEntry\.js$/)
  })

  it('returns production URL when DEV is false', async () => {
    // Dynamically re-import with mocked import.meta.env
    vi.stubEnv('DEV', false)

    // Need to re-import the module to pick up the env change
    // Clear module cache and re-import
    const mod = await import('@/federation/remotes')

    // Even with DEV=false, the module may have been cached.
    // The resolveRemoteUrl function checks import.meta.env.DEV at call time.
    const url = mod.resolveRemoteUrl('testApp' as never)
    expect(url).toContain('nicktag.tech')
    expect(url).toContain('/assets/remoteEntry.js')

    vi.unstubAllEnvs()
  })
})
