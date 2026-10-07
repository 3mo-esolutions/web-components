import * as FileSystem from 'fs'
import { execa } from 'execa'
import { Package, run } from './util/index.ts'

// npm test -- [<@3mo/name or Directory>...] [--all] [<vitest options>, e.g. -t <name>]
// Runs every kind of test of the given packages: their specs in Chromium and Firefox, their stories and their server-side rendering.
// Without a package it runs everything, which only CI does unless --all asks for it, as the whole suite saturates a laptop.
const args = process.argv.slice(2)
const firstOption = args.findIndex(arg => arg.startsWith('-'))
const names = firstOption === -1 ? args : args.slice(0, firstOption)
const options = firstOption === -1 ? [] : args.slice(firstOption)
const all = options.includes('--all')

const packages = names.map(name => Package.all.find(p => p.name === name || p.directoryName.toLowerCase() === name.toLowerCase())
	?? fail(`There is no package "${name}".`))

if (!packages.length && !all && !process.env.CI) {
	fail('Name the packages to test, as in "npm test -- Button Tab", or pass --all to run every test.')
}

// The server-side rendering tests find the elements in the manifest.
if (!FileSystem.existsSync('./custom-elements.json')) {
	await run('npm run --silent analyze')
}

// A package may have no specs, which leaves a narrowed run's specs project without any file.
const { exitCode } = await execa('npx', ['vitest', 'run', ...!packages.length ? [] : ['--passWithNoTests'], ...options.filter(option => option !== '--all')], {
	stdio: 'inherit',
	reject: false,
	env: { TEST_PACKAGES: packages.map(p => p.directoryName).join(',') },
})
process.exit(exitCode ?? 1)

function fail(message: string): never {
	process.stderr.write(`${message}\n`)
	process.exit(1)
}
