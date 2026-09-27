import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, ifDefined } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import type { Language, LanguageFieldTemplateParameter } from './index.js'
import storyLanguageFieldSource from './stories/StoryLanguageField.ts?raw'
import './stories/StoryLanguageField.js'

export default {
	title: 'Inputs / Language Field',
	decorators: [story => html`<div style='max-width: 400px'>${story()}</div>`],
} satisfies Meta

type Story = StoryObj

/** A `LanguageField` subclass fetches the languages; `fieldTemplate` renders the field for the selected one. The launch button edits all of them in a dialog. */
export const Default: Story = {
	parameters: sourceOf(storyLanguageFieldSource),
	render: () => html`
		<story-language-field label='Product name'
			.fieldTemplate=${({ value, handleChange, label, language }: LanguageFieldTemplateParameter<string>) => html`
				<mo-field-text label=${`${label} (${language.name})`} value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text>
			`}
		></story-language-field>
	`,
}

/** `mode='overlay'` lays the language selector over the field's top corner, which suits a text area. */
export const Overlay: Story = {
	render: () => html`
		<story-language-field label='Description' mode='overlay'
			.fieldTemplate=${({ value, handleChange, label, language }: LanguageFieldTemplateParameter<string>) => html`
				<mo-field-text-area label=${`${label} (${language.name})`} value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text-area>
			`}
		></story-language-field>
	`,
}

/** `dense` makes the language selector dense, to match a dense field. */
export const Dense: Story = {
	render: () => html`
		<story-language-field label='Product name' mode='overlay' dense
			.fieldTemplate=${({ value, handleChange, label, language }: LanguageFieldTemplateParameter<string>) => html`
				<mo-field-text dense label=${`${label} (${language.name})`} value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text>
			`}
		></story-language-field>
	`,
}

/** `optionTemplate` renders each language in the selector. */
export const OptionTemplate: Story = {
	render: () => html`
		<story-language-field label='Product name'
			.fieldTemplate=${({ value, handleChange, label, language }: LanguageFieldTemplateParameter<string>) => html`
				<mo-field-text label=${`${label} (${language.name})`} value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text>
			`}
			.optionTemplate=${(language: Language) => html`
				[${language.id}] ${language.name.toUpperCase()}
				<img src=${ifDefined(language.flagImageSource)} style='width: 30px'>
			`}
		></story-language-field>
	`,
}

/** With a single language there is nothing to choose, so the field is rendered alone. */
export const SingleLanguage: Story = {
	render: () => html`
		<story-language-field onlyOne label='Product name'
			.fieldTemplate=${({ value, handleChange, label, language }: LanguageFieldTemplateParameter<string>) => html`
				<mo-field-text label=${`${label} (${language.name})`} value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text>
			`}
		></story-language-field>
	`,
}