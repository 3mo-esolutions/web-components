import FileSystem from 'fs'
import Http from 'http'
import { type AddressInfo } from 'net'
import Path from 'path'
import esbuild from 'esbuild'
import { chromium, type Browser } from 'playwright'
import type { ClientRenderResult, HydrationResult } from './client.ts'
import { type Element } from './elements.ts'
import { markupOf } from './fixtures.ts'
import { limit } from './limit.ts'

export type { HydrationResult }

const directory = './dist/ssr/hydrate'
const pooled = limit(4)

let session: Promise<{ readonly browser: Browser, readonly server: Http.Server, readonly origin: string }> | undefined

function start() {
	return session ??= (async () => {
		FileSystem.mkdirSync(directory, { recursive: true })
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
		return { browser: await chromium.launch(), server, origin: `http://localhost:${(server.address() as AddressInfo).port}` }
	})()
}

/** Closes the browser and the server the hydrations share. */
export async function stop() {
	const current = session
	session = undefined
	if (current) {
		const { browser, server } = await current
		await browser.close()
		server.close()
	}
}

/** Where the two serializations part, if they do. */
function differenceOf(hydrated: string, client: string) {
	let index = 0
	while (index < hydrated.length && hydrated[index] === client[index]) {
		index++
	}
	if (index === hydrated.length && index === client.length) {
		return undefined
	}
	const start = hydrated.lastIndexOf('<', index)
	return `hydrated ${hydrated.slice(start, index + 80)} | client ${client.slice(start, index + 80)}`
}

/**
 * Hydrates the server output of a package's elements in headless Chromium and compares each with a client render of the same
 * markup. The hydration runs on a page of the package's own which imports only its entry point, as its server render did, since
 * a package may configure others globally. The client render runs on a second page without Lit's hydration support, as an
 * application rendering in the browser alone does, so that what the support changes for the whole page cannot hide in both.
 */
export function hydrate(packageName: string, entryPoint: string, rendered: ReadonlyArray<{ readonly element: Element, readonly html: string }>) {
	return pooled(async () => {
		const { browser, origin } = await start()
		const modulePath = (path: string) => Path.relative(directory, path).replace(/\\/g, '/').replace(/\.ts$/, '')
		const templates = [...rendered.map(({ element }) => `\t'${element.tag}': () => html\`${markupOf(element.tag)}\`,`), '})']
		FileSystem.writeFileSync(`${directory}/${packageName}.ts`, [
			`import '${modulePath('./scripts/ssr/errors.ts')}'`,
			'import \'@lit-labs/ssr-client/lit-element-hydrate-support.js\'',
			`import '${modulePath(entryPoint)}'`,
			'import { html } from \'lit\'',
			`import { hydrateAll } from '${modulePath('./scripts/ssr/client.ts')}'`,
			'',
			'await hydrateAll({',
			...templates,
		].join('\n'))
		FileSystem.writeFileSync(`${directory}/${packageName}.client.ts`, [
			`import '${modulePath('./scripts/ssr/errors.ts')}'`,
			`import '${modulePath(entryPoint)}'`,
			'import { html } from \'lit\'',
			`import { renderAll } from '${modulePath('./scripts/ssr/client.ts')}'`,
			'',
			'await renderAll({',
			...templates,
		].join('\n'))
		// The containers are positioned, so that an element filling its parent cannot cover the page and be hovered in one of the renders only.
		const page = (script: string, containers: ReadonlyArray<string>) => [
			'<!doctype html>',
			`<html><head><meta charset="utf-8"><title>${packageName}</title><style>[data-tag] { position: relative }</style></head><body>`,
			...containers,
			`<script type="module" src="./${script}"></script>`,
			'</body></html>',
		].join('\n')
		FileSystem.writeFileSync(`${directory}/${packageName}.html`, page(`${packageName}.js`, rendered.map(({ element, html }) => `<section><h2>${element.tag}</h2><div data-tag="${element.tag}">${html}</div></section>`)))
		FileSystem.writeFileSync(`${directory}/${packageName}.client.html`, page(`${packageName}.client.js`, rendered.map(({ element }) => `<section><h2>${element.tag}</h2><div data-tag="${element.tag}"></div></section>`)))

		const results = new Map<string, HydrationResult>()
		const pages = await Promise.all([browser.newPage({ viewport: { width: 1280, height: 800 } }), browser.newPage({ viewport: { width: 1280, height: 800 } })])
		const resultsOf = async <T>(index: number, file: string) => {
			await pages[index]!.goto(`${origin}/${file}`)
			await pages[index]!.waitForSelector('#results[data-done="true"]', { state: 'attached', timeout: 30_000 + rendered.length * 10_000 })
			return JSON.parse(await pages[index]!.textContent('#results') ?? '{}') as Record<string, T>
		}
		try {
			await esbuild.build({
				bundle: true,
				entryPoints: [`${directory}/${packageName}.ts`, `${directory}/${packageName}.client.ts`],
				outdir: directory,
				tsconfig: './tsconfig.json',
				platform: 'browser',
				conditions: ['source'],
				format: 'esm',
				legalComments: 'none',
				logLevel: 'silent',
			})
			const [hydrated, client] = await Promise.all([resultsOf<HydrationResult>(0, `${packageName}.html`), resultsOf<ClientRenderResult>(1, `${packageName}.client.html`)])
			for (const { element } of rendered) {
				const hydration = hydrated[element.tag] ?? { status: 'element-missing' }
				const reference = client[element.tag]
				const difference = hydration.status !== 'hydrated' ? undefined
					: reference?.serialized === undefined ? `the client render failed: ${reference?.error ?? 'no result'}`
						: differenceOf(hydration.serialized!, reference.serialized)
				results.set(element.tag, !difference ? hydration : { status: 'diverged', error: difference })
			}
		} catch (error) {
			for (const { element } of rendered) {
				results.set(element.tag, { status: 'hydration-error', error: `The page did not finish: ${error instanceof Error ? error.message.split('\n')[0] : error}` })
			}
		} finally {
			await Promise.all(pages.map(page => page.close()))
		}
		return results
	})
}
