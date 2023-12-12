import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { NotificationComponent } from '@a11d/lit-application'

const generateNumber = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateMessage = (min: number, max: number) => {
	return Array
		.from(
			{ length: generateNumber(min, max) },
			() => String.fromCharCode(generateNumber(32, 126)),
		)
		.reduce((value, char) => value + char, '');
}

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
		<mo-button @click=${() => NotificationComponent.notifyInfo(generateMessage(24, 128))}>Info</mo-button>
	`
})

export const Success = story({
	render: () => html`
		<mo-button @click=${() => NotificationComponent.notifySuccess(generateMessage(24, 128))}>Success</mo-button>
	`
})

export const Warning = story({
	render: () => html`
		<mo-button @click=${() => NotificationComponent.notifyWarning(generateMessage(24, 128))}>Warning</mo-button>
	`
})

export const Error = story({
	render: () => html`
		<mo-button @click=${() => NotificationComponent.notifyError(generateMessage(24, 128))}>Error</mo-button>
	`
})