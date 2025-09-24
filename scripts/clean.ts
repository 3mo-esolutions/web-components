import { Package } from './util/index.ts'
import { promises as FileSystem } from 'fs'
import Path from 'path'

await Promise.all(Package.all.map(p => {
	const dist = Path.join(p.path, 'dist')
	return new Promise(r => FileSystem.rm(dist, { recursive: true }).then(r).catch(r))
}))