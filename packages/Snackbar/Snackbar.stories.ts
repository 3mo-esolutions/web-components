import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

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
		<mo-snackbar text='Info' open></mo-snackbar>
	`
})

export const Success = story({
	render: () => html`
		<mo-snackbar type='success' text='Success' open></mo-snackbar>
	`
})

export const Warning = story({
	render: () => html`
		<mo-snackbar type='warning' text='Warning' open></mo-snackbar>
	`
})

export const Error = story({
	render: () => html`
		<mo-snackbar type='error' text='Error' open></mo-snackbar>
	`
})