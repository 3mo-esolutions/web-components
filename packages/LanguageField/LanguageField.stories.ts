import { story, meta } from '../../.storybook/story.js'
import { html, ifDefined } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { Language as LanguageBase, LanguageField as LanguageFieldBase } from './index.js'

export default meta({
	title: 'Language Field',
	component: 'mo-language-field',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

interface Language extends LanguageBase { }

class StoryLanguageField extends LanguageFieldBase<string, Language> {
	protected fetch(): Promise<Language[]> {
		return Promise.resolve([
			{ id: 1, name: 'English', flagImageSource: 'https://flagsapi.com/GB/flat/64.png' },
			{ id: 2, name: 'German', flagImageSource: 'https://flagsapi.com/DE/flat/64.png' },
		])
	}
}

customElements.define('story-language-field', StoryLanguageField)

export const ModeAttach = story({
	render: () => html`
		<story-language-field label='Label'
			.fieldTemplate=${(value: string, handleChange: (value: string) => void, label: string, language: Language) => html`
				<mo-field-text
					label=${`${label} (${language.name})`}
					value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text>
			`}
		></story-language-field>
	`
})


export const OptionTemplate = story({
	render: () => html`
		<story-language-field label='Label'
			.fieldTemplate=${(value: string, handleChange: (value: string) => void, label: string, language: Language) => html`
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
})

export const DenseField = story({
	render: () => html`
		<story-language-field label='Label' mode='overlay' dense
			.fieldTemplate=${(value: string, handleChange: (value: string) => void, label: string, language: Language) => html`
				<mo-field-text dense
					label=${`${label} (${language.name})`}
					value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text>
			`}
		></story-language-field>
	`
})

export const ModeOverlay = story({
	render: () => html`
		<story-language-field label='Label' mode='overlay'
			.fieldTemplate=${(value: string, handleChange: (value: string) => void, label: string, language: Language) => html`
				<mo-field-text-area
					label=${`${label} (${language.name})`}
					value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text-area>
			`}
		></story-language-field>
	`
})