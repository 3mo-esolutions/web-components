// @ts-check
import * as FileSystem from 'fs'
import Path from 'path'

export class Packages {
	/** @readonly */
	static directory = './packages'

	static getPackageJsonPaths() {
		return Packages.getPackageJsonPathsByDirectory(Packages.directory)
	}

	static getPackageJsonPathsByDirectory(directory) {
		const files = FileSystem.readdirSync(directory)
		return files.flatMap(file => {
			const fullPath = Path.resolve(directory, file)
			if (FileSystem.statSync(fullPath)?.isDirectory()) {
				return Packages.getPackageJsonPathsByDirectory(fullPath)
			}

			if (file.endsWith('package.json')) {
				return fullPath
			}
		}).filter(Boolean)
	}

	static getPath(packageName) {
		const p = Packages.getPackageJsonPaths().find(path => JSON.parse(FileSystem.readFileSync(path, 'utf8')).name === packageName)
		if (!p) {
			throw new Error(`Could not find package ${packageName}`)
		}
		return p
	}

	static getAllDirectories() {
		return Packages.getPackageJsonPaths().map(path => Path.dirname(path))
	}

	static getDirectory(packageName) {
		const path = Packages.getPath(packageName)
		return Path.dirname(path)
	}

	static getContent(packageName) {
		const path = Packages.getPath(packageName)
		return JSON.parse(FileSystem.readFileSync(path, 'utf8'))
	}
}