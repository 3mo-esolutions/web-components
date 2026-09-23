import { Controller, type ReactiveControllerHost } from '@a11d/lit'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'
import { DateTimeSegmentsController, type HourCycle } from './segments/index.js'

export type FieldTimeControllerOptions = {
	/** `HH:mm`, or `HH:mm:ss` at second precision: what a native time input holds. */
	readonly value?: string
	/** 'minute' (default) or 'second'. */
	readonly precision?: FieldDateTimePrecision
	/** Defaults to the language's convention. */
	readonly hourCycle?: HourCycle
	/** The day the time is edited on, and where the units the user leaves out are taken from. Defaults to now. */
	readonly referenceDate?: DateTime
	/** The field's name, appended to every segment's own. */
	readonly label?: string
	readonly disabled?: boolean
	readonly readonly?: boolean
	readonly required?: boolean
	readonly invalid?: boolean
	/** Fired while editing, once every unit is filled. */
	handleInput?(value: string | undefined): void
	/** Fired on commit: leaving the segments, Enter, or a time picked. */
	handleChange?(value: string | undefined): void
	/** Alt+ArrowDown in the segments, as on a native time input. Left out, the field has no picker. */
	handlePickerOpen?(): void
}

type OptionsOrFactory<THost> = FieldTimeControllerOptions | ((host: THost) => FieldTimeControllerOptions)

/**
 * Everything a time-of-day field does, for a host which only renders it: the segments, the value as the
 * `HH:mm` string of a native time input, where a picker stands, and the field's validity.
 *
 * ```html
 * <div ${this.controller.group.ref()}>
 *     ${this.controller.segments.segments.map(segment => html`<span ${this.controller.segment.ref(segment)}></span>`)}
 * </div>
 * ```
 *
 * A picker is the host's to render: it opens on `handlePickerOpen`, scrolls with `navigationDate` and
 * hands what was chosen to `pick`.
 *
 * @ssr false
 */
export class FieldTimeController<THost extends ReactiveControllerHost = ReactiveControllerHost> extends Controller implements EventListenerObject {
	private static readonly pattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/

	protected readonly options: FieldTimeControllerOptions

	readonly segments: DateTimeSegmentsController<THost>

	private customValidity = ''
	private navigatedValue?: string
	private _navigationDate?: DateTime

	constructor(protected override readonly host: THost, options: OptionsOrFactory<THost>) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		const controller = this
		this.segments = new DateTimeSegmentsController<THost>(host, {
			timeOnly: true,
			get value() { return controller.selectedDate },
			get precision() { return controller.precision },
			get referenceDate() { return controller.options.referenceDate },
			get hourCycle() { return controller.options.hourCycle },
			get label() { return controller.options.label },
			get disabled() { return controller.options.disabled },
			get readonly() { return controller.options.readonly },
			get required() { return controller.options.required },
			get invalid() { return controller.options.invalid },
			handleInput: value => controller.options.handleInput?.(controller.toValue(value)),
			handleChange: value => controller.options.handleChange?.(controller.toValue(value)),
		})
	}

	get group() {
		return this.segments.group
	}

	get segment() {
		return this.segments.segment
	}

	get precision() {
		return this.options.precision ?? FieldDateTimePrecision.Minute
	}

	/** The value as a time on the reference day, which is what the segments and a picker work with. */
	get selectedDate(): DateTime | undefined {
		const match = this.options.value?.match(FieldTimeController.pattern)
		if (!match) {
			return undefined
		}
		const [, hour, minute, second] = match.map(Number)
		return (this.options.referenceDate ?? new DateTime()).dayStart.with({ hour, minute, second: second || 0 })
	}

	/** Where a picker stands: at the value, until it is scrolled elsewhere, and back there whenever the value changes. */
	get navigationDate() {
		return this._navigationDate ??= this.selectedDate ?? new DateTime()
	}

	set navigationDate(value) {
		this._navigationDate = value
		this.host.requestUpdate()
	}

	/** Whether the field shows anything: a value, or units typed on the way to one. */
	get isPopulated() {
		return !!this.options.value || !this.segments.isEmpty
	}

	override hostUpdate() {
		if (this.options.value !== this.navigatedValue) {
			this.navigatedValue = this.options.value
			this._navigationDate = undefined
		}
	}

	// Idempotent for one and the same listener, so re-declaring it on every update costs nothing.
	override hostUpdated() {
		this.group.value?.addEventListener('keydown', this)
	}

	handleEvent(event: Event) {
		const { key, altKey } = event as KeyboardEvent
		if (altKey && key === 'ArrowDown' && this.options.handlePickerOpen) {
			event.preventDefault()
			this.options.handlePickerOpen()
		}
	}

	focus() {
		this.segments.focus()
	}

	/** Commits a time chosen outside the segments, e.g. in a picker. */
	pick(date: DateTime) {
		this.options.handleChange?.(this.toValue(date))
	}

	setCustomValidity(message: string) {
		this.customValidity = message
	}

	checkValidity() {
		return !this.customValidity && !(this.options.required && !this.options.value)
	}

	private toValue(date: DateTime | undefined) {
		if (!date) {
			return undefined
		}
		const pad = (value: number) => String(value).padStart(2, '0')
		const time = `${pad(date.hour)}:${pad(date.minute)}`
		return this.precision >= FieldDateTimePrecision.Second ? `${time}:${pad(date.second)}` : time
	}
}