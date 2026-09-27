import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import './index.js'

type Args = {
	readonly open: boolean
	readonly disabled: boolean
}

export default {
	title: 'Actions / Expand Collapse Icon Button',
	component: 'mo-expand-collapse-icon-button',
	args: {
		open: false,
		disabled: false,
	},
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 12px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ open, disabled }) => html`<mo-expand-collapse-icon-button ?open=${open} ?disabled=${disabled}></mo-expand-collapse-icon-button>`,
}

/** The button only shows the state, turning its chevron when `open` changes; flipping it on `click` is up to you. Press the header. */
export const Toggling: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<div style='width: 320px'>
				<div style='display: flex; align-items: center; justify-content: space-between; cursor: pointer' @click=${() => setOpen(!open)}>
					<span style='font-weight: 500'>Shipping address</span>
					<mo-expand-collapse-icon-button ?open=${open}></mo-expand-collapse-icon-button>
				</div>
				<div ?hidden=${!open}>Musterstraße 1, 10115 Berlin</div>
			</div>
		`
	},
}

/** A disabled button fades in either state and ignores presses. */
export const Disabled: Story = {
	render: () => html`
		<mo-expand-collapse-icon-button disabled></mo-expand-collapse-icon-button>
		<mo-expand-collapse-icon-button disabled open></mo-expand-collapse-icon-button>
	`,
}