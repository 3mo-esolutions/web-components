import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Selection & Input / Checkbox',
	component: 'mo-checkbox',
	tags: ['autodocs'],
	args: {
		disabled: false,
		label: 'Label',
		selected: false,
	},
	argTypes: {
		disabled: { control: 'boolean' },
		label: { control: 'text' },
		selected: { control: 'select', options: [true, false, 'indeterminate'] },
	},
	package: p,
} as Meta

export const Checkbox: StoryObj = {
	render: ({ label, disabled, selected }) => html`
		<mo-checkbox
			label=${label}
			?disabled=${disabled}
			.selected=${selected}
		></mo-checkbox>
	`
}

export const WithCustomAccentColor: StoryObj = {
	render: ({ label, disabled, selected }) => html`
		<mo-checkbox style='--mo-checkbox-accent-color: var(--mo-color-red)'
			label=${label}
			?disabled=${disabled}
			.selected=${selected}
		></mo-checkbox>
	`
}

export const WithWrappedLabel: StoryObj = {
	args: {
		label: 'This is a very long label that should wrap to the next line if it is too long to fit in one line',
	},
	render: ({ label, disabled, selected }) => html`
		<mo-flex style='width: 400px; border: 1px dashed var(--mo-color-gray-transparent); padding: 1rem;'>
			<mo-checkbox label=${label} ?disabled=${disabled} .selected=${selected}></mo-checkbox>
			<mo-checkbox label=${label} ?disabled=${disabled} .selected=${selected}></mo-checkbox>
		</mo-flex>
	`
}