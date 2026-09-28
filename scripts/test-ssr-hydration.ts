/* eslint-disable no-console */
import FileSystem from 'fs'
import Path from 'path'
import Http from 'http'
import { type AddressInfo } from 'net'
import esbuild from 'esbuild'
import { chromium } from 'playwright'
import { entryPointOf, markupOf } from './test-ssr-components.ts'
import { writeSsrTag } from './test-ssr-tags.ts'
import type { HydrationResult } from './test-ssr-hydration-client.ts'

// SSR hydration harness (phase 2):
// Hydrates the server output of every component which rendered (per scripts/test-ssr.ts, shim mode)
// in headless Chromium, and classifies the outcome:
//   - 'hydrated':               the hydrated DOM equals a client render of the same markup
//   - 'diverged':               it hydrated, but kept something the server rendered differently
//   - 'hydration-error':        the first client render differed in shape from the server's
//   - 'nested-hydration-error': a component it renders failed to hydrate
//   - 'upgrade-error':          a constructor threw as the component was defined, leaving it undefined
// Every package gets a page of its own which imports only its entry point, as its server render
// did, since a package may configure others globally. Results land in dist/ssr/report.hydration.json.
// Every element declares whether it does in its JSDoc, as `@ssr true` or `@ssr false`: the run fails when a
// declaration is missing or does not hold, and --fix writes each element's instead. A caveat after a
// holding `@ssr true - ` stays. Pass --tags=mo-a,mo-b to hydrate, check or write only those.

type RenderResult = { tag: string, path: string, status: string }

const selectedTags = process.argv.find(argument => argument.startsWith('--tags='))?.slice('--tags='.length).split(',')

const manifest = JSON.parse(FileSystem.readFileSync('./custom-elements.json', 'utf-8')) as { tags: Array<{ name: string, path: string, ssr?: { supported: boolean } }> }
const pathsByTag = new Map(manifest.tags.map(tag => [tag.name, tag.path.replace(/\\/g, '/')]))
const ssrByTag = new Map(manifest.tags.map(tag => [tag.name, tag.ssr]))

const renderedTags = (JSON.parse(FileSystem.readFileSync('./dist/ssr/report.shim.json', 'utf-8')) as Array<RenderResult>)
	.filter(result => result.status === 'rendered' && (!selectedTags || selectedTags.includes(result.tag)))
	.map(result => result.tag)

const directory = './dist/ssr/hydration'
FileSystem.rmSync(directory, { recursive: true, force: true })
FileSystem.mkdirSync(directory, { recursive: true })

const tagsByEntryPoint = new Map<string, Array<string>>()
for (const tag of renderedTags) {
	const entryPoint = entryPointOf(pathsByTag.get(tag)!)
	tagsByEntryPoint.set(entryPoint, [...tagsByEntryPoint.get(entryPoint) ?? [], tag])
}

const pages = [...tagsByEntryPoint].map(([entryPoint, tags]) => ({ name: Path.basename(Path.dirname(entryPoint)), entryPoint, tags }))
const modulePath = (path: string) => Path.relative(directory, path).replace(/\\/g, '/').replace(/\.ts$/, '')

for (const page of pages) {
	FileSystem.writeFileSync(`${directory}/${page.name}.ts`, [
		`import '${modulePath('./scripts/test-ssr-hydration-errors.ts')}'`,
		'import \'@lit-labs/ssr-client/lit-element-hydrate-support.js\'',
		`import '${modulePath(page.entryPoint)}'`,
		'import { html } from \'lit\'',
		`import { hydrateAll } from '${modulePath('./scripts/test-ssr-hydration-client.ts')}'`,
		'',
		'await hydrateAll({',
		...page.tags.map(tag => `\t'${tag}': () => html\`${markupOf(tag)}\`,`),
		'})',
	].join('\n'))

	const sections = page.tags.map(tag => `<section><h2>${tag}</h2><div data-tag="${tag}">${FileSystem.readFileSync(`./dist/ssr/shim/output/${tag}.html`, 'utf-8')}</div></section>`)
	FileSystem.writeFileSync(`${directory}/${page.name}.html`, [
		'<!doctype html>',
		`<html><head><meta charset="utf-8"><title>${page.name}</title></head><body>`,
		...sections,
		`<script type="module" src="./${page.name}.js"></script>`,
		'</body></html>',
	].join('\n'))
}

console.log(`Bundling ${pages.length} hydration pages ...`)

await esbuild.build({
	bundle: true,
	entryPoints: pages.map(page => `${directory}/${page.name}.ts`),
	outdir: directory,
	tsconfig: './tsconfig.json',
	platform: 'browser',
	conditions: ['source'],
	format: 'esm',
	legalComments: 'none',
	logLevel: 'silent',
})

const server = Http.createServer(async (request, response) => {
	const path = Path.join(directory, new URL(request.url!, 'http://localhost').pathname)
	try {
		const content = await FileSystem.promises.readFile(path)
		response.writeHead(200, { 'content-type': path.endsWith('.js') ? 'text/javascript' : 'text/html' })
		response.end(content)
	} catch {
		response.writeHead(404)
		response.end()
	}
})
await new Promise<void>(resolve => server.listen(0, resolve))
const origin = `http://localhost:${(server.address() as AddressInfo).port}`

console.log(`Hydrating ${renderedTags.length} components in headless Chromium (pages served from ${origin}) ...`)

const results = new Map<string, HydrationResult>()
const browser = await chromium.launch()
try {
	const browserPage = await browser.newPage({ viewport: { width: 1280, height: 800 } })
	for (const page of pages) {
		try {
			await browserPage.goto(`${origin}/${page.name}.html`)
			await browserPage.waitForSelector('#results[data-done="true"]', { state: 'attached', timeout: 30_000 + page.tags.length * 10_000 })
			const pageResults = JSON.parse(await browserPage.textContent('#results') ?? '{}') as Record<string, HydrationResult>
			for (const [tag, result] of Object.entries(pageResults)) {
				results.set(tag, result)
			}
		} catch (error) {
			for (const tag of page.tags) {
				results.set(tag, { status: 'hydration-error', error: `The page did not finish: ${error instanceof Error ? error.message.split('\n')[0] : error}` })
			}
		}
	}
} finally {
	await browser.close()
	server.close()
}

const report = [...results].map(([tag, result]) => ({ tag, ...result })).sort((a, b) => a.tag.localeCompare(b.tag))
FileSystem.writeFileSync('./dist/ssr/report.hydration.json', JSON.stringify(report, undefined, '\t'))

console.log('\n===== SSR Hydration Report =====')
const countOf = (status: string) => report.filter(result => result.status === status).length
for (const status of [...new Set(report.map(result => result.status))].sort((a, b) => countOf(b) - countOf(a))) {
	const group = report.filter(result => result.status === status)
	console.log(`\n--- ${status} (${group.length}) ---`)
	if (status === 'hydrated') {
		console.log(group.map(result => result.tag).join(', '))
	} else {
		for (const result of group) {
			console.log(`${result.tag}: ${result.error?.slice(0, 240) ?? ''}`)
		}
	}
}

// An element renders on the server exactly when it hydrates to what a client render gives:
const verdicts = [...pathsByTag]
	.filter(([tag]) => !selectedTags || selectedTags.includes(tag))
	.map(([tag, path]) => ({ tag, path, supported: results.get(tag)?.status === 'hydrated', declared: ssrByTag.get(tag)?.supported }))
	.sort((a, b) => a.tag.localeCompare(b.tag))

console.log('\n===== @ssr audit =====')
if (process.argv.includes('--fix')) {
	const written = verdicts.filter(verdict => writeSsrTag(verdict.path, verdict.tag, verdict.supported))
	console.log(`Wrote the @ssr tag of ${written.length} elements: ${written.map(verdict => `${verdict.tag} (${verdict.supported})`).join(', ') || 'none'}`)
} else {
	const list = (label: string, verdictsOf: Array<{ tag: string }>) => verdictsOf.length && console.log(`${label}: ${verdictsOf.map(verdict => verdict.tag).join(', ')}`)
	const failing = verdicts.filter(verdict => verdict.declared === true && !verdict.supported)
	const stale = verdicts.filter(verdict => verdict.declared === false && verdict.supported)
	const undeclared = verdicts.filter(verdict => verdict.declared === undefined)
	console.log(`Declared @ssr true: ${verdicts.filter(verdict => verdict.declared).length} | false: ${verdicts.filter(verdict => verdict.declared === false).length} | none: ${undeclared.length}`)
	list('Declared @ssr true, yet failing', failing)
	list('Declared @ssr false, yet hydrating identically', stale)
	list('Without an @ssr tag', undeclared)
	if (failing.length || stale.length || undeclared.length) {
		console.log('Run "npm run test:ssr:hydration -- --fix" to write each element\'s tag, and fix what should render.')
		process.exitCode = 1
	}
}