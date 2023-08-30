
import { HTMLTemplateResult, cache, css, html, live, nothing, property, style } from '@a11d/lit'
import { InputFieldComponent } from '@3mo/field'
import type { MaterialIcon } from '@3mo/icon'

export const enum FieldDateTimePrecision {
	Year = 'year',
	Month = 'month',
	Day = 'day',
	Hour = 'hour',
	Minute = 'minute',
	Second = 'second',
}

function isDateTimePrecisionSmaller(precision: FieldDateTimePrecision, other: FieldDateTimePrecision) {
	const precisions = [
		FieldDateTimePrecision.Year,
		FieldDateTimePrecision.Month,
		FieldDateTimePrecision.Day,
		FieldDateTimePrecision.Hour,
		FieldDateTimePrecision.Minute,
		FieldDateTimePrecision.Second,
	]
	return precisions.indexOf(precision) < precisions.indexOf(other)
}

/**
 * @attr open - Whether the date picker is open
 * @attr hideDatePicker - Hide the date picker
 * @attr shortcutReferenceDate - The date to use as a reference for shortcuts
 * @attr precision - The precision of the date picker. Defaults to 'minute'
 */
export abstract class FieldDateTimeBase<T> extends InputFieldComponent<T> {
	@property({
		type: Boolean,
		reflect: true,
		updated(this: FieldDateTimeBase<T>, open: boolean, wasOpen?: boolean) {
			if (open === false && wasOpen === true) {
				this.change.dispatch(this.value)
			}
		}
	}) open = false
	@property({ type: Boolean }) hideDatePicker = false
	@property({ type: Object }) shortcutReferenceDate = new DateTime
	@property() precision = FieldDateTimePrecision.Minute

	protected readonly calendarIconButtonIcon: MaterialIcon = 'today'

	protected abstract get navigatingDate(): DateTime

	protected abstract get selectedDate(): DateTime | undefined

	protected get formatOptions(): Intl.DateTimeFormatOptions {
		return {
			calendar: this.selectedDate?.calendarId,
			timeZone: this.selectedDate?.timeZoneId,
			year: 'numeric',
			month: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Month) ? undefined : '2-digit',
			day: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Day) ? undefined : '2-digit',
			hour: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Hour) ? undefined : '2-digit',
			minute: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Minute) ? undefined : '2-digit',
			second: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Second) ? undefined : '2-digit',
			hourCycle: 'h23',
		}
	}

	protected roundToPrecision(date: DateTime) {
		return date.with({
			year: date.year,
			month: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Month) ? 1 : date.month,
			day: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Day) ? 1 : date.day,
			hour: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Hour) ? 0 : date.hour,
			minute: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Minute) ? 0 : date.minute,
			second: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Second) ? 0 : date.second,
		})
	}

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
			}

			#selector {
				min-height: 175px;
			}

			.timezone {
				padding: 3px;
				font-size: small;
				text-align: end;
				font-weight: 500;
				color: var(--mo-color-gray);
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
			<mo-icon tabindex='-1' dense slot='end'
				icon=${this.calendarIconButtonIcon}
				${style({ color: this.isActive ? 'var(--mo-color-accent)' : 'var(--mo-color-gray)', fontSize: '22px', marginTop: '2px' })}
			></mo-icon>
		`
	}

	protected get popoverTemplate() {
		return this.hideDatePicker ? nothing : html`
			<mo-popover tabindex='-1' fixed openOnFocus
				.anchor=${this}
				?open=${this.open}
				@openChange=${(e: CustomEvent<boolean>) => this.open = e.detail}
			>${cache(!this.open ? nothing : this.popoverContentTemplate)}</mo-popover>
		`
	}

	protected get popoverContentTemplate() {
		return html`
			<mo-flex id='selector' direction='horizontal' style='height: 100%'>
				${this.dateTemplate}
				${this.timeTemplate}
			</mo-flex>
		`
	}

	protected get dateTemplate() {
		return html`
			${this.yearListTemplate}
			${this.monthListTemplate}
			${this.dayTemplate}
		`
	}

	private get yearListTemplate() {
		return html`
			<mo-year-list
				.navigatingValue=${this.navigatingDate}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Year)}
			></mo-year-list>
		`
	}

	private get monthListTemplate() {
		return [FieldDateTimePrecision.Year].includes(this.precision) ? nothing : html`
			<mo-month-list
				.navigatingValue=${this.navigatingDate}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Month)}
			></mo-month-list>
		`
	}

	private get dayTemplate() {
		return [FieldDateTimePrecision.Year, FieldDateTimePrecision.Month].includes(this.precision) ? nothing : this.calendarTemplate
	}

	protected abstract get calendarTemplate(): HTMLTemplateResult

	private get timeTemplate() {
		return [FieldDateTimePrecision.Year, FieldDateTimePrecision.Month, FieldDateTimePrecision.Day].includes(this.precision) ? nothing : html`
			<mo-flex gap='6px'>
				<div class='timezone'>
					${this.navigatingDate?.formatToParts({ timeZoneName: 'long' }).find(x => x.type === 'timeZoneName')?.value}
					(${this.navigatingDate?.formatToParts({ timeZoneName: 'shortOffset' }).find(x => x.type === 'timeZoneName')?.value})
				</div>
				<mo-flex direction='horizontal' style='flex: 1'>
					${this.hourListTemplate}
					${this.minuteListTemplate}
					${this.secondListTemplate}
				</mo-flex>
			</mo-flex>
		`
	}

	private get hourListTemplate() {
		return html`
			<mo-hour-list style='flex: 1'
				.navigatingValue=${this.navigatingDate}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Hour)}
			></mo-hour-list>
		`
	}

	private get minuteListTemplate() {
		return [FieldDateTimePrecision.Hour].includes(this.precision) ? nothing : html`
			<mo-minute-list style='flex: 1'
				.navigatingValue=${this.navigatingDate}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Minute)}
			></mo-minute-list>
		`
	}

	private get secondListTemplate() {
		return [FieldDateTimePrecision.Hour, FieldDateTimePrecision.Minute].includes(this.precision) ? nothing : html`
			<mo-second-list style='flex: 1'
				.navigatingValue=${this.navigatingDate}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Second)}
			></mo-second-list>
		`
	}

	protected handleSelectedDateChange(date: DateTime, precision: FieldDateTimePrecision) {
		date
		precision
		this.requestUpdate()
	}
}