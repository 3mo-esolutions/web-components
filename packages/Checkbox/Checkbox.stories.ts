import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly label: string
	readonly selected: boolean
	readonly disabled: boolean
}

export default {
	title: 'Inputs / Checkbox',
	component: 'mo-checkbox',
	args: {
		label: 'Remember me',
		selected: false,
		disabled: false,
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; align-items: flex-start; gap: 12px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ label, selected, disabled }) => html`<mo-checkbox label=${label} ?selected=${selected} ?disabled=${disabled}></mo-checkbox>`,
}

/** `selected` is `true`, `false` or `'indeterminate'`, which shows a dash for a partial selection. */
export const States: Story = {
	render: () => html`
		<mo-checkbox label='Unselected'></mo-checkbox>
		<mo-checkbox label='Selected' selected></mo-checkbox>
		<mo-checkbox label='Indeterminate' selected='indeterminate'></mo-checkbox>
		<mo-checkbox label='Disabled' disabled></mo-checkbox>
		<mo-checkbox label='Disabled and selected' selected disabled></mo-checkbox>
	`,
}

/** Without a `label` only the box is rendered, for tables and toolbars. */
export const WithoutLabel: Story = {
	render: () => html`<mo-checkbox selected></mo-checkbox>`,
}

/** A long label wraps, and the box stays aligned with its first line. */
export const LongLabel: Story = {
	render: ({ selected, disabled }) => html`
		<mo-checkbox style='max-width: 400px' ?selected=${selected} ?disabled=${disabled}
			label='I agree that my data is processed to handle my request and stored for as long as the law requires'
		></mo-checkbox>
	`,
}

/** `--mo-checkbox-accent-color` colors the selected box, `--mo-checkbox-disabled-color` a disabled one. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-checkbox label='Accent' selected style='--mo-checkbox-accent-color: var(--mo-color-red)'></mo-checkbox>
		<mo-checkbox label='Disabled' selected disabled style='--mo-checkbox-disabled-color: var(--mo-color-red)'></mo-checkbox>
	`,
}