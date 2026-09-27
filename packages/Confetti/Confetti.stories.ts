import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

export default {
	title: 'Feedback / Confetti',
	component: 'mo-confetti',
} satisfies Meta

/** `rain()` covers the nearest positioned ancestor in confetti until the last piece has fallen. */
export const Default: StoryObj = {
	render: () => html`
		<mo-button type='filled' startIcon='celebration' @click=${() => document.querySelector('mo-confetti')?.rain()}>Celebrate</mo-button>
		<mo-confetti></mo-confetti>
	`,
}