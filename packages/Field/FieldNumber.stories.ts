import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'Core/Input/Field/Number',
	component: 'mo-field-number',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Number = story({
	render: () => html`<mo-field-number label='Number'></mo-field-number>`
})

export const Dense = story({
	render: () => html`<mo-field-number dense label='Number'></mo-field-number>`
})

export const Required = story({
	render: () => html`<mo-field-number required label='Number'></mo-field-number>`
})

export const Readonly = story({
	render: () => html`<mo-field-number readonly label='Number'></mo-field-number>`
})

export const Disabled = story({
	render: () => html`<mo-field-number disabled label='Number'></mo-field-number>`
})

export const MinMaxStep = story({
	render: () => html`
		<mo-field-number label='Number' step='2' max='50' min='0'>
			<span slot='end'>/50</span>
		</mo-field-number>
	`
})