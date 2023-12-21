import { property, query, state } from '@a11d/lit'
import type { FocusMethod } from '@3mo/focus-controller'
import { FieldComponent } from './FieldComponent.js'

/**
 * @attr selectOnFocus - Selects the input text when the field receives focus.
 * @attr dense - Whether the field is dense
 *
 * @csspart input - The input element.
 */
export abstract class InputFieldComponent<T> extends FieldComponent<T> {
	@property({ type: Boolean, reflect: true }) selectOnFocus = false
	@property({ type: Boolean }) dense = false

	@state() protected inputStringValue?: string

	@query('[part=input]') readonly inputElement!: HTMLInputElement

	override get isPopulated() {
		return !!this.inputStringValue
	}

	protected override get isDense() {
		return this.dense
	}

	protected override valueUpdated() {
		this.inputStringValue = this.valueToInputValue(this.value)
		super.valueUpdated()
	}

	protected override handleInput(value?: T, e?: Event) {
		this.inputStringValue = this.inputElement.value
		super.handleInput(value, e)
	}

	protected override handleChange(value?: T, event?: Event) {
		super.handleChange(value, event)
		this.inputStringValue = this.valueToInputValue(value)
	}

	protected abstract valueToInputValue(value?: T): string | undefined

	protected override handleFocus(bubbled: boolean, method: FocusMethod) {
		super.handleFocus(bubbled, method)
		if (this.selectOnFocus) {
			this.select()
		}
	}

	override async focus() {
		await this.updateComplete
		this.inputElement.focus()
	}

	override async blur() {
		await this.updateComplete
		this.inputElement.blur()
	}

	async select() {
		await this.updateComplete
		this.inputElement.select()
	}

	setSelectionRange(...args: Parameters<HTMLInputElement['setSelectionRange']>) {
		this.inputElement.setSelectionRange(...args)
	}

	setRangeText(...args: Parameters<HTMLInputElement['setRangeText']>) {
		this.inputElement.setRangeText(...args)
	}

	override setCustomValidity(error: string) {
		this.inputElement.setCustomValidity(error)
	}

	override async checkValidity() {
		await this.updateComplete
		return this.inputElement.checkValidity()
	}

	override reportValidity() {
		this.inputElement.reportValidity()
	}
}