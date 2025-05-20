import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import { DialogAlert } from './index.js'

export default {
	title: 'Communication / Standard Dialogs / Alert Dialog',
	component: 'mo-dialog-alert',
	package: p,
} as Meta

export const AlertDialog: StoryObj = {
	render: () => html`
		<mo-button @click=${() => new DialogAlert({ heading: 'Heading', content: 'Content' }).confirm()}>Open</mo-button>
	`
}