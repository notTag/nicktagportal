// Remote micro-frontend URL resolver
// Extend RemoteName union when adding new remotes: 'blogApp' | 'projectsApp'
export type RemoteName = never

const DEV_BASE = 'http://localhost'
const PROD_BASE = 'https://nicktag.tech'

// Map remote names to local dev server ports
const remotePortsDev: Record<string, number> = {
  // 'blogApp': 3001,
  // 'projectsApp': 3002,
}

// Map remote names to production URL paths
const remotePathsProd: Record<string, string> = {
  // 'blogApp': '/remotes/blog',
  // 'projectsApp': '/remotes/projects',
}

/**
 * Resolve the remoteEntry.js URL for a given remote.
 * Uses import.meta.env.DEV to distinguish local development from production.
 *
 * Local dev: http://localhost:{port}/assets/remoteEntry.js
 * Production: https://nicktag.tech{path}/assets/remoteEntry.js
 */
export function resolveRemoteUrl(name: RemoteName): string {
  if (import.meta.env.DEV) {
    const port = remotePortsDev[name as string]
    return `${DEV_BASE}:${port}/assets/remoteEntry.js`
  }
  const path = remotePathsProd[name as string]
  return `${PROD_BASE}${path}/assets/remoteEntry.js`
}
