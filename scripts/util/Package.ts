/* eslint-disable no-console */
import * as FileSystem from 'fs'
import process from 'process'
import Path from 'path'
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
		readonly description: string
		readonly repository: { readonly url: string }
		changelog?: string
	}

	constructor(path: string) {
		this.path = path
		this.relativePath = Path.relative(process.cwd(), path).replace(/\\/g, '/')
		this.directoryName = Path.basename(path)
		this.packageJsonPath = Path.resolve(path, 'package.json').replace(/\\/g, '/')
		this.packageJson = JSON.parse(FileSystem.readFileSync(this.packageJsonPath, 'utf8'))
		this.name = this.packageJson.name
	}

	async release(versionBumpType: string) {
		await run('npm run clean')
		console.log(await run('tsc', this.relativePath) || 'TypeScript compiled successfully')
		await run('npm run analyze', undefined, true)

		if (versionBumpType.includes('--preid')) {
			throw new Error('Do not include the --preid flag in the version bump type. Use "prerelease" instead.')
		}

		const isPreRelease = versionBumpType.startsWith('pre')

		console.log(await run(`npm version --loglevel=error ${versionBumpType.replace('prepatch', 'prerelease')} ${!isPreRelease ? '' : '--preid=preview'}`, this.relativePath))
		console.log(await run(`npm publish --loglevel=error --access public ${!isPreRelease ? '' : '--tag preview'}`, this.relativePath))

		await run('npm run clean')
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

		if (fullPath.endsWith('package.json') && !fullPath.includes('node_modules')) {
			// remove the package.json file name from the path:
			return Path.dirname(fullPath)
		}
	}).filter(Boolean) as Array<string>
}