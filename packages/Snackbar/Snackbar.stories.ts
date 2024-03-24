import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { Snackbar } from './Snackbar.js'

export default {
	title: 'Snackbar',
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