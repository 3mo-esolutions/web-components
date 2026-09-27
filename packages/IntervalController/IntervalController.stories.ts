import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { sourceOf } from '../../.storybook/source.js'
import clockSource from './stories/Clock.ts?raw'
import tickCounterSource from './stories/TickCounter.ts?raw'
import './stories/Clock.js'
import './stories/TickCounter.js'

export default {
	title: 'Behaviors / Interval Controller',
} satisfies Meta

/** The task runs as soon as the host connects and then once per period. */
export const Default: StoryObj = {
	parameters: sourceOf(clockSource),
	render: () => html`<story-clock></story-clock>`,
}

/** The interval runs only while the host is connected. Remove the counter and it stops; a new one starts over with an immediate tick. */
export const WhileConnected: StoryObj = {
	parameters: sourceOf(tickCounterSource),
	decorators: [story => html`<mo-flex direction='horizontal' gap='16px' alignItems='center'>${story()}</mo-flex>`],
	render: () => {
		const [connected, setConnected] = useState(true)
		return html`
			<mo-button type='outlined' @click=${() => setConnected(!connected)}>${connected ? 'Remove' : 'Add'}</mo-button>
			${connected ? html`<story-tick-counter></story-tick-counter>` : html.nothing}
		`
	},
}