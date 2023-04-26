import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'Core/Input/Field/Text',
	component: 'mo-field-text',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
		value: 'Value',
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Text = story({
	render: ({ label, required, disabled, dense, readonly, value }) => html`
		<mo-field-text label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}></mo-field-text>
	`
})

export const MinMaxLength = story({
	render: ({ required, disabled, dense, readonly, value }) => html`
		<mo-field-text label='Label (between 10 and 25 characters)' minLength='10' maxLength='25'
			?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}
		></mo-field-text>
	`
})

export const StartAndEndSlots = story({
	render: ({ required, disabled, dense, readonly, value }) => html`
		<mo-field-text label='Regex' ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}>
			<span slot='start'>/</span>
			<span slot='end'>/gm</span>
		</mo-field-text>
	`
})