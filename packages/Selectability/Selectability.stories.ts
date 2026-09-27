import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import { people } from '../../stories/index.js'
import selectableListSource from './stories/SelectableList.ts?raw'
import pagedListSource from './stories/PagedList.ts?raw'
import './stories/SelectableList.js'
import './stories/PagedList.js'

export default {
	title: 'Behaviors / Selectability',
} satisfies Meta

/** A plain click replaces the selection, ctrl/⌘+click adds an item, shift+click extends from the last one and ctrl/⌘+A takes everything. */
export const Default: StoryObj = {
	parameters: sourceOf(selectableListSource),
	render: () => html`<story-selectable-list></story-selectable-list>`,
}

/** `strategy: SelectabilityStrategy.Toggle` makes every click add or remove an item, as if it carried a checkbox; shift+click still extends. */
export const ToggleStrategy: StoryObj = {
	render: () => html`<story-selectable-list strategy='toggle'></story-selectable-list>`,
}

/** `selectability: Selectability.Single` keeps at most one item selected; the range and preserve gestures act like a plain click. */
export const SingleSelection: StoryObj = {
	render: () => html`<story-selectable-list selectability='single'></story-selectable-list>`,
}

/** `allState` and `toggleAll()` drive a tri-state select-all. Unselectable items do not count, so it can still reach "all". */
export const SelectAll: StoryObj = {
	render: () => html`<story-selectable-list selectAll .unselectable=${[people[2]!.id, people[5]!.id]}></story-selectable-list>`,
}

/** Items `isSelectable` rejects ignore clicks, are left out of select-all and are stepped over by a range. */
export const UnselectableItems: StoryObj = {
	render: () => html`<story-selectable-list .unselectable=${[people[1]!.id, people[2]!.id, people[3]!.id]}></story-selectable-list>`,
}

/** `items` is the whole list, not what is rendered, so shift+click on a later page also selects every page in between. */
export const BeyondWhatIsRendered: StoryObj = {
	parameters: sourceOf(pagedListSource),
	render: () => html`<story-paged-list></story-paged-list>`,
}