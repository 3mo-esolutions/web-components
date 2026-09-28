import { ComponentMembers, type CustomElementsManifest, Package } from './util/index.ts'
import { ModuleExports } from './util/ModuleExports.ts'
import { promises as FileSystem, existsSync, globSync } from 'fs'
import { createRequire } from 'module'
import Path from 'path'
import type TypeScript from 'typescript'

const customElements = JSON.parse(analyzeSources()) as CustomElementsManifest

const unknownTags = new Array<string>()

// Base classes live in other packages, so every component source has to be known before members can be resolved:
ComponentMembers.collect(customElements.tags.map(tag => tag.path))

customElements.tags = customElements.tags
	.filter(tag => !tag.path.endsWith('.test.ts') && !tag.path.endsWith('.stories.ts') && !/[\\/]stories[\\/]/.test(tag.path))
	.map(tag => {
		const { known, staticOnly, corrections, documentation, accessibility, ssr } = ComponentMembers.of(tag.name)
		tag.accessibility = accessibility
		tag.ssr = ssr
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
		.map(p => ({ package: p, tags: customElements.tags.filter(tag => tag.path.replace(/\\/g, '/').startsWith(`./${p.relativePath}/`)) }))
		.filter(({ package: p, tags }) => tags.length && existsSync(`./${p.relativePath}/dist`))
		.map(({ package: p, tags }) => FileSystem.writeFile(
			`./${p.relativePath}/dist/custom-elements.json`,
			JSON.stringify({ version: 'experimental', tags }, null, '\t'),
		))
)

await FileSystem.writeFile('./custom-elements.json', JSON.stringify(customElements, null, '\t'))

/**
 * The analyzer's CLI compiles with fixed options, under which a file without imports or exports is a script, so its
 * `declare global` types stay unresolved, and a `@3mo/*` import resolves to built declarations wherever `dist` exists,
 * which carry no defaults. Its own options plus module detection and imports resolved to the sources give the same
 * manifest in every checkout.
 */
/** The part of the analyzer's API used here, as its ES module declarations do not resolve under "NodeNext". */
type Analyzer = {
	analyzeSourceFile(sourceFile: TypeScript.SourceFile, options: { program: TypeScript.Program, ts: typeof TypeScript, config: object }): unknown
	transformAnalyzerResult(kind: 'json', results: Array<unknown>, program: TypeScript.Program, config: { visibility: 'public', inlineTypes: boolean, cwd: string }): string
}

function analyzeSources() {
	// The CommonJS build, as the ES module one imports named exports from TypeScript, which Node refuses:
	const require = createRequire(import.meta.url)
	const { analyzeSourceFile, transformAnalyzerResult } = require('web-component-analyzer') as Analyzer
	const ts = createRequire(require.resolve('web-component-analyzer'))('typescript') as typeof TypeScript
	const files = globSync('packages/**/*.ts', { exclude: path => /(^|[\\/])(dist|node_modules)$/.test(path) })
		.map(file => Path.resolve(file).replace(/\\/g, '/'))
	const program = ts.createProgram(files, {
		noEmitOnError: false,
		allowJs: true,
		maxNodeModuleJsDepth: 3,
		experimentalDecorators: true,
		target: ts.ScriptTarget.Latest,
		downlevelIteration: true,
		module: ts.ModuleKind.ESNext,
		strictNullChecks: true,
		moduleResolution: ts.ModuleResolutionKind.Node10,
		esModuleInterop: true,
		noEmit: true,
		allowSyntheticDefaultImports: true,
		allowUnreachableCode: true,
		allowUnusedLabels: true,
		skipLibCheck: true,
		moduleDetection: ts.ModuleDetectionKind.Force,
		paths: Object.fromEntries(Package.all.flatMap(p => !p.entry ? [] : [[p.name, [Path.resolve(p.entry)]]])),
	})
	const results = program.getSourceFiles()
		.filter(sourceFile => files.includes(sourceFile.fileName))
		.sort((a, b) => a.fileName > b.fileName ? 1 : -1)
		.map(sourceFile => analyzeSourceFile(sourceFile, { program, ts, config: {} }))
	return transformAnalyzerResult('json', results, program, { visibility: 'public', inlineTypes: false, cwd: process.cwd() })
}