import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly label: string
	readonly direction: 'vertical' | 'horizontal' | 'vertical-reversed' | 'horizontal-reversed'
}

export default {
	title: 'Inputs / Checkbox Group',
	component: 'mo-checkbox-group',
	args: {
		label: 'Notifications',
		direction: 'vertical',
	},
	argTypes: {
		direction: { control: 'select', options: ['vertical', 'horizontal', 'vertical-reversed', 'horizontal-reversed'] },
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ label, direction }) => html`
		<mo-checkbox-group label=${label} direction=${direction}>
			<mo-checkbox label='Email' selected></mo-checkbox>
			<mo-checkbox label='SMS'></mo-checkbox>
			<mo-checkbox label='Push'></mo-checkbox>
		</mo-checkbox-group>
	`,
}

/** Groups nest: each one reflects its own checkboxes, and selecting a group selects everything inside it. */
export const Nested: Story = {
	render: () => html`
		<mo-checkbox-group label='Permissions'>
			<mo-checkbox label='Read' selected></mo-checkbox>
			<mo-checkbox-group label='Write'>
				<mo-checkbox label='Create' selected></mo-checkbox>
				<mo-checkbox label='Update'></mo-checkbox>
				<mo-checkbox label='Delete'></mo-checkbox>
			</mo-checkbox-group>
			<mo-checkbox label='Share'></mo-checkbox>
		</mo-checkbox-group>
	`,
}

/** `direction='horizontal'` lays the checkboxes out in a row. */
export const Horizontal: Story = {
	render: () => html`
		<mo-checkbox-group label='Weekdays' direction='horizontal'>
			<mo-checkbox label='Mon' selected></mo-checkbox>
			<mo-checkbox label='Tue' selected></mo-checkbox>
			<mo-checkbox label='Wed'></mo-checkbox>
			<mo-checkbox label='Thu'></mo-checkbox>
			<mo-checkbox label='Fri'></mo-checkbox>
		</mo-checkbox-group>
	`,
}

/** `--mo-checkbox-group-nested-margin` sets how far the checkboxes are indented. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-checkbox-group label='Notifications' style='--mo-checkbox-group-nested-margin: 8px'>
			<mo-checkbox label='Email' selected></mo-checkbox>
			<mo-checkbox label='SMS'></mo-checkbox>
		</mo-checkbox-group>
	`,
}