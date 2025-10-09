import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import { GenericDialog } from './index.js'

export default {
	title: 'Communication / Standard Dialogs / Generic Dialog',
	component: 'mo-generic-dialog',
	package: p,
} as Meta

export const Default: StoryObj = {
	render: () => html`
		<mo-button @click=${() => new GenericDialog({ heading: 'Heading', content: 'Content' }).confirm()}>Open</mo-button>
	`
}