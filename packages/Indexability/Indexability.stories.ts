import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import indexedListSource from './stories/IndexedList.ts?raw'
import registryBoardSource from './stories/RegistryBoard.ts?raw'
import './stories/IndexedList.js'
import './stories/RegistryBoard.js'

export default {
	title: 'Behaviors / Indexability',
} satisfies Meta

/** `items` answers in declared order, the order the owner reads its data in; click an item to resolve it with `itemAt`. */
export const Default: StoryObj = {
	parameters: sourceOf(indexedListSource),
	render: () => html`<story-indexed-list></story-indexed-list>`,
}

/** The same items rendered back to front: their document position changed, the answer did not. */
export const ScrambledDomOrder: StoryObj = {
	render: () => html`<story-indexed-list scrambled></story-indexed-list>`,
}

/** An item nested inside another resolves to itself, as the path is scanned nearest first, so a compound item can carry sub-items. */
export const NestedItems: StoryObj = {
	render: () => html`<story-indexed-list nested></story-indexed-list>`,
}

/**
 * Two registries on one host, whose cards each sit in their own shadow root. Each knows only its own items,
 * which is how sibling controllers, such as a grid's rows and its column headers, stay out of each other's events.
 */
export const SeveralRegistriesAcrossShadowRoots: StoryObj = {
	parameters: sourceOf(registryBoardSource),
	render: () => html`<story-registry-board></story-registry-board>`,
}