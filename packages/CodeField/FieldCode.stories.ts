import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Selection & Input / Code Field',
	component: 'mo-field-code',
	args: {
		label: 'Verification code',
		length: 6,
		type: 'numeric',
		required: false,
		disabled: false,
		readonly: false,
	},
	argTypes: {
		type: {
			control: 'select',
			options: ['numeric', 'alphanumeric', 'alphabetic'],
		},
	},
	package: p,
} as Meta

export const FieldCode: StoryObj = {
	render: ({ label, length, type, required, disabled, readonly }) => html`
		<mo-field-code
			label=${label}
			length=${length}
			type=${type}
			?required=${required}
			?disabled=${disabled}
			?readonly=${readonly}
		></mo-field-code>
	`
}

/** A longer code of letters and digits, grouped by a separator so that it can be read back aloud. */
export const Grouped: StoryObj = {
	render: () => html`
		<mo-field-code label='Recovery code' length='8' type='alphanumeric' separator='–' .separators=${[3]}></mo-field-code>
	`
}

/**
 * A PIN is not a one-time code: it is masked, and no phone or password manager should offer to fill
 * it, so `autoComplete` is turned off.
 */
export const Pin: StoryObj = {
	render: () => html`
		<mo-field-code label='PIN' length='4' mask='•' autoComplete='off'></mo-field-code>
	`
}

/**
 * `input` follows every character, while `change` waits for the code to settle — which a code of a
 * known length does on its last character, with no need to leave the field.
 */
export const Completion: StoryObj = {
	render: () => html`
		<mo-flex gap='1rem' alignItems='start'>
			<mo-field-code label='Verification code'
				@change=${(e: CustomEvent<string | undefined>) => (e.target as HTMLElement).nextElementSibling!.textContent = `Changed: ${e.detail}`}
			></mo-field-code>
			<span style='color: var(--mo-color-gray)'>Changed: —</span>
		</mo-flex>
	`
}

export const States: StoryObj = {
	render: () => html`
		<mo-flex gap='2rem'>
			<mo-field-code label='Required' required></mo-field-code>
			<mo-field-code label='Read-only' value='123456' readonly></mo-field-code>
			<mo-field-code label='Disabled' value='123456' disabled></mo-field-code>
		</mo-flex>
	`
}