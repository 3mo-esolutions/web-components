
import { bind, component, css, html, property } from '@a11d/lit'
import { type MaterialIcon } from '@3mo/icon'
import { Localizer } from '@3mo/localization'
import { Memoize as memoize } from 'typescript-memoize'
import { FieldDateTimeBase as FieldDateTimeBase } from './FieldDateTimeBase.js'
import { type FieldDateTimePrecision } from './FieldDateTimePrecision.js'
import { DateRangeParser } from './DateRangeParser.js'

Localizer.dictionaries.add('de', {
	'Period': 'Zeitraum',
	'Start': 'Start',
	'End': 'Ende',
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
 * @i18n "Period"
 * @i18n "Start"
 * @i18n "End"
 */
@component('mo-field-date-time-range')
export class FieldDateTimeRange extends FieldDateTimeBase<DateTimeRange | undefined> {
	protected get selectedDate() { return this.selection === FieldDateRangeSelection.Start ? this.value?.start : this.value?.end }

	@property() override label = t('Period')
	@property() selection = FieldDateRangeSelection.Start
	@property({ type: Object }) value?: DateTimeRange

	protected resetNavigatingDate() {
		this.navigatingDate = this.selection === FieldDateRangeSelection.Start
			? this.value?.start ?? this.navigatingDate
			: this.value?.end ?? this.navigatingDate
	}

	static override get styles() {
		return css`
			${super.styles}

			mo-tab-bar {
				max-width: 200px;
				place-self: center;
				padding-block: 4px;
				mo-tab {
					&:not([active]) {
						opacity: 0.5;
					}
				}
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
			<mo-calendar
				precision=${this.precision.key}
				.value=${this.value}
				@dateClick=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, this.precision)}
			></mo-calendar>
		`
	}

	protected override get popoverContentTemplate() {
		return html`
			${this.popoverToolbarTemplate}
			${super.popoverContentTemplate}
		`
	}

	protected get popoverToolbarTemplate() {
		return html`
			${this.startEndTabBarTemplate}
		`
	}

	private get startEndTabBarTemplate() {
		return html`
			<mo-flex>
				<mo-tab-bar ${bind(this, 'selection', { sourceUpdated: () => this.resetNavigatingDate() })}>
					<mo-tab value=${FieldDateRangeSelection.Start}>${t('Start')}</mo-tab>
					<mo-tab value=${FieldDateRangeSelection.End}>${t('End')}</mo-tab>
				</mo-tab-bar>
			</mo-flex>
		`
	}

	override handleSelectedDateChange(date: DateTime, precision: FieldDateTimePrecision) {
		const { hour, minute, second } = this.navigatingDate
		date = date.with({ hour, minute, second })
		const { start, end } = this.precision.getRange(date)
		this.value = this.selection === FieldDateRangeSelection.Start
			? new DateTimeRange(start, this.value?.end)
			: new DateTimeRange(this.value?.start, end)

		if (this.precision === precision) {
			this.selection = this.selection === FieldDateRangeSelection.Start
				? FieldDateRangeSelection.End
				: FieldDateRangeSelection.Start
		}

		super.handleSelectedDateChange(date, precision)
	}

	protected valueToInputValue(value: DateTimeRange | undefined) {
		return value?.format(this.formatOptions) ?? ''
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