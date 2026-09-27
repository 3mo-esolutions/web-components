import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly label: string
	readonly selected: boolean
	readonly disabled: boolean
}

export default {
	title: 'Inputs / Radio',
	component: 'mo-radio',
	args: {
		label: 'Standard shipping',
		selected: false,
		disabled: false,
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; align-items: flex-start; gap: 12px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ label, selected, disabled }) => html`<mo-radio label=${label} ?selected=${selected} ?disabled=${disabled}></mo-radio>`,
}

/** Radios sharing a `name` form a group: selecting one clears the others, and the arrow keys move the selection within it. */
export const Groups: Story = {
	render: () => html`
		<mo-flex direction='horizontal' gap='16px'>
			<mo-radio name='shipping' label='Standard' selected></mo-radio>
			<mo-radio name='shipping' label='Express'></mo-radio>
			<mo-radio name='shipping' label='Pickup'></mo-radio>
		</mo-flex>
		<mo-flex direction='horizontal' gap='16px'>
			<mo-radio name='payment' label='Invoice' selected></mo-radio>
			<mo-radio name='payment' label='Card'></mo-radio>
		</mo-flex>
	`,
}

/** Selected and unselected, each also disabled. */
export const States: Story = {
	render: () => html`
		<mo-radio name='unselected' label='Unselected'></mo-radio>
		<mo-radio name='selected' label='Selected' selected></mo-radio>
		<mo-radio name='disabled' label='Disabled' disabled></mo-radio>
		<mo-radio name='disabled-selected' label='Disabled and selected' selected disabled></mo-radio>
	`,
}

/** `--mo-radio-accent-color` colors a selected radio, `--mo-radio-unchecked-color` an unselected one and `--mo-radio-disabled-color` a disabled one. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-radio name='accent' label='Accent' selected style='--mo-radio-accent-color: var(--mo-color-red)'></mo-radio>
		<mo-radio name='unchecked' label='Unchecked' style='--mo-radio-unchecked-color: var(--mo-color-red)'></mo-radio>
		<mo-radio name='disabled-color' label='Disabled' selected disabled style='--mo-radio-disabled-color: var(--mo-color-red)'></mo-radio>
	`,
}