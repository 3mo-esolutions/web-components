import { html, property, event, Component, type HTMLTemplateResult, state, css, type PropertyValues } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { FocusController, type FocusMethod } from '@3mo/focus-controller'

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
	static {
		property({ type: Object, bindingDefault: true })(FieldComponent.prototype, 'value')
	}

	@event() readonly change!: EventDispatcher<T | undefined>
	@event() readonly input!: EventDispatcher<T | undefined>
	@event() readonly validityChange!: EventDispatcher<boolean>

	abstract value?: T | undefined
	@property() label = ''
	@property({ type: Boolean }) readonly = false
	@property({ type: Boolean }) disabled = false
	@property({ type: Boolean }) required = false
	@property({ type: Boolean }) protected invalid = false

	@state() private focused = false
	@state() protected inputValue?: T

	protected readonly slotController = new SlotController(this)
	protected readonly focusController = new FocusController(this, {
		handleChange: (focused, bubbled, method) => {
			this.focused = focused
			focused ? this.handleFocus(bubbled, method) : this.handleBlur(bubbled, method)
		}
	})

	protected override update(changedProperties: PropertyValues<this>) {
		if (changedProperties.has('value')) {
			this.valueUpdated()
		}
		super.update(changedProperties)
	}

	protected valueUpdated() {
		this.inputValue = this.value
		this.validate()
	}

	protected handleFocus(bubbled: boolean, method: FocusMethod) {
		bubbled
		method
	}

	protected handleBlur(bubbled: boolean, method: FocusMethod) {
		bubbled
		method
	}

	protected handleInput(value: T | undefined, e?: Event) {
		e?.stopPropagation()
		this.inputValue = value
		this.input.dispatch(this.inputValue)
		this.validate()
	}

	protected handleChange(value: T | undefined, e?: Event) {
		e?.stopPropagation()
		this.value = value
		this.change.dispatch(this.value)
		this.validate()
	}

	protected get isPopulated() {
		return this.inputValue !== undefined
	}

	protected get isActive() {
		return this.focused
	}

	protected get isDense() {
		return false
	}

	static override get styles() {
		return css`
			:host {
				display: block;
			}

			mo-field {
				width: 100%;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-field id='field' label=${this.label}
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
		return !this.slotController.hasAssignedElements('start') ? html.nothing : html`
			<slot slot='start' name='start'></slot>
		`
	}

	protected abstract get inputTemplate(): HTMLTemplateResult

	protected get endSlotTemplate() {
		return !this.slotController.hasAssignedElements('end') ? html.nothing : html`
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