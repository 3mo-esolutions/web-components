import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Option } from './Option.js'

describe('Option', () => {
	const fixture = new ComponentTestFixture(() => new Option())

	it('should not toggle when clicked in single mode', async () => {
		expect(fixture.component.selected).toBe(false)

		fixture.component.dispatchEvent(new MouseEvent('click'))
		await fixture.component.updateComplete
		expect(fixture.component.selected).toBe(true)

		fixture.component.dispatchEvent(new MouseEvent('click'))
		await fixture.component.updateComplete
		expect(fixture.component.selected).toBe(true)
	})

	it('should toggle when clicked in multiple mode', () => {
		fixture.component.multiple = true
		expect(fixture.component.selected).toBe(false)

		fixture.component.dispatchEvent(new MouseEvent('click'))
		expect(fixture.component.selected).toBe(true)

		fixture.component.dispatchEvent(new MouseEvent('click'))
		expect(fixture.component.selected).toBe(false)
	})

	it('should dispatch change when clicked', () => {
		const changeSpy = vi.fn()
		fixture.component.change.subscribe(changeSpy)

		fixture.component.dispatchEvent(new MouseEvent('click'))

		expect(changeSpy).toHaveBeenCalledExactlyOnceWith(true)
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
			expect(fixture.component.textMatches('extcon')).toBe(true)
			expect(fixture.component.textMatches('content')).toBe(true)
			expect(fixture.component.textMatches('tag')).toBe(true)
		})

		it('should match against inputText as well when set', () => {
			fixture.component.inputText = 'Text Content'
			expect(fixture.component.textMatches('extcon')).toBe(true)
			expect(fixture.component.textMatches('content')).toBe(true)
			expect(fixture.component.textMatches('tag')).toBe(true)
		})
	})

	describe('valueMatches', () => {
		it('should match a numeric string value against its number form', () => {
			fixture.component.value = '42'

			expect(fixture.component.valueMatches(42)).toBe(true)
			expect(fixture.component.valueMatches('42')).toBe(true)
			expect(fixture.component.valueMatches(24)).toBe(false)
		})

		it('should compare non-numeric values verbatim', () => {
			fixture.component.value = 'abc'

			expect(fixture.component.valueMatches('abc')).toBe(true)
			expect(fixture.component.valueMatches('ABC')).toBe(false)
			expect(fixture.component.valueMatches(undefined)).toBe(false)
		})
	})

	describe('dataMatches', () => {
		it('should match structurally equal data instances', () => {
			fixture.component.data = { id: 1, name: 'John' }

			expect(fixture.component.dataMatches({ id: 1, name: 'John' })).toBe(true)
			expect(fixture.component.dataMatches({ id: 1, name: 'Jane' })).toBe(false)
			expect(fixture.component.dataMatches(undefined)).toBe(false)
		})
	})
})