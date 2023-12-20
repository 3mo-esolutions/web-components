import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import { Currency as LCurrency } from '@3mo/localization'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Field Currency',
	component: 'mo-field-currency',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
		value: 'test@3mo.de',
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Currency = story({
	render: ({ label, required, disabled, dense, readonly, value }) => html`
		<mo-field-currency currency='EUR' label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}></mo-field-currency>
	`
})

export const WithAnotherCurrency = story({
	render: () => html`<mo-field-currency label='Currency' .currency=${LCurrency.GBP}></mo-field-currency>`
})

export const WithoutCurrency = story({
	render: () => html`<mo-field-currency label='Currency' .currency=${undefined}></mo-field-currency>`
})