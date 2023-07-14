// @ts-check
import * as FileSystem from 'fs'
import Path from 'path'
import { run } from './run.mjs'

export class Packages {
	/** @readonly */
	static directory = './packages'

	/**
	 * Recursively searches the packages directory for package.json files
	 * @returns {string[]} - An array of paths to package.json files
	 */
	static getPackageJsonPaths() {
		return Packages.getPackageJsonPathsByDirectory(Packages.directory)
	}

	/**
	 * Recursively searches a directory for package.json files
	 * @param {string} directory - The directory to search for package.json files
	 * @returns {string[]} - An array of paths to package.json files
	 */
	static getPackageJsonPathsByDirectory(directory) {
		const files = FileSystem.readdirSync(directory)
		// @ts-ignore - filter returns string[] | string[][]
		return files.flatMap(file => {
			const fullPath = Path.resolve(directory, file)
			if (FileSystem.statSync(fullPath)?.isDirectory()) {
				return Packages.getPackageJsonPathsByDirectory(fullPath)
			}

			if (fullPath.endsWith('package.json') && !fullPath.includes('node_modules')) {
				return fullPath
			}
		}).filter(Boolean)
	}

	/**
	 * Gets the path to a folder containing the given package name
	 * @param {string} packageName
	 * @returns {string}
	 */
	static getPath(packageName) {
		const p = Packages.getPackageJsonPaths().find(path => JSON.parse(FileSystem.readFileSync(path, 'utf8')).name === packageName)
		if (!p) {
			throw new Error(`Could not find package ${packageName}`)
		}
		return p
	}

	/**
	 * Gets the directories' paths containing package.json files
	 * @returns {string[]} - An array of paths to directories containing package.json files
	 */
	static getAllDirectories() {
		return Packages.getPackageJsonPaths().map(path => Path.dirname(path))
	}

	/**
	 *  Gets the names of all packages
	 * @returns {string[]} - An array of package names
	 */
	static getAllPackages() {
		return Packages.getPackageJsonPaths().map(p => {
			const content = JSON.parse(FileSystem.readFileSync(p, 'utf8'))
			return content.name
		})
	}

	/**
	 * Gets the path to a folder containing the given package name
	 * @param {string} packageName
	 * @returns {string} - The path to the directory containing the package.json file with the given package name
	 */
	static getDirectory(packageName) {
		const path = Packages.getPath(packageName)
		return Path.dirname(path)
	}

	/**
	 * Gets the content of a package.json file
	 * @param {string} packageName - The name of the package
	 * @returns {object} - The content of the package.json file
	 */
	static getContent(packageName) {
		const path = Packages.getPath(packageName)
		return JSON.parse(FileSystem.readFileSync(path, 'utf8'))
	}

	/**
	 * Releases a package
	 * @param {string} packageName
	 * @param {string} versionBumpType
	 */
	static async release(packageName, versionBumpType) {
		const packageDirectory = Packages.getDirectory(packageName)
		await run('npm run clean')
		await run('tsc', packageDirectory)
		await run(`npm version --loglevel=error ${versionBumpType}`, packageDirectory)
		await run('npm publish --loglevel=error --access public', packageDirectory)
		await run('npm run clean')
	}

	/**
	 * Releases all packages
	 */
	static async releaseAll() {
		const versionBumpType = 'patch'
		const packages = Packages.getAllPackages()
		for (const packageName of packages) {
			try {
				await Packages.release(packageName, versionBumpType)
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error(error)
			}
		}
	}
}