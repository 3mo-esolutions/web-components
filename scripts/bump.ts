import * as FileSystem from 'fs'
import { Package, run } from './util/index.ts'

// npm run bump -- [<@3mo/name or Directory>...] [<major|minor|patch|premajor|preminor|prepatch|prerelease>]
const types = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease']
const args = process.argv.slice(2)
const type = types.includes(args.at(-1)!) ? args.pop()! : 'patch'

const packages = args.length
	? args.map(name => Package.all.find(p => p.name === name || p.directoryName === name) ?? unknown(name))
	: await changedPackages()

if (!packages.length) {
	throw new Error(`No package has uncommitted changes that are not bumped yet. Usage: npm run bump -- [<@3mo/name or Directory>...] [<${types.join('|')}>]`)
}

process.stdout.write(`Bumping ${packages.map(p => p.name).join(', ')} (${type})\n`)
await run(`npm version ${type}${!type.startsWith('pre') ? '' : ' --preid=preview'} --no-git-tag-version --no-workspaces-update --loglevel=error ${packages.map(p => `-w ${p.name}`).join(' ')}`)
raisePrereleaseFloors(packages.map(p => new Package(p.path)).filter(p => p.isPrerelease))
await run('npm install --no-audit --no-fund --loglevel=error')
await run('npm run --silent analyze', { reject: true })
await run(`npm run --silent readme -- ${packages.map(p => p.name).join(' ')}`)

/** The packages with uncommitted changes, staged or not, whose version still equals the committed one. */
async function changedPackages() {
	const files = [
		...(await run('git diff HEAD --name-only', { captureOutput: true })).split('\n'),
		...(await run('git ls-files --others --exclude-standard', { captureOutput: true })).split('\n'),
	].map(file => file.trim()).filter(Boolean)
	const changed = Package.all
		.filter(p => !p.packageJson.private)
		.filter(p => files.some(file => file.startsWith(`${p.relativePath}/`)))
	const unbumped = new Array<Package>()
	for (const p of changed) {
		const committed = await run(`git show HEAD:${p.relativePath}/package.json`, { captureOutput: true, reject: true })
		const committedVersion = !committed.trim() ? undefined : (JSON.parse(committed) as { version?: string }).version
		if (committedVersion === p.version) {
			unbumped.push(p)
		} else {
			process.stdout.write(`Skipping ${p.name}, already bumped to ${p.version}\n`)
		}
	}
	return unbumped
}

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