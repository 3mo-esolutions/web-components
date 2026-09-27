import type { CustomElementsManifest } from './CustomElementsManifest.ts'
import { DocsPage, type IndexEntry } from './DocsPage.ts'
import { StoriesFile } from './StoriesFile.ts'

/**
 * What a language model reads of the Storybook: the Markdown of each docs page, "llms.txt" listing them as
 * https://llmstxt.org describes, and "llms-full.txt" holding every page but the optional ones.
 */
export class LlmsText {
	/** The files by their paths relative to the Storybook, from its `index.json`. */
	static files(index: { readonly entries: Record<string, IndexEntry> }, manifest: CustomElementsManifest) {
		const pages = DocsPage.all(Object.values(index.entries), manifest)
		const introduction = pages.find(page => page.title === 'Getting Started / Introduction')
		const header = [
			'# 3MO Web Components',
			`> ${introduction?.lead[0] ?? ''}`,
			'Every component is its own npm package, `@3mo/<name>`, and importing a package registers its `mo-*` elements. `@3mo/del` bundles them all, together with `@a11d/lit`, '
			+ 'whose `Component`, `html` and decorators write elements of your own.',
			'Each page is a page of the Storybook as Markdown: what a component is for, its usage, examples with their code, its accessibility, and its API of attributes, properties, '
			+ 'events, slots, CSS custom properties and CSS parts. The examples draw on sample data such as `people` in place of yours. '
			+ 'Every package also ships the manifest of its elements as `dist/custom-elements.json`.',
		]

		const listed = pages.filter(page => !page.optional)
		const sectionOf = (page: DocsPage) => page.title.split(' / ')[0]!
		const link = (page: DocsPage, name: string) => `- [${name}](${page.url})${!page.summary ? '' : `: ${page.summary}`}`
		const llms = [
			...header,
			`[llms-full.txt](${StoriesFile.storybookUrl}llms-full.txt) holds every page but the optional ones in one file.`,
			...[...new Set(listed.map(sectionOf))].flatMap(section => [
				`## ${section}`,
				listed.filter(page => sectionOf(page) === section).map(page => link(page, page.title.split(' / ').slice(1).join(' / '))).join('\n'),
			]),
			'## Optional',
			pages.filter(page => page.optional).map(page => link(page, page.title)).join('\n'),
		]

		return new Map([
			...pages.map(page => [page.path, page.markdown()] as const),
			['llms.txt', llms.join('\n\n')],
			['llms-full.txt', [...header, ...listed.map(page => page.markdown({ changelog: false }))].join('\n\n')],
		])
	}
}