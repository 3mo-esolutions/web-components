import type { Meta, StoryObj } from '@storybook/web-components'
import { html, ifDefined, property } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { type Language as LanguageBase, LanguageField as LanguageFieldBase, type LanguageFieldTemplateParameter } from './index.js'

export default {
	title: 'Language Field',
	component: 'mo-language-field',
	package: p,
} as Meta

interface Language extends LanguageBase { }

class StoryLanguageField extends LanguageFieldBase<string, Language> {
	@property({ type: Boolean }) onlyOne = false
	protected fetch(): Promise<Language[]> {
		return Promise.resolve([
			{ id: 1, name: 'English', flagImageSource: 'https://flagsapi.com/GB/flat/64.png' },
			this.onlyOne ? undefined : { id: 2, name: 'German', flagImageSource: 'https://flagsapi.com/DE/flat/64.png' },
		].filter(Boolean) as Language[])
	}
}

customElements.define('story-language-field', StoryLanguageField)

export const ModeAttach: StoryObj = {
	render: () => html`
		<story-language-field label='Label'
			.fieldTemplate=${({ value, handleChange, label, language }: LanguageFieldTemplateParameter<string>) => html`
				<mo-field-text
					label=${`${label} (${language.name})`}
					value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text>
			`}
		></story-language-field>
	`
}


export const OptionTemplate: StoryObj = {
	render: () => html`
		<story-language-field label='Label'
			.fieldTemplate=${({ value, handleChange, label, language }: LanguageFieldTemplateParameter<string>) => html`
				<mo-field-text
					label=${`${label} (${language.name})`}
					value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text>
			`}
			.optionTemplate=${(language: Language) => html`
				[${language.id}]
				${language.name.toUpperCase()}
				<img src=${ifDefined(language.flagImageSource)} style='width: 30px'>
			`}
		></story-language-field>
	`
}

export const DenseField: StoryObj = {
	render: () => html`
		<story-language-field label='Label' mode='overlay' dense
			.fieldTemplate=${({ value, handleChange, label, language }: LanguageFieldTemplateParameter<string>) => html`
				<mo-field-text dense
					label=${`${label} (${language.name})`}
					value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text>
			`}
		></story-language-field>
	`
}

export const ModeOverlay: StoryObj = {
	render: () => html`
		<story-language-field label='Label' mode='overlay'
			.fieldTemplate=${({ value, handleChange, label, language }: LanguageFieldTemplateParameter<string>) => html`
				<mo-field-text-area
					label=${`${label} (${language.name})`}
					value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text-area>
			`}
		></story-language-field>
	`
}

export const WhenOneLanguage: StoryObj = {
	render: () => html`
		<story-language-field onlyOne label='Label' mode='overlay'
			.fieldTemplate=${({ value, handleChange, label, language }: LanguageFieldTemplateParameter<string>) => html`
				<mo-field-text
					label=${`${label} (${language.name})`}
					value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text>
			`}
		></story-language-field>
	`
}