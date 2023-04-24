import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Input/Field/Percent',
	component: 'mo-field-percent',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Percent = story({
	render: () => html`<mo-field-percent label='Percent'></mo-field-percent>`
})

export const Dense = story({
	render: () => html`<mo-field-percent dense label='Percent'></mo-field-percent>`
})

export const Readonly = story({
	render: () => html`<mo-field-percent readonly label='Percent'></mo-field-percent>`
})

export const Required = story({
	render: () => html`<mo-field-percent required label='Percent'></mo-field-percent>`
})

export const Disabled = story({
	render: () => html`<mo-field-percent disabled label='Percent'></mo-field-percent>`
})