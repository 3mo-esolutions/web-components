import { type ReactiveControllerHost } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { FieldDateTimeControllerBase, type FieldDateTimePreset } from '../date-time/FieldDateTimeControllerBase.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import { DateRangeParser } from './DateRangeParser.js'

Localizer.dictionaries.add('de', {
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

/** The end of the range a picker edits. */
export type FieldDateTimeRangeSelection = 'start' | 'end'

/**
 * Everything a date range field does, for a host which only renders it: a group of segments for
 * each end with the arrow keys crossing between them, the end a picker edits, range shortcuts, the
 * presets, and the validity.
 *
 * ```html
 * <div ${this.controller.startSegments.group.ref()}>
 *     ${this.controller.startSegments.segments.map(segment => html`<span ${this.controller.startSegments.segment.ref(segment)}></span>`)}
 * </div>
 * <div ${this.controller.endSegments.group.ref()}>…</div>
 * ```
 *
 * A picker is the host's to render: it opens on `handlePickerOpen`, edits the `selection` end, scrolls
 * with `navigationDate`, marks `calendarValue`, and hands what was chosen to `pick`. Picking an end at
 * the field's precision moves the selection on to the other end.
 *
 * @ssr false
 */
export class FieldDateTimeRangeController<THost extends ReactiveControllerHost = ReactiveControllerHost> extends FieldDateTimeControllerBase<DateTimeRange, THost> {
	private _selection: FieldDateTimeRangeSelection = 'start'

	readonly startSegments = this.createSegments(controller => ({
		get value() { return controller.options.value?.start },
		handleInput: value => controller.options.handleInput?.(controller.withEnd('start', value)),
		handleChange: value => controller.options.handleChange?.(controller.withEnd('start', value)),
		handleFocusChange: focused => { if (focused) { controller.selection = 'start' } },
		handleMoveBeyond: direction => direction > 0 && controller.endSegments.focusFirst(),
		parseShortcut: (text, referenceDate) => controller.parseShortcut(text, referenceDate),
	}))

	readonly endSegments = this.createSegments(controller => ({
		get value() { return controller.options.value?.end },
		handleInput: value => controller.options.handleInput?.(controller.withEnd('end', value)),
		handleChange: value => controller.options.handleChange?.(controller.withEnd('end', value)),
		handleFocusChange: focused => { if (focused) { controller.selection = 'end' } },
		handleMoveBeyond: direction => direction < 0 && controller.startSegments.focusLast(),
		parseShortcut: (text, referenceDate) => controller.parseShortcut(text, referenceDate),
	}))

	/** The end a picker edits. Entering an end's segments selects it. */
	get selection() {
		return this._selection
	}

	set selection(value) {
		if (this._selection !== value) {
			this._selection = value
			this.resetNavigationDate()
			this.host.requestUpdate()
		}
	}

	protected get segmentsControllers() {
		return [this.startSegments, this.endSegments]
	}

	get selectedDate() {
		return this.selection === 'start' ? this.options.value?.start : this.options.value?.end
	}

	get calendarValue() {
		return this.options.value
	}

	/** An end without a date leaves the picker where it stands. */
	protected override resetNavigationDate() {
		super.resetNavigationDate(this.selectedDate ?? this.navigationDate)
	}

	/** A picked day keeps the time the picker stands at; the start begins the precision's unit and the end ends it. */
	pick(date: DateTime, precision: FieldDateTimePrecision) {
		const { hour, minute, second } = this.navigationDate
		const { start, end } = this.precision.getRange(date.with({ hour, minute, second }))
		const value = this.options.value
		this.options.handleChange?.(this.selection === 'start'
			? new DateTimeRange(start, value?.end)
			: new DateTimeRange(value?.start, end))
		if (precision === this.precision) {
			this.selection = this.selection === 'start' ? 'end' : 'start'
		}
	}

	private withEnd(selection: FieldDateTimeRangeSelection, value: DateTime | undefined) {
		const start = selection === 'start' ? value : this.options.value?.start
		const end = selection === 'end' ? (value ? this.precision.getRange(value).end : undefined) : this.options.value?.end
		return !start && !end ? undefined : new DateTimeRange(start, end)
	}

	/** Range keywords ("m", "lw") set both ends at once; anything else resolves to the focused end. */
	private parseShortcut(text: string, referenceDate: DateTime) {
		const range = DateRangeParser.parse(text, referenceDate)
		if (range?.start && range.end) {
			this.options.handleChange?.(range)
			return undefined
		}
		return range?.start ?? range?.end
	}

	protected datesOf(value: DateTimeRange) {
		return [value.start, value.end].filter((date): date is DateTime => !!date)
	}

	protected get defaultPresets(): ReadonlyArray<ReadonlyArray<FieldDateTimePreset<DateTimeRange>>> {
		const now = new DateTime()
		const lastDays = (count: number) => ({ label: t('Last ${count:number} days', { count }), value: new DateTimeRange(now.subtract({ days: count - 1 }).dayStart, now.dayEnd) })
		return [
			this.precision < FieldDateTimePrecision.Day ? [] : [
				{ label: t('Last week'), value: new DateTimeRange(now.add({ weeks: -1 }).weekStart.dayStart, now.add({ weeks: -1 }).weekEnd.dayEnd) },
				{ label: t('This week'), value: new DateTimeRange(now.weekStart.dayStart, now.weekEnd.dayEnd) },
				{ label: t('Next week'), value: new DateTimeRange(now.add({ weeks: 1 }).weekStart.dayStart, now.add({ weeks: 1 }).weekEnd.dayEnd) },
				lastDays(7),
				lastDays(30),
				lastDays(90),
			],
			this.precision < FieldDateTimePrecision.Month ? [] : [
				{ label: t('Last month'), value: new DateTimeRange(now.add({ months: -1 }).monthStart.dayStart, now.add({ months: -1 }).monthEnd.dayEnd) },
				{ label: t('This month'), value: new DateTimeRange(now.monthStart.dayStart, now.monthEnd.dayEnd) },
				{ label: t('Next month'), value: new DateTimeRange(now.add({ months: 1 }).monthStart.dayStart, now.add({ months: 1 }).monthEnd.dayEnd) },
			],
			[
				{ label: t('Last year'), value: new DateTimeRange(now.add({ years: -1 }).yearStart.dayStart, now.add({ years: -1 }).yearEnd.dayEnd) },
				{ label: t('This year'), value: new DateTimeRange(now.yearStart.dayStart, now.yearEnd.dayEnd) },
				{ label: t('Next year'), value: new DateTimeRange(now.add({ years: 1 }).yearStart.dayStart, now.add({ years: 1 }).yearEnd.dayEnd) },
			],
		]
	}
}