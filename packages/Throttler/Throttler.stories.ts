import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { Throttler } from './index.js'

export default {
	title: 'Utilities / Throttler',
	decorators: [story => html`<mo-flex direction='horizontal' gap='16px' alignItems='center'>${story()}</mo-flex>`],
} satisfies Meta

/** Click rapidly: the first click saves at once and the last one a second after the burst ends. The calls in between never resolve. */
export const Default: StoryObj = {
	render: () => {
		const [throttler] = useState(() => new Throttler(1000))
		const [clicks, setClicks] = useState(0)
		const [saves, setSaves] = useState(0)
		return html`
			<mo-button type='outlined' @click=${async () => {
				setClicks(count => count + 1)
				await throttler.throttle()
				setSaves(count => count + 1)
			}}>Save</mo-button>
			<span>${clicks} clicks, ${saves} saves</span>
		`
	},
}

/** Throttling keystrokes searches for the first one right away and for the final text once typing pauses. */
export const Typing: StoryObj = {
	render: () => {
		const [throttler] = useState(() => new Throttler(500))
		const [searches, setSearches] = useState(new Array<string>())
		return html`
			<mo-field-search label='Search' @input=${async (event: CustomEvent<string | undefined>) => {
				await throttler.throttle()
				setSearches(previous => [...previous, event.detail ?? ''])
			}}></mo-field-search>
			<span>${searches.length} searches, last for "${searches.at(-1) ?? ''}"</span>
		`
	},
}