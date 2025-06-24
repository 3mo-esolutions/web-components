
import { bind, component, css, html, join, property, type HTMLTemplateResult } from '@a11d/lit'
import { type MaterialIcon } from '@3mo/icon'
import { Localizer } from '@3mo/localization'
import { Memoize as memoize } from 'typescript-memoize'
import { FieldDateTimeBase as FieldDateTimeBase } from './FieldDateTimeBase.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'
import { DateRangeParser } from './DateRangeParser.js'

Localizer.dictionaries.add('de', {
	'Period': 'Zeitraum',
	'Start': 'Start',
	'End': 'Ende',
	'Last ${count:number} days': 'Letzte ${count} Tage',
	'Last week': 'Letzte Woche',
	'This week': 'Diese Woche',
	'Next week': 'Nächste Woche',
	'Last month': 'Letzter Monat',
	'This month': 'Dieser Monat',
	'Next month': 'Nächster Monat',
	'Last year': 'Letztes Jahr',
	'This year': 'Dieses Jahr',
	'Next year': 'Nächstes Jahr',
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
 * @i18n "Last ${count:number} days"
 * @i18n "Last week"
 * @i18n "This week"
 * @i18n "Next week"
 * @i18n "Last month"
 * @i18n "This month"
 * @i18n "Next month"
 * @i18n "Last year"
 * @i18n "This year"
 * @i18n "Next year"
 */
@component('mo-field-date-time-range')
export class FieldDateTimeRange extends FieldDateTimeBase<DateTimeRange | undefined> {
	protected get selectedDate() { return this.selection === FieldDateRangeSelection.Start ? this.value?.start : this.value?.end }

	@property() override label = t('Period')
	@property() selection = FieldDateRangeSelection.Start
	@property({ type: Object }) value?: DateTimeRange

	protected resetNavigationDate() {
		this.navigationDate = this.selection === FieldDateRangeSelection.Start
			? this.value?.start ?? this.navigationDate
			: this.value?.end ?? this.navigationDate
	}

	protected override get presetsTemplate() {
		return join([
			this.precision < FieldDateTimePrecision.Day ? undefined : html`
				${this.getPresetTemplate(t('Last week'), () => new DateTimeRange(new DateTime().add({ weeks: -1 }).weekStart.dayStart, new DateTime().add({ weeks: -1 }).weekEnd.dayEnd))}
				${this.getPresetTemplate(t('This week'), () => new DateTimeRange(new DateTime().weekStart.dayStart, new DateTime().weekEnd.dayEnd))}
				${this.getPresetTemplate(t('Next week'), () => new DateTimeRange(new DateTime().add({ weeks: 1 }).weekStart.dayStart, new DateTime().add({ weeks: 1 }).weekEnd.dayEnd))}
				${this.getPresetTemplate(t('Last ${count:number} days', { count: 7 }), () => new DateTimeRange(new DateTime().subtract({ days: 6 }).dayStart, new DateTime().dayEnd))}
				${this.getPresetTemplate(t('Last ${count:number} days', { count: 30 }), () => new DateTimeRange(new DateTime().subtract({ days: 29 }).dayStart, new DateTime().dayEnd))}
				${this.getPresetTemplate(t('Last ${count:number} days', { count: 90 }), () => new DateTimeRange(new DateTime().subtract({ days: 89 }).dayStart, new DateTime().dayEnd))}
			`,
			this.precision < FieldDateTimePrecision.Month ? undefined : html`
				${this.getPresetTemplate(t('Last month'), () => new DateTimeRange(new DateTime().add({ months: -1 }).monthStart.dayStart, new DateTime().add({ months: -1 }).monthEnd.dayEnd))}
				${this.getPresetTemplate(t('This month'), () => new DateTimeRange(new DateTime().monthStart.dayStart, new DateTime().monthEnd.dayEnd))}
				${this.getPresetTemplate(t('Next month'), () => new DateTimeRange(new DateTime().add({ months: 1 }).monthStart.dayStart, new DateTime().add({ months: 1 }).monthEnd.dayEnd))}
			`,
			this.precision < FieldDateTimePrecision.Year ? undefined : html`
				${this.getPresetTemplate(t('Last year'), () => new DateTimeRange(new DateTime().add({ years: -1 }).yearStart.dayStart, new DateTime().add({ years: -1 }).yearEnd.dayEnd))}
				${this.getPresetTemplate(t('This year'), () => new DateTimeRange(new DateTime().yearStart.dayStart, new DateTime().yearEnd.dayEnd))}
				${this.getPresetTemplate(t('Next year'), () => new DateTimeRange(new DateTime().add({ years: 1 }).yearStart.dayStart, new DateTime().add({ years: 1 }).yearEnd.dayEnd))}
			`
		].filter(Boolean), html`<mo-line></mo-line>`) as unknown as HTMLTemplateResult
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

	protected get calendarValue() {
		return this.value
	}

	protected override get popoverSelectionTemplate() {
		return html`
			<mo-flex>
				${this.popoverToolbarTemplate}
				${super.popoverSelectionTemplate}
			</mo-flex>
		`
	}

	protected get popoverToolbarTemplate() {
		return html`
			${this.startEndTabBarTemplate}
		`
	}

	private get startEndTabBarTemplate() {
		return html`
			<mo-flex style='border-inline-start: 1px solid var(--mo-color-transparent-gray-3)'>
				<mo-tab-bar ${bind(this, 'selection', { sourceUpdated: () => this.resetNavigationDate() })}>
					<mo-tab value=${FieldDateRangeSelection.Start}>${t('Start')}</mo-tab>
					<mo-tab value=${FieldDateRangeSelection.End}>${t('End')}</mo-tab>
				</mo-tab-bar>
			</mo-flex>
		`
	}

	override handleSelectedDateChange(date: DateTime, precision: FieldDateTimePrecision) {
		const { hour, minute, second } = this.navigationDate
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