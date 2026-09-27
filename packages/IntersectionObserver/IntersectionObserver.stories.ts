import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import visibilityReadoutSource from './stories/VisibilityReadout.ts?raw'
import inViewCardSource from './stories/InViewCard.ts?raw'
import './stories/VisibilityReadout.js'
import './stories/InViewCard.js'

export default {
	title: 'Behaviors / Intersection Observer',
} satisfies Meta

/** `observeIntersection` calls back as the element it sits on crosses the thresholds it is given. Scroll the box in and out of view. */
export const Default: StoryObj = {
	parameters: sourceOf(visibilityReadoutSource),
	render: () => html`<story-visibility-readout></story-visibility-readout>`,
}

/** `IntersectionController` observes the host itself and keeps what its callback returns as `value`. Scroll, and each card lights up as it enters the view. */
export const Controller: StoryObj = {
	parameters: sourceOf(inViewCardSource),
	decorators: [story => html`<mo-flex gap='8px' style='block-size: 14rem; inline-size: 18rem; overflow: auto'>${story()}</mo-flex>`],
	render: () => html`
		<story-in-view-card>January</story-in-view-card>
		<story-in-view-card>February</story-in-view-card>
		<story-in-view-card>March</story-in-view-card>
		<story-in-view-card>April</story-in-view-card>
		<story-in-view-card>May</story-in-view-card>
		<story-in-view-card>June</story-in-view-card>
	`,
}