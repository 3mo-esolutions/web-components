import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './IconButton.js'

type Args = {
	readonly icon: string
	readonly disabled: boolean
	readonly dense: boolean
}

export default {
	title: 'Actions / Icon Button',
	component: 'mo-icon-button',
	args: {
		icon: 'verified',
		disabled: false,
		dense: false,
	},
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 12px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ icon, disabled, dense }) => html`<mo-icon-button icon=${icon} ?disabled=${disabled} ?dense=${dense}></mo-icon-button>`,
}

/** The icon, its ripple and its focus ring take the inherited `color`. */
export const Color: Story = {
	render: ({ icon, disabled, dense }) => html`
		<mo-icon-button icon=${icon} ?disabled=${disabled} ?dense=${dense} style='color: var(--mo-color-green)'></mo-icon-button>
		<mo-icon-button icon=${icon} ?disabled=${disabled} ?dense=${dense} style='color: var(--mo-color-red)'></mo-icon-button>
		<mo-icon-button icon=${icon} ?disabled=${disabled} ?dense=${dense} style='color: var(--mo-color-accent)'></mo-icon-button>
	`,
}

/** The button scales with its `font-size`, 20px by default. */
export const Sizes: Story = {
	render: ({ icon, disabled, dense }) => html`
		<mo-icon-button icon=${icon} ?disabled=${disabled} ?dense=${dense} style='font-size: 16px'></mo-icon-button>
		<mo-icon-button icon=${icon} ?disabled=${disabled} ?dense=${dense}></mo-icon-button>
		<mo-icon-button icon=${icon} ?disabled=${disabled} ?dense=${dense} style='font-size: 32px'></mo-icon-button>
		<mo-icon-button icon=${icon} ?disabled=${disabled} ?dense=${dense} style='font-size: 48px'></mo-icon-button>
	`,
}

/** `dense` halves the padding around the icon, for tight spots such as a field or a table cell. */
export const Dense: Story = {
	render: ({ icon, disabled }) => html`
		<mo-icon-button icon=${icon} ?disabled=${disabled}></mo-icon-button>
		<mo-icon-button icon=${icon} ?disabled=${disabled} dense></mo-icon-button>
	`,
}

/** A disabled button fades and ignores presses. */
export const Disabled: Story = {
	render: ({ icon, dense }) => html`<mo-icon-button icon=${icon} ?dense=${dense} disabled></mo-icon-button>`,
}

/** The `icon` slot takes any content in place of the Material icon. */
export const IconSlot: Story = {
	render: ({ disabled, dense }) => html`
		<mo-icon-button ?disabled=${disabled} ?dense=${dense}><span slot='icon'>🔖</span></mo-icon-button>
		<mo-icon-button ?disabled=${disabled} ?dense=${dense}><span slot='icon'>🚀</span></mo-icon-button>
		<mo-icon-button ?disabled=${disabled} ?dense=${dense}><span slot='icon'>🔍</span></mo-icon-button>
	`,
}

/** The `button`, `ripple` and `focus-ring` parts can be restyled or hidden from outside. */
export const Parts: Story = {
	render: ({ disabled, dense }) => html`
		<style>
			.gradient::part(button) {
				border: 1px solid gray;
				background: linear-gradient(90deg, rgba(255, 166, 158, 0.25) 0%, rgba(134, 22, 87, 0.25) 100%);
			}
		</style>
		<mo-icon-button class='gradient' ?disabled=${disabled} ?dense=${dense} style='font-size: 80px'><span slot='icon'>🎅</span></mo-icon-button>
	`,
}
