import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { FieldPairMode } from './index.js'

type Args = {
	readonly mode: FieldPairMode
	readonly reversed: boolean
}

export default {
	title: 'Inputs / Field Pair',
	component: 'mo-field-pair',
	args: {
		mode: FieldPairMode.Attach,
		reversed: false,
	},
	argTypes: {
		mode: { control: 'select', options: Object.values(FieldPairMode) },
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; gap: 16px; max-width: 360px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ mode, reversed }) => html`
		<mo-field-pair mode=${mode} ?reversed=${reversed}>
			<mo-field-number label='Weight' value='12'></mo-field-number>
			<mo-field-select slot='attachment' value='kg'>
				<mo-option value='kg'>kg</mo-option>
				<mo-option value='lb'>lb</mo-option>
			</mo-field-select>
		</mo-field-pair>
	`,
}

/** `reversed` puts the attachment first, like a country code before a phone number. */
export const Reversed: Story = {
	render: () => html`
		<mo-field-pair reversed>
			<mo-field-text label='Phone' value='30 1234567'></mo-field-text>
			<mo-field-select slot='attachment' value='+49'>
				<mo-option value='+49'>+49</mo-option>
				<mo-option value='+43'>+43</mo-option>
				<mo-option value='+41'>+41</mo-option>
			</mo-field-select>
		</mo-field-pair>
	`,
}

/** `mode='overlay'` lays the attachment over the field's top corner instead of beside it, which suits a text area. */
export const Overlay: Story = {
	render: () => html`
		<mo-field-pair mode='overlay'>
			<mo-field-text-area label='Description' value='A chair with four legs.'></mo-field-text-area>
			<mo-field-select slot='attachment' value='en'>
				<mo-option value='en'>English</mo-option>
				<mo-option value='de'>German</mo-option>
			</mo-field-select>
		</mo-field-pair>
	`,
}

/** `--mo-field-pair-attachment-width` sizes the attachment, 100px by default. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-field-pair style='--mo-field-pair-attachment-width: 72px'>
			<mo-field-number label='Discount' value='10'></mo-field-number>
			<mo-field-select slot='attachment' value='percent'>
				<mo-option value='percent'>%</mo-option>
				<mo-option value='amount'>€</mo-option>
			</mo-field-select>
		</mo-field-pair>
	`,
}
