
import { component, html, join, property, type HTMLTemplateResult } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { FieldDateTimeBase } from './FieldDateTimeBase.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'
import { Memoize as memoize } from 'typescript-memoize'

Localizer.dictionaries.add('de', {
	'Date & Time': 'Datum & Uhrzeit',
	'Today': 'Heute',
	'Yesterday': 'Gestern',
	'Tomorrow': 'Morgen',
	'Week start': 'Wochenstart',
	'Week end': 'Wochenende',
	'Month start': 'Monatsanfang',
	'Month end': 'Monatsende',
	'Year start': 'Jahresanfang',
	'Year end': 'Jahresende',
})

/**
 * @element mo-field-date-time
 *
 * @i18n "Date & Time"
 * @i18n "Today"
 * @i18n "Yesterday"
 * @i18n "Tomorrow"
 * @i18n "Week start"
 * @i18n "Week end"
 * @i18n "Month start"
 * @i18n "Month end"
 * @i18n "Year start"
 * @i18n "Year end"
 */
@component('mo-field-date-time')
export class FieldDateTime extends FieldDateTimeBase<Date | undefined> {
	protected get selectedDate() {
		if (!this.value) {
			return undefined
		}
		if (this.value instanceof Date) {
			return new DateTime(this.value)
		}
		return this.value
	}

	@property() override label = t('Date & Time')
	@property({ type: Object }) value?: Date

	@memoize()
	protected override get placeholder() {
		return new DateTime().format(this.formatOptions)
	}

	protected resetNavigationDate() {
		this.navigationDate = this.selectedDate ?? new DateTime()
	}

	protected get calendarValue() {
		return new DateTimeRange(this.selectedDate, this.selectedDate)
	}

	protected override get presetsTemplate() {
		return join([this.precision < FieldDateTimePrecision.Day ? undefined : html`
			${this.getPresetTemplate(t('Today'), () => new DateTime().dayStart)}
			${this.getPresetTemplate(t('Yesterday'), () => new DateTime().subtract({ days: 1 }).dayStart)}
			${this.getPresetTemplate(t('Tomorrow'), () => new DateTime().add({ days: 1 }).dayStart)}
			<mo-line></mo-line>
			${this.getPresetTemplate(t('Week start'), () => new DateTime().weekStart.dayStart)}
			${this.getPresetTemplate(t('Week end'), () => new DateTime().weekEnd.dayEnd)}
			<mo-line></mo-line>
			${this.getPresetTemplate(t('Month start'), () => new DateTime().monthStart.dayStart)}
			${this.getPresetTemplate(t('Month end'), () => new DateTime().monthEnd.dayEnd)}
			<mo-line></mo-line>
			${this.getPresetTemplate(t('Year start'), () => new DateTime().yearStart.dayStart)}
			${this.getPresetTemplate(t('Year end'), () => new DateTime().yearEnd.dayEnd)}
		`].filter(Boolean), html`<mo-line></mo-line>`) as any as HTMLTemplateResult
	}

	protected override handleSelectedDateChange(date: DateTime, precision: FieldDateTimePrecision) {
		const { hour, minute, second } = this.navigationDate
		date = date.with({ hour, minute, second })
		this.value = !date ? undefined : this.precision.getRange(date).start
		super.handleSelectedDateChange(date, precision)
	}

	protected valueToInputValue(value: Date | undefined) {
		return value?.format(this.formatOptions) ?? ''
	}

	protected inputValueToValue(value: string) {
		return value ? DateTime.parseAsDateTime(value, this.shortcutReferenceDate) : undefined
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-date-time': FieldDateTime
	}
}