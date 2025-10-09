import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Data Display / Heading',
	component: 'mo-heading',
	args: {
		typography: 'heading1',
	},
	argTypes: {
		typography: { control: 'select', options: ['heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6', 'subtitle1', 'subtitle2'] },
	},
	package: p,
} as Meta

export const Heading: StoryObj = {
	render: ({ typography }) => html`<mo-heading typography=${typography}>Heading</mo-heading>`
}