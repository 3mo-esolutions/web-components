import { ComponentTestFixture } from '@a11d/lit-testing'
import { associatedEventsByPropertiesKey } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { FieldSearch } from './FieldSearch.js'
import { expectSlotRendersOnlyWithAssignedContent, expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField } from '../Field/InputFieldComponent.test.js'
import './index.js'
import '@3mo/icon'
import '@3mo/icon-button'

describe('FieldSearch', () => {
	const fixture = new ComponentTestFixture<FieldSearch>('mo-field-search')

	const searchIcon = () => fixture.component.renderRoot.querySelector<HTMLElement>('mo-icon[icon=search]')
	const clearButton = () => fixture.component.renderRoot.querySelector<HTMLElement>('mo-icon-button[icon=cancel]')

	const language = Localizer.languages.current
	afterEach(() => Localizer.languages.current = language)

	it('should default its label to the localized "Search"', () => {
		expect(String(fixture.component.label)).toBe(String(t('Search')))

		// The label is captured by the class field initializer, so the language has to be switched before construction.
		Localizer.languages.current = 'de'
		expect(String(document.createElement('mo-field-search').label)).toBe('Suche')
	})

	it('should have "input" instead of "change" as the associated event to the "value" default binding property', () => {
		const associatedEvent = (FieldSearch as any)[associatedEventsByPropertiesKey].get('value')
		expect(associatedEvent).toBe('input')
	})

	describe('tunneling to the input', () => {
		it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
		it('should render its input with inputmode "search"', () => expect(fixture.component.inputElement.getAttribute('inputmode')).toBe('search'))
		it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'disabled' }))
		it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey: 'readonly', inputKey: 'readOnly' }))
		it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'required' }))
		it('should tunnel value', () => expectFieldPropertyTunnelsToInput(fixture, { value: 'Test', key: 'value' }))
	})

	describe('events', () => {
		it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', 'test'))
		it('should proxy change event', () => expectInputEventTunnelsToField(fixture, 'change', 'test'))
	})

	describe('slots', () => {
		it('should render an start slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'start'))
		it('should render an end slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'end'))
	})

	describe('search icon', () => {
		it('should render a search icon in the start slot', () => {
			expect(searchIcon()).not.toBeNull()
			expect(searchIcon()!.getAttribute('slot')).toBe('start')
		})

		it('should focus the input when the search icon is clicked', () => {
			spyOn(fixture.component, 'focus')

			searchIcon()!.click()

			expect(fixture.component.focus).toHaveBeenCalled()
		})
	})

	describe('clearability', () => {
		it('should not render a clear button while empty', () => {
			expect(clearButton()).toBeNull()
		})

		it('should render a clear button once the input holds text', async () => {
			fixture.component.inputElement.value = 'query'
			fixture.component.inputElement.dispatchEvent(new Event('input'))
			await fixture.updateComplete

			expect(clearButton()).not.toBeNull()
		})

		it('should clear the value and dispatch input and change with an empty string when the clear button is clicked', async () => {
			fixture.component.value = 'query'
			await fixture.updateComplete
			const input = jasmine.createSpy('input')
			const change = jasmine.createSpy('change')
			fixture.component.addEventListener('input', (e: Event) => input((e as CustomEvent<string>).detail))
			fixture.component.addEventListener('change', (e: Event) => change((e as CustomEvent<string>).detail))

			clearButton()!.click()
			await fixture.updateComplete

			expect(fixture.component.value).toBe('')
			expect(input).toHaveBeenCalledOnceWith('')
			expect(change).toHaveBeenCalledOnceWith('')
			expect(clearButton()).toBeNull()
		})

		it('should not dispatch events when clearing while the value is already empty', async () => {
			fixture.component.inputElement.value = 'query'
			fixture.component.inputElement.dispatchEvent(new Event('input'))
			await fixture.updateComplete
			expect(fixture.component.value).toBeUndefined()
			const input = jasmine.createSpy('input')
			const change = jasmine.createSpy('change')
			fixture.component.addEventListener('input', input)
			fixture.component.addEventListener('change', change)

			clearButton()!.click()
			await fixture.updateComplete

			expect(input).not.toHaveBeenCalled()
			expect(change).not.toHaveBeenCalled()
		})
	})
})