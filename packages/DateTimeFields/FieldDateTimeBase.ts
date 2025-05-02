
import { type HTMLTemplateResult, cache, css, html, live, property, style, bind, state } from '@a11d/lit'
import { InputFieldComponent } from '@3mo/field'
import { type MaterialIcon } from '@3mo/icon'

export enum FieldDateTimePrecision {
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
 * @attr pickerHidden - Hide the date picker
 * @attr shortcutReferenceDate - The date to use as a reference for shortcuts
 * @attr precision - The precision of the date picker. Defaults to 'minute'
 */
export abstract class FieldDateTimeBase<T> extends InputFieldComponent<T> {
	@property({ type: Boolean, reflect: true }) open = false
	@property({ type: Boolean }) pickerHidden = false
	@property({ type: Object }) shortcutReferenceDate = new DateTime
	@property() precision = FieldDateTimePrecision.Minute

	@state() navigatingDate = new DateTime()

	protected readonly calendarIconButtonIcon: MaterialIcon = 'today'

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

	protected floorToPrecision(date: DateTime) {
		return date.with({
			year: date.year,
			month: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Month) ? 1 : date.month,
			day: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Day) ? 1 : date.day,
			hour: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Hour) ? 0 : date.hour,
			minute: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Minute) ? 0 : date.minute,
			second: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Second) ? 0 : date.second,
		})
	}

	protected ceilToPrecision(date: DateTime) {
		return date.with({
			year: date.year,
			minute: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Minute) ? 60 : date.minute,
			second: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Second) ? 60 : date.second,
		})
			.with({ month: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Month) ? date.monthsInYear : date.month })
			.with({ day: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Day) ? date.daysInMonth : date.day })
			.with({ hour: isDateTimePrecisionSmaller(this.precision, FieldDateTimePrecision.Hour) ? date.hoursInDay : date.hour })
	}

	protected override valueUpdated() {
		super.valueUpdated()
		this.resetNavigatingDate()
	}

	protected abstract resetNavigatingDate(): void

	protected override handleChange(value?: T, e?: Event) {
		super.handleChange(value, e)
		this.inputStringValue = this.valueToInputValue(value)
	}

	protected override get isActive() {
		return super.isActive || this.open
	}

	protected get placeholder() {
		return ''
	}

	static override get styles() {
		return css`
			${super.styles}

			:host {
				position: relative;
			}

			:host([disabled]) {
				pointer-events: none;
			}

			mo-field {
				anchor-name: --field-date-time;
			}

			mo-popover {
				position-anchor: --field-date-time;
				position-visibility: anchors-visible;
				background: var(--mo-color-background);
				box-shadow: var(--mo-shadow);
				border-radius: var(--mo-border-radius);
				color: var(--mo-color-foreground);
				font-size: 0.875em;
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

			input::placeholder {
				color: transparent;
			}

			mo-field[active]:not([dense]) input::placeholder {
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
			${this.clearIconButtonTemplate}
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
				placeholder=${this.placeholder}
				.value=${live(this.inputStringValue || '')}
				@input=${(e: Event) => this.handleInput(this.inputValueToValue(this.inputElement.value || ''), e)}
				@change=${(e: Event) => this.handleChange(this.inputValueToValue(this.inputElement.value || ''), e)}
			>
		`
	}

	protected abstract inputValueToValue(value: string): T | undefined
	protected abstract override valueToInputValue(value: T | undefined): string

	private get clearIconButtonTemplate() {
		const clear = (e: PointerEvent) => {
			e.stopPropagation()
			this.handleInput(undefined)
			this.handleChange(undefined)
		}
		return !this.value || !this.focusController.focused ? html.nothing : html`
			<mo-icon-button tabindex='-1' dense slot='end' icon='cancel'
				@click=${clear}
				${style({ color: 'var(--mo-color-gray)', fontSize: '20px', cursor: 'pointer', userSelect: 'none', marginBlockStart: '2.75px', marginInlineEnd: '5px' })}
			></mo-icon-button>
		`
	}

	protected get calendarIconButtonTemplate() {
		return this.pickerHidden ? html.nothing : html`
			<mo-icon tabindex='-1' slot='end'
				icon=${this.calendarIconButtonIcon}
				${style({ color: this.isActive ? 'var(--mo-color-accent)' : 'var(--mo-color-gray)', fontSize: '22px', marginBlockStart: '2px', cursor: 'pointer', userSelect: 'none' })}
			></mo-icon>
		`
	}

	protected get popoverTemplate() {
		return this.pickerHidden ? html.nothing : html`
			<mo-popover tabindex='-1' .anchor=${this} target='field' ?open=${bind(this, 'open')}>
				${cache(!this.open ? html.nothing : this.popoverContentTemplate)}
			</mo-popover>
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
				.navigatingValue=${bind(this, 'navigatingDate')}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Year)}
			></mo-year-list>
		`
	}

	private get monthListTemplate() {
		return [FieldDateTimePrecision.Year].includes(this.precision) ? html.nothing : html`
			<mo-month-list
				.navigatingValue=${bind(this, 'navigatingDate')}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Month)}
			></mo-month-list>
		`
	}

	private get dayTemplate() {
		return [FieldDateTimePrecision.Year, FieldDateTimePrecision.Month].includes(this.precision) ? html.nothing : this.calendarTemplate
	}

	protected abstract get calendarTemplate(): HTMLTemplateResult

	private get timeTemplate() {
		return [FieldDateTimePrecision.Year, FieldDateTimePrecision.Month, FieldDateTimePrecision.Day].includes(this.precision) ? html.nothing : html`
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
				.navigatingValue=${bind(this, 'navigatingDate')}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Hour)}
			></mo-hour-list>
		`
	}

	private get minuteListTemplate() {
		return [FieldDateTimePrecision.Hour].includes(this.precision) ? html.nothing : html`
			<mo-minute-list style='flex: 1'
				.navigatingValue=${bind(this, 'navigatingDate')}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Minute)}
			></mo-minute-list>
		`
	}

	private get secondListTemplate() {
		return [FieldDateTimePrecision.Hour, FieldDateTimePrecision.Minute].includes(this.precision) ? html.nothing : html`
			<mo-second-list style='flex: 1'
				.navigatingValue=${bind(this, 'navigatingDate')}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Second)}
			></mo-second-list>
		`
	}

	protected handleSelectedDateChange(date: DateTime, precision: FieldDateTimePrecision) {
		date
		precision
		this.change.dispatch(this.value)
		this.requestUpdate()
	}
}