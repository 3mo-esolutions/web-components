import FileSystem from 'fs'
import Path from 'path'
import { storyNameFromExport } from 'storybook/internal/csf'
import type { CustomElementsManifest, Member, Ssr, Tag } from './CustomElementsManifest.ts'
import { type ModuleExport, ModuleExports } from './ModuleExports.ts'
import type { Package } from './Package.ts'
import { StoriesFile } from './StoriesFile.ts'

/**
 * The README of a package, projected from what its Storybook page is built of: the package.json, the class JSDoc of
 * its elements through the manifest, its stories and the JSDoc above them. Nothing in it is written by hand.
 */
export class PackageReadme {
	static of(p: Package, manifest: CustomElementsManifest) {
		return new PackageReadme(p, manifest).toString()
	}

	/** The repository's README: every package with its documentation, version and downloads. */
	static root(packages: ReadonlyArray<Package>) {
		const style = 'for-the-badge'
		const rows = [...packages]
			.sort((a, b) => a.directoryName.localeCompare(b.directoryName, 'en', { sensitivity: 'base' }))
			.map(p => {
				const encoded = encodeURIComponent(p.name)
				const npm = `https://www.npmjs.com/package/${p.name}`
				return [
					`[${p.directoryName}](${p.packageJson.homepage ?? p.relativePath})`,
					`[![](https://img.shields.io/badge/${encoded.replace(/-/g, '--')}-8A2BE2?style=${style}&logo=npm&logoColor=red&color=white)](${npm})`,
					`[![](https://img.shields.io/npm/v/${encoded}?style=${style}&label=)](${npm})`,
					`[![](https://img.shields.io/npm/dm/${encoded}?style=${style}&label=&color=blue)](${npm})`,
				]
			})
		return [
			'<div align="center">\n<a href="https://3mo.de">\n<img src="https://www.3mo.de/wp-content/themes/3mo/assets/images/logo_3mo.svg" alt="3MO Logo" width="80" height="80">\n</a>',
			'<h3>3MO Web Components</h3>',
			`[![Tests](https://img.shields.io/github/actions/workflow/status/3mo-esolutions/web-components/development.yml?logo=github&style=${style}&label=Tests)](https://github.com/3mo-esolutions/web-components/actions/workflows/development.yml)\n`
			+ `[![Stories](https://img.shields.io/badge/-Stories-pink.svg?logo=storybook&style=${style})](${StoriesFile.storybookUrl})`,
			table(['Module', 'Package', 'Version', 'Downloads'], rows),
			'</div>',
		].join('\n\n')
	}

	private readonly package: Package
	private readonly homepage: string
	private readonly storiesFiles: ReadonlyArray<StoriesFile>
	private readonly elements: ReadonlyArray<Tag>
	/** The elements the package's pages document, whose descriptions introduce the README. */
	private readonly featured: ReadonlySet<Tag>
	private readonly exports: ReadonlyArray<ModuleExport>

	private constructor(p: Package, manifest: CustomElementsManifest) {
		this.package = p
		this.homepage = p.packageJson.homepage ?? StoriesFile.storybookUrl

		const storiesFiles = StoriesFile.of(p.path, p.name)
		const docsId = /[?&]path=\/docs\/([^&#]+?)--/.exec(this.homepage)?.[1]
		const primary = storiesFiles.find(file => file.id === docsId)
			?? storiesFiles.find(file => Path.basename(file.path) === `${p.directoryName}.stories.ts`)
			?? storiesFiles[0]
		this.storiesFiles = !primary ? [] : [primary, ...storiesFiles.filter(file => file !== primary)]

		const tags = manifest.tags.filter(tag => `./${tag.path.replace(/\\/g, '/').replace(/^\.\//, '')}`.startsWith(`./${p.relativePath}/`))
		const unique = [...new Set(tags.map(tag => tag.name))].map(name => {
			const candidates = tags.filter(tag => tag.name === name)
			return candidates.length === 1 ? candidates[0]! : candidates.find(declares) ?? candidates[0]!
		})
		const components = this.storiesFiles.flatMap(file => unique.filter(tag => tag.name === file.component))
		this.elements = [...new Set([...components, ...unique])]
		this.featured = new Set(components.length ? components : unique)

		this.exports = !p.entry ? [] : ModuleExports.of(p.entry)
	}

	toString() {
		const { name, description, license, author } = this.package.packageJson
		const usage = this.storiesFiles[0]?.usage
		const source = `${this.package.repositoryUrl}/tree/main/${this.package.relativePath}`
		const inStorybook = this.homepage.startsWith(StoriesFile.storybookUrl)
		return [
			`# ${storyNameFromExport(this.package.directoryName)}`,
			description,
			[
				`[![npm](https://img.shields.io/npm/v/${name}?style=flat-square&color=0077c8)](https://www.npmjs.com/package/${name})`,
				...!inStorybook ? [] : [`[![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](${this.homepage})`],
			].join(' '),
			this.introduction,
			'## Installation',
			fence('sh', `npm install ${name}`),
			fence('ts', this.importStatement),
			...this.serverSideRendering,
			...!usage ? [] : ['## Usage', fence('html', usage)],
			...this.examples,
			...this.accessibility,
			...this.api,
			'## Links',
			[
				...this.homepage === source ? [] : [`- [Documentation](${this.homepage})`],
				// The changelog is a section of the package's page, which only packages with stories have:
				...!inStorybook || !this.homepage.includes('path=/docs/') ? [] : [`- [Changelog](${this.homepage})`],
				`- [Source](${source})`,
			].join('\n'),
			...!license ? [] : ['## License', `${license}${!author ? '' : ` © ${typeof author === 'string' ? author : author.name}`}`],
		].filter(Boolean).join('\n\n').replace(/\r\n?/g, '\n')
	}

	private get introduction() {
		const described = [...this.featured].filter(tag => prose(tag.description))
		return described
			.map(tag => paragraphs(prose(tag.description), described.length === 1 ? undefined : tag.name))
			.join('\n\n')
	}

	/** What the `@ssr` tags of the featured elements declare, linking to what rendering on the server takes. */
	private get serverSideRendering() {
		const declared = [...this.featured].filter(tag => tag.ssr)
		const link = `[Server-side rendering](${StoriesFile.storybookUrl}?path=/docs/getting-started-installation--overview#server-side-rendering)`
		return !declared.length ? []
			: declared.length === 1 ? [`${link}: ${ssrOf(declared[0]!.ssr!)}`]
				: [`${link}:`, declared.map(tag => `- \`<${tag.name}>\`: ${ssrOf(tag.ssr!)}`).join('\n')]
	}

	private get importStatement() {
		const { name } = this.package.packageJson
		if (this.elements.length) {
			return `import '${name}'`
		}
		// What the stories import is what using the package takes; failing that, a long list is narrowed to what is documented:
		const values = this.exports.filter(entry => !entry.typeOnly)
		const imported = new Set(this.storiesFiles.flatMap(file => [...file.imports]))
		const main = [values.filter(entry => imported.has(entry.name)), values.length <= 3 ? values : values.filter(entry => entry.description), values]
			.find(entries => entries.length) ?? []
		const names = main.map(entry => entry.name)
		return !names.length ? `import '${name}'`
			: names.join(', ').length <= 60 ? `import { ${names.join(', ')} } from '${name}'`
				: `import {\n${names.map(n => `\t${n},`).join('\n')}\n} from '${name}'`
	}

	/** Every story but the one shown as the usage, those of the package's other pages under their own heading. */
	private get examples() {
		const [primary, ...others] = this.storiesFiles
		const list = (stories: StoriesFile['stories']) => stories
			.map(story => `- [${story.name.replace(/[[\]]/g, '\\$&')}](${story.url})${!story.description ? '' : ` — ${summary(story.description)}`}`)
			.join('\n')
		const blocks = !primary ? [] : [
			list(primary.stories.slice(primary.usage ? 1 : 0)),
			...others.flatMap(file => !file.stories.length ? [] : [`### ${file.title.split('/').pop()!.trim()}`, list(file.stories)]),
		].filter(Boolean)
		return !blocks.length ? [] : ['## Examples', ...blocks]
	}

	/** The `@accessibility` sections of the package's elements and controllers, under a heading each where there are several. */
	private get accessibility() {
		const sections = [
			...this.elements.map(tag => [tag.name, tag.accessibility] as const),
			...this.exports.map(entry => [entry.name, entry.accessibility] as const),
		].filter((section): section is readonly [string, string] => !!section[1])
		const unique = sections
			.filter(([, text], index) => sections.findIndex(([, other]) => other === text) === index)
			// Links between pages are relative to the Storybook, which a README is not part of:
			.map(([name, text]) => [name, text.replaceAll('](?path=', `](${StoriesFile.storybookUrl}?path=`)] as const)
		return !unique.length ? [] : [
			'## Accessibility',
			...unique.flatMap(([name, text]) => unique.length === 1 ? [text] : [`### ${code(name)}`, text]),
		]
	}

	private get api() {
		if (this.elements.length) {
			const elements = this.elements
				.map(tag => elementApi(tag, this.storiesFiles.find(file => file.component === tag.name)?.argTypeDescriptions, !this.featured.has(tag)))
				.filter(blocks => blocks.length > 1)
			return !elements.length ? [] : ['## API', ...elements.flat()]
		}
		// Undocumented types are mostly the options of what is listed anyway:
		const exports = this.exports
			.map(entry => ({ ...entry, summary: !entry.description ? '' : summary(entry.description) }))
			.filter(entry => !entry.typeOnly || entry.summary)
		return !exports.length ? [] : [
			'## API',
			'### Exports',
			table(['Name', 'Kind', 'Description?'], exports.map(entry => [code(entry.name), entry.kind, entry.summary])),
		]
	}
}

/** The heading and tables of an element's API, opened by its description unless the text around already introduces it. */
export function elementApi(tag: Tag, argTypeDescriptions: ReadonlyMap<string, string> | undefined, describeElement: boolean) {
	const describe = (member: Member) => [
		!member.deprecatedMessage ? '' : `**Deprecated**: ${inline(member.deprecatedMessage)}`,
		inline(prose(member.description) || argTypeDescriptions?.get(member.name) || ''),
	].filter(Boolean).join(' ')
	const properties = (tag.properties ?? []).filter(p => !p.type?.startsWith('EventDispatcher') || !tag.events?.some(event => event.name === p.name))
	const attributes = (tag.attributes ?? []).filter(attribute => !properties.some(p => p.attribute === attribute.name))
	const sections: Array<[string, string]> = [
		['Properties', table(['Name', 'Attribute', 'Type', 'Default', 'Description?'], [
			...properties.map(p => [code(p.name), !p.attribute ? '' : code(p.attribute), !p.type ? '' : code(p.type), defaultOf(p.default), describe(p)]),
			...attributes.map(a => ['', code(a.name), !a.type ? '' : code(a.type), defaultOf(a.default), describe(a)]),
		])],
		['Events', table(['Name', 'Detail', 'Description?'], (tag.events ?? []).map(event => {
			const detail = /^CustomEvent<([^]*)>$/.exec(event.type ?? '')?.[1]
			return [code(event.name), !detail ? '' : code(detail), inline(prose(event.description))]
		}))],
		['Slots', table(['Name', 'Description?'], (tag.slots ?? []).map(slot => [!slot.name ? '(default)' : code(slot.name), inline(prose(slot.description))]))],
		['CSS custom properties', table(['Name', 'Description?'], (tag.cssProperties ?? []).map(p => [code(p.name), inline(prose(p.description))]))],
		['CSS parts', table(['Name', 'Description?'], (tag.cssParts ?? []).map(part => [code(part.name), inline(prose(part.description))]))],
	]
	return [
		`### ${code(tag.name)}`,
		...!describeElement || !prose(tag.description) ? [] : [paragraphs(prose(tag.description))],
		...sections.filter(([, content]) => !!content).flatMap(([heading, content]) => [`#### ${heading}`, content]),
	]
}

function declares(tag: Tag) {
	try {
		return new RegExp(`@component\\(\\s*['"\`]${tag.name}['"\`]`).test(FileSystem.readFileSync(tag.path.replace(/\\/g, '/'), 'utf8'))
	} catch {
		return false
	}
}

/** What an element's `@ssr` tag declares, as sentences. */
export function ssrOf({ supported, caveat }: Ssr) {
	return !supported ? 'Renders in the browser only.' : `Renders with Lit SSR and hydrates.${!caveat ? '' : ` ${caveat.replace(/(?<![.!?])$/, '.')}`}`
}

/** A description of the manifest, where one the analyzer failed to stringify - JSDoc with an inline tag - counts as none. */
export function prose(text: string | undefined) {
	return !text?.trim() || text.includes('[object Object]') ? '' : text
}

/** Resolves JSDoc's inline `{@link}` tags, which Markdown would print as they are. */
export function links(text: string) {
	return text.replace(/\{@link(?:code|plain)?\s+([^\s|}]+)(?:\s*\|\s*|\s+)?([^}]*)\}/g, (_, target: string, label: string) => label.trim() || `\`${target}\``)
}

/** A text for one table cell or list item. */
export function inline(text: string) {
	return links(text).replace(/\s+/g, ' ').trim()
}

export function paragraphs(text: string, label?: string) {
	const [first = '', ...rest] = links(text.replace(/\r\n?/g, '\n')).split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean)
	return [!label ? first : `${code(label)} — ${first}`, ...rest].join('\n\n')
}

/** The first sentence of a text's first paragraph, which a text opening with a list does not have. */
export function summary(text: string) {
	const paragraph = links(text.replace(/\r\n?/g, '\n')).split(/\n\s*\n|\n(?=\s*(?:[-*+]|\d+\.)\s)/)[0] ?? ''
	const flat = /^\s*(?:[-*+]|\d+\.)\s/.test(paragraph) ? '' : paragraph.replace(/\s+/g, ' ').trim()
	let code = false
	for (let index = 0; index < flat.length; index++) {
		const char = flat[index]!
		if (char === '`') {
			code = !code
		} else if (!code && '.!?'.includes(char) && (index === flat.length - 1 || flat[index + 1] === ' ' && !/[a-z]/.test(flat[index + 2] ?? ''))) {
			return inline(flat.slice(0, index + 1))
		}
	}
	return inline(flat.replace(/:$/, '.'))
}

export function code(text: string) {
	const value = text.replace(/\s+/g, ' ').trim()
	const fence = '`'.repeat(Math.max(0, ...[...value.matchAll(/`+/g)].map(match => match[0].length)) + 1)
	return fence.length > 1 ? `${fence} ${value} ${fence}` : `${fence}${value}${fence}`
}

export function fence(language: string, content: string) {
	const backticks = '`'.repeat(Math.max(2, ...[...content.matchAll(/`+/g)].map(match => match[0].length)) + 1)
	return `${backticks}${language}\n${content}\n${backticks}`
}

export function defaultOf(value: unknown) {
	const text = value === undefined ? '' : typeof value === 'string' ? value : JSON.stringify(value)
	return !text || text.includes('\n') || text.length > 40 ? '' : code(text)
}

/** A table whose columns marked with a trailing `?` are left out when none of the rows has a value for them. */
export function table(columns: ReadonlyArray<string>, rows: ReadonlyArray<ReadonlyArray<string>>) {
	if (!rows.length) {
		return ''
	}
	const kept = columns.map((column, index) => !column.endsWith('?') || rows.some(row => !!row[index])).map((keep, index) => keep ? index : -1).filter(index => index !== -1)
	const line = (cells: ReadonlyArray<string>) => `| ${cells.map(cell => cell.replace(/\|/g, '\\|')).join(' | ')} |`
	return [
		line(kept.map(index => columns[index]!.replace(/\?$/, ''))),
		line(kept.map(() => '---')),
		...rows.map(row => line(kept.map(index => row[index] ?? ''))),
	].join('\n')
}