import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import type { FieldCodeType } from './FieldCode.js'
import './index.js'

type Args = {
	readonly label: string
	readonly length: number
	readonly type: FieldCodeType
	readonly required: boolean
	readonly disabled: boolean
	readonly readonly: boolean
}

export default {
	title: 'Inputs / Code Field',
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
		type: { control: 'select', options: ['numeric', 'alphanumeric', 'alphabetic'] },
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; align-items: flex-start; gap: 24px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ label, length, type, required, disabled, readonly }) => html`
		<mo-field-code label=${label} length=${length} type=${type} ?required=${required} ?disabled=${disabled} ?readonly=${readonly}></mo-field-code>
	`,
}

/** `type` limits the characters: digits, letters and digits, or letters only. `pattern` takes any regular expression instead. */
export const Types: Story = {
	render: () => html`
		<mo-field-code label='Numeric' type='numeric' length='4'></mo-field-code>
		<mo-field-code label='Alphanumeric' type='alphanumeric' length='4'></mo-field-code>
		<mo-field-code label='Alphabetic' type='alphabetic' length='4'></mo-field-code>
		<mo-field-code label='Hexadecimal' pattern='[0-9a-f]' length='4'></mo-field-code>
	`,
}

/** A separator groups a longer code so that it can be read back aloud; `separators` lists the positions it follows. */
export const Grouped: Story = {
	render: () => html`<mo-field-code label='Recovery code' length='8' type='alphanumeric' separator='–' separators='[3]'></mo-field-code>`,
}

/** A PIN is masked, and `autoComplete='off'` keeps phones and password managers from offering to fill it. */
export const Pin: Story = {
	render: () => html`<mo-field-code label='PIN' length='4' mask='•' autoComplete='off'></mo-field-code>`,
}

/**
 * One real input sits behind the cells, so pasting a code or accepting the one a phone offers fills them all at once.
 * `input` follows every character, while `change` fires the moment the last one lands - watch the Actions panel.
 */
export const Completion: Story = {
	render: () => html`<mo-field-code label='Verification code'></mo-field-code>`,
}

/** Required, read-only and disabled. A required code is valid only once every cell is filled. */
export const States: Story = {
	render: () => html`
		<mo-field-code label='Required' required></mo-field-code>
		<mo-field-code label='Read-only' value='123456' readonly></mo-field-code>
		<mo-field-code label='Disabled' value='123456' disabled></mo-field-code>
	`,
}

/** The cells are sized by `--mo-field-code-cell-width` and `--mo-field-code-cell-height` and spaced by `--mo-field-code-gap`. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-field-code label='Compact' value='1234' length='4' style='--mo-field-code-cell-width: 2rem; --mo-field-code-cell-height: 2.5rem; --mo-field-code-gap: 0.25rem'></mo-field-code>
		<mo-field-code label='Filled' value='1234' length='4' style='--mo-field-background: var(--mo-color-accent-transparent)'></mo-field-code>
	`,
}

/** The `cell`, `separator` and `label` parts can be restyled from outside. */
export const Parts: Story = {
	render: () => html`
		<style>
			.round::part(cell) { border-radius: 50%; }
			.round::part(separator) { color: var(--mo-color-accent); }
		</style>
		<mo-field-code class='round' label='Recovery code' value='AB12' length='6' type='alphanumeric' separator='·' separators='[3]'></mo-field-code>
	`,
}