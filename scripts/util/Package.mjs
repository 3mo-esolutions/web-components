/* eslint-disable no-console */
// @ts-check
import * as FileSystem from 'fs'
import process from 'process'
import Path from 'path'
import { run } from './run.mjs'

export class Package {
	/** @readonly */
	static directory = './packages'

	/** @type {Package[]} @readonly */ static all = getPackagePathsByDirectory(Package.directory).map(path => new Package(path))

	/** @readonly @type string */ path
	/** @readonly @type string */ relativePath
	/** @readonly @type string */ directoryName
	/** @readonly @type string */ packageJsonPath
	/** @readonly @type object */ packageJson
	/** @readonly @type string */ name

	/** @param {string} path */
	constructor(path) {
		this.path = path
		this.relativePath = Path.relative(process.cwd(), path).replace(/\\/g, '/')
		this.directoryName = Path.basename(path)
		this.packageJsonPath = Path.resolve(path, 'package.json').replace(/\\/g, '/')
		this.packageJson = JSON.parse(FileSystem.readFileSync(this.packageJsonPath, 'utf8'))
		this.name = this.packageJson.name
	}

	/**
	 * Releases the package
	 * @param {string} versionBumpType
	 */
	async release(versionBumpType) {
		await run('npm run clean')
		console.log(await run('tsc', this.relativePath) || 'TypeScript compiled successfully')
		await run('npm run analyze', undefined, true)
		console.log(await run(`npm version --loglevel=error ${versionBumpType}`, this.relativePath))
		console.log(await run('npm publish --loglevel=error --access public', this.relativePath))
		await run('npm run clean')
	}
}

/**
 * Recursively searches a directory for package.json files
 * @param {string} directory - The directory to search for package.json files
 * @returns {string[]} - An array of paths to package.json files
 */
function getPackagePathsByDirectory(directory) {
	const files = FileSystem.readdirSync(directory)
	// @ts-ignore - filter returns string[] | string[][]
	return files.flatMap(file => {
		const fullPath = Path.resolve(directory, file)
		if (FileSystem.statSync(fullPath)?.isDirectory()) {
			return getPackagePathsByDirectory(fullPath)
		}

		if (fullPath.endsWith('package.json') && !fullPath.includes('node_modules')) {
			// remove the package.json file name from the path:
			return Path.dirname(fullPath)
		}
	}).filter(Boolean)
}