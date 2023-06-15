import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
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

class TestLanguageField extends LanguageFieldBase<string, Language> {
	protected fetch(): Promise<Language[]> {
		return Promise.resolve([
			{ id: 1, name: 'English', flagImageSource: 'https://flagsapi.com/GB/flat/64.png' },
			{ id: 2, name: 'German', flagImageSource: 'https://flagsapi.com/DE/flat/64.png' },
		])
	}

}

customElements.define('test-language-field', TestLanguageField)

export const ModeAttach = story({
	render: () => html`
		<test-language-field label='Label'
			.fieldTemplate=${(value: string, handleChange: (value: string) => void, label: string, language: Language) => html`
				<mo-field-text
					label=${`${label} (${language.name})`}
					value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text>
			`}
		></test-language-field>
	`
})

export const ModeOverlay = story({
	render: () => html`
		<test-language-field label='Label' mode='overlay'
			.fieldTemplate=${(value: string, handleChange: (value: string) => void, label: string, language: Language) => html`
				<mo-field-text-area
					label=${`${label} (${language.name})`}
					value=${value}
					@change=${(e: CustomEvent<string>) => handleChange(e.detail)}
				></mo-field-text-area>
			`}
		></test-language-field>
	`
})