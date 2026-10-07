import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly open: boolean
}

export default {
	title: 'Actions / Floating Action Button Group',
	component: 'mo-fab-group',
	args: {
		open: false,
	},
	decorators: [story => html`<div style='position: relative; height: 300px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ open }) => html`
		<mo-fab-group ?open=${open} style='position: absolute; inset-inline-end: 16px; bottom: 16px'>
			<mo-fab icon='add'>Add</mo-fab>
			<mo-fab icon='publish'>Import</mo-fab>
			<mo-fab icon='share'>Share</mo-fab>
		</mo-fab-group>
	`,
}

/** `--mo-fab-group-transition-duration` sets how long the buttons take to unfold. Press the button. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-fab-group style='position: absolute; inset-inline-end: 16px; bottom: 16px; --mo-fab-group-transition-duration: 1s'>
			<mo-fab icon='add'>Add</mo-fab>
			<mo-fab icon='publish'>Import</mo-fab>
			<mo-fab icon='share'>Share</mo-fab>
		</mo-fab-group>
	`,
}
