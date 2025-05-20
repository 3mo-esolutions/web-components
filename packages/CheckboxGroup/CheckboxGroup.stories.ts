import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Selection & Input / Checkbox Group',
	component: 'mo-checkbox-group',
	args: {
		label: 'Label',
		direction: 'vertical',
	},
	argTypes: {
		label: { control: 'text' },
		direction: { control: 'select', options: ['vertical', 'horizontal', 'vertical-reversed', 'horizontal-reversed'] },
	},
	package: p,
} as Meta

export const CheckboxGroup: StoryObj = {
	render: ({ label, direction }) => html`
		<mo-checkbox-group label=${label} direction=${direction}>
			<mo-checkbox label='Checkbox 1' selected></mo-checkbox>
			<mo-checkbox-group label='Checkbox 2'>
				<mo-checkbox label='Checkbox 2.1' selected></mo-checkbox>
				<mo-checkbox label='Checkbox 2.2' selected='indeterminate'></mo-checkbox>
				<mo-checkbox label='Checkbox 2.3'></mo-checkbox>
			</mo-checkbox-group>
			<mo-checkbox label='Checkbox 3'></mo-checkbox>
			<mo-checkbox label='Checkbox 4'></mo-checkbox>
		</mo-checkbox-group>
	`
}