import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import reorderableItemsSource from './stories/ReorderableItems.ts?raw'
import taskListSource from './stories/TaskList.ts?raw'
import boardSource from './stories/Board.ts?raw'
import './stories/ReorderableItems.js'
import './stories/TaskList.js'
import './stories/Board.js'

export default {
	title: 'Behaviors / Reorderability',
} satisfies Meta

/** Drag an item, or on touch hold it first, so a plain swipe still scrolls. The displaced items move aside as it goes. */
export const Default: StoryObj = {
	parameters: sourceOf(reorderableItemsSource),
	render: () => html`<story-reorderable-items></story-reorderable-items>`,
}

/** Items that wrap onto several lines are hit-tested rather than ordered along one axis. */
export const WrappingGrid: StoryObj = {
	render: () => html`<story-reorderable-items layout='grid' count='14'></story-reorderable-items>`,
}

/** A horizontal scroller, which scrolls by itself as a drag nears its edges. */
export const HorizontalRow: StoryObj = {
	render: () => html`<story-reorderable-items layout='row' count='12'></story-reorderable-items>`,
}

/** The same row written right to left: the order is read off the items' positions, so nothing about direction is configured. */
export const RightToLeft: StoryObj = {
	decorators: [story => html`<div dir='rtl'>${story()}</div>`],
	render: () => html`<story-reorderable-items layout='row'></story-reorderable-items>`,
}

/** `strategy: 'indicator'` leaves the items in place, stamps `drop-before` or `drop-after` on the target and drags a `dragImage` preview. */
export const IndicatorStrategy: StoryObj = {
	render: () => html`<story-reorderable-items layout='row' strategy='indicator'></story-reorderable-items>`,
}

/** `handle` confines the grab to a descendant, here the grip icon. */
export const DragHandle: StoryObj = {
	render: () => html`<story-reorderable-items handle='.grip'></story-reorderable-items>`,
}

/** Disabled items can be neither grabbed nor dropped onto, but still move aside for a reorder around them. */
export const DisabledItems: StoryObj = {
	render: () => html`<story-reorderable-items .disabled=${[0, 3]}></story-reorderable-items>`,
}

/**
 * `excluded: '.actions'` keeps each row's own buttons out of the drag, so the whole row drags and its controls keep their clicks.
 * Naming what must not drag is exact where a `handle` cannot be: the row's body is the item element itself.
 */
export const ItemsWithTheirOwnControls: StoryObj = {
	parameters: sourceOf(taskListSource),
	render: () => html`<story-task-list></story-task-list>`,
}

/** One controller per column: a card reorders within its column and never travels into another. */
export const BoardOfIndependentLists: StoryObj = {
	parameters: sourceOf(boardSource),
	render: () => html`<story-board></story-board>`,
}
