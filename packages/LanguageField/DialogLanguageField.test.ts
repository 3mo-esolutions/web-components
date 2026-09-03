import { component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Dialog, DialogSize } from '@3mo/dialog'
import { LanguageField, type LanguageFieldTemplateParameter } from './LanguageField.js'
import { DialogLanguageField } from './DialogLanguageField.js'
import { type Language } from './Language.js'
import './index.js'

type TestLanguage = Language & { readonly id: number, readonly name: string }

const english: TestLanguage = { id: 1, name: 'English' }
const german: TestLanguage = { id: 2, name: 'German' }

@component('test-dialog-language-field')
class TestLanguageField extends LanguageField<string, TestLanguage> {
	protected override fetch() {
		return Promise.resolve([english, german])
	}

	override get languages() {
		return [english, german]
	}
}

describe('DialogLanguageField', () => {
	let languageField: TestLanguageField

	const fixture = new ComponentTestFixture<DialogLanguageField<string, TestLanguage>>(() => {
		languageField = new TestLanguageField()
		languageField.label = 'Multilingual Field'
		languageField.dialogSize = DialogSize.Large
		languageField.value.set(german.id, 'Hallo')
		languageField.fieldTemplate = ({ language, value }: LanguageFieldTemplateParameter<string, TestLanguage>) => html`
			<input data-language=${language.name} .value=${value ?? ''}>
		`
		return new DialogLanguageField({ languageField })
	})

	const inputs = () => [...fixture.component.renderRoot.querySelectorAll('input')]
	const dialog = () => fixture.component.dialogElement as unknown as Dialog

	it('should use the language field\'s label as its heading', () => {
		expect(String(dialog().heading)).toBe('Multilingual Field')
	})

	it('should render one field per language via the language field\'s fieldTemplate', () => {
		expect(inputs().map(input => input.dataset.language)).toEqual(['English', 'German'])
		expect(inputs().map(input => input.value)).toEqual(['', 'Hallo'])
	})

	it('should pass the language field\'s dialogSize through to the dialog', () => {
		expect(dialog().size).toBe(DialogSize.Large)
	})
})