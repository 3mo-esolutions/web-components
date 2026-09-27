import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import infiniteListSource from './stories/InfiniteList.ts?raw'
import './stories/InfiniteList.js'

export default {
	title: 'Behaviors / Infinite Scroll Controller',
} satisfies Meta

/** Scroll down: the next chunk loads once less than half a viewport of items is left below. */
export const Default: StoryObj = {
	parameters: sourceOf(infiniteListSource),
	render: () => html`<story-infinite-list></story-infinite-list>`,
}

/** `fetchNext` resolving to `false` ends the stream, here after 50 items. */
export const EndOfStream: StoryObj = {
	render: () => html`<story-infinite-list total='50'></story-infinite-list>`,
}

/** Every third chunk fails. A failure stalls the stream, however much you scroll, until Retry calls `reset()`. */
export const FailingChunks: StoryObj = {
	render: () => html`<story-infinite-list failEvery='3'></story-infinite-list>`,
}