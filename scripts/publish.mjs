import { spawn } from 'node:child_process'
import { stdout } from 'node:process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const packages = ['core', 'react', 'vue']

function pkgPath(name) {
  return path.join(root, 'packages', name, 'package.json')
}

async function readPkg(name) {
  return JSON.parse(await readFile(pkgPath(name), 'utf8'))
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? root,
      stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    })
    let output = ''
    if (options.capture) {
      child.stdout?.on('data', (chunk) => {
        output += chunk.toString()
      })
      child.stderr?.on('data', (chunk) => {
        output += chunk.toString()
      })
    }
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve(output.trim())
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))
    })
  })
}

async function whoami() {
  try {
    return await run('npm', ['whoami'], { capture: true })
  } catch {
    return undefined
  }
}

async function ensureLogin() {
  let user = await whoami()
  if (user) return user

  stdout.write('Not logged in. Opening npm web login…\n')
  await run('npm', ['login', '--auth-type=web'])
  user = await whoami()
  if (!user) throw new Error('npm login failed.')
  return user
}

async function npmVersion(pkgName) {
  try {
    return await run('npm', ['view', pkgName, 'version'], { capture: true })
  } catch {
    return undefined
  }
}

async function main() {
  if (!process.stdin.isTTY) {
    throw new Error('Run `pnpm publish:npm` in a terminal. Publishing uses npm web 2FA.')
  }

  const user = await ensureLogin()
  stdout.write(`npm user: ${user}\n`)

  const local = await Promise.all(
    packages.map(async (name) => {
      const pkg = await readPkg(name)
      return { dir: name, name: pkg.name, version: pkg.version }
    }),
  )

  const remote = await Promise.all(
    local.map(async (pkg) => ({
      ...pkg,
      published: await npmVersion(pkg.name),
    })),
  )

  for (const pkg of remote) {
    stdout.write(
      `${pkg.name}: local ${pkg.version} / npm ${pkg.published ?? '(unpublished)'}\n`,
    )
  }

  const changed = remote.filter((pkg) => pkg.version !== pkg.published)
  if (changed.length === 0) {
    stdout.write('No version changes. Skip publish.\n')
    return
  }

  stdout.write(`Will publish: ${changed.map((pkg) => `${pkg.name}@${pkg.version}`).join(', ')}\n`)
  stdout.write('lint / typecheck / test / build / docs:build…\n')
  await run('pnpm', ['lint'])
  await run('pnpm', ['typecheck'])
  await run('pnpm', ['test'])
  await run('pnpm', ['build'])
  await run('pnpm', ['docs:build'])

  stdout.write(
    'Publishing via pnpm. If npm asks to authenticate, open the URL and confirm with your security key.\n',
  )

  for (const pkg of changed) {
    stdout.write(`Publishing ${pkg.name}@${pkg.version}…\n`)
    await run('pnpm', [
      '--filter',
      pkg.name,
      'publish',
      '--access',
      'public',
      '--no-git-checks',
    ])
  }

  stdout.write(`Published ${changed.map((pkg) => `${pkg.name}@${pkg.version}`).join(', ')}.\n`)
}

main().catch((error) => {
  stdout.write(`${error instanceof Error ? error.message : error}\n`)
  process.exitCode = 1
})
