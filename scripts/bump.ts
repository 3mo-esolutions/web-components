import * as FileSystem from 'fs'
import { Package, run } from './util/index.ts'

// npm run bump -- <@3mo/name or Directory>... <major|minor|patch|premajor|preminor|prepatch|prerelease>
const types = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease']
const names = process.argv.slice(2, -1)
const type = process.argv.at(-1)

if (!names.length || !type || !types.includes(type)) {
	throw new Error(`Usage: npm run bump -- <@3mo/name or Directory>... <${types.join('|')}>`)
}

const packages = names.map(name => Package.all.find(p => p.name === name || p.directoryName === name) ?? unknown(name))

await run(`npm version ${type}${!type.startsWith('pre') ? '' : ' --preid=preview'} --no-git-tag-version --no-workspaces-update --loglevel=error ${packages.map(p => `-w ${p.name}`).join(' ')}`)
raisePrereleaseFloors(packages.map(p => new Package(p.path)).filter(p => p.isPrerelease))
await run('npm install --no-audit --no-fund --loglevel=error')
await run('npm run --silent analyze', { reject: true })
await run(`npm run --silent readme -- ${packages.map(p => p.name).join(' ')}`)

/** A prerelease satisfies no range but one naming a prerelease of its own version, so the workspace would not install: its dependents require it from here on. */
function raisePrereleaseFloors(prereleases: ReadonlyArray<Package>) {
	for (const dependent of Package.all) {
		const text = FileSystem.readFileSync(dependent.packageJsonPath, 'utf8')
		const json = JSON.parse(text) as Record<string, Record<string, string> | undefined>
		const raised = prereleases.filter(p => ['dependencies', 'peerDependencies', 'devDependencies'].some(field => {
			const ranges = json[field]
			return !ranges?.[p.name] ? false : !!(ranges[p.name] = `>=${p.version}`)
		}))
		if (raised.length) {
			FileSystem.writeFileSync(dependent.packageJsonPath, JSON.stringify(json, undefined, '\t') + (text.endsWith('\n') ? '\n' : ''))
			process.stdout.write(`${dependent.name} now requires ${raised.map(p => `${p.name}@>=${p.version}`).join(', ')}\n`)
		}
	}
}

function unknown(name: string): never {
	throw new Error(`There is no package "${name}"`)
}