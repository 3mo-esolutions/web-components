
import { css, html, live, nothing, property, query, style } from '@a11d/lit'
import { InputFieldComponent } from '@3mo/field'
import { MaterialIcon } from '@3mo/icon'
import { CalendarSelectionAdapter, SelectableCalendar } from './calendar/index.js'

/**
 * @attr open - Whether the date picker is open
 * @attr hideDatePicker - Hide the date picker
 * @attr shortcutReferenceDate - The date to use as a reference for shortcuts
 */
export abstract class FieldDateBase<T> extends InputFieldComponent<T> {
	@property({ type: Boolean, reflect: true }) open = false
	@property({ type: Boolean }) hideDatePicker = false
	@property({ type: Object }) shortcutReferenceDate = new DateTime

	@query('mo-selectable-calendar') protected readonly calendarElement?: SelectableCalendar<T>

	protected readonly abstract calendarSelectionAdapterConstructor: Constructor<CalendarSelectionAdapter<T>>

	protected override handleChange(value?: T, e?: Event) {
		super.handleChange(value, e)
		this.inputStringValue = this.valueToInputValue(value)
	}

	protected override get isActive() {
		return super.isActive || this.open
	}

	static override get styles() {
		return css`
			${super.styles}

			:host {
				position: relative;
			}

			mo-popover {
				background: var(--mo-color-background);
				box-shadow: var(--mo-shadow);
				border-radius: var(--mo-border-radius);
				color: var(--mo-color-foreground);
				padding: 10px 4px;
			}
		`
	}

	protected override get template() {
		return html`
			${super.template}
			${this.popoverTemplate}
		`
	}

	protected override get endSlotTemplate() {
		return html`
			${super.endSlotTemplate}
			${this.calendarIconButtonTemplate}
		`
	}

	protected override get inputTemplate() {
		return html`
			<input
				part='input'
				?readonly=${this.readonly}
				?required=${this.required}
				?disabled=${this.disabled}
				.value=${live(this.inputStringValue || '')}
				@input=${(e: Event) => this.handleInput(this.inputValueToValue(this.inputElement.value || ''), e)}
				@change=${(e: Event) => this.handleChange(this.inputValueToValue(this.inputElement.value || ''), e)}
			>
		`
	}

	protected abstract inputValueToValue(value: string): T | undefined
	protected abstract override valueToInputValue(value: T | undefined): string

	protected get calendarIconButtonTemplate() {
		return this.hideDatePicker ? nothing : html`
			<mo-icon-button tabindex='-1' dense slot='end'
				icon=${this.calendarIconButtonIcon}
				${style({ color: this.isActive ? 'var(--mo-color-accent)' : 'var(--mo-color-gray)' })}
				@click=${() => this.open = !this.open}>
			</mo-icon-button>
		`
	}

	protected get popoverTemplate() {
		return this.hideDatePicker ? nothing : html`
			<mo-popover tabindex='-1' openOnFocus
				.anchor=${this}
				?open=${this.open}
				@openChange=${(e: CustomEvent<boolean>) => this.open = e.detail}
			>
				${this.calendarTemplate}
			</mo-popover>
		`
	}

	protected get calendarTemplate() {
		return html`
			<mo-selectable-calendar
				.selectionAdapterConstructor=${this.calendarSelectionAdapterConstructor}
				.value=${this.value}
				@change=${(e: CustomEvent<T>) => this.handleCalendarChange(e.detail)}
			></mo-selectable-calendar>
		`
	}

	protected readonly calendarIconButtonIcon: MaterialIcon = 'today'

	protected handleCalendarChange(value: T) {
		this.value = value
		this.change.dispatch(value)
	}
}