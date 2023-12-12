import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { NotificationComponent } from '@a11d/lit-application'

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

export const Info = story({
	render: () => html`
		<mo-button @click=${() => NotificationComponent.notifyInfo('Info')}>Info</mo-button>
	`
})

export const Success = story({
	render: () => html`
		<mo-button @click=${() => NotificationComponent.notifySuccess('Success')}>Success</mo-button>
	`
})

export const Warning = story({
	render: () => html`
		<mo-button @click=${() => NotificationComponent.notifyWarning('Warning')}>Warning</mo-button>
	`
})

export const Error = story({
	render: () => html`
		<mo-button @click=${() => NotificationComponent.notifyError('Error')}>Error</mo-button>
	`
})