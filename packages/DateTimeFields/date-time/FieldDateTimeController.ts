import { type ReactiveControllerHost } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { FieldDateTimeControllerBase, type FieldDateTimePreset } from './FieldDateTimeControllerBase.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'

Localizer.dictionaries.add('de', {
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
 * Everything a date or date-time field does, for a host which only renders it: the segments at the
 * field's precision, where a picker stands and what picking in it means, the presets, and the validity.
 *
 * ```html
 * <div ${this.controller.group.ref()}>
 *     ${this.controller.segments.segments.map(segment => html`<span ${this.controller.segment.ref(segment)}></span>`)}
 * </div>
 * ```
 *
 * A picker is the host's to render: it opens on `handlePickerOpen`, scrolls with `navigationDate`,
 * marks `calendarValue`, and hands what was chosen to `pick`.
 *
 * @ssr false
 */
export class FieldDateTimeController<THost extends ReactiveControllerHost = ReactiveControllerHost> extends FieldDateTimeControllerBase<Date, THost> {
	readonly segments = this.createSegments(controller => ({
		get value() { return controller.selectedDate },
		handleInput: value => controller.options.handleInput?.(value),
		handleChange: value => controller.options.handleChange?.(value),
	}))

	get group() {
		return this.segments.group
	}

	get segment() {
		return this.segments.segment
	}

	protected get segmentsControllers() {
		return [this.segments]
	}

	get selectedDate() {
		return this.options.value ? new DateTime(this.options.value) : undefined
	}

	get calendarValue() {
		return new DateTimeRange(this.selectedDate, this.selectedDate)
	}

	/** A picked day keeps the time the picker stands at; the value starts at the precision's unit. */
	pick(date: DateTime) {
		const { hour, minute, second } = this.navigationDate
		this.options.handleChange?.(this.precision.getRange(date.with({ hour, minute, second })).start)
	}

	protected datesOf(value: Date) {
		return [new DateTime(value)]
	}

	protected get defaultPresets(): ReadonlyArray<ReadonlyArray<FieldDateTimePreset<Date>>> {
		if (this.precision < FieldDateTimePrecision.Day) {
			return []
		}
		const now = new DateTime()
		return [
			[
				{ label: t('Today'), value: now.dayStart },
				{ label: t('Yesterday'), value: now.subtract({ days: 1 }).dayStart },
				{ label: t('Tomorrow'), value: now.add({ days: 1 }).dayStart },
			],
			[
				{ label: t('Week start'), value: now.weekStart.dayStart },
				{ label: t('Week end'), value: now.weekEnd.dayEnd },
			],
			[
				{ label: t('Month start'), value: now.monthStart.dayStart },
				{ label: t('Month end'), value: now.monthEnd.dayEnd },
			],
			[
				{ label: t('Year start'), value: now.yearStart.dayStart },
				{ label: t('Year end'), value: now.yearEnd.dayEnd },
			],
		]
	}
}