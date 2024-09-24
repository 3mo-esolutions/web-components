
import { type HTMLTemplateResult, cache, css, html, live, property, style, bind, ifDefined, state } from '@a11d/lit'
import { MediaQueryController } from '@3mo/media-query-observer'
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
	@property({
		type: Boolean,
		reflect: true,
		updated(this: FieldDateTimeBase<T>, open: boolean, wasOpen?: boolean) {
			if (open === true && wasOpen === false) {
				this.lastValue = this.value
			} else if (open === false && wasOpen === true && this.lastValue !== this.value) {
				this.change.dispatch(this.value)
			}
		}
	}) open = false
	@property({ type: Boolean }) pickerHidden = false
	@property({ type: Object }) shortcutReferenceDate = new DateTime
	@property() precision = FieldDateTimePrecision.Minute

	private readonly smQuery = new MediaQueryController(this, '(max-width: 576px)')

	@state() navigatingDate = new DateTime()

	private lastValue?: T

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

			mo-popover {
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

			@media (width <= 576px) {
				mo-popover {
					left: 0 !important;
					bottom: 0 !important;
					top: unset !important;
					right: unset !important;
					width: 100% !important;
					border-radius: 12px 12px 0 0;

					mo-selectable-calendar,
          mo-selectable-range-calendar {
          	--mo-calendar-day-size: calc((100vw - 20px) / 7);
          }
				}
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
				?readonly=${this.readonly || this.smQuery.matches}
				?required=${this.required}
				?disabled=${this.disabled}
				placeholder=${ifDefined(this.smQuery.matches ? undefined : this.placeholder)}
				.value=${live(this.inputStringValue || '')}
				@input=${(e: Event) => this.handleInput(this.inputValueToValue(this.inputElement.value || ''), e)}
				@change=${(e: Event) => this.handleChange(this.inputValueToValue(this.inputElement.value || ''), e)}
			>
		`
	}

	protected abstract inputValueToValue(value: string): T | undefined
	protected abstract override valueToInputValue(value: T | undefined): string

	protected get calendarIconButtonTemplate() {
		return this.pickerHidden ? html.nothing : html`
			<mo-icon tabindex='-1' dense slot='end'
				icon=${this.calendarIconButtonIcon}
				${style({ color: this.isActive ? 'var(--mo-color-accent)' : 'var(--mo-color-gray)', fontSize: '22px', marginTop: '2px', cursor: 'pointer', userSelect: 'none' })}
			></mo-icon>
		`
	}

	protected get popoverTemplate() {
		if (this.pickerHidden) {
			return html.nothing
		}
		if (this.smQuery.matches) {
			 return html`
				<mo-popover tabindex='-1' fixed .anchor=${this} ?open=${bind(this, 'open')}>
					<mo-flex>
						<mo-icon-button icon='close'
							${style({ color: 'var(--mo-color-gray)', margin: '12px 16px -8px auto' })}
							@click=${() => {
              	this.pickerHidden = true
                this.open = false
              	setTimeout(() => this.pickerHidden = false, 0)
              }}
						></mo-icon-button>
						${cache(!this.open ? html.nothing : this.popoverContentTemplate)}
					</mo-flex>
				</mo-popover>
			 `
		}
		return html`
			<mo-popover tabindex='-1' fixed .anchor=${this} ?open=${bind(this, 'open')}>
				${cache(!this.open ? html.nothing : this.popoverContentTemplate)}
			</mo-popover>
		`
	}

	protected get popoverContentTemplate() {
		return this.smQuery.matches ? this.compactPopoverContentTemplate : html`
			<mo-flex id='selector' direction='horizontal' style='height: 100%'>
				${this.dateTemplate}
				${this.timeTemplate}
			</mo-flex>
		`
	}

	protected get compactPopoverContentTemplate() {
		return html`
			<mo-flex alignItems='center' ${style({ paddingBlock: '10px' })}>
				<mo-flex direction='horizontal' gap='8px' ${style({ width: 'calc(100% - 20px)' })}>
					${this.monthListTemplate}
					${this.yearListTemplate}
				</mo-flex>
				${this.dayTemplate}
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
		if (this.smQuery.matches) {
			return html`
				<mo-field-year ${style({ width: '80px' })}
					.value=${this.selectedDate?.getFullYear()}
					@change=${(e: CustomEvent<number>) => {
						const currentDate = this.selectedDate ?? new DateTime()
						currentDate.setFullYear(e.detail)
						this.handleSelectedDateChange(currentDate, FieldDateTimePrecision.Year)
					}}
				></mo-field-year>
			`
		}

		return html`
			<mo-year-list
				.navigatingValue=${bind(this, 'navigatingDate')}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Year)}
			></mo-year-list>
		`
	}

	private get monthListTemplate() {
		if ([FieldDateTimePrecision.Year].includes(this.precision)) {
			return html.nothing
		}

		if (this.smQuery.matches) {
			return html`
				<mo-field-month ${style({ flexGrow: '1' })}
					.navigatingDate=${this.navigatingDate}
					.value=${this.selectedDate?.getMonth()}
					@change=${(e: CustomEvent<number>) => {
						const currentDate = this.selectedDate ?? new DateTime()
						currentDate.setMonth(e.detail)
						this.handleSelectedDateChange(currentDate, FieldDateTimePrecision.Month)
					}}
				></mo-field-month>
			`
		}

		return html`
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
		if ([FieldDateTimePrecision.Year, FieldDateTimePrecision.Month, FieldDateTimePrecision.Day].includes(this.precision)) {
			return html.nothing
		}

		if (this.smQuery.matches) {
			const hours = (this.selectedDate ?? this.navigatingDate).getHours()
			const minutes = (this.selectedDate ?? this.navigatingDate).getMinutes()

			const setHours = (hours: number) => {
				const currentDate = this.selectedDate ?? new DateTime()
				currentDate.setHours(hours)
				this.handleSelectedDateChange(currentDate, FieldDateTimePrecision.Hour)
			}

			const setMinutes = (minutes: number) => {
				const currentDate = this.selectedDate ?? new DateTime()
				currentDate.setMinutes(minutes)
				this.handleSelectedDateChange(currentDate, FieldDateTimePrecision.Minute)
			}

			return html`
				<mo-flex direction='horizontal' alignItems='center'>
					<mo-flex alignItems='center'>
						<mo-icon-button icon='keyboard_arrow_up'
							${style({ color: 'var(--mo-color-gray)' })}
							@click=${() => setHours(hours - 1)}
						></mo-icon-button>
						<span contenteditable inputmode='decimal' ${style({ fontSize: '1.5em' })}
							@keydown=${(e: KeyboardEvent) => {
								if (e.key.length === 1 && isNaN(Number(e.key))) {
									e.preventDefault()
								}
								if (e.key === 'Enter') {
									(e.target as HTMLElement)?.blur()
								}
							}}
							@change=${(e: UIEvent) => {
								const textNode = e.target as HTMLElement
								const value = Number(textNode?.innerText)
								if (isNaN(value) || value < 0 || value > 23) {
									textNode.innerText = hours.toString()
								} else {
									setHours(value)
								}
							}}
						>
							${hours}
						</span>
						<mo-icon-button icon='keyboard_arrow_down'
							${style({ color: 'var(--mo-color-gray)' })}
							@click=${() => setHours(hours + 1)}
						></mo-icon-button>
					</mo-flex>

					<span ${style({ fontSize: '1.5em' })}>:</span>

					<mo-flex alignItems='center'>
						<mo-icon-button icon='keyboard_arrow_up'
							${style({ color: 'var(--mo-color-gray)' })}
							@click=${() => setMinutes(minutes - 1)}
						></mo-icon-button>
						<span contenteditable inputmode='decimal' ${style({ fontSize: '1.5em' })}
							@keydown=${(e: KeyboardEvent) => {
								if (e.key.length === 1 && isNaN(Number(e.key))) {
									e.preventDefault()
								}
								if (e.key === 'Enter') {
									(e.target as HTMLElement)?.blur()
								}
							}}
							@change=${(e: UIEvent) => {
								const textNode = e.target as HTMLElement
								const value = Number(textNode?.innerText)
								if (isNaN(value) || value < 0 || value > 59) {
									textNode.innerText = minutes < 10 ? `0${minutes}`: minutes.toString()
								} else {
									setMinutes(value)
								}
							}}
						>
							${minutes < 10 ? `0${minutes}`: minutes}
						</span>
						<mo-icon-button icon='keyboard_arrow_down'
							${style({ color: 'var(--mo-color-gray)' })}
							@click=${() => setMinutes(minutes + 1)}
						></mo-icon-button>
					</mo-flex>
				</mo-flex>
			`
		}

		return html`
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
		this.requestUpdate()
	}
}