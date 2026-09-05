/* eslint-disable no-console */
import FileSystem from 'fs'
import Path from 'path'
import esbuild from 'esbuild'

// SSR hydration harness (phase 2):
// Takes every tag that server-rendered successfully (per scripts/test-ssr.ts, shim mode),
// embeds its server-rendered declarative-shadow-DOM HTML into a single test page, and
// generates a client bundle that hydrates each component and records the outcome.
// Lit hydration is fail-fast: template-shape mismatches between server and first client
// render throw, so 'hydrated' here means the server output matched the client render.
// Serve dist/ssr/hydration/ statically and read #results (data-done="true" when finished).

type Result = { tag: string, path: string, status: string }

const manifest = JSON.parse(FileSystem.readFileSync('./custom-elements.json', 'utf-8')) as { tags: Array<{ name: string, path: string }> }
const pathsByTag = new Map(manifest.tags.map(tag => [tag.name, tag.path.replace(/\\/g, '/')]))

const report = JSON.parse(FileSystem.readFileSync('./dist/ssr/report.shim.json', 'utf-8')) as Array<Result>
const renderedTags = report.filter(result => result.status === 'rendered').map(result => result.tag)

const hydrationDirectory = './dist/ssr/hydration'
FileSystem.mkdirSync(hydrationDirectory, { recursive: true })

const moduleImports = renderedTags
	.map(tag => Path.relative(hydrationDirectory, pathsByTag.get(tag)!).replace(/\\/g, '/').replace(/\.ts$/, ''))
	.map(modulePath => `import '${modulePath}'`)

const templateEntries = renderedTags
	.map(tag => '\t\'' + tag + '\': () => html' + '`<' + tag + '></' + tag + '>`,')

const client = `import '@lit-labs/ssr-client/lit-element-hydrate-support.js'
import { hydrate } from '@lit-labs/ssr-client'
import { html, type TemplateResult } from 'lit'
${moduleImports.join('\n')}

const templates: Record<string, () => TemplateResult> = {
${templateEntries.join('\n')}
}

const globalErrors = new Array<string>()
window.addEventListener('error', event => globalErrors.push(String(event.error?.message ?? event.message)))
window.addEventListener('unhandledrejection', event => globalErrors.push(String(event.reason?.message ?? event.reason)))

const results: Record<string, { status: string, error?: string }> = {}

// A component whose update never settles would stall the whole run, so every wait is bounded.
const settled = (promise: Promise<unknown> | undefined) => Promise.race([
	promise ?? Promise.resolve(),
	new Promise((_, reject) => setTimeout(() => reject(new Error('update did not settle')), 3000)),
])

for (const [tag, template] of Object.entries(templates)) {
	const container = document.querySelector('[data-tag="' + tag + '"]')!
	const element = container.querySelector(tag) as (HTMLElement & { updateComplete?: Promise<unknown>, requestUpdate?: () => void }) | null
	try {
		if (!element) {
			results[tag] = { status: 'element-missing' }
			continue
		}
		hydrate(template(), container)
		element.removeAttribute('defer-hydration')
		await settled(element.updateComplete)
		// Second client-side render pass: catches components that hydrate but then
		// break on their first real update.
		element.requestUpdate?.()
		await settled(element.updateComplete)
		results[tag] = element.shadowRoot ? { status: 'hydrated' } : { status: 'no-shadow-root' }
	} catch (error) {
		results[tag] = { status: 'hydration-error', error: String(error instanceof Error ? error.message : error).slice(0, 300) }
	}
}

const summary = {
	hydrated: Object.values(results).filter(result => result.status === 'hydrated').length,
	failed: Object.values(results).filter(result => result.status !== 'hydrated').length,
	results,
	globalErrors: globalErrors.slice(0, 50),
}
const output = document.createElement('pre')
output.id = 'results'
output.dataset.done = 'true'
output.textContent = JSON.stringify(summary, undefined, 2)
document.body.append(output)
`

FileSystem.writeFileSync(`${hydrationDirectory}/client.ts`, client)

const serverHtmlSections = renderedTags
	.map(tag => `<section><h2>${tag}</h2><div data-tag="${tag}">${FileSystem.readFileSync(`./dist/ssr/shim/output/${tag}.html`, 'utf-8')}</div></section>`)

FileSystem.writeFileSync(`${hydrationDirectory}/index.html`, `<!doctype html>
<html>
<head><meta charset="utf-8"><title>SSR Hydration Test</title></head>
<body>
${serverHtmlSections.join('\n')}
<script type="module" src="./client.js"></script>
</body>
</html>`)

await esbuild.build({
	bundle: true,
	entryPoints: [`${hydrationDirectory}/client.ts`],
	outfile: `${hydrationDirectory}/client.js`,
	tsconfig: './tsconfig.json',
	platform: 'browser',
	format: 'esm',
	legalComments: 'none',
})

console.log(`Hydration test page ready: ${hydrationDirectory}/index.html (${renderedTags.length} components)`)