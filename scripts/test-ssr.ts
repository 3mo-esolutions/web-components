/* eslint-disable no-console */
import FileSystem from 'fs'
import Path from 'path'
import OperatingSystem from 'os'
import esbuild from 'esbuild'
import { execa } from 'execa'

// SSR compatibility harness:
// For every custom element in custom-elements.json, this script server-renders
// `<tag></tag>` via @lit-labs/ssr in an isolated Node subprocess and classifies the outcome:
//   - 'bundle-error':  the component's module graph could not even be bundled for Node
//   - 'import-crash':  evaluating the module graph threw (module-scope DOM access etc.)
//   - 'render-crash':  rendering threw (observers/directives/DOM access on the render path)
//   - 'timeout':       rendering hung
//   - 'rendered':      SSR produced declarative-shadow-DOM HTML (written to dist/ssr/<mode>/output)
// Results land in dist/ssr/report.<mode>.json; failures are grouped by root error for triage.
//
// Modes (--mode=shim|bare, default shim):
//   - 'shim': the official @lit-labs/ssr environment — install-global-dom-shim provides
//     document, Element, HTMLElement, observers etc. This is what SSR hosts (Eleventy/Astro/
//     custom servers using renderModule) provide, so it is the compatibility target.
//   - 'bare': plain Node where document/window are undefined (the @a11d/lit `??= undefined`
//     idiom) — stricter; catches any non-optional DOM access.

const mode = process.argv.find(argument => argument.startsWith('--mode='))?.slice('--mode='.length) ?? 'shim'
if (mode !== 'shim' && mode !== 'bare') {
	throw new Error(`Unknown mode '${mode}' - use --mode=shim or --mode=bare`)
}

type ManifestTag = { name: string, path: string }
type Result = {
	tag: string
	path: string
	declaredSsr: boolean
	status: 'bundle-error' | 'import-crash' | 'render-crash' | 'timeout' | 'rendered' | 'unknown'
	htmlLength?: number
	error?: string
}

const manifest = JSON.parse(FileSystem.readFileSync('./custom-elements.json', 'utf-8')) as { tags: Array<ManifestTag> }
const tagsByName = new Map<string, ManifestTag>()
for (const tag of manifest.tags) {
	if (!tagsByName.has(tag.name)) {
		tagsByName.set(tag.name, { ...tag, path: tag.path.replace(/\\/g, '/') })
	}
}
const tags = [...tagsByName.values()]

// Consumers import a package, not one of its files, and only the entry point establishes the
// module order the package is written for. Deep imports are therefore not representative and
// would report unrelated circular import failures as missing SSR support.
function entryPointOf(tag: ManifestTag) {
	let directory = Path.dirname(tag.path)
	while (directory.includes('packages')) {
		if (FileSystem.existsSync(`${directory}/package.json`) && FileSystem.existsSync(`${directory}/index.ts`)) {
			return `${directory}/index.ts`
		}
		directory = Path.dirname(directory)
	}
	return tag.path
}

function isDeclaredSsr(tag: ManifestTag) {
	try {
		const source = FileSystem.readFileSync(tag.path, 'utf-8')
		const jsDocBlocks = source.match(/\/\*\*[\s\S]*?\*\//g) ?? []
		const block = jsDocBlocks.find(b => b.includes(`@element ${tag.name}`))
		return !!block && /@ssr\s+true/.test(block)
	} catch {
		return false
	}
}

const entriesDirectory = `./dist/ssr/${mode}/entries`
const bundlesDirectory = `./dist/ssr/${mode}/bundles`
const outputDirectory = `./dist/ssr/${mode}/output`
for (const directory of [entriesDirectory, bundlesDirectory, outputDirectory]) {
	FileSystem.mkdirSync(directory, { recursive: true })
}

for (const tag of tags) {
	const modulePath = Path.relative(entriesDirectory, entryPointOf(tag)).replace(/\\/g, '/').replace(/\.ts$/, '')
	const entry = [
		...(mode === 'shim' ? ['import \'@lit-labs/ssr/lib/install-global-dom-shim.js\''] : []),
		`import '${modulePath}'`,
		'import { render } from \'@lit-labs/ssr\'',
		'import { collectResult } from \'@lit-labs/ssr/lib/render-result.js\'',
		'import { html } from \'lit\'',
		'',
		'console.log(\'__IMPORT_OK__\')',
		'try {',
		'	const result = await collectResult(render(html' + '`<' + tag.name + '></' + tag.name + '>`' + '))',
		'	console.log(\'__RENDER_OK__\')',
		'	process.stdout.write(result)',
		'} catch (error) {',
		'	console.log(\'__RENDER_ERROR__\')',
		'	console.error(error instanceof Error ? (error.stack ?? error.message) : String(error))',
		'	process.exit(3)',
		'}',
	].join('\n')
	FileSystem.writeFileSync(`${entriesDirectory}/${tag.name}.ts`, entry)
}

console.log(`Bundling ${tags.length} component entries ...`)

const bundleErrors = new Map<string, string>()
const concurrency = Math.max(2, OperatingSystem.availableParallelism() - 2)

async function runPooled<T>(items: Array<T>, worker: (item: T) => Promise<void>) {
	const queue = [...items]
	await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
		while (queue.length > 0) {
			await worker(queue.shift()!)
		}
	}))
}

await runPooled(tags, async tag => {
	try {
		await esbuild.build({
			bundle: true,
			entryPoints: [`${entriesDirectory}/${tag.name}.ts`],
			outfile: `${bundlesDirectory}/${tag.name}.mjs`,
			tsconfig: './tsconfig.json',
			platform: 'node',
			// Module-first resolution mirrors Vite-based SSR hosts and avoids CJS default-export
			// interop artifacts in dual-format dependencies (e.g. intl-format-cache).
			mainFields: ['module', 'main'],
			format: 'esm',
			legalComments: 'none',
			logLevel: 'silent',
		})
	} catch (error) {
		bundleErrors.set(tag.name, error instanceof Error ? error.message : String(error))
	}
})

console.log(`Rendering ${tags.length} components with @lit-labs/ssr (concurrency ${concurrency}) ...`)

const results = new Array<Result>()

await runPooled(tags, async tag => {
	const base = { tag: tag.name, path: tag.path, declaredSsr: isDeclaredSsr(tag) }

	const bundleError = bundleErrors.get(tag.name)
	if (bundleError) {
		results.push({ ...base, status: 'bundle-error', error: firstErrorLine(bundleError) })
		return
	}

	const subprocess = await execa(process.execPath, [`${bundlesDirectory}/${tag.name}.mjs`], {
		timeout: 20_000,
		reject: false,
	})

	if (subprocess.timedOut) {
		results.push({ ...base, status: 'timeout' })
	} else if (!subprocess.stdout.includes('__IMPORT_OK__')) {
		results.push({ ...base, status: 'import-crash', error: firstErrorLine(subprocess.stderr) })
	} else if (subprocess.stdout.includes('__RENDER_ERROR__')) {
		results.push({ ...base, status: 'render-crash', error: firstErrorLine(subprocess.stderr) })
	} else if (subprocess.stdout.includes('__RENDER_OK__')) {
		const html = subprocess.stdout.slice(subprocess.stdout.indexOf('__RENDER_OK__') + '__RENDER_OK__'.length).replace(/^\r?\n/, '')
		FileSystem.writeFileSync(`${outputDirectory}/${tag.name}.html`, html)
		results.push({ ...base, status: 'rendered', htmlLength: html.length })
	} else {
		results.push({ ...base, status: 'unknown', error: firstErrorLine(subprocess.stderr) })
	}
})

function firstErrorLine(stderr: string) {
	const lines = stderr.split('\n').map(line => line.trim()).filter(Boolean)
	const errorLine = lines.find(line => /(^\w*Error|Error:|error:)/.test(line)) ?? lines[0] ?? 'unknown error'
	return errorLine.slice(0, 300)
}

results.sort((a, b) => a.tag.localeCompare(b.tag))
FileSystem.writeFileSync(`./dist/ssr/report.${mode}.json`, JSON.stringify(results, undefined, '\t'))

const byStatus = Map.groupBy(results, result => result.status)
console.log(`\n===== SSR Compatibility Report (mode: ${mode}) =====`)
for (const [status, group] of [...byStatus.entries()].sort((a, b) => b[1].length - a[1].length)) {
	console.log(`\n--- ${status} (${group.length}) ---`)
	if (status === 'rendered') {
		console.log(group.map(result => `${result.tag}${result.declaredSsr ? ' [@ssr]' : ''}`).join(', '))
	} else {
		const byError = Map.groupBy(group, result => result.error ?? 'unknown')
		for (const [error, errorGroup] of [...byError.entries()].sort((a, b) => b[1].length - a[1].length)) {
			console.log(`\n[${errorGroup.length}x] ${error}`)
			console.log(`    ${errorGroup.map(result => result.tag).join(', ')}`)
		}
	}
}

const declared = results.filter(result => result.declaredSsr)
const declaredButFailing = declared.filter(result => result.status !== 'rendered')
const renderedButUndeclared = results.filter(result => result.status === 'rendered' && !result.declaredSsr)
console.log('\n===== @ssr-tag audit =====')
console.log(`Declared @ssr true: ${declared.length} | of which failing: ${declaredButFailing.length}`)
if (declaredButFailing.length > 0) {
	console.log(`Declared but failing: ${declaredButFailing.map(result => `${result.tag} (${result.status})`).join(', ')}`)
}
console.log(`Rendered but not declared: ${renderedButUndeclared.map(result => result.tag).join(', ') || 'none'}`)