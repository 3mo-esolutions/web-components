import FileSystem from 'fs'
import OperatingSystem from 'os'
import Path from 'path'
import esbuild from 'esbuild'
import { execa } from 'execa'
import { type Element } from './elements.ts'
import { markupOf } from './fixtures.ts'
import { limit } from './limit.ts'

/**
 * How an element fares on the server, rendered with `@lit-labs/ssr` in a Node process of its own under the DOM
 * shim SSR hosts install, through its package's entry point:
 * - `bundle-error`: its modules could not be bundled for Node
 * - `import-crash`: evaluating its modules threw
 * - `render-crash`: rendering it threw
 * - `timeout`: rendering it hung
 * - `absent`: its fixture rendered without it
 * - `rendered`: it rendered, and `html` is the server's output
 */
export type RenderResult = {
	readonly status: 'bundle-error' | 'import-crash' | 'render-crash' | 'timeout' | 'absent' | 'rendered' | 'unknown'
	readonly html?: string
	readonly error?: string
}

const directory = './dist/ssr/render'
const pooled = limit(Math.max(2, OperatingSystem.availableParallelism() - 2))

export function render(element: Element) {
	return pooled(async (): Promise<RenderResult> => {
		FileSystem.mkdirSync(directory, { recursive: true })
		const entry = `${directory}/${element.tag}.ts`
		const bundle = `${directory}/${element.tag}.mjs`
		FileSystem.writeFileSync(entry, [
			'import \'@lit-labs/ssr/lib/install-global-dom-shim.js\'',
			`import '${Path.relative(directory, element.entryPoint).replace(/\\/g, '/').replace(/\.ts$/, '')}'`,
			'import { render } from \'@lit-labs/ssr\'',
			'import { collectResult } from \'@lit-labs/ssr/lib/render-result.js\'',
			'import { html } from \'lit\'',
			'',
			'console.log(\'__IMPORTED__\')',
			'try {',
			'	const result = await collectResult(render(html`' + markupOf(element.tag) + '`))',
			'	console.log(\'__RENDERED__\')',
			'	process.stdout.write(result)',
			'} catch (error) {',
			'	console.log(\'__RENDER_ERROR__\')',
			'	console.error(error instanceof Error ? (error.stack ?? error.message) : String(error))',
			'	process.exit(3)',
			'}',
		].join('\n'))

		try {
			await esbuild.build({
				bundle: true,
				entryPoints: [entry],
				outfile: bundle,
				tsconfig: './tsconfig.json',
				platform: 'node',
				// Module-first, as Vite-based SSR hosts resolve, which avoids the CommonJS interop of dual-format dependencies:
				mainFields: ['module', 'main'],
				// The packages' own sources, as a checkout has built none of them:
				conditions: ['source'],
				format: 'esm',
				legalComments: 'none',
				logLevel: 'silent',
			})
		} catch (error) {
			return { status: 'bundle-error', error: firstErrorLine(error instanceof Error ? error.message : String(error)) }
		}

		const { stdout, stderr, timedOut } = await execa(process.execPath, [bundle], { timeout: 20_000, reject: false })
		if (timedOut) {
			return { status: 'timeout' }
		}
		if (!stdout.includes('__IMPORTED__')) {
			return { status: 'import-crash', error: firstErrorLine(stderr) }
		}
		if (stdout.includes('__RENDER_ERROR__')) {
			return { status: 'render-crash', error: firstErrorLine(stderr) }
		}
		if (!stdout.includes('__RENDERED__')) {
			return { status: 'unknown', error: firstErrorLine(stderr) }
		}
		const html = stdout.slice(stdout.indexOf('__RENDERED__') + '__RENDERED__'.length).replace(/^\r?\n/, '')
		FileSystem.writeFileSync(`${directory}/${element.tag}.html`, html)
		return html.includes(`<${element.tag}`) ? { status: 'rendered', html } : { status: 'absent', error: 'Its fixture renders without it' }
	})
}

function firstErrorLine(output: string) {
	const lines = output.split('\n').map(line => line.trim()).filter(Boolean)
	return (lines.find(line => /(^\w*Error|Error:|error:)/.test(line)) ?? lines[0] ?? 'unknown error').slice(0, 300)
}
