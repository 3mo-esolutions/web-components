import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import type { VirtualizedScroller } from './VirtualizedScroller.js'
import './index.js'

export default {
	title: 'Layout / Virtualized Scroller',
	component: 'mo-virtualized-scroller',
} satisfies Meta

export const Default: StoryObj = {
	render: () => html`
		<mo-virtualized-scroller style='height: 400px'
			.items=${Array.from({ length: 1000 }, (_, index) => index + 1)}
			.getItemTemplate=${(number: number) => html`<div style='padding: 10px'>Item ${number}</div>`}
		></mo-virtualized-scroller>
	`,
}

/** Items of different heights are measured as they render, so a hundred thousand of them still scroll smoothly. */
export const VariableHeights: StoryObj = {
	render: () => html`
		<mo-virtualized-scroller style='height: 400px'
			.items=${Array.from({ length: 100_000 }, (_, index) => index + 1)}
			.getItemTemplate=${(number: number) => html`
				<div style='width: 100%; box-sizing: border-box; margin-block: 4px; padding: 10px; height: ${40 + number % 5 * 20}px; border-radius: 4px; color: black; background: ${number % 2 ? '#7FCDCD' : '#F7CAC9'}'>Item ${number}</div>
			`}
		></mo-virtualized-scroller>
	`,
}

/** `getElement(index)` returns an item even when it is not rendered, so that it can be scrolled into view. */
export const ScrollToItem: StoryObj = {
	render: () => html`
		<mo-flex gap='8px' alignItems='start'>
			<mo-button @click=${(e: Event) => ((e.currentTarget as HTMLElement).parentElement!.querySelector('mo-virtualized-scroller') as VirtualizedScroller).getElement(499)?.scrollIntoView({ block: 'center' })}>Scroll to item 500</mo-button>
			<mo-virtualized-scroller style='height: 400px'
				.items=${Array.from({ length: 1000 }, (_, index) => index + 1)}
				.getItemTemplate=${(number: number) => html`<div style='padding: 10px'>Item ${number}</div>`}
			></mo-virtualized-scroller>
		</mo-flex>
	`,
}
