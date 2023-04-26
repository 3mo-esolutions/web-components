import { PropertyValues, property, query, state } from '@a11d/lit'
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

	protected override update(changedProperties: PropertyValues<this>) {
		if (changedProperties.has('value')) {
			this.inputStringValue = this.valueToInputValue(this.value)
		}
		super.update(changedProperties)
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

	protected override handleFocus() {
		super.handleFocus()
		if (this.selectOnFocus) {
			this.select()
		}
	}

	override blur() {
		this.inputElement.blur()
	}

	override focus() {
		this.inputElement.focus()
	}

	select() {
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

	override checkValidity() {
		return Promise.resolve(this.inputElement.checkValidity())
	}

	override reportValidity() {
		this.inputElement.reportValidity()
	}
}