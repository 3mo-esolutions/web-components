import FileSystem from 'fs'
import Path from 'path'
import ts from 'typescript'
import type { CustomElementsManifest, Tag } from './CustomElementsManifest.ts'
import { Package } from './Package.ts'
import { elementApi, fence, links, paragraphs, prose, ssrOf, summary } from './PackageReadme.ts'
import { type Story, StoriesFile } from './StoriesFile.ts'

/** An entry of the `index.json` of a Storybook. */
export interface IndexEntry {
	readonly type: 'docs' | 'story'
	readonly id: string
	readonly title: string
	readonly importPath: string
	readonly tags?: ReadonlyArray<string>
	readonly storiesImports?: ReadonlyArray<string>
}

/** The blocks `.storybook/DocsPage.tsx` composes every component page of that has no MDX page attached. */
const componentPage = '<Hero />\n<Install />\n<Playground />\n<Stories />\n<Accessibility />\n<Api />\n<Changelog />'

/**
 * A docs page of the Storybook as Markdown, for language models and anyone else reading it without running it. It is
 * rendered from what the page is made of: its MDX, or the blocks of every component page, with each story as its code.
 */
export class DocsPage {
	static readonly url = `${StoriesFile.storybookUrl}docs/`

	/** The docs pages of a Storybook's index, in the order of its sidebar. */
	static all(entries: ReadonlyArray<IndexEntry>, manifest: CustomElementsManifest) {
		return entries.filter(entry => entry.type === 'docs').map(entry => new DocsPage(entry, manifest))
	}

	/** Points links to pages and stories of the Storybook at the Markdown of their pages. */
	static markdownLinks(text: string) {
		const storybook = StoriesFile.storybookUrl.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
		const link = new RegExp(`\\]\\((?:${storybook})?\\?path=/(docs|story)/([^)#\\s]+?)--([^)#\\s]+)(#[^)\\s]*)?\\)`, 'g')
		return text.replace(link, (_, kind: string, id: string, name: string, anchor = '') => `](${DocsPage.url}${id}.md${kind === 'story' ? `#${name}` : anchor})`)
	}

	readonly title: string
	readonly name: string
	/** The Markdown file, relative to the Storybook. */
	readonly path: string
	readonly url: string
	/** Pages a reader short of context skips: contributing, and the changelog of every package. */
	readonly optional: boolean
	/** The paragraphs that open the page. */
	readonly lead: ReadonlyArray<string>

	private readonly entry: IndexEntry
	private readonly manifest: CustomElementsManifest
	private readonly mdx: string
	private readonly mdxPath: string
	private readonly imports: ts.SourceFile
	private readonly storiesFile: StoriesFile | undefined
	/** The stories files the MDX imports, by the name it imports them under. */
	private readonly namespaces: ReadonlyMap<string, StoriesFile>
	private readonly tag: Tag | undefined
	private readonly packageDirectory: string | undefined
	private readonly package: Package | undefined

	private constructor(entry: IndexEntry, manifest: CustomElementsManifest) {
		this.entry = entry
		this.manifest = manifest
		this.title = entry.title.split('/').map(segment => segment.trim()).join(' / ')
		this.name = this.title.split(' / ').pop()!
		this.path = `docs/${entry.id.split('--')[0]}.md`
		this.url = `${StoriesFile.storybookUrl}${this.path}`

		const mdx = entry.importPath.endsWith('.mdx')
		this.mdxPath = Path.resolve(entry.importPath)
		this.mdx = mdx ? FileSystem.readFileSync(this.mdxPath, 'utf8').replace(/\r\n?/g, '\n') : componentPage
		this.imports = ts.createSourceFile(this.mdxPath, this.mdx.split('\n').filter(line => /^import\s/.test(line)).join('\n'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
		// An MDX page attached to no stories may still import some to show one:
		const storiesPath = !mdx ? entry.importPath : entry.tags?.includes('attached-mdx') ? entry.storiesImports?.[0] : undefined
		this.storiesFile = !storiesPath ? undefined : StoriesFile.at(storiesPath)
		this.namespaces = new Map(this.imports.statements.flatMap(statement => {
			const bindings = ts.isImportDeclaration(statement) ? statement.importClause?.namedBindings : undefined
			const specifier = ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : ''
			if (!bindings || !ts.isNamespaceImport(bindings) || !/\.stories(\.ts)?$/.test(specifier)) {
				return []
			}
			const path = Path.resolve(Path.dirname(this.mdxPath), specifier.endsWith('.ts') ? specifier : `${specifier}.ts`)
			const file = this.storiesFile && Path.resolve(this.storiesFile.path) === path ? this.storiesFile : StoriesFile.at(path)
			return !file ? [] : [[bindings.name.text, file] as const]
		}))
		this.optional = this.title.startsWith('Contributing') || this.mdx.includes('<CombinedChangelog')

		const tags = manifest.tags.filter(tag => tag.name === this.storiesFile?.component)
		this.tag = tags.find(tag => prose(tag.description)) ?? tags[0]
		this.packageDirectory = !this.storiesFile ? undefined : packageDirectoryOf(this.storiesFile.path)
		this.package = Package.all.find(p => Path.resolve(p.path) === this.packageDirectory)

		const header = /<PageHeader\b[^>]*>(.*)<\/PageHeader>/.exec(this.mdx)?.[1]
		this.lead = paragraphs(header ?? (prose(this.tag?.description) || this.packageDescription || '')).split('\n\n').filter(Boolean)
	}

	/** The first sentence of the page's lead. */
	get summary() {
		return !this.lead[0] ? '' : summary(this.lead[0])
	}

	/** The page, which without the changelog is what a reader of every page at once needs of it. */
	markdown({ changelog = true } = {}) {
		const output = new Array<string>()
		let fenced = false
		for (const line of this.mdx.split('\n')) {
			const trimmed = line.trim()
			if (/^(`{3,}|~{3,})/.test(trimmed)) {
				fenced = !fenced
			}
			if (fenced || /^(`{3,}|~{3,})/.test(trimmed)) {
				output.push(line)
				continue
			}
			if (/^import\s/.test(trimmed) || /^<Meta\b.*\/>$/.test(trimmed) || /^<\/?Cards>$/.test(trimmed)) {
				continue
			}
			const block = /^<([A-Z]\w*)((?:\s+\w+=(?:\{[^}]*\}|'[^']*'|"[^"]*"))*)\s*\/>$/.exec(trimmed)
			const element = /^<(PageHeader|Card)((?:\s+\w+=(?:'[^']*'|"[^"]*"))*)>(.*)<\/\1>$/.exec(trimmed)
			if (!block && !element && /^<\/?[A-Z]/.test(trimmed)) {
				unknown(`${this.entry.importPath} has "${trimmed}", which has no Markdown: write each block on one line of its own`)
			}
			const attributes = attributesOf(block?.[2] ?? element?.[2] ?? '')
			output.push(block ? `\n${this.block(block[1]!, attributes, changelog)}\n`
				: element?.[1] === 'PageHeader' ? `# ${attributes.title}\n\n${element[3]}\n`
					: element ? `- [${attributes.title}](${attributes.href}): ${element[3]}`
						: line)
		}
		return DocsPage.markdownLinks(output.join('\n')).replace(/\n{3,}/g, '\n\n').trim()
	}

	private get packageDescription() {
		const path = !this.packageDirectory ? undefined : Path.join(this.packageDirectory, 'package.json')
		return !path ? undefined : (JSON.parse(FileSystem.readFileSync(path, 'utf8')) as { readonly description?: string }).description
	}

	private block(name: string, attributes: Record<string, string>, changelog: boolean) {
		const story = () => {
			const [namespace = '', exportName] = (attributes.of ?? '').split('.')
			const file = this.namespaces.get(namespace)
			return file?.stories.find(story => story.exportName === exportName)
				?? unknown(`${this.entry.importPath} shows ${attributes.of}, which is not a story of the stories files it imports`)
		}
		switch (name) {
			case 'Hero': return this.hero
			case 'Install': return this.install
			case 'Playground': return this.usage
			case 'Stories': return this.examples
			case 'DocsStory': return storyMarkdown(story())
			case 'Description': return descriptionOf(story())
			case 'Canvas': return codeOf(story())
			case 'Source': return fence(attributes.language === 'typescript' ? 'ts' : attributes.language ?? '', this.raw(attributes.code ?? '').trim())
			case 'Accessibility': return this.accessibility
			case 'Api': return this.api
			case 'Changelog': return !changelog ? '' : this.changelog
			case 'CombinedChangelog': return !FileSystem.existsSync('CHANGELOG.md') ? '' : FileSystem.readFileSync('CHANGELOG.md', 'utf8').replace(/^# /gm, '## ')
			default: return unknown(`${this.entry.importPath} uses <${name} />, which has no Markdown`)
		}
	}

	private get hero() {
		const packageJson = this.package?.packageJson
		const status = this.entry.tags?.find(tag => tag.startsWith('status:'))?.slice('status:'.length)
		const source = !this.packageDirectory ? undefined : Path.relative(process.cwd(), this.packageDirectory).replace(/\\/g, '/')
		return [
			`# ${this.name}`,
			...this.lead,
			[
				!this.tag ? '' : `- Element: \`<${this.tag.name}>\``,
				!packageJson ? '' : `- Package: \`${packageJson.name}\` ${packageJson.version}${!status ? '' : ` (${status})`}`,
				!this.tag?.ssr ? '' : `- Server-side rendering: ${ssrOf(this.tag.ssr)}`,
				`- Storybook: <${StoriesFile.storybookUrl}?path=/docs/${this.entry.id}>`,
				!source ? '' : `- Source: <https://github.com/3mo-esolutions/web-components/tree/main/${source}>`,
			].filter(Boolean).join('\n'),
		].join('\n\n')
	}

	private get install() {
		const name = this.package?.packageJson.name
		return !name ? '' : ['## Installation', fence('bash', `npm install ${name}`), ...!this.tag ? [] : [fence('ts', `import '${name}'`)]].join('\n\n')
	}

	private get usage() {
		const primary = this.storiesFile?.stories[0]
		return !primary?.code ? '' : `## Usage\n\n${codeOf(primary)}`
	}

	private get examples() {
		const stories = this.storiesFile?.stories.slice(1) ?? []
		return !stories.length ? '' : ['## Examples', ...stories.map(storyMarkdown)].join('\n\n')
	}

	private get accessibility() {
		const controller = this.storiesFile?.controller
		const text = this.tag ? this.tag.accessibility : !controller ? undefined : this.manifest.accessibility?.[controller]
		return !text ? '' : `## Accessibility\n\n${text}`
	}

	private get api() {
		return !this.tag ? '' : ['## API', ...elementApi(this.tag, this.storiesFile?.argTypeDescriptions, false)].join('\n\n')
	}

	private get changelog() {
		const path = !this.packageDirectory ? undefined : Path.join(this.packageDirectory, 'CHANGELOG.md')
		const content = !path || !FileSystem.existsSync(path) ? '' : FileSystem.readFileSync(path, 'utf8').replace(/\r\n?/g, '\n').trim()
		return !content ? '' : `## Changelog\n\n${content.replace(/^## /gm, '### ')}`
	}

	private raw(name: string) {
		return StoriesFile.rawImport(this.imports, this.mdxPath, name) ?? unknown(`${this.entry.importPath} shows ${name}, which is not a ?raw import`)
	}
}

function storyMarkdown(story: Story) {
	return [`### ${story.name}`, descriptionOf(story), codeOf(story)].filter(Boolean).join('\n\n')
}

function descriptionOf(story: Story) {
	return !story.description ? '' : links(story.description.trim())
}

function codeOf(story: Story) {
	return !story.code ? '' : fence(story.code.language, story.code.text)
}

/** The directory of the nearest package.json above a file, short of the repository's own. */
function packageDirectoryOf(path: string) {
	const root = process.cwd()
	for (let directory = Path.dirname(Path.resolve(path)); directory.startsWith(root) && directory !== root; directory = Path.dirname(directory)) {
		if (FileSystem.existsSync(Path.join(directory, 'package.json'))) {
			return directory
		}
	}
	return undefined
}

/** The attributes of a JSX element, an expression without its braces. */
function attributesOf(text: string) {
	return Object.fromEntries([...text.matchAll(/(\w+)=(?:\{([^}]*)\}|'([^']*)'|"([^"]*)")/g)]
		.map(([, name, expression, single, double]) => [name!, (expression ?? single ?? double ?? '').trim()]))
}

function unknown(message: string): never {
	throw new Error(message)
}