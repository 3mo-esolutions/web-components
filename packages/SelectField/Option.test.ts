import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Option } from './Option.js'

describe('Option', () => {
	const fixture = new ComponentTestFixture(() => new Option())

	it('should not toggle when clicked in single mode', async () => {
		expect(fixture.component.selected).toBeFalse()

		fixture.component.dispatchEvent(new MouseEvent('click'))
		await fixture.component.updateComplete
		expect(fixture.component.selected).toBeTrue()

		fixture.component.dispatchEvent(new MouseEvent('click'))
		await fixture.component.updateComplete
		expect(fixture.component.selected).toBeTrue()
	})

	it('should toggle when clicked in multiple mode', () => {
		fixture.component.multiple = true
		expect(fixture.component.selected).toBeFalse()

		fixture.component.dispatchEvent(new MouseEvent('click'))
		expect(fixture.component.selected).toBeTrue()

		fixture.component.dispatchEvent(new MouseEvent('click'))
		expect(fixture.component.selected).toBeFalse()
	})

	it('should dispatch change when clicked', () => {
		const changeSpy = jasmine.createSpy('change')
		fixture.component.change.subscribe(changeSpy)

		fixture.component.dispatchEvent(new MouseEvent('click'))

		expect(changeSpy).toHaveBeenCalledOnceWith(true)
	})

	describe('text', () => {
		const fixture = new ComponentTestFixture<Option<unknown>>(html`<mo-option> Text Content </mo-option>`)

		it('should prefer inputText over the trimmed text content', () => {
			expect(fixture.component.text).toBe('Text Content')

			fixture.component.inputText = 'Input Text'

			expect(fixture.component.text).toBe('Input Text')
		})
	})

	describe('textMatches', () => {
		const fixture = new ComponentTestFixture<Option<unknown>>(html`<mo-option>[Tag] Text Content</mo-option>`)

		it('should match with text content only', () => {
			expect(fixture.component.textMatches('extcon')).toBeTrue()
			expect(fixture.component.textMatches('content')).toBeTrue()
			expect(fixture.component.textMatches('tag')).toBeTrue()
		})

		it('should match against inputText as well when set', () => {
			fixture.component.inputText = 'Text Content'
			expect(fixture.component.textMatches('extcon')).toBeTrue()
			expect(fixture.component.textMatches('content')).toBeTrue()
			expect(fixture.component.textMatches('tag')).toBeTrue()
		})
	})

	describe('valueMatches', () => {
		it('should match a numeric string value against its number form', () => {
			fixture.component.value = '42'

			expect(fixture.component.valueMatches(42)).toBeTrue()
			expect(fixture.component.valueMatches('42')).toBeTrue()
			expect(fixture.component.valueMatches(24)).toBeFalse()
		})

		it('should compare non-numeric values verbatim', () => {
			fixture.component.value = 'abc'

			expect(fixture.component.valueMatches('abc')).toBeTrue()
			expect(fixture.component.valueMatches('ABC')).toBeFalse()
			expect(fixture.component.valueMatches(undefined)).toBeFalse()
		})
	})

	describe('dataMatches', () => {
		it('should match structurally equal data instances', () => {
			fixture.component.data = { id: 1, name: 'John' }

			expect(fixture.component.dataMatches({ id: 1, name: 'John' })).toBeTrue()
			expect(fixture.component.dataMatches({ id: 1, name: 'Jane' })).toBeFalse()
			expect(fixture.component.dataMatches(undefined)).toBeFalse()
		})
	})
})