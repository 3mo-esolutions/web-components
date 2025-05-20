import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Buttons & Actions / Expand Collapse Icon Button',
	component: 'mo-expand-collapse-icon-button',
	args: {
		disabled: false,
		open: false,
	},
	package: p,
} as Meta

export const ExpandCollapseIconButton: StoryObj = {
	render: ({ disabled, open }) => html`
		<mo-expand-collapse-icon-button
			?disabled=${disabled}
			?open=${open}
		></mo-expand-collapse-icon-button>
	`
}