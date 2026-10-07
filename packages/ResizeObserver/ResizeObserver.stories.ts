import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import sizeReadoutSource from './stories/SizeReadout.ts?raw'
import responsiveCardSource from './stories/ResponsiveCard.ts?raw'
import './stories/SizeReadout.js'
import './stories/ResponsiveCard.js'

export default {
	title: 'Behaviors / Resize Observer',
} satisfies Meta

/** `observeResize` calls back whenever the element it sits on resizes. Drag the box's corner. */
export const Default: StoryObj = {
	parameters: sourceOf(sizeReadoutSource),
	render: () => html`<story-size-readout></story-size-readout>`,
}

/** `ResizeController` observes the host itself and keeps what its callback returns as `value`. Drag the card's edge below 320 pixels and it stacks. */
export const Controller: StoryObj = {
	parameters: sourceOf(responsiveCardSource),
	render: () => html`<story-responsive-card></story-responsive-card>`,
}
