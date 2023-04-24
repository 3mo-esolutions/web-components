import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'Core/Input/Field/Text',
	component: 'mo-field-text',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Text = story({
	render: () => html`<mo-field-text label='Label' value='Text'></mo-field-text>`
})

export const Dense = story({
	render: () => html`<mo-field-text dense label='Label' value='Text'></mo-field-text>`
})

export const Disabled = story({
	render: () => html`<mo-field-text disabled label='Label' value='Text'></mo-field-text>`
})

export const Readonly = story({
	render: () => html`<mo-field-text readonly label='Label' value='Text'></mo-field-text>`
})

export const Required = story({
	render: () => html`<mo-field-text label='Required' required></mo-field-text>`
})

export const MinMaxLength = story({
	render: () => html`<mo-field-text label='Label (between 10 and 25 characters)' required value='Test' minLength='10' maxLength='25'></mo-field-text>`
})

export const StartSlot = story({
	render: () => html`
		<mo-field-text label='Username' value='me'>
			<span slot='start'>@</span>
		</mo-field-text>
	`
})

export const EndSlot = story({
	render: () => html`
		<mo-field-text label='Label' value='Text'>
			<span slot='end'>@email.com</span>
		</mo-field-text>
	`
})