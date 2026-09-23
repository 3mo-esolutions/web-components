import { Controller, type ReactiveControllerHost } from '@a11d/lit'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import { DateTimeSegmentsController, type DateTimeSegmentsControllerOptions, type HourCycle } from '../segments/index.js'

export type FieldDateTimeControllerOptions<T> = {
	readonly value?: T
	/** Defaults to 'minute'. */
	readonly precision?: FieldDateTimePrecision
	/** Defaults to the language's convention. */
	readonly hourCycle?: HourCycle
	/** Where the units the user leaves out are taken from, and what relative shortcuts count from. Defaults to now. */
	readonly referenceDate?: DateTime
	/** The earliest date which may be chosen, inclusive. */
	readonly min?: DateTime
	/** The latest date which may be chosen, inclusive. */
	readonly max?: DateTime
	readonly dateDisabled?: (date: DateTime) => boolean
	/** The field's name, appended to every segment's own. */
	readonly label?: string
	readonly disabled?: boolean
	readonly readonly?: boolean
	readonly required?: boolean
	readonly invalid?: boolean
	/** Fired while editing, once every unit is filled. */
	handleInput?(value: T | undefined): void
	/** Fired on commit: leaving the segments, Enter, a shortcut, or a date picked. */
	handleChange?(value: T | undefined): void
	/** Alt+ArrowDown in the segments, as on a native date input. Left out, the field has no picker. */
	handlePickerOpen?(): void
}

export type FieldDateTimePreset<T> = {
	readonly label: string
	readonly value: T
}

export type FieldDateTimeControllerOptionsOrFactory<T, THost> = FieldDateTimeControllerOptions<T> | ((host: THost) => FieldDateTimeControllerOptions<T>)

/** What one group of segments is told beyond what the field tells every group. */
type SegmentsBinding = Pick<DateTimeSegmentsControllerOptions, 'value' | 'handleInput' | 'handleChange' | 'handleFocusChange' | 'handleMoveBeyond' | 'parseShortcut'>

/**
 * What every date field does, whether it holds one date or a range: the groups of segments, where a
 * picker stands and what picking in it means, the presets it offers, and the field's validity.
 *
 * @ssr false
 */
export abstract class FieldDateTimeControllerBase<T, THost extends ReactiveControllerHost = ReactiveControllerHost> extends Controller implements EventListenerObject {
	protected readonly options: FieldDateTimeControllerOptions<T>

	private customValidity = ''
	private navigatedValue?: T
	private _navigationDate?: DateTime

	constructor(protected override readonly host: THost, options: FieldDateTimeControllerOptionsOrFactory<T, THost>) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
	}

	/** Every group of segments the field renders, in order. */
	protected abstract get segmentsControllers(): ReadonlyArray<DateTimeSegmentsController<THost>>

	/** The date a picker marks and scrolls to. */
	abstract get selectedDate(): DateTime | undefined

	/** The dates a calendar marks. */
	abstract get calendarValue(): DateTimeRange | undefined

	/** Commits a date chosen in a picker, at the precision it was chosen at: a day in a calendar, or an hour in a list. */
	abstract pick(date: DateTime, precision: FieldDateTimePrecision): void

	protected abstract datesOf(value: T): ReadonlyArray<DateTime>

	protected abstract get defaultPresets(): ReadonlyArray<ReadonlyArray<FieldDateTimePreset<T>>>

	get precision() {
		return this.options.precision ?? FieldDateTimePrecision.Minute
	}

	/** Where a picker stands: at the selected date, until it is scrolled elsewhere, and back there whenever the value changes. */
	get navigationDate() {
		return this._navigationDate ??= this.selectedDate ?? new DateTime()
	}

	set navigationDate(value) {
		this._navigationDate = value
		this.host.requestUpdate()
	}

	protected resetNavigationDate(date = this.selectedDate) {
		this._navigationDate = date
	}

	/** The presets a picker offers, in groups, leaving out any the field would refuse. */
	get presets(): ReadonlyArray<ReadonlyArray<FieldDateTimePreset<T>>> {
		return this.defaultPresets
			.map(group => group.filter(preset => !this.isDisabled(preset.value)))
			.filter(group => group.length > 0)
	}

	/** Whether the field shows anything: a value, or units typed on the way to one. */
	get isPopulated() {
		return this.hasValue || this.segmentsControllers.some(segments => !segments.isEmpty)
	}

	private get hasValue() {
		return this.options.value !== undefined && this.datesOf(this.options.value).length > 0
	}

	/** Whether the value holds a date before `min`, after `max`, or refused by `dateDisabled`. */
	isDisabled(value: T) {
		const { min, max, dateDisabled } = this.options
		const precision = this.precision > FieldDateTimePrecision.Day ? FieldDateTimePrecision.Day : this.precision
		return this.datesOf(value).some(date =>
			(!!min && precision.isSmallerThan(date, min) && !precision.equals(date, min))
			|| (!!max && precision.isSmallerThan(max, date) && !precision.equals(max, date))
			|| (dateDisabled?.(date) ?? false)
		)
	}

	override hostUpdate() {
		if (this.options.value !== this.navigatedValue) {
			this.navigatedValue = this.options.value
			this.resetNavigationDate()
		}
	}

	// Idempotent for one and the same listener, so re-declaring it on every update costs nothing.
	override hostUpdated() {
		for (const segments of this.segmentsControllers) {
			segments.group.value?.addEventListener('keydown', this)
		}
	}

	handleEvent(event: Event) {
		const { key, altKey } = event as KeyboardEvent
		if (altKey && key === 'ArrowDown' && this.options.handlePickerOpen) {
			event.preventDefault()
			this.options.handlePickerOpen()
		}
	}

	focus() {
		this.segmentsControllers[0]?.focus()
	}

	setCustomValidity(message: string) {
		this.customValidity = message
	}

	checkValidity() {
		const { value, required } = this.options
		return !this.customValidity
			&& !(required && !this.hasValue)
			&& !(value !== undefined && this.isDisabled(value))
	}

	protected createSegments(binding: (controller: this) => SegmentsBinding) {
		const controller = this
		const bound = binding(this)
		return new DateTimeSegmentsController<THost>(this.host, {
			get value() { return bound.value },
			get precision() { return controller.precision },
			get referenceDate() { return controller.options.referenceDate },
			get hourCycle() { return controller.options.hourCycle },
			get label() { return controller.options.label },
			get disabled() { return controller.options.disabled },
			get readonly() { return controller.options.readonly },
			get required() { return controller.options.required },
			get invalid() { return controller.options.invalid },
			handleInput: bound.handleInput,
			handleChange: bound.handleChange,
			handleFocusChange: bound.handleFocusChange,
			handleMoveBeyond: bound.handleMoveBeyond,
			parseShortcut: bound.parseShortcut,
		})
	}
}