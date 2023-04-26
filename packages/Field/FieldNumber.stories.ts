import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'Core/Input/Field/Number',
	component: 'mo-field-number',
	args: {
		label: 'Label',
		required: false,
		disabled: false,
		readonly: false,
		value: 0,
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Number = story({
	render: ({ label, required, disabled, readonly, value }) => html`
		<mo-field-number label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} value=${value}></mo-field-number>
	`
})

export const MinMaxStep = story({
	render: () => html`
		<mo-field-number label='Number' step='2' max='50' min='0'>
			<span slot='end'>/50</span>
		</mo-field-number>
	`
})