import { type HTMLTemplateResult, html, live, query } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { FieldComponent } from './FieldComponent.js'
import { type Field } from './Field.js'
import { expectSlotRendersOnlyWithAssignedContent } from './InputFieldComponent.test.js'

export { expectSlotRendersOnlyWithAssignedContent }

class TestFieldComponent extends FieldComponent<string> {
	value: string | undefined = ''

	protected get inputTemplate(): HTMLTemplateResult {
		return html`
			<input
				.value=${live(this.inputValue || '')}
				@input=${(e: CustomEvent<string>) => this.handleInput(e.detail, e)}
				@change=${(e: CustomEvent<string>) => this.handleChange(e.detail, e)}
			>
		`
	}

	@query('input') readonly inputElement!: HTMLInputElement

	setCustomValidity(error: string) {
		this.inputElement.setCustomValidity(error)
	}

	async checkValidity() {
		await this.updateComplete
		return this.inputElement.checkValidity()
	}

	reportValidity() {
		return this.inputElement.reportValidity()
	}
}

customElements.define('test-field-component', TestFieldComponent)

describe('FieldComponent', () => {
	const fixture = new ComponentTestFixture<TestFieldComponent>(html`
		<test-field-component></test-field-component>
	`)

	const field = () => fixture.component.renderRoot.querySelector<Field>('mo-field')!

	const settle = async () => {
		await new Promise(resolve => setTimeout(resolve, 0))
		await fixture.updateComplete
	}

	const eventDetails = <T>(type: string) => {
		const details = new Array<T>()
		fixture.component.addEventListener(type, (e: Event) => details.push((e as CustomEvent<T>).detail))
		return details
	}

	describe('slots', () => {
		it('should render an start slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'start'))
		it('should render an end slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'end'))
	})

	describe('value', () => {
		it('should sync a programmatically assigned value into the input', async () => {
			fixture.component.value = 'Test'
			await fixture.updateComplete

			expect(fixture.component.inputElement.value).toBe('Test')
		})

		it('should not dispatch input or change events on programmatic value assignment', async () => {
			const inputs = eventDetails<string>('input')
			const changes = eventDetails<string>('change')

			fixture.component.value = 'Test'
			await settle()

			expect(inputs).toEqual([])
			expect(changes).toEqual([])
		})
	})

	describe('events', () => {
		it('should dispatch input with the typed value and stop the inner event\'s propagation', () => {
			const inputs = eventDetails<string>('input')
			const propagated = jasmine.createSpy('propagated')
			fixture.component.renderRoot.addEventListener('input', propagated)

			fixture.component.inputElement.dispatchEvent(new CustomEvent('input', { detail: 'Typed', bubbles: true }))

			expect(inputs).toEqual(['Typed'])
			expect(propagated).not.toHaveBeenCalled()
		})

		it('should update value and dispatch change with the committed value', () => {
			const changes = eventDetails<string>('change')

			fixture.component.inputElement.dispatchEvent(new CustomEvent('change', { detail: 'Committed', bubbles: true }))

			expect(fixture.component.value).toBe('Committed')
			expect(changes).toEqual(['Committed'])
		})
	})

	describe('tunneling to the inner mo-field', () => {
		const properties: Array<[property: 'label' | 'disabled' | 'readonly' | 'required', value: string | boolean]> = [
			['label', 'Label'],
			['disabled', true],
			['readonly', true],
			['required', true],
		]

		for (const [property, value] of properties) {
			it(`should tunnel ${property}`, async () => {
				expect(field()[property]).not.toBe(value)

				Object.assign(fixture.component, { [property]: value })
				await fixture.updateComplete

				expect(field()[property]).toBe(value)
			})
		}

		it('should mark the inner mo-field populated while it holds a value', async () => {
			fixture.component.value = undefined
			await fixture.updateComplete
			expect(field().populated).toBeFalse()

			fixture.component.value = 'Test'
			await fixture.updateComplete

			expect(field().populated).toBeTrue()
		})

		it('should mark the inner mo-field active while focused', async () => {
			expect(field().active).toBeFalse()

			fixture.component.dispatchEvent(new FocusEvent('focusin'))
			await fixture.updateComplete
			expect(field().active).toBeTrue()

			fixture.component.dispatchEvent(new FocusEvent('focusout'))
			await fixture.updateComplete

			expect(field().active).toBeFalse()
		})
	})

	describe('validation', () => {
		it('should validate and dispatch validityChange whenever the value changes', async () => {
			await settle()
			const validities = eventDetails<boolean>('validityChange')

			fixture.component.value = 'Test'
			await settle()
			expect(validities).toEqual([true])

			fixture.component.setCustomValidity('Invalid')
			fixture.component.value = 'Other'
			await settle()

			expect(validities).toEqual([true, false])
		})

		it('should reflect a failing validity as the inner mo-field\'s invalid state', async () => {
			expect(field().invalid).toBeFalse()

			fixture.component.setCustomValidity('Invalid')
			fixture.component.value = 'Test'
			await settle()

			expect(field().invalid).toBeTrue()
		})

		it('should account for setCustomValidity in checkValidity', async () => {
			fixture.component.setCustomValidity('Invalid')
			expect(await fixture.component.checkValidity()).toBeFalse()

			fixture.component.setCustomValidity('')

			expect(await fixture.component.checkValidity()).toBeTrue()
		})
	})
})