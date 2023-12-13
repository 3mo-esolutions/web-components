import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { Snackbar } from './Snackbar.js'

export default meta({
	title: 'Snackbar',
	component: 'mo-snackbar',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

let count = 0

export const Info = story({
	render: () => html`
		<mo-button @click=${() => Snackbar.notifyInfo(`Notification #${count++}`)}>Info</mo-button>
	`
})

export const Success = story({
	render: () => html`
		<mo-button @click=${() => Snackbar.notifySuccess(`Notification #${count++}`)}>Success</mo-button>
	`
})

export const Warning = story({
	render: () => html`
		<mo-button @click=${() => Snackbar.notifyWarning(`Notification #${count++}`)}>Warning</mo-button>
	`
})

export const Error = story({
	render: () => html`
		<mo-button @click=${() => Snackbar.notifyError(`Notification #${count++}`)}>Error</mo-button>
	`
})