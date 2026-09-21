/**
 * Provider keys for the experiments: read from the environment, else from a
 * gitignored .env file at the repository root (KEY=value lines). Never printed.
 */
import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const fileEnv = {}
for (const candidate of [path.join(root, '.env'), path.join(root, '.env.local')]) {
  if (!fs.existsSync(candidate)) continue
  for (const line of fs.readFileSync(candidate, 'utf8').split(/\r?\n/)) {
    if (!/^[A-Z0-9_]+=/.test(line)) continue
    const i = line.indexOf('=')
    fileEnv[line.slice(0, i)] = line.slice(i + 1).replace(/^"|"$/g, '')
  }
}
export const env = new Proxy({}, { get: (_, k) => process.env[k] ?? fileEnv[k] })
