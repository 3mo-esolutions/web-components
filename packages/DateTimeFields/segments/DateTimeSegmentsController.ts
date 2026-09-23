import { Controller, type ReactiveControllerHost } from '@a11d/lit'
import { Localizer, type LanguageCode } from '@3mo/localization'
import { SegmentedInputController, type SegmentedInputStep } from '@3mo/segmented-input'
import { type FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import { type DateTimeSegment, type EditableDateTimeSegment, type EditableDateTimeSegmentType } from './DateTimeSegment.js'
import { DateTimeSegmenter, type HourCycle } from './DateTimeSegmenter.js'

Localizer.dictionaries.add('de', {
	'Empty': 'Leer',
})

export type DateTimeSegmentsControllerOptions = {
	readonly value?: DateTime
	readonly precision: FieldDateTimePrecision
	/** Completes the units the user leaves out, and anchors relative shortcuts. Defaults to now. */
	readonly referenceDate?: DateTime
	readonly language?: LanguageCode
	readonly calendar?: string
	readonly timeZone?: string
	readonly hourCycle?: HourCycle
	readonly timeOnly?: boolean
	/** The field's label, appended to every segment's own name. */
	readonly label?: string
	readonly disabled?: boolean
	readonly readonly?: boolean
	readonly required?: boolean
	readonly invalid?: boolean
	/** Fired while editing, once every unit is filled and the value differs. */
	handleInput?(value: DateTime | undefined): void
	/** Fired on commit — leaving the group, Enter, a shortcut or a paste. */
	handleChange?(value: DateTime | undefined): void
	handleFocusChange?(focused: boolean): void
	/** Fired when the focus would move past the first or last segment. */
	handleMoveBeyond?(direction: -1 | 1): void
	/** Resolves a typed shortcut ("+1", "h", "adw") or pasted text to a value. Defaults to `DateTime.parseAsDateTime`. */
	parseShortcut?(text: string, referenceDate: DateTime): DateTime | undefined
}

type OptionsOrFactory<THost> = DateTimeSegmentsControllerOptions | ((host: THost) => DateTimeSegmentsControllerOptions)

/**
 * A segmented input whose units are the units of a date: one focusable spinbutton each, edited by
 * typing digits in the language's own numbering system or by stepping through the calendar.
 *
 * ```html
 * <div ${this.segments.group.ref()}>
 *     ${this.segments.segments.map(segment => html`<span ${this.segments.segment.ref(segment)}></span>`)}
 * </div>
 * ```
 */
export class DateTimeSegmentsController<THost extends ReactiveControllerHost = ReactiveControllerHost> extends Controller {
	protected readonly options: DateTimeSegmentsControllerOptions

	private _segmenter?: DateTimeSegmenter
	private date!: DateTime
	private filled = new Set<EditableDateTimeSegmentType>()
	private syncedValue?: number

	readonly input: SegmentedInputController<DateTimeSegment, THost>

	constructor(protected override readonly host: THost, options: OptionsOrFactory<THost>) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		this.sync()
		const controller = this
		this.input = new SegmentedInputController<DateTimeSegment, THost>(host, {
			get segments() { return controller.segments },
			get direction() { return controller.segmenter.direction },
			get label() { return controller.options.label },
			get description() { return controller.isEmpty ? undefined : controller.segmenter.describe(controller.date) },
			get disabled() { return controller.options.disabled },
			get readonly() { return controller.options.readonly },
			get required() { return controller.options.required },
			get invalid() { return controller.options.invalid },
			accept: (segment, typed, character) => controller.accept(segment, typed, character),
			isComplete: (segment, text) => controller.isSegmentComplete(segment, text),
			handleSegmentInput: (segment, text) => text ? controller.handleSegmentInput(segment, text) : controller.clearSegment(segment.type),
			handleStep: (segment, step) => controller.handleStep(segment, step),
			// Every keyword resolves to a day, which a time-only field cannot show.
			get handleShortcut() { return controller.options.timeOnly && !controller.options.parseShortcut ? undefined : (text: string) => controller.applyShortcut(text) },
			handleCommit: () => controller.handleCommit(),
			handleFocusChange: focused => controller.options.handleFocusChange?.(focused),
			handleMoveBeyond: direction => controller.options.handleMoveBeyond?.(direction),
			stamp: (element, segment) => controller.stamp(element, segment),
		})
	}

	get segmenter() {
		const segmenter = new DateTimeSegmenter({
			precision: this.options.precision,
			language: this.options.language,
			calendar: this.options.calendar,
			// The reference's zone, never the value's: a zone which flips between commits would move the wall time.
			timeZone: this.options.timeZone ?? this.options.referenceDate?.timeZoneId,
			hourCycle: this.options.hourCycle,
			timeOnly: this.options.timeOnly,
		})
		if (this._segmenter?.key !== segmenter.key) {
			this._segmenter = segmenter
			if (this.date) {
				this.date = segmenter.adopt(this.date)
			}
		}
		return this._segmenter!
	}

	get segments(): ReadonlyArray<DateTimeSegment> {
		return this.segmenter.segments(this.date, this.filled)
	}

	/** The reference the unfilled units are taken from. */
	get referenceDate() {
		return this.segmenter.adopt(this.options.referenceDate ?? new DateTime)
	}

	get isEmpty() {
		return this.filled.size === 0
	}

	get isComplete() {
		return this.segmenter.types.every(type => this.filled.has(type))
	}

	/** The value the filled units describe, normalized to the precision; undefined while a unit is missing. */
	get value(): DateTime | undefined {
		return this.isComplete ? this.normalize(this.date) : undefined
	}

	private get editable() {
		return !this.options.disabled && !this.options.readonly
	}

	// #region Parts

	get group() {
		return this.input.group
	}

	get segment() {
		return this.input.segment
	}

	focus(type?: EditableDateTimeSegmentType) {
		this.input.focus(type)
	}

	focusFirst() {
		this.input.focusFirst()
	}

	focusLast() {
		this.input.focusLast()
	}

	// #endregion

	override hostUpdate() {
		this.sync()
	}

	private sync() {
		const value = this.options.value
		const segmenter = this.segmenter
		if (value?.valueOf() !== this.syncedValue || !this.date) {
			this.syncedValue = value?.valueOf()
			this.date = value ? segmenter.adopt(value) : this.referenceDate
			this.filled = new Set(value ? segmenter.types : [])
		} else if (this.filled.size === 0) {
			this.date = this.referenceDate
		}
	}

	private normalize(date: DateTime) {
		const precision = this.options.precision
		return this.segmenter.adopt(precision.key === 'week' ? date.weekStart.dayStart : precision.getRange(date).start!)
	}

	// #region Editing

	/** A digit which would take the unit past its largest value starts it over: a month holding "1" typed "3" reads "3". */
	private accept(segment: EditableDateTimeSegment, typed: string, character: string) {
		if (segment.type === 'dayPeriod') {
			const period = this.segmenter.dayPeriodOf(character)
			return period === undefined ? undefined : String(period)
		}
		const digit = this.segmenter.digitOf(character)
		if (digit === undefined) {
			return undefined
		}
		const text = typed + digit
		return Number(text) > (segment.max ?? Infinity) ? String(digit) : text
	}

	private isSegmentComplete(segment: EditableDateTimeSegment, text: string) {
		const max = segment.max ?? 0
		return Number(text) * 10 > max || text.length >= String(max).length
	}

	/** Sets the unit, unless what is typed so far is not yet a value it could hold — "0" of "05". */
	private handleSegmentInput(segment: EditableDateTimeSegment, text: string) {
		const value = Number(text)
		if (!isNaN(value) && value >= (segment.min ?? 0)) {
			this.set(segment.type, value)
		}
	}

	private handleStep(segment: EditableDateTimeSegment, step: SegmentedInputStep) {
		const type = segment.type
		const page = DateTimeSegmenter.pageSteps[type] ?? 1
		switch (step) {
			case 'increment': return this.step(type, 1)
			case 'decrement': return this.step(type, -1)
			case 'incrementPage': return this.step(type, page)
			case 'decrementPage': return this.step(type, -page)
			case 'min': return this.set(type, this.segmenter.limits(this.date, type).min)
			case 'max': return this.set(type, this.segmenter.limits(this.date, type).max)
		}
	}

	private set(type: EditableDateTimeSegmentType, value: number) {
		if (!this.editable) {
			return
		}
		this.date = this.segmenter.set(this.date, type, value)
		this.filled.add(type)
		this.edited()
	}

	private step(type: EditableDateTimeSegmentType, delta: number) {
		if (!this.editable) {
			return
		}
		if (this.filled.has(type)) {
			this.date = this.segmenter.step(this.date, type, delta)
		}
		this.filled.add(type)
		this.edited()
	}

	private clearSegment(type: EditableDateTimeSegmentType) {
		this.filled.delete(type)
		this.date = this.segmenter.set(this.date, type, this.segmenter.valueOf(this.referenceDate, type))
		this.edited()
	}

	private replace(date: DateTime) {
		this.date = this.segmenter.adopt(date)
		this.filled = new Set(this.segmenter.types)
		this.edited()
	}

	private lastInput?: number
	private edited() {
		const value = this.value
		// A unit still being typed ("202" of "2026") is not a value anyone wants to hear about yet.
		if (!this.input.typedText && value && value.valueOf() !== this.lastInput && value.valueOf() !== this.options.value?.valueOf()) {
			this.lastInput = value.valueOf()
			this.options.handleInput?.(value)
		}
	}

	// #endregion

	private applyShortcut(text: string) {
		const parsed = this.options.parseShortcut
			? this.options.parseShortcut(text, this.referenceDate)
			: DateTime.parseAsDateTime(text, this.referenceDate)
		if (parsed) {
			this.replace(parsed)
		} else {
			// The host may have taken the value itself (a range keyword sets both ends); follow it.
			this.sync()
		}
		return true
	}

	private handleCommit() {
		let value: DateTime | undefined
		if (!this.isEmpty) {
			this.filled = new Set(this.segmenter.types)
			value = this.value
		}
		if (value?.valueOf() !== this.options.value?.valueOf()) {
			this.syncedValue = value?.valueOf()
			this.lastInput = value?.valueOf()
			this.options.handleChange?.(value)
		}
	}

	private stamp(element: HTMLElement, segment: EditableDateTimeSegment) {
		segment.filled ? element.setAttribute('aria-valuenow', String(segment.value)) : element.removeAttribute('aria-valuenow')
		element.setAttribute('aria-valuemin', String(segment.min))
		element.setAttribute('aria-valuemax', String(segment.max))
		element.setAttribute('aria-valuetext', segment.filled ? segment.valueText ?? segment.text : String(t('Empty')))
	}

	commit() {
		this.input.commit()
	}

	/** Empties every segment and clears the host's value. */
	clear() {
		this.filled = new Set()
		this.date = this.referenceDate
		this.input.commit()
	}
}