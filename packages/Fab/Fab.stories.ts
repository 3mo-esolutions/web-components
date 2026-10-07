import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly icon: string
	readonly dense: boolean
}

export default {
	title: 'Actions / Floating Action Button',
	component: 'mo-fab',
	args: {
		icon: 'add',
		dense: false,
	},
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 16px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ icon, dense }) => html`<mo-fab icon=${icon} ?dense=${dense}></mo-fab>`,
}

/** Text in the default slot makes it an extended FAB, labelled beside its icon. */
export const Extended: Story = {
	render: ({ icon, dense }) => html`<mo-fab icon=${icon} ?dense=${dense}>Add</mo-fab>`,
}

/** `dense` makes it the small FAB, with or without a label. */
export const Dense: Story = {
	render: ({ icon }) => html`
		<mo-fab icon=${icon} dense></mo-fab>
		<mo-fab icon=${icon} dense>Add</mo-fab>
	`,
}

/** `iconAtEnd` moves the icon after the label, and follows the writing direction. */
export const IconAtEnd: Story = {
	render: () => html`<mo-fab icon='arrow_forward' iconAtEnd>Next</mo-fab>`,
}

/** The `icon` slot takes any content in place of the Material icon, such as an SVG drawn in the current color. */
export const IconSlot: Story = {
	render: () => html`
		<mo-fab>
			<svg slot='icon' viewBox='0 0 24 24' width='24' height='24' fill='currentColor'>
				<path d='M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z'/>
			</svg>
		</mo-fab>
		<mo-fab>
			<svg slot='icon' viewBox='0 0 24 24' width='24' height='24' fill='currentColor'>
				<path d='M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z'/>
			</svg>
			Generate
		</mo-fab>
	`,
}

/** The `button`, `ripple` and `focus-ring` parts can be restyled or hidden from outside. */
export const Parts: Story = {
	render: ({ icon, dense }) => html`
		<style>
			.round::part(button) { border-radius: 50%; }
			.no-ripple::part(ripple) { display: none; }
		</style>
		<mo-fab class='round' icon=${icon} ?dense=${dense}></mo-fab>
		<mo-fab class='no-ripple' icon=${icon} ?dense=${dense}>Without ripple</mo-fab>
	`,
}
