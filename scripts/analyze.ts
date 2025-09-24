import { Package, run } from './util/index.ts'
import { promises as FileSystem, existsSync } from 'fs'

await run('wca analyze --outFiles ./custom-elements.json --visibility public ./packages/**/*.ts')

const customElements = (await import('../custom-elements.json', { with: { type: 'json' }, assert: { type: 'json' } })).default
customElements.tags = customElements.tags
	.filter(tag => !tag.path.endsWith('.test.ts') && !tag.path.endsWith('.stories.ts'))
	.map(tag => {
		tag.path = tag.path.replace('./', '.\\')

		for (const p of [...tag.attributes ?? [], tag.properties ?? []]) {
			if ('type' in p && p.type?.startsWith('(object extends TData ? string : TData extends readonly any[] ? Extract<keyof TData')) {
				p.type = 'KeyPath.Of<TData>'
			}
		}

		for (const event of tag.events ?? []) {
			event.type = tag.properties?.find(p => p.name === event.name)?.type?.replace('EventDispatcher', 'CustomEvent') ?? 'CustomEvent'
		}

		return tag
	})

await Promise.all(
	Package.all.map(p => {
		const packageTags = customElements.tags
			.filter(tag => tag.path.replace(/\\/g, '/').startsWith('./' + p.relativePath))
		if (packageTags.length) {
			if (existsSync(`./${p.relativePath}/dist`)) {
				return FileSystem.writeFile(
					`./${p.relativePath}/dist/custom-elements.json`,
					JSON.stringify({ version: 'experimental', tags: packageTags }, null, '\t'),
				)
			}
		}
	})
)

await FileSystem.writeFile('./custom-elements.json', JSON.stringify(customElements, null, '\t'))