import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly inward: boolean
}

export default {
	title: 'Foundations / Focus Ring',
	component: 'mo-focus-ring',
	args: {
		inward: false,
	},
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; gap: 16px; padding: 8px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

/** Press Tab to focus the card: the ring shows for keyboard focus, not for a click. */
export const Default: Story = {
	render: ({ inward }) => html`
		<div tabindex='0' style='position: relative; padding: 16px; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: 4px; outline: none'>
			Invoice #1024
			<mo-focus-ring ?inward=${inward}></mo-focus-ring>
		</div>
	`,
}

/** `inward` draws the ring inside the element, where an outer one would be clipped or overlap its neighbours. */
export const Inward: Story = {
	render: () => html`
		<div tabindex='0' style='position: relative; padding: 16px; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: 4px; outline: none'>
			Invoice #1024
			<mo-focus-ring inward></mo-focus-ring>
		</div>
	`,
}

/** `visible` shows the ring without focus, e.g. on the active option of a list whose focus stays in an input. */
export const Visible: Story = {
	render: () => html`
		<div style='position: relative; padding: 16px; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: 4px'>
			Invoice #1024
			<mo-focus-ring visible></mo-focus-ring>
		</div>
	`,
}

/** `for` takes the id of the element whose focus to follow in place of the parent, which the ring keeps surrounding - focus the input. */
export const Control: Story = {
	render: () => html`
		<label style='position: relative; display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: 4px'>
			Search
			<input id='focus-ring-search' style='border: none; outline: none; background: none; color: inherit; font: inherit'>
			<mo-focus-ring for='focus-ring-search'></mo-focus-ring>
		</label>
	`,
}

/** `--mo-focus-ring-color` replaces the accent color. */
export const CustomProperties: Story = {
	render: () => html`
		<div style='position: relative; padding: 16px; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: 4px'>
			Invoice #1024
			<mo-focus-ring visible style='--mo-focus-ring-color: var(--mo-color-red)'></mo-focus-ring>
		</div>
	`,
}