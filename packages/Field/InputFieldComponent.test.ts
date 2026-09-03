import { type HTMLTemplateResult, html, live } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { InputFieldComponent } from './InputFieldComponent.js'
import { type FieldComponent } from './FieldComponent.js'

class TestInputFieldComponent extends InputFieldComponent<string> {
	protected valueToInputValue(value?: string) {
		return value ? `formatted:${value}` : ''
	}

	protected get inputTemplate(): HTMLTemplateResult {
		return html`
			<input
				part='input'
				.value=${live(this.inputStringValue || '')}
				@input=${(e: Event) => this.handleInput((e.target as HTMLInputElement).value, e)}
				@change=${(e: Event) => this.handleChange((e.target as HTMLInputElement).value, e)}
			>
		`
	}
}

customElements.define('test-input-field-component', TestInputFieldComponent)

describe('InputFieldComponent', () => {
	const fixture = new ComponentTestFixture<TestInputFieldComponent>(html`
		<test-input-field-component></test-input-field-component>
	`)

	it('should expose the element with part="input" as inputElement', () => {
		expect(fixture.component.inputElement).toBeInstanceOf(HTMLInputElement)
		expect(fixture.component.inputElement.getAttribute('part')).toBe('input')
	})

	describe('populated state', () => {
		it('should mark the inner mo-field populated while the input holds text, even before the value is committed', async () => {
			fixture.component.inputElement.value = 'hello'
			fixture.component.inputElement.dispatchEvent(new Event('input', { bubbles: true }))
			await fixture.updateComplete

			expect(fixture.component.isPopulated).toBeTrue()
		})

		it('should not mark the inner mo-field populated for an empty input string', async () => {
			fixture.component.inputElement.value = ''
			fixture.component.inputElement.dispatchEvent(new Event('input', { bubbles: true }))
			await fixture.updateComplete

			expect(fixture.component.isPopulated).toBeFalse()
		})
	})

	describe('dense', () => {
		it('should tunnel dense to the inner mo-field', async () => {
			fixture.component.dense = true
			await fixture.updateComplete
			expect((fixture.component as any).isDense).toBeTrue()
		})
	})

	describe('selectOnFocus', () => {
		it('should not select the input\'s content on focus by default', () => {
			spyOn(fixture.component, 'select')
			fixture.component.selectOnFocus = false
			fixture.component.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
			expect(fixture.component.select).not.toHaveBeenCalled()
		})

		it('should select the input\'s whole content on focus when enabled', () => {
			spyOn(fixture.component, 'select')
			fixture.component.selectOnFocus = true
			fixture.component.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
			expect(fixture.component.select).toHaveBeenCalled()
		})
	})

	describe('focus and selection methods', () => {
		it('should focus the underlying input via focus()', async () => {
			spyOn(fixture.component.inputElement, 'focus')
			await fixture.component.focus()
			expect(fixture.component.inputElement.focus).toHaveBeenCalled()
		})

		it('should blur the underlying input via blur()', async () => {
			spyOn(fixture.component.inputElement, 'blur')
			await fixture.component.blur()
			expect(fixture.component.inputElement.blur).toHaveBeenCalled()
		})

		it('should select the input\'s text via select()', async () => {
			spyOn(fixture.component.inputElement, 'select')
			await fixture.component.select()
			expect(fixture.component.inputElement.select).toHaveBeenCalled()
		})

		for (const method of ['setSelectionRange', 'setRangeText'] as const) {
			it(`should forward ${method} to the input`, () => {
				spyOn(fixture.component.inputElement, method)
				if (method === 'setSelectionRange') {
					fixture.component.setSelectionRange(0, 5)
					expect(fixture.component.inputElement.setSelectionRange).toHaveBeenCalledWith(0, 5)
				} else {
					fixture.component.setRangeText('abc', 0, 3)
					expect(fixture.component.inputElement.setRangeText).toHaveBeenCalledWith('abc', 0, 3)
				}
			})
		}
	})

	describe('validation', () => {
		it('should report the input\'s native validity via checkValidity', async () => {
			expect(await fixture.component.checkValidity()).toBeTrue()
		})

		it('should fail validation after setCustomValidity with a message and pass again once cleared', async () => {
			fixture.component.setCustomValidity('Invalid value')
			expect(await fixture.component.checkValidity()).toBeFalse()

			fixture.component.setCustomValidity('')
			expect(await fixture.component.checkValidity()).toBeTrue()
		})
	})

	describe('input string synchronization', () => {
		it('should reformat the displayed string via valueToInputValue on change, but leave it untouched while typing', async () => {
			fixture.component.inputElement.value = 'test'
			fixture.component.inputElement.dispatchEvent(new Event('input', { bubbles: true }))
			await fixture.updateComplete
			expect(fixture.component.inputElement.value).toBe('test')

			fixture.component.inputElement.dispatchEvent(new Event('change', { bubbles: true }))
			await fixture.updateComplete
			expect(fixture.component.inputElement.value).toBe('formatted:test')
		})
	})
})

type KeyProperty = { key: string, fieldKey?: undefined, inputKey?: undefined } | { key?: undefined, fieldKey: string, inputKey: string }
type ValueProperty = { value: any, inputValue?: undefined, fieldValue?: undefined } | { value?: undefined, inputValue: string, fieldValue: any }

export const expectFieldPropertyTunnelsToInput = async (fixture: ComponentTestFixture<any>, parameters: KeyProperty & ValueProperty) => {
	const { key, fieldKey, inputKey, value, fieldValue, inputValue } = parameters
	expect(fixture.component.inputElement[inputKey ?? key as string]).toBeFalsy()

	fixture.component[fieldKey ?? key as string] = fieldValue ?? value
	await fixture.updateComplete

	expect(fixture.component.inputElement[inputKey ?? key as string]).toBe(inputValue ?? value)
}

export const expectInputEventTunnelsToField = (fixture: ComponentTestFixture<any>, event: string, inputValue: any, value = inputValue) => {
	const dispatch = jasmine.createSpy('dispatch')
	fixture.component.addEventListener(event, (e: CustomEvent<any>) => dispatch(e.detail))

	fixture.component.inputElement.value = inputValue
	fixture.component.inputElement.dispatchEvent(new Event(event))

	expect(dispatch).toHaveBeenCalledOnceWith(value)
}

export async function expectSlotRendersOnlyWithAssignedContent(fixture: ComponentTestFixture<FieldComponent<unknown>>, slotName: string) {
	expect(fixture.component.renderRoot.querySelector(`slot[name="${slotName}"]`)).toBeNull()

	const slot = document.createElement('div')
	slot.slot = slotName
	fixture.component.append(slot)
	await fixture.update()

	expect(fixture.component.renderRoot.querySelector(`slot[name="${slotName}"]`)).not.toBeNull()
	slot.remove()
}