import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly label: string
	readonly selected: boolean
	readonly disabled: boolean
}

export default {
	title: 'Inputs / Switch',
	component: 'mo-switch',
	args: {
		label: 'Dark mode',
		selected: false,
		disabled: false,
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; align-items: flex-start; gap: 12px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ label, selected, disabled }) => html`<mo-switch label=${label} ?selected=${selected} ?disabled=${disabled}></mo-switch>`,
}

/** On and off, each also disabled. Without a `label` only the switch is rendered. */
export const States: Story = {
	render: () => html`
		<mo-switch label='Off'></mo-switch>
		<mo-switch label='On' selected></mo-switch>
		<mo-switch label='Disabled' disabled></mo-switch>
		<mo-switch label='Disabled and on' selected disabled></mo-switch>
		<mo-switch selected></mo-switch>
	`,
}

/** `--mo-switch-accent-color` colors the switch when on, `--mo-switch-unselected-color` when off. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-switch label='Accent' selected style='--mo-switch-accent-color: var(--mo-color-yellow)'></mo-switch>
		<mo-switch label='Unselected' style='--mo-switch-accent-color: var(--mo-color-green); --mo-switch-unselected-color: var(--mo-color-red)'></mo-switch>
	`,
}