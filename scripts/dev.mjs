import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:net'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const services = [
  { name: 'backend', directory: 'backend' },
  { name: 'storefront', directory: 'storefront' },
]

// Check before spawning anything: a second workspace launch must not start a
// storefront alongside an existing backend and accidentally capture its API port.
for (const [name, port] of [['backend', 3000], ['storefront', 3001], ['dashboard', 5173]]) {
  try {
    await new Promise((resolve, reject) => {
      const probe = createServer()
      probe.once('error', reject)
      probe.listen({ port, host: '::', exclusive: true }, () => probe.close(resolve))
    })
  } catch (error) {
    console.error(`[${name}] Cannot start: port ${port} is unavailable (${error.code}). Stop the existing dev process before running npm run dev again.`)
    process.exit(1)
  }
}

let stopping = false
let exitCode = 0
let openProcesses = services.length
const children = []

function signalChildren(signal) {
  for (const child of children) {
    if (!child.pid || child.exitCode !== null) continue
    try {
      if (process.platform === 'win32') child.kill(signal)
      else process.kill(-child.pid, signal)
    } catch (error) {
      if (error.code !== 'ESRCH') console.error(error)
    }
  }
}

function stop(signal = 'SIGINT') {
  if (stopping) return
  stopping = true
  signalChildren(signal)
  const forceStop = setTimeout(() => signalChildren('SIGKILL'), 5000)
  forceStop.unref()
}

process.on('SIGINT', () => {
  exitCode = 130
  stop('SIGINT')
})
process.on('SIGTERM', () => {
  exitCode = 143
  stop('SIGTERM')
})

for (const service of services) {
  const child = spawn(npm, ['run', 'dev'], {
    cwd: join(root, service.directory),
    env: process.env,
    detached: process.platform !== 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  children.push(child)

  for (const stream of [child.stdout, child.stderr]) {
    const lines = createInterface({ input: stream })
    lines.on('line', line => console.log(`[${service.name}] ${line}`))
  }

  child.on('error', error => {
    console.error(`[${service.name}] ${error.message}`)
    exitCode = 1
    stop()
  })

  child.on('close', (code, signal) => {
    openProcesses -= 1
    if (!stopping) {
      console.error(`[${service.name}] stopped (${signal ?? `exit ${code}`}); stopping the other service`)
      exitCode = code || 1
      stop()
    }
    if (openProcesses === 0) process.exit(exitCode)
  })
}
