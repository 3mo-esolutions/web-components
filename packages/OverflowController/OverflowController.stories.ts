import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import overflowBarSource from './stories/OverflowBar.ts?raw'
import './stories/OverflowBar.js'

export default {
	title: 'Behaviors / Overflow Controller',
} satisfies Meta

/** Drag the container's end corner to narrow it: items overflow from the end and return, while `reservedSize` keeps room for the badge. Items keep `flex: 0 0 auto` and are spaced by `gap`, as the arithmetic assumes. */
export const Default: StoryObj = {
	parameters: sourceOf(overflowBarSource),
	render: () => html`<story-overflow-bar></story-overflow-bar>`,
}

/** Items registered as `pinned` never overflow: Save As… and Delete keep their place while the others come and go. */
export const PinnedItems: StoryObj = {
	render: () => html`<story-overflow-bar .pinned=${['Save As…', 'Delete']}></story-overflow-bar>`,
}