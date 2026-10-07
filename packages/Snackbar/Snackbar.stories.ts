import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { Snackbar } from './index.js'

export default {
	title: 'Feedback / Snackbar',
	component: 'mo-snackbar',
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; gap: 12px'>${story()}</div>`],
} satisfies Meta

export const Default: StoryObj = {
	render: () => html`
		<mo-button @click=${() => Snackbar.notifyInfo('Changes saved')}>Save</mo-button>
	`,
}

/** Each type brings its own color and icon; a warning stays 10 seconds and an error 15, where the others go after 5. */
export const Types: StoryObj = {
	render: () => html`
		<mo-button @click=${() => Snackbar.notifyInfo('A new version is available')}>Info</mo-button>
		<mo-button @click=${() => Snackbar.notifySuccess('The order was shipped')}>Success</mo-button>
		<mo-button @click=${() => Snackbar.notifyWarning('The subscription ends in 3 days')}>Warning</mo-button>
		<mo-button @click=${() => Snackbar.notifyError('The payment was declined')}>Error</mo-button>
	`,
}

/** `actions` add buttons to the snack-bar, and each one keeps it open 2.5 seconds longer. */
export const Actions: StoryObj = {
	render: () => html`
		<mo-button @click=${() => Snackbar.notifySuccess({
			message: 'The event was created',
			actions: [{ title: 'Undo', handleClick: () => Snackbar.notifyInfo('The event was removed') }],
		})}>Create event</mo-button>
	`,
}

/** Up to three snack-bars lay out as a list; more pile up behind the third. Hover the pile to lay them all out again and pause their timers. */
export const Stacking: StoryObj = {
	render: () => html`
		<mo-button @click=${() => {
			Snackbar.notifyInfo('Notification 1')
			Snackbar.notifySuccess('Notification 2')
			Snackbar.notifyWarning('Notification 3')
			Snackbar.notifyError('Notification 4')
			Snackbar.notifyInfo('Notification 5 with a longer message that spans wider than the others')
		}}>Show 5 notifications</mo-button>
	`,
}
