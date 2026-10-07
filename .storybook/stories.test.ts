import { beforeAll, describe, it } from 'vitest'
import type { ReactiveElement } from '@a11d/lit'
import { composeStories, composeStory } from 'storybook/preview-api'
import { setProjectAnnotations } from '@storybook/web-components-vite'
import '@3mo/del'
import { decorators, globalTypes, initialGlobals } from './globals.js'

type StoryModule = Parameters<typeof composeStories>[0]
type Story = ReturnType<typeof composeStory>

const annotations = setProjectAnnotations([{ decorators, globalTypes, initialGlobals }])

beforeAll(() => annotations.beforeAll?.())

// `composeStories` alone ignores the annotations set above and composes with only the ones it is handed.
const compose: Parameters<typeof composeStories>[2] = (story, meta, project, name) => composeStory(story, meta, project, undefined, name)

// Imported one by one after the library, as Storybook does, rather than eagerly, which would hoist them above it.
for (const [path, load] of Object.entries(import.meta.glob<StoryModule>(['../packages/**/*.stories.ts', '../samples/**/*.stories.ts']))) {
	const module = await load()
	describe(module.default.title ?? path, () => {
		for (const [name, story] of Object.entries(composeStories(module, {}, compose) as Record<string, Story>)) {
			it.skipIf(!story.tags.includes('test'))(name, () => renderStory(story))
		}
	})
}

async function renderStory(story: Story) {
	const errors = new Set<unknown>()
	// Like Vitest, which ignores the error events that carry no error, such as a ResizeObserver loop.
	const collect = (error: unknown) => {
		if (error !== undefined && error !== null) {
			errors.add(error)
		}
	}
	const onError = (event: ErrorEvent) => collect(event.error)
	const onRejection = (event: PromiseRejectionEvent) => collect(event.reason)
	const canvasElement = document.body.appendChild(document.createElement('div'))
	window.addEventListener('error', onError)
	window.addEventListener('unhandledrejection', onRejection)
	try {
		await story.run({ canvasElement })
		for (const error of await settle(canvasElement)) {
			collect(error)
		}
		const undefinedTags = new Set(elementsIn(canvasElement).filter(element => element.matches(':not(:defined)') && !customElements.get(element.localName)).map(element => `<${element.localName}>`))
		if (undefinedTags.size) {
			collect(new Error(`${[...undefinedTags].join(', ')} rendered without a definition, as an inert element`))
		}
	} finally {
		window.removeEventListener('error', onError)
		window.removeEventListener('unhandledrejection', onRejection)
		canvasElement.remove()
	}
	if (errors.size) {
		throw errors.size === 1 ? [...errors][0] : new AggregateError([...errors], `${errors.size} errors while rendering`)
	}
}

/** Waits for the updates the render set off and returns what they threw, which Chromium reports as unhandled only stories later. */
async function settle(root: Element) {
	const errors = new Array<unknown>()
	for (let pass = 0; pass < 5; pass++) {
		// An element whose constructor threw is not `:defined`, and its update never completes.
		const elements = elementsIn(root).filter((element): element is ReactiveElement => 'updateComplete' in element && element.matches(':defined'))
		for (const result of await Promise.allSettled(elements.map(element => element.updateComplete))) {
			if (result.status === 'rejected') {
				errors.push(result.reason)
			}
		}
		await new Promise(resolve => setTimeout(resolve))
		if (!elementsIn(root).some(element => (element as Partial<ReactiveElement>).isUpdatePending)) {
			break
		}
	}
	return errors
}

function elementsIn(root: Element | ShadowRoot): Array<Element> {
	return [...root.querySelectorAll('*')].flatMap(element => !element.shadowRoot ? [element] : [element, ...elementsIn(element.shadowRoot)])
}
