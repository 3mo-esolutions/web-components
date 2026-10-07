import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

export default {
	title: 'Layout / Line',
	component: 'mo-line',
} satisfies Meta

export const Default: StoryObj = {
	render: () => html`<mo-line></mo-line>`,
}

/** Content becomes a label in the middle of the line. */
export const Label: StoryObj = {
	render: () => html`<mo-line>or</mo-line>`,
}

/** The line and its label follow `color`. */
export const Color: StoryObj = {
	render: () => html`<mo-line style='color: var(--mo-color-red)'>Unread</mo-line>`,
}

/** `direction='vertical'` separates items side by side and fills the height of its container, with or without a label. */
export const Vertical: StoryObj = {
	render: () => html`
		<mo-flex direction='horizontal' gap='16px' style='height: 100px'>
			<div style='flex: 1'>Sign in</div>
			<mo-line direction='vertical'></mo-line>
			<div style='flex: 1'>Register</div>
			<mo-line direction='vertical'>or</mo-line>
			<div style='flex: 1'>Continue as guest</div>
		</mo-flex>
	`,
}
