import * as FileSystem from 'fs'
import { Package } from './util/index.ts'

// An application must load one copy of every package that defines custom elements or shares their state. As peer dependencies, npm installs them next to the application and refuses a second copy. "--fix" moves them out of "dependencies".
const fix = process.argv.includes('--fix')
const shared = ['@material/web', '@lit-labs/virtualizer', '@a11d/lit', '@a11d/lit-application']
const isShared = (name: string) => name.startsWith('@3mo/') || shared.includes(name)

const misplaced = Package.all
	.map(p => ({ package: p, names: Object.keys(p.packageJson.dependencies ?? {}).filter(isShared) }))
	.filter(({ names }) => names.length)

if (fix) {
	for (const { package: p, names } of misplaced) {
		const text = FileSystem.readFileSync(p.packageJsonPath, 'utf8')
		const json = JSON.parse(text) as Record<string, unknown> & { dependencies: Record<string, string>, peerDependencies?: Record<string, string> }
		const moved = Object.fromEntries(names.map(name => [name, json.dependencies[name]!]))
		const dependencies = Object.fromEntries(Object.entries(json.dependencies).filter(([name]) => !names.includes(name)))
		const entries = Object.entries(json).flatMap(([key, value]) => key === 'peerDependencies' ? []
			: key !== 'dependencies' ? [[key, value]]
				: [...!Object.keys(dependencies).length ? [] : [['dependencies', dependencies]], ['peerDependencies', { ...json.peerDependencies, ...moved }]])
		FileSystem.writeFileSync(p.packageJsonPath, JSON.stringify(Object.fromEntries(entries), undefined, '\t') + (text.endsWith('\n') ? '\n' : ''))
	}
	process.stdout.write(`Moved into peerDependencies in ${misplaced.length} packages.\n`)
} else if (misplaced.length) {
	process.stderr.write(`These belong in peerDependencies, as an application must load them once ("npm run peers -- --fix" moves them):\n${misplaced.map(({ package: p, names }) => `  ${p.name}: ${names.join(', ')}`).join('\n')}\n`)
	process.exitCode = 1
}