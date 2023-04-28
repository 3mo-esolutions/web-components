import { html, property, event, nothing, Component, HTMLTemplateResult, state } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { FocusController } from '@3mo/focus-controller'

/**
 * @attr value - The field's value
 * @attr label - The field's label
 * @attr readonly - Whether the field is readonly
 * @attr disabled - Whether the field is disabled
 * @attr required - Whether the field is required
 *
 * @slot - The field's content
 * @slot start - Content to be placed at the start of the field
 * @slot end - Content to be placed at the end of the field
 *
 * @fires change
 * @fires input
 * @fires validityChange
 */
export abstract class FieldComponent<T> extends Component {
	@event() readonly change!: EventDispatcher<T | undefined>
	@event() readonly input!: EventDispatcher<T | undefined>
	@event() readonly validityChange!: EventDispatcher<boolean>

	@property({ type: Object }) abstract value?: T | undefined
	@property() label = ''
	@property({ type: Boolean }) readonly = false
	@property({ type: Boolean }) disabled = false
	@property({ type: Boolean }) required = false
	@property({ type: Boolean }) protected invalid = false

	@state() private focused = false
	@state() protected inputValue?: T

	protected readonly slotController = new SlotController(this)
	protected readonly focusController = new FocusController(this, {
		handleChange: focused => {
			this.focused = focused
			focused ? this.handleFocus() : this.handleBlur()
		}
	})

	protected override firstUpdated() {
		this.validate()
	}

	protected handleFocus() { }

	protected handleBlur() { }

	protected handleInput(value: T | undefined, e?: Event) {
		e?.stopPropagation()
		this.inputValue = value
		this.input.dispatch(this.inputValue)
		this.validate()
	}

	protected handleChange(value: T | undefined, e?: Event) {
		e?.stopPropagation()
		this.handleInput(value)
		this.value = value
		this.change.dispatch(this.value)
	}

	protected get isPopulated() {
		return this.inputValue !== undefined
	}

	protected get isActive() {
		return this.isPopulated || this.focused
	}

	protected get isDense() {
		return false
	}

	protected override get template() {
		return html`
			<mo-field label=${this.label}
				?populated=${this.isPopulated}
				?disabled=${this.disabled}
				?readonly=${this.readonly}
				?required=${this.required}
				?dense=${this.isDense}
				?invalid=${this.invalid}
				?active=${this.isActive}
			>
				${this.startSlotTemplate}
				${this.inputTemplate}
				${this.endSlotTemplate}
			</mo-field>
		`
	}

	protected get startSlotTemplate() {
		return !this.slotController.hasAssignedElements('start') ? nothing : html`
			<slot slot='start' name='start'></slot>
		`
	}

	protected abstract get inputTemplate(): HTMLTemplateResult

	protected get endSlotTemplate() {
		return !this.slotController.hasAssignedElements('end') ? nothing : html`
			<slot slot='end' name='end'></slot>
		`
	}

	protected async validate() {
		const validity = await this.checkValidity()
		this.invalid = !validity
		this.validityChange.dispatch(validity)
	}

	abstract setCustomValidity(...args: Parameters<HTMLInputElement['setCustomValidity']>): ReturnType<HTMLInputElement['setCustomValidity']>
	abstract checkValidity(): Promise<boolean>
	abstract reportValidity(): void
}