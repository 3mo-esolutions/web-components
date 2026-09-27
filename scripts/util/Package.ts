import * as FileSystem from 'fs'
import process from 'process'
import Path from 'path'
import { execa } from 'execa'
import { run } from './run.ts'

export class Package {
	static readonly directory = './packages'

	static readonly all = getPackagePathsByDirectory(Package.directory).map(path => new Package(path))

	readonly path!: string
	readonly relativePath!: string
	readonly directoryName!: string
	readonly packageJsonPath!: string
	readonly name!: string
	readonly packageJson!: {
		readonly name: string
		readonly version: string
		readonly description: string
		readonly homepage?: string
		readonly license?: string
		readonly author?: string | { readonly name: string }
		readonly main?: string
		readonly repository: { readonly url: string }
		readonly private?: boolean
		readonly dependencies?: Readonly<Record<string, string>>
		readonly peerDependencies?: Readonly<Record<string, string>>
		readonly optionalDependencies?: Readonly<Record<string, string>>
	}

	constructor(path: string) {
		this.path = path
		this.relativePath = Path.relative(process.cwd(), path).replace(/\\/g, '/')
		this.directoryName = Path.basename(path)
		this.packageJsonPath = Path.resolve(path, 'package.json').replace(/\\/g, '/')
		this.packageJson = JSON.parse(FileSystem.readFileSync(this.packageJsonPath, 'utf8'))
		this.name = this.packageJson.name
	}

	/** The module consumers import, as a source file of the package. */
	get entry() {
		return [Path.join(this.path, 'index.ts'), this.packageJson.main && Path.join(this.path, this.packageJson.main)]
			.find(path => !!path && !path.split(Path.sep).includes('dist') && FileSystem.existsSync(path)) || undefined
	}

	/** The repository's web address, as npm also accepts `git+https://….git`. */
	get repositoryUrl() {
		return this.packageJson.repository.url.replace(/^git\+/, '').replace(/\.git$/, '')
	}

	get version() {
		return this.packageJson.version
	}

	/** Whether the version is a prerelease, which is published under the "preview" tag. */
	get isPrerelease() {
		return this.version.includes('-')
	}

	/** The workspace packages this one needs installed, development dependencies aside. */
	get dependencies() {
		const { dependencies, peerDependencies, optionalDependencies } = this.packageJson
		const names = new Set(Object.keys({ ...dependencies, ...peerDependencies, ...optionalDependencies }))
		return Package.all.filter(p => names.has(p.name))
	}

	/** Every package, each after the workspace packages it depends on directly or transitively. */
	static get inDependencyOrder() {
		const ordered = new Array<Package>()
		const visit = (p: Package, path: ReadonlyArray<Package>) => {
			if (path.includes(p)) {
				throw new Error(`Circular dependency: ${[...path, p].map(p => p.name).join(' → ')}`)
			}
			if (!ordered.includes(p)) {
				p.dependencies.forEach(dependency => visit(dependency, [...path, p]))
				ordered.push(p)
			}
		}
		Package.all.forEach(p => visit(p, []))
		return ordered
	}

	/** What npm records of the current version, or undefined while npm does not have it. */
	async published() {
		const { stdout, exitCode } = await execa(`npm view ${this.name}@${this.version} version gitHead --json --loglevel=silent`, { shell: true, reject: false })
		const output = !stdout.trim() ? undefined : JSON.parse(stdout) as string | { readonly version?: string, readonly gitHead?: string, readonly error?: { readonly code: string, readonly summary: string } }
		if (typeof output === 'object' && output.error) {
			if (output.error.code === 'E404') {
				return undefined
			}
			throw new Error(`npm could not look up ${this.name}@${this.version}: ${output.error.summary}`)
		}
		if (exitCode) {
			throw new Error(`npm could not look up ${this.name}@${this.version}`)
		}
		return !output ? undefined : typeof output === 'string' ? { version: output } : output
	}

	async build() {
		await FileSystem.promises.rm(Path.join(this.path, 'dist'), { recursive: true, force: true })
		if (FileSystem.existsSync(Path.join(this.path, 'tsconfig.json'))) {
			await run(`node ./node_modules/typescript/bin/tsc -p ${this.relativePath} --incremental false`)
		}
	}

	async publish() {
		await run(`npm publish --loglevel=error --access public${!this.isPrerelease ? '' : ' --tag preview'}`, { directory: this.relativePath })
	}
}

/** Recursively searches a directory for package.json files */
function getPackagePathsByDirectory(directory: string): Array<string> {
	const files = FileSystem.readdirSync(directory)
	return files.flatMap(file => {
		const fullPath = Path.resolve(directory, file)
		if (FileSystem.statSync(fullPath)?.isDirectory()) {
			return getPackagePathsByDirectory(fullPath)
		}

		// remove the package.json file name from the path:
		return fullPath.endsWith('package.json') && !fullPath.includes('node_modules') ? [Path.dirname(fullPath)] : []
	})
}