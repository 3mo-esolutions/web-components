import { ComponentMembers, type CustomElementsManifest, Package, run } from './util/index.ts'
import { ModuleExports } from './util/ModuleExports.ts'
import { promises as FileSystem, existsSync } from 'fs'

await run('wca analyze --outFiles ./custom-elements.json --visibility public ./packages/**/*.ts')

const customElements = JSON.parse(await FileSystem.readFile('./custom-elements.json', 'utf8')) as CustomElementsManifest

const unknownTags = new Array<string>()

// Base classes live in other packages, so every component source has to be known before members can be resolved:
ComponentMembers.collect(customElements.tags.map(tag => tag.path))

customElements.tags = customElements.tags
	.filter(tag => !tag.path.endsWith('.test.ts') && !tag.path.endsWith('.stories.ts') && !/[\\/]stories[\\/]/.test(tag.path))
	.map(tag => {
		const { known, staticOnly, corrections, documentation, accessibility } = ComponentMembers.of(tag.name)
		tag.accessibility = accessibility
		tag.attributes = tag.attributes?.filter(a => !staticOnly.has(a.name))
		tag.properties = tag.properties?.filter(p => !staticOnly.has(p.name))
		if (!known) {
			unknownTags.push(`${tag.name} (${tag.path})`)
		}

		tag.path = tag.path.replace('./', '.\\')

		if (tag.description?.includes('[object Object]')) {
			tag.description = documentation()
		}

		for (const p of [...tag.attributes ?? [], ...tag.properties ?? []]) {
			const correction = corrections.get(p.name)
			if (correction) {
				p.type = correction.type
				p.default = correction.default
			}
			if (p.description?.includes('[object Object]')) {
				p.description = documentation(p.name)
			}

			if (p.type?.startsWith('(object extends TData ? string : TData extends readonly any[] ? Extract<keyof TData')) {
				p.type = 'KeyPath.Of<TData>'
			}
		}

		for (const event of tag.events ?? []) {
			event.type = tag.properties?.find(p => p.name === event.name)?.type?.replace('EventDispatcher', 'CustomEvent') ?? 'CustomEvent'
		}

		// A member without an attribute is public API only once documented; dispatchers are listed as events already.
		tag.properties = tag.properties?.filter(p => !p.type?.startsWith('EventDispatcher') && (!!p.attribute || !!p.description))
		for (const p of [...tag.attributes ?? [], ...tag.properties ?? []]) {
			if (p.default?.includes('\n') || (p.default?.length ?? 0) > 40) {
				p.default = undefined
			}
		}

		return tag
	})

customElements.accessibility = Object.fromEntries(Package.all
	.flatMap(p => !p.entry ? [] : ModuleExports.of(p.entry))
	.filter(entry => entry.accessibility && !ComponentMembers.isElement(entry.name))
	.map(entry => [entry.name, entry.accessibility!]))

if (unknownTags.length) {
	process.stderr.write(
		'\nThe following tags are declared in an "HTMLElementTagNameMap" without a class registering them through'
		+ ' "@component", which usually means the two names do not match:\n'
		+ unknownTags.map(t => `  - ${t}`).join('\n') + '\n'
	)
}

await Promise.all(
	Package.all
		.map(p => ({ package: p, tags: customElements.tags.filter(tag => tag.path.replace(/\\/g, '/').startsWith('./' + p.relativePath)) }))
		.filter(({ package: p, tags }) => tags.length && existsSync(`./${p.relativePath}/dist`))
		.map(({ package: p, tags }) => FileSystem.writeFile(
			`./${p.relativePath}/dist/custom-elements.json`,
			JSON.stringify({ version: 'experimental', tags }, null, '\t'),
		))
)

await FileSystem.writeFile('./custom-elements.json', JSON.stringify(customElements, null, '\t'))