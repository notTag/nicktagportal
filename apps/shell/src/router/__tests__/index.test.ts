import { describe, it, expect } from 'vitest'
import router from '@/router'

describe('router configuration', () => {
  it('has a route for / with name home', () => {
    const routes = router.getRoutes()
    const home = routes.find((r) => r.name === 'home')
    expect(home).toBeDefined()
    expect(home!.path).toBe('/')
  })

  it('has a route for /skills with name skills', () => {
    const routes = router.getRoutes()
    const skills = routes.find((r) => r.name === 'skills')
    expect(skills).toBeDefined()
    expect(skills!.path).toBe('/skills')
  })

  it('has a route for /cli with name cli', () => {
    const routes = router.getRoutes()
    const cli = routes.find((r) => r.name === 'cli')
    expect(cli).toBeDefined()
    expect(cli!.path).toBe('/cli')
  })

  it('has a route for /playground with name playground', () => {
    const routes = router.getRoutes()
    const playground = routes.find((r) => r.name === 'playground')
    expect(playground).toBeDefined()
    expect(playground!.path).toBe('/playground')
  })

  it('has a route for /playground/:remote with name playground-remote', () => {
    const routes = router.getRoutes()
    const remote = routes.find((r) => r.name === 'playground-remote')
    expect(remote).toBeDefined()
    expect(remote!.path).toBe('/playground/:remote')
  })

  it('has a catch-all route with name not-found', () => {
    const routes = router.getRoutes()
    const notFound = routes.find((r) => r.name === 'not-found')
    expect(notFound).toBeDefined()
  })

  it('defines exactly 6 routes', () => {
    const routes = router.getRoutes()
    expect(routes).toHaveLength(6)
  })

  it('uses web history mode', () => {
    // Vue Router normalizes base '/' to empty string
    // Verify it uses createWebHistory (not hash) by checking the history type
    const base = router.options.history.base
    expect(base === '/' || base === '').toBe(true)
  })

  describe('lazy-loaded route components', () => {
    it('resolves SkillsView component from /skills route', async () => {
      const routes = router.getRoutes()
      const skills = routes.find((r) => r.name === 'skills')
      const componentDef = skills!.components!.default
      // Lazy routes have a function that returns a promise
      if (typeof componentDef === 'function') {
        const mod = await (componentDef as () => Promise<unknown>)()
        expect(mod).toBeTruthy()
      }
    })

    it('resolves CliView component from /cli route', async () => {
      const routes = router.getRoutes()
      const cli = routes.find((r) => r.name === 'cli')
      const componentDef = cli!.components!.default
      if (typeof componentDef === 'function') {
        const mod = await (componentDef as () => Promise<unknown>)()
        expect(mod).toBeTruthy()
      }
    })

    it('resolves PlaygroundView component from /playground route', async () => {
      const routes = router.getRoutes()
      const playground = routes.find((r) => r.name === 'playground')
      const componentDef = playground!.components!.default
      if (typeof componentDef === 'function') {
        const mod = await (componentDef as () => Promise<unknown>)()
        expect(mod).toBeTruthy()
      }
    })

    it('resolves NotFoundView component from catch-all route', async () => {
      const routes = router.getRoutes()
      const notFound = routes.find((r) => r.name === 'not-found')
      const componentDef = notFound!.components!.default
      if (typeof componentDef === 'function') {
        const mod = await (componentDef as () => Promise<unknown>)()
        expect(mod).toBeTruthy()
      }
    })
  })
})
