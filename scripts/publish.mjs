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
      cwd: root,
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

function parseOtp(argv) {
  const flag = argv.find((arg) => arg.startsWith('--otp'))
  if (!flag) return process.env.NPM_OTP
  if (flag.includes('=')) return flag.slice('--otp='.length)
  const index = argv.indexOf(flag)
  return argv[index + 1]
}

async function whoami() {
  try {
    return await run('npm', ['whoami'], { capture: true })
  } catch {
    throw new Error('Not logged in to npm. Run `npm login` first.')
  }
}

async function npmVersion(pkgName) {
  try {
    return await run('npm', ['view', pkgName, 'version'], { capture: true })
  } catch {
    return undefined
  }
}

async function main() {
  const user = await whoami()
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

  stdout.write('Publishing…\n')
  const filters = changed.flatMap((pkg) => ['--filter', pkg.name])
  const publishArgs = [
    ...filters,
    'publish',
    '--access',
    'public',
    '--no-git-checks',
  ]
  const otp = parseOtp(process.argv.slice(2))
  if (otp) publishArgs.push('--otp', otp)
  await run('pnpm', publishArgs)

  stdout.write(`Published ${changed.map((pkg) => `${pkg.name}@${pkg.version}`).join(', ')}.\n`)
}

main().catch((error) => {
  stdout.write(`${error instanceof Error ? error.message : error}\n`)
  process.exitCode = 1
})
