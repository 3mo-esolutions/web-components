import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { Currency as LCurrency } from '@3mo/localization'
import p from './package.json'
import './index.js'

export default {
	title: 'Selection & Input / Number Fields / Field Currency',
	component: 'mo-field-currency',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
		value: 11.22,
	},
	package: p,
} as Meta

export const Currency: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, value }) => html`
		<mo-field-currency currency='EUR' label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}></mo-field-currency>
	`
}

export const WithAnotherCurrency: StoryObj = {
	render: () => html`<mo-field-currency label='Currency' .currency=${LCurrency.GBP}></mo-field-currency>`
}

export const WithoutCurrency: StoryObj = {
	render: () => html`<mo-field-currency label='Currency' .currency=${undefined}></mo-field-currency>`
}