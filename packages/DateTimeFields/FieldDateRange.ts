
import { component, property, classMap, css, html, state, style, ClassInfo } from '@a11d/lit'
import { MaterialIcon } from '@3mo/icon'
import { FieldDateBase } from './FieldDateBase.js'
import { CalendarSelectionAdapter } from './calendar/index.js'
import { DateRangeParser } from './DateRangeParser.js'

const enum DateRangeCalendarSelectionAdapterCurrentSelection { StartDate, EndDate }

class DateRangeCalendarSelectionAdapter extends CalendarSelectionAdapter<DateTimeRange> {
	currentSelection = DateRangeCalendarSelectionAdapterCurrentSelection.StartDate

	override get styles() {
		return css`
			.day.inSelectionRange:not(.selected) {
				background: var(--mo-color-accent-transparent);
			}

			.day.inSelectionRange {
				border-radius: 0px;
			}

			.day.selected.first {
				border-radius: 100px 0 0 100px;
			}

			.day.selected.last {
				border-radius: 0 100px 100px 0;
			}

			.day.selected.first.last {
				border-radius: 100px;
			}
		`
	}

	getDayTemplate(day: DateTime, classInfo: ClassInfo) {
		const dateRange = this.calendar.value
		const firstEquals = !dateRange?.start ? false : day.equals(dateRange.start)
		const lastEquals = !dateRange?.end ? false : day.equals(dateRange.end)
		const classes = {
			...classInfo,
			inSelectionRange: !dateRange ? false : dateRange.includes(day),
			selected: firstEquals || lastEquals,
			first: firstEquals,
			last: lastEquals,
		}
		return html`
			<mo-flex
				class=${classMap(classes)}
				@click=${() => this.handleClick(day)}
			>${day.format({ day: 'numeric' })}</mo-flex>
		`
	}

	getNavigatingDate(value?: DateTimeRange) {
		const date = value?.start ?? new DateTime()
		return new DateTime(date.year, date.month)
	}

	private handleClick(date: DateTime) {
		const dateRange = this.calendar.value

		const shallReset = !!dateRange?.start && !!dateRange.end
		const value = this.currentSelection === DateRangeCalendarSelectionAdapterCurrentSelection.StartDate
			? new DateTimeRange(date, shallReset ? undefined : dateRange?.end)
			: new DateTimeRange(shallReset ? undefined : dateRange?.start, date)

		this.currentSelection = value.start
			? DateRangeCalendarSelectionAdapterCurrentSelection.EndDate
			: DateRangeCalendarSelectionAdapterCurrentSelection.StartDate

		this.select(value as DateTimeRange)
	}
}

/** @element mo-field-date-range */
@component('mo-field-date-range')
export class FieldDateRange extends FieldDateBase<DateTimeRange | undefined> {
	@state()
	private get currentSelection() { return (this.calendarElement?.selectionAdapter as DateRangeCalendarSelectionAdapter | undefined)?.currentSelection ?? DateRangeCalendarSelectionAdapterCurrentSelection.StartDate }
	private set currentSelection(value) {
		const selectionAdapter = (this.calendarElement?.selectionAdapter as DateRangeCalendarSelectionAdapter | undefined)
		if (selectionAdapter) {
			selectionAdapter.currentSelection = value
			this.requestUpdate()
		}
	}

	protected calendarSelectionAdapterConstructor = DateRangeCalendarSelectionAdapter

	@property({ type: Object }) value?: DateTimeRange

	protected override calendarIconButtonIcon: MaterialIcon = 'date_range'

	protected override handleCalendarChange(value?: DateTimeRange) {
		super.handleCalendarChange(value)
		if (value?.start && value.end) {
			this.open = false
		}
	}

	protected override get menuContentTemplate() {
		return html`
			<mo-flex>
				<mo-flex direction='horizontal' alignItems='center' ${style({ textAlign: 'center', height: '30px' })}>
						<div ${style({ width: '*', fontWeight: '500', cursor: 'pointer' })}
							${style({ color: this.currentSelection === DateRangeCalendarSelectionAdapterCurrentSelection.StartDate ? 'var(--mo-color-accent)' : 'unset' })}
							@click=${() => this.currentSelection = DateRangeCalendarSelectionAdapterCurrentSelection.StartDate}
						>${!this.value?.start ? 'Start' : this.value.start.formatAsDate()}</div>

						<div ${style({ color: 'var(--mo-color-gray)' })}>bis</div>

						<div ${style({ width: '*', fontWeight: '500', cursor: 'pointer' })}
							${style({ color: this.currentSelection === DateRangeCalendarSelectionAdapterCurrentSelection.EndDate ? 'var(--mo-color-accent)' : 'unset' })}
							@click=${() => this.currentSelection = DateRangeCalendarSelectionAdapterCurrentSelection.EndDate}
						>${!this.value?.end ? 'Ende' : this.value.end.formatAsDate()}</div>
				</mo-flex>
				${super.menuContentTemplate}
			</mo-flex>
		`
	}

	protected valueToInputValue(value: DateTimeRange | undefined) {
		return value ? value.format() ?? '' : ''
	}

	protected override inputValueToValue(value: string) {
		return value ? DateRangeParser.parse(value, this.shortcutReferenceDate) : undefined
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-date-range': FieldDateRange
	}
}