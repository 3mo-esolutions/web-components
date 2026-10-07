import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

export default {
	title: 'Layout / Scroller',
	component: 'mo-scroller',
} satisfies Meta

export const Default: StoryObj = {
	render: () => html`
		<mo-scroller style='height: 400px'>
			${Array.from({ length: 50 }, (_, index) => html`<p>Paragraph ${index + 1}</p>`)}
		</mo-scroller>
	`,
}

/** Content wider than the scroller scrolls sideways with the same thin scrollbar. */
export const Horizontal: StoryObj = {
	render: () => html`
		<mo-scroller>
			<mo-flex direction='horizontal' gap='8px' style='width: max-content; padding-block-end: 8px'>
				${Array.from({ length: 30 }, (_, index) => html`<mo-card style='width: 160px'>Card ${index + 1}</mo-card>`)}
			</mo-flex>
		</mo-scroller>
	`,
}

/** `snapType` sets `scroll-snap-type`, so that scrolling comes to rest on the items that declare `scroll-snap-align`. */
export const Snapping: StoryObj = {
	render: () => html`
		<mo-scroller snapType='y proximity' style='height: 400px'>
			${Array.from({ length: 20 }, (_, index) => html`
				<div style='height: 300px; display: flex; align-items: center; justify-content: center; color: black; scroll-snap-align: center; background: ${index % 2 ? '#7FCDCD' : '#F3E0BE'}'>Slide ${index + 1}</div>
			`)}
		</mo-scroller>
	`,
}

/** `--mo-scroller-thumb-color` and `--mo-scroller-track-color` color the scrollbar. */
export const CustomProperties: StoryObj = {
	render: () => html`
		<mo-scroller style='height: 400px; --mo-scroller-thumb-color: var(--mo-color-accent); --mo-scroller-track-color: var(--mo-color-transparent-gray-3)'>
			${Array.from({ length: 50 }, (_, index) => html`<p>Paragraph ${index + 1}</p>`)}
		</mo-scroller>
	`,
}
