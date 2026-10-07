/// <reference lib="dom" />
import { hydrate } from '@lit-labs/ssr-client'
import { render, type TemplateResult } from 'lit'
import { errors } from './errors.ts'

// The browser side of the hydration harness. One page hydrates the server output of each component, another renders the same
// markup without Lit's hydration support, as an application rendering in the browser alone does, and each records what its
// components came to in #results, which the harness reads once it is marked as done and compares.

type HydratingElement = HTMLElement & { updateComplete?: Promise<unknown>, requestUpdate?(): void }

export type HydrationResult = {
	readonly status: 'hydrated' | 'diverged' | 'upgrade-error' | 'hydration-error' | 'nested-hydration-error' | 'no-shadow-root' | 'element-missing'
	readonly error?: string
	/** What the component came to, for the harness to compare. */
	readonly serialized?: string
}

// A component whose update never settles would stall the whole run, so every wait is bounded.
const settled = (promise: Promise<unknown> | undefined) => Promise.race([
	promise ?? Promise.resolve(),
	new Promise((_, reject) => setTimeout(() => reject(new Error('update did not settle')), 3000)),
])

const tick = (milliseconds = 100) => new Promise(resolve => setTimeout(resolve, milliseconds))

/** An element whose constructor threw while upgrading is left undefined for good and never hydrates. */
function failedUpgrade(root: Element | ShadowRoot): Element | undefined {
	for (const element of root.querySelectorAll('*')) {
		if (customElements.get(element.localName) && !element.matches(':defined')) {
			return element
		}
		const failed = element.shadowRoot ? failedUpgrade(element.shadowRoot) : undefined
		if (failed) {
			return failed
		}
	}
	return undefined
}

// Hydration verifies the shape of a template but trusts the server for text, so a value the server could not know stays
// stale without an error. Comparing the hydrated DOM with a client render of the same markup reveals it. Lit's markers,
// styles, and generated ids differ between the two by design and are left out.
function serialize(node: Node): string {
	if (node instanceof Text) {
		return node.data.trim()
	}
	if (!(node instanceof Element) || node.localName === 'style') {
		return ''
	}
	// A server writes the value of a form control as its attribute, whereas the browser sets the
	// property, so what they hold is compared instead. Class names may come in either order.
	const control = node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement
	const attributes = [...node.attributes]
		.filter(attribute => attribute.name !== 'defer-hydration' && !attribute.name.startsWith('lit$'))
		.filter(attribute => !control || (attribute.name !== 'value' && attribute.name !== 'checked'))
		.map(attribute => `${attribute.name}="${attribute.name === 'class' ? attribute.value.split(' ').filter(Boolean).sort().join(' ') : attribute.value}"`)
		.concat(!control ? [] : [`.value="${node.value}"`])
		.concat(node instanceof HTMLInputElement ? [`.checked="${node.checked}"`] : [])
		.sort()
	const shadow = !node.shadowRoot ? '' : `#shadow(${[...node.shadowRoot.childNodes].map(serialize).join('')})`
	return `<${[node.localName, ...attributes].join(' ')}>${shadow}${[...node.childNodes].map(serialize).join('')}</${node.localName}>`
}

function normalizeIds(serialized: string) {
	const ids = [...new Set([...serialized.matchAll(/ id="([^"]*[0-9][^"]*)"/g)].map(match => match[1]!))]
	return ids.reduce((result, id, index) => result.split(id).join(`id${index}`), serialized)
}

const serializeContainer = (container: Element) => normalizeIds([...container.childNodes].map(serialize).join(''))

async function hydrateOne(tag: string, template: () => TemplateResult, importErrors: ReadonlyArray<string>): Promise<HydrationResult> {
	const container = document.querySelector(`[data-tag="${tag}"]`)!
	// A component its parent renders in a shadow root hydrates, and is compared, as part of that parent:
	const element = container.querySelector<HydratingElement>(tag) ?? container.firstElementChild as HydratingElement | null
	if (!element) {
		return { status: 'element-missing' }
	}
	const failed = failedUpgrade(container)
	if (failed) {
		return { status: 'upgrade-error', error: `${failed.localName} failed to upgrade, while importing: ${importErrors[0] ?? 'no error'}` }
	}
	const errorsBefore = errors.length
	try {
		hydrate(template(), container)
		const deferred = [...container.querySelectorAll<HydratingElement>('[defer-hydration]')]
		deferred.forEach(deferredElement => deferredElement.removeAttribute('defer-hydration'))
		await Promise.all(deferred.map(deferredElement => settled(deferredElement.updateComplete)))
		// A second update catches components which hydrate but break on their first real update.
		element.requestUpdate?.()
		await settled(element.updateComplete)
		// Nested components hydrate once their parent has, and nothing awaits their updates,
		// so their failures only surface as global errors raised within this window.
		await tick()
		const nestedError = errors[errorsBefore]
		if (!element.shadowRoot) {
			return { status: 'no-shadow-root' }
		}
		if (nestedError) {
			return { status: 'nested-hydration-error', error: nestedError }
		}
		return { status: 'hydrated', serialized: serializeContainer(container) }
	} catch (error) {
		return { status: 'hydration-error', error: String(error instanceof Error ? error.message : error) }
	}
}

/** Renders the markup the server rendered, in the browser alone, as what hydrating it must come to. */
async function renderOne(tag: string, template: () => TemplateResult) {
	const container = document.querySelector<HTMLElement>(`[data-tag="${tag}"]`)!
	const errorsBefore = errors.length
	try {
		render(template(), container)
		const elements = [...container.querySelectorAll<HydratingElement>('*')].filter(element => element.updateComplete !== undefined)
		elements.forEach(element => element.removeAttribute('defer-hydration'))
		await Promise.allSettled(elements.map(element => settled(element.updateComplete)))
		await tick()
		const error = errors[errorsBefore]
		return error ? { error } : { serialized: serializeContainer(container) }
	} catch (error) {
		return { error: String(error instanceof Error ? error.message : error) }
	}
}

function publish(results: Record<string, unknown>) {
	const output = document.createElement('pre')
	output.id = 'results'
	output.textContent = JSON.stringify(results)
	output.dataset.done = 'true'
	document.body.append(output)
}

export async function hydrateAll(templates: Record<string, () => TemplateResult>) {
	const importErrors = errors.slice()
	const results: Record<string, HydrationResult> = {}
	for (const [tag, template] of Object.entries(templates)) {
		results[tag] = await hydrateOne(tag, template, importErrors)
	}
	publish(results)
}

export type ClientRenderResult = { readonly serialized?: string, readonly error?: string }

export async function renderAll(templates: Record<string, () => TemplateResult>) {
	const results: Record<string, ClientRenderResult> = {}
	for (const [tag, template] of Object.entries(templates)) {
		results[tag] = await renderOne(tag, template)
	}
	publish(results)
}
