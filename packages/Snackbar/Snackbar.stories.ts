import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { Snackbar } from './Snackbar.js'

export default {
	title: 'Communication / Snackbar',
	component: 'mo-snackbar',
	package: p,
} as Meta

let count = 0

export const Info: StoryObj = {
	render: () => html`
		<mo-button @click=${() => Snackbar.notifyInfo(`Notification #${count++}`)}>Info</mo-button>
	`
}

export const Success: StoryObj = {
	render: () => html`
		<mo-button @click=${() => Snackbar.notifySuccess(`Notification #${count++}`)}>Success</mo-button>
	`
}

export const Warning: StoryObj = {
	render: () => html`
		<mo-button @click=${() => Snackbar.notifyWarning(`Notification #${count++}`)}>Warning</mo-button>
	`
}

export const Error: StoryObj = {
	render: () => html`
		<mo-button @click=${() => Snackbar.notifyError(`Notification #${count++}`)}>Error</mo-button>
	`
}

export const WithActions: StoryObj = {
	render: () => html`
		<mo-button @click=${() => Snackbar.notifySuccess({
			message: `Event #${count++} created`,
			actions: [{ title: 'Undo', handleClick: () => Snackbar.notifyInfo('Undone!') }],
		})}>With Actions</mo-button>
	`
}

export const Stacking: StoryObj = {
	render: () => html`
		<p>Snack-bars lay out as a list while up to 3 of them are open. From the 4th one on, they collapse into a pile behind the 3rd one instead of growing the list any further. Hover over the stack to lay them all out again.</p>
		<mo-button @click=${() => {
			Snackbar.notifyInfo(`Notification #${count++}`)
			Snackbar.notifySuccess(`Notification #${count++}`)
			Snackbar.notifyWarning(`Notification #${count++}`)
			Snackbar.notifyError(`Notification #${count++}`)
			Snackbar.notifyInfo(`Notification #${count++} with a longer message that spans wider than the others`)
		}}>Show 5 notifications</mo-button>
	`
}