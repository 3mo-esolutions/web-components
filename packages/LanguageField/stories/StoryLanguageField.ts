import { component, property } from '@a11d/lit'
import { LanguageField, type Language } from '@3mo/language-field'

/** A language field over the languages an application offers, which a real one would fetch from its API. */
@component('story-language-field')
export class StoryLanguageField extends LanguageField<string, Language> {
	@property({ type: Boolean }) onlyOne = false

	protected fetch() {
		const languages: Array<Language> = [
			{ name: 'English', flagImageSource: 'https://flagsapi.com/GB/flat/64.png' },
			{ name: 'German', flagImageSource: 'https://flagsapi.com/DE/flat/64.png' },
		]
		return Promise.resolve(this.onlyOne ? languages.slice(0, 1) : languages)
	}
}