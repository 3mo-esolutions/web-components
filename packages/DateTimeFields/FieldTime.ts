import { bind, cache, component, css, html, property, state, style } from '@a11d/lit'
import { FieldComponent } from '@3mo/field'
import { Localizer } from '@3mo/localization'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'
import { dateTimeConverter } from './FieldDateTimeBase.js'
import { DateTimeSegmentsController, hourCycleConverter, segmentsStyles, type HourCycle } from './segments/index.js'

Localizer.dictionaries.add('de', {
	'Time': 'Uhrzeit',
})

const timePattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/

/**
 * A time-of-day field. Its value is the 24-hour `HH:mm` (or `HH:mm:ss` at second precision) string the
 * native time input uses, so that it drops in where one was, while the segments follow the language's
 * own clock — "02:07 PM" for English, "14:07" for German — and the popover offers the hour and minute wheels.
 *
 * @element mo-field-time
 *
 * @attr value - The time as `HH:mm` or `HH:mm:ss`
 * @attr open - Whether the time picker is open
 * @attr pickerHidden - Hide the time picker
 * @attr dense - Whether the field is dense
 * @attr precision - 'minute' (default) or 'second'
 * @attr hourCycle - The hour cycle of the segments ('h11', 'h12', 'h23' or 'h24'). Defaults to the language's convention.
 * @attr shortcutReferenceDate - The date the units the user leaves out are taken from. Defaults to now.
 *
 * @csspart segments - The group of segments making up the time
 * @csspart segment - An editable unit of the time
 * @csspart literal - A separator between the units
 *
 * @i18n "Time"
 */
@component('mo-field-time')
export class FieldTime extends FieldComponent<string> {
	@property() override label = t('Time')
	@property() value?: string
	@property({ type: Boolean, reflect: true }) open = false
	@property({ type: Boolean }) pickerHidden = false
	@property({ type: Boolean }) dense = false
	@property({ type: String, converter: value => FieldDateTimePrecision.parse(value || undefined) }) precision = FieldDateTimePrecision.Minute
	@property({ type: String, converter: hourCycleConverter }) hourCycle?: HourCycle
	@property({ type: Object, converter: dateTimeConverter }) shortcutReferenceDate = new DateTime()

	@state() navigationDate = new DateTime()

	readonly segments = new DateTimeSegmentsController(this, host => ({
		timeOnly: true,
		get value() { return host.selectedDate },
		get precision() { return host.precision },
		get referenceDate() { return host.shortcutReferenceDate },
		get hourCycle() { return host.hourCycle },
		get label() { return host._label },
		get disabled() { return host.disabled },
		get readonly() { return host.readonly },
		get required() { return host.required },
		get invalid() { return host.invalid },
		handleInput: value => host.handleInput(host.toValue(value)),
		handleChange: value => host.handleChange(host.toValue(value)),
	}))

	/** Alt+ArrowDown opens the picker, as it does on a native date-time input. */
	protected handlePickerKey(event: KeyboardEvent) {
		if (event.altKey && event.key === 'ArrowDown' && !this.pickerHidden) {
			event.preventDefault()
			this.open = true
		}
	}

	/** The value as a time on the reference day, which is all the segments need to render and edit it. */
	get selectedDate(): DateTime | undefined {
		const match = this.value?.match(timePattern)
		if (!match) {
			return undefined
		}
		const [, hour, minute, second] = match.map(Number)
		return this.shortcutReferenceDate.dayStart.with({ hour, minute, second: second || 0 })
	}

	protected toValue(date: DateTime | undefined) {
		if (!date) {
			return undefined
		}
		const pad = (value: number) => String(value).padStart(2, '0')
		const time = `${pad(date.hour)}:${pad(date.minute)}`
		return this.precision >= FieldDateTimePrecision.Second ? `${time}:${pad(date.second)}` : time
	}

	protected override valueUpdated() {
		super.valueUpdated()
		this.navigationDate = this.selectedDate ?? new DateTime()
	}

	protected override get isActive() {
		return super.isActive || this.open
	}

	protected override get isDense() {
		return this.dense
	}

	protected override get isPopulated() {
		return !!this.value || !this.segments.isEmpty
	}

	override focus() {
		this.segments.focus()
	}

	private customValidity = ''

	override setCustomValidity(error: string) {
		this.customValidity = error
	}

	override async checkValidity() {
		await this.updateComplete
		return !this.customValidity && !(this.required && !this.value)
	}

	override reportValidity() {
		this.focus()
	}

	static override get styles() {
		return css`
			${super.styles}

			:host {
				position: relative;
			}

			:host([disabled]) {
				pointer-events: none;
			}

			mo-field {
				anchor-name: --mo-field-time;
			}

			mo-popover {
				position-anchor: --mo-field-time;
				position-visibility: anchors-visible;
				background: var(--mo-color-background);
				box-shadow: var(--mo-shadow);
				border-radius: var(--mo-border-radius);
				color: var(--mo-color-foreground);
				font-size: 0.875em;
			}

			#selector {
				height: clamp(175px, 100vh, 300px);
			}

			${segmentsStyles}
		`
	}

	protected override get template() {
		return html`
			${super.template}
			${this.popoverTemplate}
		`
	}

	protected override get inputTemplate() {
		return html`
			<div part='segments' @keydown=${(e: KeyboardEvent) => this.handlePickerKey(e)} ${this.segments.group.ref()}>
				${this.segments.segments.map(segment => html`<span part=${segment.editable ? 'segment' : 'literal'} ${this.segments.segment.ref(segment)}></span>`)}
			</div>
		`
	}

	protected override get endSlotTemplate() {
		return html`
			${super.endSlotTemplate}
			${this.pickerHidden ? html.nothing : html`
				<mo-icon id='picker' slot='end' icon='schedule'
					${style({ color: this.isActive ? 'var(--mo-color-accent)' : 'var(--mo-color-gray)', cursor: 'pointer', userSelect: 'none' })}
				></mo-icon>
			`}
		`
	}

	protected get popoverTemplate() {
		return this.pickerHidden ? html.nothing : html`
			<mo-popover tabindex='-1' .anchor=${this} target='picker' ?open=${bind(this, 'open')}>
				${cache(!this.open ? html.nothing : html`
					<mo-flex id='selector' direction='horizontal'>
						<mo-hour-list style='flex: 1'
							.hourCycle=${this.hourCycle}
							.navigationDate=${bind(this, 'navigationDate')}
							.value=${this.selectedDate}
							@change=${(e: CustomEvent<DateTime>) => this.handleListChange(e.detail)}
						></mo-hour-list>
						<mo-minute-list style='flex: 1'
							.navigationDate=${bind(this, 'navigationDate')}
							.value=${this.selectedDate}
							@change=${(e: CustomEvent<DateTime>) => this.handleListChange(e.detail)}
						></mo-minute-list>
						${this.precision < FieldDateTimePrecision.Second ? html.nothing : html`
							<mo-second-list style='flex: 1'
								.navigationDate=${bind(this, 'navigationDate')}
								.value=${this.selectedDate}
								@change=${(e: CustomEvent<DateTime>) => this.handleListChange(e.detail)}
							></mo-second-list>
						`}
					</mo-flex>
				`)}
			</mo-popover>
		`
	}

	private handleListChange(date: DateTime) {
		this.handleChange(this.toValue(date))
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-time': FieldTime
	}
}