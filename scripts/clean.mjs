/* eslint-disable */
// @ts-check
import { Packages } from './util/index.mjs'
import FileSystem from 'fs'
import path from 'path'

for (const directory of Packages.getAllDirectories()) {
	const distDirectory = path.join(directory, 'dist')
	if (FileSystem.existsSync(distDirectory)) {
		FileSystem.rmSync(distDirectory, { recursive: true })
	}
}