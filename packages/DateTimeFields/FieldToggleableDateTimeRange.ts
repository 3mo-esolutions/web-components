import { bind, component, html } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { FieldDateTimeRange } from './FieldDateTimeRange.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'

Localizer.dictionaries.add('de', {
	'Include time': 'Zeitauswahl',
})

/**
 * @element mo-field-toggleable-date-time-range
 *
 * @i18n "Include time"
 */
@component('mo-field-toggleable-date-time-range')
export class FieldToggleableDateTimeRange extends FieldDateTimeRange {
	override precision = FieldDateTimePrecision.Day

	get includeTime() { return this.precision === FieldDateTimePrecision.Minute }
	set includeTime(includeTime) { this.precision = includeTime ? FieldDateTimePrecision.Minute : FieldDateTimePrecision.Day }

	protected override get popoverToolbarTemplate() {
		return html`
			<mo-grid style='width: calc(100% - 16px); padding-inline: 8px;' columns='* auto'>
				${super.popoverToolbarTemplate}
				${this.toggleTemplate}
			</mo-grid>
		`
	}

	private get toggleTemplate() {
		return html`
			<mo-switch label=${t('Include time')} ${bind(this, 'includeTime')}></mo-switch>
		`
	}
}