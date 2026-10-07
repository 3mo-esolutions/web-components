import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import fieldKeywordsSource from './stories/FieldKeywords.ts?raw'
import './stories/FieldKeywords.js'
import './index.js'

type Args = {
	readonly label: string
	readonly populated: boolean
	readonly active: boolean
	readonly invalid: boolean
	readonly dense: boolean
	readonly required: boolean
	readonly disabled: boolean
}

export default {
	title: 'Inputs / Field',
	component: 'mo-field',
	args: {
		label: 'Website',
		populated: true,
		active: false,
		invalid: false,
		dense: false,
		required: false,
		disabled: false,
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; gap: 16px; max-width: 320px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ label, populated, active, invalid, dense, required, disabled }) => html`
		<mo-field label=${label} ?populated=${populated} ?active=${active} ?invalid=${invalid} ?dense=${dense} ?required=${required} ?disabled=${disabled}>
			<input value='3mo.de'>
		</mo-field>
	`,
}

/** The frame draws only what its host tells it: `populated` lifts the label, `active` adds the accent line, `invalid` turns it red and `dense` makes the label a placeholder. */
export const States: Story = {
	render: () => html`
		<mo-field label='Empty'>
			<input>
		</mo-field>
		<mo-field label='Populated' populated>
			<input value='3mo.de'>
		</mo-field>
		<mo-field label='Active' populated active>
			<input value='3mo.de'>
		</mo-field>
		<mo-field label='Invalid' populated invalid>
			<input value='3mo'>
		</mo-field>
		<mo-field label='Required' required>
			<input>
		</mo-field>
		<mo-field label='Dense' dense>
			<input>
		</mo-field>
		<mo-field label='Disabled' populated disabled>
			<input value='3mo.de' disabled>
		</mo-field>
	`,
}

/** `start` and `end` hold icons, units or buttons beside the content. */
export const Slots: Story = {
	render: () => html`
		<mo-field label='Website' populated>
			<mo-icon slot='start' icon='insert_link'></mo-icon>
			<input value='3mo'>
			<span slot='end'>.de</span>
		</mo-field>
	`,
}

/** The default slot takes any control, here a native `<select>`, restyled to match. */
export const CustomContent: Story = {
	render: () => html`
		<mo-field label='Country' populated>
			<select>
				<option>Germany</option>
				<option>Austria</option>
				<option>Switzerland</option>
			</select>
		</mo-field>
	`,
}

/**
 * A field of your own extends `InputFieldComponent`, which renders this frame and brings the value, events, focus and validation.
 * [Forms](?path=/docs/getting-started-forms--overview) shows how to bind it.
 */
export const CustomField: Story = {
	parameters: sourceOf(fieldKeywordsSource),
	render: () => html`<story-field-keywords label='Keywords' .value=${['lit', 'web components']}></story-field-keywords>`,
}

/** `--mo-field-background` replaces the background, and the corner radii follow `--mo-field-border-start-start-radius` and `--mo-field-border-start-end-radius`. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-field label='Transparent' populated style='--mo-field-background: transparent'>
			<input value='3mo.de'>
		</mo-field>
		<mo-field label='Accent' populated style='--mo-field-background: var(--mo-color-accent-transparent)'>
			<input value='3mo.de'>
		</mo-field>
		<mo-field label='Square' populated style='--mo-field-border-start-start-radius: 0; --mo-field-border-start-end-radius: 0'>
			<input value='3mo.de'>
		</mo-field>
	`,
}
