import { describe, it, expect } from 'vitest'
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
})
