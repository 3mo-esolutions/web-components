import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import navigableListSource from './stories/NavigableList.ts?raw'
import searchableListSource from './stories/SearchableList.ts?raw'
import './stories/NavigableList.js'
import './stories/SearchableList.js'

export default {
	title: 'Behaviors / Navigability',
} satisfies Meta

/** Tab in, then the arrows move, Home and End jump and PageUp and PageDown page. A key-driven cursor is stamped `data-navigability-method=keyboard`. */
export const Default: StoryObj<{ wrap: boolean, typeahead: boolean }> = {
	args: { wrap: false, typeahead: false },
	parameters: sourceOf(navigableListSource),
	render: ({ wrap, typeahead }) => html`<story-navigable-list ?wrap=${wrap} ?typeahead=${typeahead}></story-navigable-list>`,
}

/** `wrap` connects the ends, so ↓ on the last person lands on the first. */
export const Wrapping: StoryObj = {
	render: () => html`<story-navigable-list wrap></story-navigable-list>`,
}

/** `typeahead` moves to the next item whose text starts with what was typed. */
export const Typeahead: StoryObj = {
	render: () => html`<story-navigable-list typeahead></story-navigable-list>`,
}

/** Disabled items keep their place in the order but are stepped over. */
export const DisabledItems: StoryObj = {
	render: () => html`<story-navigable-list .disabled=${[3, 7]}></story-navigable-list>`,
}

/**
 * `focus: 'activedescendant'` keeps focus in the input, which keeps its caret keys. Filter while a person is current:
 * the cursor finds its item again by key, or snaps to the nearest one.
 */
export const ActiveDescendant: StoryObj = {
	parameters: sourceOf(searchableListSource),
	render: () => html`<story-searchable-list></story-searchable-list>`,
}