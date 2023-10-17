import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'CheckboxGroup',
	component: 'mo-checkbox-group',
	args: {
		label: 'Label',
		direction: 'vertical',
	},
	argTypes: {
		label: { control: 'text' },
		direction: { control: 'select', options: ['vertical', 'horizontal', 'vertical-reversed', 'horizontal-reversed'] },
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const CheckboxGroup = story({
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
})