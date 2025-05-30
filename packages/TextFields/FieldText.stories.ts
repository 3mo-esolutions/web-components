import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Selection & Input / Text Fields / Field Text',
	component: 'mo-field-text',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
		value: 'Value',
	},
	package: p,
} as Meta

export const FieldText: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, value }) => html`
		<mo-field-text label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}></mo-field-text>
	`
}

export const MinMaxLength: StoryObj = {
	render: ({ required, disabled, dense, readonly, value }) => html`
		<mo-field-text label='Label (between 10 and 25 characters)' minLength='10' maxLength='25'
			?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}
		></mo-field-text>
	`
}

export const StartAndEndSlots: StoryObj = {
	render: ({ required, disabled, dense, readonly, value }) => html`
		<mo-field-text label='Regex' ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}>
			<span slot='start'>/</span>
			<span slot='end'>/gm</span>
		</mo-field-text>
	`
}

export const WithTextAlignEnd: StoryObj = {
	render: ({ required, disabled, dense, readonly, value }) => html`
		<mo-field-text label='Text Align End' ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value} style='text-align: end'>
			<span slot='start' @click=${(e: Event) => setTextAlign(e, 'start')}>⬅️</span>
			<span slot='end' @click=${(e: Event) => setTextAlign(e, 'end')}>➡️</span>
		</mo-field-text>
	`
}

const setTextAlign = (e: Event, textAlign: 'start' | 'end') => {
	const field = (e.target as HTMLElement)!.closest('mo-field-text')!
	field.style.textAlign = textAlign
	field.renderRoot.querySelector('mo-field')?.requestUpdate()
}