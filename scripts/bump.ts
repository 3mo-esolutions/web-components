import { Package, run } from './util/index.ts'

// npm run bump -- <@3mo/name or Directory>... <major|minor|patch|premajor|preminor|prepatch|prerelease>
const types = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease']
const names = process.argv.slice(2, -1)
const type = process.argv.at(-1)

if (!names.length || !type || !types.includes(type)) {
	throw new Error(`Usage: npm run bump -- <@3mo/name or Directory>... <${types.join('|')}>`)
}

const packages = names.map(name => Package.all.find(p => p.name === name || p.directoryName === name) ?? unknown(name))

await run(`npm version ${type}${!type.startsWith('pre') ? '' : ' --preid=preview'} --no-git-tag-version --loglevel=error ${packages.map(p => `-w ${p.name}`).join(' ')}`)
await run('npm run --silent analyze', { reject: true })
await run(`npm run --silent readme -- ${packages.map(p => p.name).join(' ')}`)

function unknown(name: string): never {
	throw new Error(`There is no package "${name}"`)
}