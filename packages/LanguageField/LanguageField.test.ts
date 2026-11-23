import { component, html, type HTMLTemplateResult } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { LanguageField, type LanguageFieldTemplateParameter } from './LanguageField.js'
import { DialogLanguageField } from './DialogLanguageField.js'
import { type Language } from './Language.js'
import './index.js'
import '@3mo/text-fields'
import { FieldPairMode } from '@3mo/field-pair'

type TestLanguage = Language & { readonly id: number, readonly name: string }

const english: TestLanguage = { id: 1, name: 'English' }
const german: TestLanguage = { id: 2, name: 'German' }

@component('test-language-field')
class TestLanguageField extends LanguageField<string, TestLanguage> {
	languagesToFetch = new Array<TestLanguage>()

	protected override fetch() {
		return Promise.resolve(this.languagesToFetch)
	}
}

describe('LanguageField', () => {
	function createTest(languages: Array<TestLanguage>, selectedLanguage?: TestLanguage) {
		const fieldTemplateCalls = new Array<LanguageFieldTemplateParameter<string, TestLanguage>>()
		const languagesFetch = vi.fn()
		const languageChange = vi.fn()
		const change = vi.fn()

		const fieldTemplate = (parameters: LanguageFieldTemplateParameter<string, TestLanguage>): HTMLTemplateResult => {
			fieldTemplateCalls.push(parameters)
			return html`
				<input .value=${parameters.value ?? ''}
					@change=${(e: Event) => parameters.handleChange((e.target as HTMLInputElement).value)}
				>
			`
		}

		const fixture = new ComponentTestFixture<TestLanguageField>(() => {
			fieldTemplateCalls.length = 0
			languagesFetch.mockClear()
			languageChange.mockClear()
			change.mockClear()

			const component = new TestLanguageField()
			component.languagesToFetch = languages
			component.label = 'Multilingual Field'
			component.fieldTemplate = fieldTemplate
			component.selectedLanguage = selectedLanguage
			component.addEventListener('languagesFetch', (e: Event) => languagesFetch((e as CustomEvent).detail))
			component.addEventListener('languageChange', (e: Event) => languageChange((e as CustomEvent).detail))
			component.addEventListener('change', (e: Event) => change((e as CustomEvent).detail))
			return component
		})

		beforeEach(async () => {
			await new Promise<void>(resolve => setTimeout(resolve))
			await fixture.updateComplete
		})

		return {
			fixture,
			fieldTemplateCalls,
			languagesFetch,
			languageChange,
			change,
			get component() { return fixture.component },
			get lastFieldTemplateCall() { return fieldTemplateCalls[fieldTemplateCalls.length - 1]! },
			query<T extends Element>(selector: string) { return fixture.component.renderRoot.querySelector<T>(selector) },
		}
	}

	const multilingual = createTest([english, german])

	describe('language fetching', () => {
		const preselected = createTest([english, german], german)

		it('should fetch languages on first render and dispatch languagesFetch with them', () => {
			expect(multilingual.component.languages).toEqual([english, german])
			expect(multilingual.languagesFetch).toHaveBeenCalledExactlyOnceWith([english, german])
		})

		it('should select the first language and dispatch languageChange when none is preselected', () => {
			expect(multilingual.component.selectedLanguage).toBe(english)
			expect(multilingual.languageChange).toHaveBeenCalledWith(english)
		})

		it('should keep a preset selectedLanguage instead of auto-selecting', () => {
			expect(preselected.component.selectedLanguage).toBe(german)
			expect(preselected.languageChange).not.toHaveBeenCalledWith(english)
		})

		it('should default defaultLanguage to the first fetched language', () => {
			expect(multilingual.component.defaultLanguage).toBe(english)
		})
	})

	describe('rendering', () => {
		const empty = createTest([])
		const single = createTest([english])

		it('should render nothing until a language is selected', () => {
			expect(empty.component.selectedLanguage).toBeUndefined()
			expect(empty.query('mo-field-pair')).toBeNull()
			expect(empty.query('input')).toBeNull()
		})

		it('should render the field alone with the "single" attribute when only one language exists', () => {
			expect(single.component.hasAttribute('single')).toBe(true)
			expect(single.query('mo-field-pair')).toBeNull()
			expect(single.query('input')).not.toBeNull()
		})

		it('should render the field and the language selector inside a mo-field-pair when multiple languages exist', () => {
			const fieldPair = multilingual.query('mo-field-pair')!

			expect(multilingual.component.hasAttribute('single')).toBe(false)
			expect(fieldPair).not.toBeNull()
			expect(fieldPair.querySelector('input')).not.toBeNull()
			expect(fieldPair.querySelector('mo-field-select[slot=attachment]')).not.toBeNull()
		})

		it('should render an option per language, using optionTemplate when provided', async () => {
			const options = () => [...multilingual.component.renderRoot.querySelectorAll('mo-option')]
			expect(options().map(option => option.getAttribute('value'))).toEqual(['1', '2'])

			multilingual.component.optionTemplate = language => html`<span class='custom-option'>${language.name.toUpperCase()}</span>`
			await multilingual.fixture.updateComplete

			expect(options().map(option => option.querySelector('.custom-option')?.textContent)).toEqual(['ENGLISH', 'GERMAN'])
		})

		it('should invoke fieldTemplate with the selected language\'s value, label, language and a working handleChange', () => {
			const parameters = multilingual.lastFieldTemplateCall

			expect(parameters.label).toBe('Multilingual Field')
			expect(parameters.language).toBe(english)
			expect(parameters.value).toBeUndefined()

			parameters.handleChange('Hello')

			expect(multilingual.component.value.get(1)).toBe('Hello')
		})
	})

	describe('layout', () => {
		describe('in a container of definite height', () => {
			const fixture = new ComponentTestFixture<TestLanguageField>(() => {
				const component = new TestLanguageField()
				component.languagesToFetch = [english, german]
				component.mode = FieldPairMode.Overlay
				component.fieldTemplate = () => html`<div style='height: 100%'></div>`
				return component
			})

			const container = document.createElement('div')
			container.style.cssText = 'height: 300px; width: 500px'

			beforeEach(async () => {
				fixture.component.before(container)
				container.append(fixture.component)
				await new Promise<void>(resolve => setTimeout(resolve))
				await fixture.updateComplete
			})

			afterEach(() => container.remove())

			it('should let its field fill the container when the selector overlays it', async () => {
				await vi.waitFor(() => expect(fixture.component.renderRoot.querySelector('mo-field-pair')).not.toBeNull())
				const editor = fixture.component.renderRoot.querySelector('mo-field-pair > div')!

				expect(editor.getBoundingClientRect().height).toBe(300)
			})
		})

		describe('when dense, in a cell taller than the field', () => {
			const fixture = new ComponentTestFixture<TestLanguageField>(() => {
				const component = new TestLanguageField()
				component.languagesToFetch = [english, german]
				component.dense = true
				component.fieldTemplate = () => html`<mo-field-text dense></mo-field-text>`
				return component
			})

			const cell = document.createElement('div')
			cell.style.cssText = 'height: 60px; width: 500px; display: flex; flex-direction: column; justify-content: center'

			beforeEach(async () => {
				fixture.component.before(cell)
				cell.append(fixture.component)
				await new Promise<void>(resolve => setTimeout(resolve))
				await fixture.updateComplete
			})

			afterEach(() => cell.remove())

			const frames = () => {
				const pair = fixture.component.renderRoot.querySelector('mo-field-pair')!
				const field = pair.querySelector('mo-field-text')!.renderRoot.querySelector('mo-field')!
				const selector = pair.querySelector('mo-field-select')!.renderRoot.querySelector('mo-field')!
				return { pair: pair.getBoundingClientRect(), field: field.getBoundingClientRect(), selector: selector.getBoundingClientRect() }
			}

			it('should give the language selector the height of the field', async () => {
				await vi.waitFor(() => expect(frames().selector.height).toBeGreaterThan(0))
				const { field, selector } = frames()
				expect(selector.height).toBe(field.height)
			})

			it('should leave the cell to center the pair rather than stretch it', async () => {
				await vi.waitFor(() => expect(frames().selector.height).toBeGreaterThan(0))
				const { pair, field } = frames()
				const box = cell.getBoundingClientRect()
				expect(pair.height).toBe(field.height)
				expect(Math.abs((pair.top - box.top) - (box.bottom - pair.bottom))).toBeLessThanOrEqual(1)
			})
		})
	})

	describe('value', () => {
		it('should store a field change under the language\'s valueKey and dispatch change with the map', () => {
			multilingual.component.handleFieldChange(english, 'Hello')

			expect(multilingual.component.value.get(1)).toBe('Hello')
			expect(multilingual.change).toHaveBeenCalledExactlyOnceWith(multilingual.component.value)
		})

		it('should honor a custom valueKey', () => {
			multilingual.component.valueKey = 'name'

			multilingual.component.handleFieldChange(english, 'Hello')

			expect(multilingual.component.value.get('English')).toBe('Hello')
			expect(multilingual.component.value.get(1)).toBeUndefined()
		})

		describe('default-language propagation', () => {
			afterEach(() => LanguageField.applyDefaultLanguageBehavior = true)

			it('should propagate the default language\'s value to all languages while no other language has a value', () => {
				multilingual.component.handleFieldChange(english, 'Hello')

				expect(multilingual.component.value.get(1)).toBe('Hello')
				expect(multilingual.component.value.get(2)).toBe('Hello')
			})

			it('should not propagate once another language holds its own value', () => {
				multilingual.component.handleFieldChange(german, 'Hallo')
				multilingual.component.handleFieldChange(english, 'Hello')

				expect(multilingual.component.value.get(1)).toBe('Hello')
				expect(multilingual.component.value.get(2)).toBe('Hallo')
			})

			it('should not propagate when LanguageField.applyDefaultLanguageBehavior is disabled', () => {
				LanguageField.applyDefaultLanguageBehavior = false

				multilingual.component.handleFieldChange(english, 'Hello')

				expect(multilingual.component.value.get(1)).toBe('Hello')
				expect(multilingual.component.value.get(2)).toBeUndefined()
			})
		})
	})

	describe('language switching', () => {
		it('should dispatch languageChange and re-render the field with the newly selected language\'s value when the selector changes', async () => {
			multilingual.component.value.set(german.id, 'Hallo')
			multilingual.fieldTemplateCalls.length = 0

			multilingual.query('mo-field-select')!.dispatchEvent(new CustomEvent('change', { detail: german.id }))
			await multilingual.fixture.updateComplete

			expect(multilingual.languageChange).toHaveBeenCalledWith(german)
			expect(multilingual.component.selectedLanguage).toBe(german)
			expect(multilingual.lastFieldTemplateCall.language).toBe(german)
			expect(multilingual.lastFieldTemplateCall.value).toBe('Hallo')
		})
	})

	describe('dialog', () => {
		const single = createTest([english])

		it('should not render the dialog icon-button when only one language exists', () => {
			expect(single.query('[part=dialog-icon-button]')).toBeNull()
			expect(multilingual.query('[part=dialog-icon-button]')).not.toBeNull()
		})

		it('should open the language-field dialog when the dialog icon-button is clicked', async () => {
			const confirm = vi.spyOn(DialogLanguageField.prototype as any, 'confirm').mockResolvedValue(undefined)

			multilingual.query<HTMLElement>('[part=dialog-icon-button]')!.click()

			expect(confirm).toHaveBeenCalled()
			await multilingual.fixture.updateComplete
		})
	})

	it('should delegate focus() to the rendered field', () => {
		const field = multilingual.component.fieldElement
		expect(field).toBeInstanceOf(HTMLInputElement)
		const focus = vi.spyOn(field, 'focus').mockReturnValue(undefined)

		multilingual.component.focus()

		expect(focus).toHaveBeenCalled()
	})
})
