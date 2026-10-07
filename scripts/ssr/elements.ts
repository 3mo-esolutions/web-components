import FileSystem from 'fs'
import Path from 'path'
import { entryPointOf } from './fixtures.ts'

export interface Element {
	readonly tag: string
	readonly path: string
	/** The entry point of the element's package, which a consumer imports and every render goes through. */
	readonly entryPoint: string
	/** The directory name of the element's package. */
	readonly package: string
}

const manifestPath = './custom-elements.json'
if (!FileSystem.existsSync(manifestPath)) {
	throw new Error('custom-elements.json is missing. Run "npm run analyze" first.')
}

const manifest = JSON.parse(FileSystem.readFileSync(manifestPath, 'utf-8')) as { tags: Array<{ name: string, path: string }> }

/** Every element of the manifest, once each. */
export const elements: ReadonlyArray<Element> = [...new Map(manifest.tags.map(tag => {
	const path = tag.path.replace(/\\/g, '/')
	const entryPoint = entryPointOf(path)
	return [tag.name, { tag: tag.name, path, entryPoint, package: Path.basename(Path.dirname(entryPoint)) }] as const
})).values()].sort((a, b) => a.tag.localeCompare(b.tag))

/** The elements of each package, which render and hydrate together. */
export const elementsByPackage = elements.reduce((map, element) => map.set(element.package, [...map.get(element.package) ?? [], element]), new Map<string, Array<Element>>())
