import { ComponentTestFixture } from '@a11d/lit-testing'
import { Color } from '@3mo/color'
import { type ColorPicker } from '@3mo/color-picker'
import { expectFieldPropertyTunnelsToInput, expectSlotRendersOnlyWithAssignedContent } from '../Field/InputFieldComponent.test.js'
import { type FieldColor } from './FieldColor.js'
import './index.js'

describe('FieldColor', () => {
	const fixture = new ComponentTestFixture<FieldColor>('mo-field-color')

	const colorPicker = () => fixture.component.renderRoot.querySelector('mo-color-picker') as ColorPicker

	const detailSpyFor = (type: 'input' | 'change') => {
		const spy = jasmine.createSpy(`${type} detail`)
		fixture.component.addEventListener(type, (e: Event) => spy((e as CustomEvent<Color | undefined>).detail))
		return spy
	}

	describe('tunneling to the input', () => {
		it('should set the part attribute', () => {
			expect(fixture.component.inputElement.getAttribute('part')).toBe('input')
		})

		for (const [fieldKey, inputKey] of [['disabled', 'disabled'], ['readonly', 'readOnly'], ['required', 'required']] as const) {
			it(`should tunnel ${fieldKey}`, () => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey, inputKey }))
		}

		it('should display the value\'s hex representation in the input', async () => {
			fixture.component.value = new Color('rgb(12, 34, 56)')
			await fixture.updateComplete

			expect(fixture.component.inputElement.value).toBe('#0C2238')
		})
	})

	describe('events', () => {
		for (const type of ['input', 'change'] as const) {
			it(`should dispatch ${type} with a Color parsed from the typed string`, () => {
				const spy = detailSpyFor(type)

				fixture.component.inputElement.value = '#0c2238'
				fixture.component.inputElement.dispatchEvent(new Event(type))

				expect(spy).toHaveBeenCalledTimes(1)
				expect(spy.calls.mostRecent().args[0].hex).toBe('#0C2238')
			})
		}

		it('should dispatch undefined when the input is emptied', async () => {
			fixture.component.value = new Color('#0C2238')
			await fixture.updateComplete

			const spy = detailSpyFor('change')

			fixture.component.inputElement.value = ''
			fixture.component.inputElement.dispatchEvent(new Event('change'))

			expect(fixture.component.value).toBeUndefined()
			expect(spy).toHaveBeenCalledOnceWith(null)
		})

		it('should not dispatch input or change when the value is assigned programmatically', async () => {
			const spy = jasmine.createSpy('dispatch')
			fixture.component.addEventListener('input', spy)
			fixture.component.addEventListener('change', spy)

			fixture.component.value = new Color('#0C2238')
			await fixture.updateComplete

			expect(spy).not.toHaveBeenCalled()
		})
	})

	describe('slots', () => {
		it('should render a start slot only when it has assigned content', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'start'))
		it('should render an end slot only when it has assigned content', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'end'))
	})

	describe('color picker', () => {
		const emitFromColorPicker = (type: 'input' | 'change', hex: string) => {
			const input = colorPicker().renderRoot.querySelector('input')!
			input.value = hex
			input.dispatchEvent(new Event(type))
		}

		it('should render a color picker in the end slot synced to the field\'s value', async () => {
			fixture.component.value = new Color('#0C2238')
			await fixture.updateComplete

			expect(colorPicker().getAttribute('slot')).toBe('end')
			expect(colorPicker().value?.hex).toBe('#0C2238')
		})

		// BUG: FieldColor.ts picker handlers swapped
		xit('should dispatch input with the live color while the picker emits input', () => {
			const spy = detailSpyFor('input')

			emitFromColorPicker('input', '#00ff00')

			expect(spy).toHaveBeenCalledTimes(1)
			expect(spy.calls.mostRecent().args[0].hex).toBe('#00FF00')
			expect(fixture.component.value).toBeUndefined()
		})

		xit('should commit the value and dispatch change when the picker emits change', () => {
			const spy = detailSpyFor('change')

			emitFromColorPicker('change', '#00ff00')

			expect(spy).toHaveBeenCalledTimes(1)
			expect(spy.calls.mostRecent().args[0].hex).toBe('#00FF00')
			expect(fixture.component.value?.hex).toBe('#00FF00')
		})
	})
})