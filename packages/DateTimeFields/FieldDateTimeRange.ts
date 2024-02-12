
import { component, css, html, property } from '@a11d/lit'
import { MaterialIcon } from '@3mo/icon'
import { FieldDateTimeBase as FieldDateTimeBase, FieldDateTimePrecision } from './FieldDateTimeBase.js'
import { DateRangeParser } from './DateRangeParser.js'
import { Memoize as memoize } from 'typescript-memoize'
import { Localizer } from '@3mo/localization'

Localizer.register('de', {
	'Start': 'Von',
	'End': 'Bis',
})

enum FieldDateRangeSelection {
	Start = 'start',
	End = 'end',
}

/**
 * @element mo-field-date-range
 *
 * @attr selection - The selected date range. Either "start" or "end". Defaults to "start".
 * @attr value - The selected date range.
 *
 * @i18n "Start"
 * @i18n "End"
 */
@component('mo-field-date-time-range')
export class FieldDateTimeRange extends FieldDateTimeBase<DateTimeRange | undefined> {
	protected get navigatingDate() { return (this.selection === FieldDateRangeSelection.Start ? this.value?.start : this.value?.end) ?? new DateTime() }

	protected get selectedDate() { return this.selection === FieldDateRangeSelection.Start ? this.value?.start : this.value?.end }

	@property() selection = FieldDateRangeSelection.Start
	@property({ type: Object }) value?: DateTimeRange

	static override get styles() {
		return css`
			${super.styles}

			mo-tab-bar {
				max-width: 200px;
				place-self: center;
				padding-block: 4px;
			}

			mo-tab {
				--mdc-tab-height: 40px;
			}

			mo-tab:not([active]) {
				opacity: 0.5;
			}
		`
	}

	protected override calendarIconButtonIcon: MaterialIcon = 'date_range'

	@memoize()
	protected override get placeholder() {
		return new DateTimeRange(new DateTime().subtract({ years: 1 }), new DateTime()).format(this.formatOptions)
	}

	protected get calendarTemplate() {
		return html`
			<mo-selectable-range-calendar
				.navigatingValue=${this.navigatingDate}
				.dateRange=${this.value}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Day)}
			></mo-selectable-range-calendar>
		`
	}

	protected override get popoverContentTemplate() {
		return html`
			<mo-flex>
				<mo-tab-bar value=${this.selection} @change=${(e: CustomEvent<FieldDateRangeSelection>) => this.selection = e.detail}>
					<mo-tab value=${FieldDateRangeSelection.Start}>${t('Start')}</mo-tab>
					<mo-tab value=${FieldDateRangeSelection.End}>${t('End')}</mo-tab>
				</mo-tab-bar>
			</mo-flex>

			${super.popoverContentTemplate}
		`
	}

	override handleSelectedDateChange(date: DateTime, precision: FieldDateTimePrecision) {
		this.value = this.selection === FieldDateRangeSelection.Start
			? new DateTimeRange(this.roundToPrecision(date), this.value?.end)
			: new DateTimeRange(this.value?.start, this.roundToPrecision(date))

		if (this.precision === precision) {
			this.selection = this.selection === FieldDateRangeSelection.Start
				? FieldDateRangeSelection.End
				: FieldDateRangeSelection.Start
		}

		super.handleSelectedDateChange(date, precision)
	}

	protected valueToInputValue(value: DateTimeRange | undefined) {
		return value ? value.format(this.formatOptions) ?? '' : ''
	}

	protected override inputValueToValue(value: string) {
		return value ? DateRangeParser.parse(value, this.shortcutReferenceDate) : undefined
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-date-time-range': FieldDateTimeRange
	}
}