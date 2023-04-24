import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import { Currency as LCurrency } from '@3mo/localization'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Input/Field/Currency',
	component: 'mo-field-currency',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Currency = story({
	render: () => html`<mo-field-currency label='Currency'></mo-field-currency>`
})

export const Required = story({
	render: () => html`<mo-field-currency required label='Currency'></mo-field-currency>`
})

export const Disabled = story({
	render: () => html`<mo-field-currency disabled label='Currency'></mo-field-currency>`
})

export const Readonly = story({
	render: () => html`<mo-field-currency readonly label='Currency'></mo-field-currency>`
})

export const CurrencySign = story({
	render: () => html`<mo-field-currency label='Currency' .currency=${LCurrency.USD}></mo-field-currency>`
})

export const CurrencySymbol = story({
	render: () => html`<mo-field-currency label='Currency' currencySymbol='₿'></mo-field-currency>`
})

export const Dense = story({
	render: () => html`<mo-field-currency dense label='Currency'></mo-field-currency>`
})