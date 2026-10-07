import { existsSync, promises as FileSystem } from 'fs'
import { type CustomElementsManifest, Package, run } from './util/index.ts'
import { PackageReadme } from './util/PackageReadme.ts'

// No arguments: the root README and every package's. "--root": only the root README. Package names: only those packages'.
const options = process.argv.slice(2)
const names = options.filter(option => !option.startsWith('--'))
const packages = names.map(name => Package.all.find(p => p.name === name || p.directoryName === name) ?? unknown(name))

if (!names.length) {
	await FileSystem.writeFile('README.md', `${PackageReadme.root(Package.all)}\n`)
}

if (!options.includes('--root')) {
	if (!existsSync('./custom-elements.json')) {
		await run('npm run --silent analyze', { reject: true })
	}
	const manifest = JSON.parse(await FileSystem.readFile('./custom-elements.json', 'utf8')) as CustomElementsManifest
	await Promise.all((names.length ? packages : Package.all).map(p => FileSystem.writeFile(`${p.path}/README.md`, `${PackageReadme.of(p, manifest)}\n`)))
}

function unknown(name: string): never {
	throw new Error(`There is no package "${name}"`)
}
