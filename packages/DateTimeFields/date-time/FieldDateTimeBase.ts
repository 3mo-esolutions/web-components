import { cache, css, html, join, property, style, bind, query, ifDefined, type HTMLTemplateResult } from '@a11d/lit'
import { hasChanged } from '@a11d/equals'
import { FieldComponent } from '@3mo/field'
import { type MaterialIcon } from '@3mo/icon'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import { dateTimeConverter } from '../dateTimeConverter.js'
import { type FieldDateTimeControllerBase, type FieldDateTimeControllerOptions } from './FieldDateTimeControllerBase.js'
import { hourCycleConverter, segmentsStyles, type DateTimeSegmentsController, type HourCycle } from '../segments/index.js'
import type { Calendar } from '../selection/index.js'

/**
 * @attr open - Whether the date picker is open
 * @attr pickerHidden - Hide the date picker
 * @attr dense - Whether the field is dense
 * @attr shortcutReferenceDate - The date to use as a reference for shortcuts and for the units the user leaves out
 * @attr precision - The precision of the date picker. Defaults to 'minute'
 * @attr hourCycle - The hour cycle of the time segments ('h11', 'h12', 'h23' or 'h24'). Defaults to the language's convention.
 * @attr min - The minimum selectable date (inclusive). Dates before this are disabled.
 * @attr max - The maximum selectable date (inclusive). Dates after this are disabled.
 * @attr dateDisabled - A function that determines whether a date should be disabled. Receives a DateTime object and should return a boolean.
 *
 * @csspart segments - The group of segments making up one date-time value
 * @csspart segment - An editable unit of the value
 * @csspart literal - A separator between the units
 */
export abstract class FieldDateTimeBase<T> extends FieldComponent<T> {
	@property({ type: Boolean, reflect: true }) open = false
	@property({ type: Boolean }) pickerHidden = false
	@property({ type: Boolean }) dense = false
	@property({ type: Object, converter: dateTimeConverter }) shortcutReferenceDate = new DateTime()
	@property({ type: String, converter: value => FieldDateTimePrecision.parse(value || undefined) }) precision = FieldDateTimePrecision.Minute
	@property({ type: String, converter: hourCycleConverter }) hourCycle?: HourCycle
	@property({ type: Object, converter: dateTimeConverter }) min?: DateTime
	@property({ type: Object, converter: dateTimeConverter }) max?: DateTime
	@property({ type: Object, hasChanged }) dateDisabled?: (date: DateTime) => boolean

	@query('mo-calendar') protected readonly calendar?: Calendar

	/** The field's behaviour, for a date field of another design. */
	abstract readonly controller: FieldDateTimeControllerBase<NonNullable<T>>

	/** What the controller is told: the field's own properties and events. */
	protected get controllerOptions(): FieldDateTimeControllerOptions<NonNullable<T>> {
		const field = this
		return {
			get value() { return field.value ?? undefined },
			get precision() { return field.precision },
			get hourCycle() { return field.hourCycle },
			get referenceDate() { return field.shortcutReferenceDate },
			get min() { return field.min },
			get max() { return field.max },
			get dateDisabled() { return field.dateDisabled },
			get label() { return field._label },
			get disabled() { return field.disabled },
			get readonly() { return field.readonly },
			get required() { return field.required },
			get invalid() { return field.invalid },
			get handlePickerOpen() { return field.pickerHidden ? undefined : () => field.open = true },
			handleInput: value => field.handleInput(value),
			handleChange: value => field.handleChange(value),
		}
	}

	protected override connected() {
		Localizer.languages.change.subscribe(this.handleLanguageChange)
	}

	protected override disconnected() {
		Localizer.languages.change.unsubscribe(this.handleLanguageChange)
	}

	private handleLanguageChange = () => {
		this.controller.navigationDate = new DateTime(this.controller.navigationDate)
	}

	protected readonly calendarIconButtonIcon: MaterialIcon = 'today'

	protected override get isActive() {
		return super.isActive || this.open
	}

	protected override get isDense() {
		return this.dense
	}

	protected override get isPopulated() {
		return this.controller.isPopulated
	}

	override focus() {
		this.controller.focus()
	}

	override blur() {
		(this.shadowRoot?.activeElement as HTMLElement | null)?.blur()
	}

	override setCustomValidity(error: string) {
		this.controller.setCustomValidity(error)
	}

	override async checkValidity() {
		await this.updateComplete
		return this.controller.checkValidity()
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
				anchor-name: --mo-field-date-time;
			}

			mo-popover {
				position-anchor: --mo-field-date-time;
				position-visibility: anchors-visible;
				background: var(--mo-color-background);
				box-shadow: var(--mo-shadow);
				border-radius: var(--mo-border-radius);
				color: var(--mo-color-foreground);
				font-size: 0.875em;
			}

			#selector {
				height: clamp(175px, 100vh, 450px);
			}

			.timezone {
				padding: 0.4rem;
				font-size: small;
				text-align: center;
				font-weight: 500;
				color: var(--mo-color-gray);
			}

			${segmentsStyles}

			#presets {
				background-color: var(--mo-color-transparent-gray-1);
				mo-list-item {
					padding-block: 0.5rem;
					min-height: auto;
					opacity: 0.9;
				}
			}
		`
	}

	protected override get template() {
		return html`
			${super.template}
			${this.popoverTemplate}
		`
	}

	protected override get endSlotTemplate() {
		return html`
			${super.endSlotTemplate}
			${this.clearIconButtonTemplate}
			${this.calendarIconButtonTemplate}
		`
	}

	protected override get inputTemplate() {
		return this.segmentsTemplate
	}

	protected abstract get segmentsTemplate(): HTMLTemplateResult

	protected getSegmentsTemplate(controller: DateTimeSegmentsController, range?: 'start' | 'end') {
		return html`
			<div part='segments' data-range=${ifDefined(range)} ${controller.group.ref()}>
				${controller.segments.map(segment => html`<span part=${segment.editable ? 'segment' : 'literal'} ${controller.segment.ref(segment)}></span>`)}
			</div>
		`
	}

	private get clearIconButtonTemplate() {
		const clear = (e: PointerEvent) => {
			e.stopPropagation()
			this.handleInput(undefined)
			this.handleChange(undefined)
		}
		return !this.value || !this.focusController.focused ? html.nothing : html`
			<mo-icon-button tabindex='-1' dense slot='end' icon='cancel'
				@click=${clear}
				${style({ color: 'var(--mo-color-gray)', fontSize: '20px', cursor: 'pointer', userSelect: 'none', marginBlockStart: '2.75px', marginInlineEnd: '5px' })}
			></mo-icon-button>
		`
	}

	protected get calendarIconButtonTemplate() {
		return this.pickerHidden ? html.nothing : html`
			<mo-icon id='picker' tabindex='-1' slot='end'
				icon=${this.calendarIconButtonIcon}
				${style({ color: this.isActive ? 'var(--mo-color-accent)' : 'var(--mo-color-gray)', fontSize: '22px', marginBlockStart: '2px', cursor: 'pointer', userSelect: 'none' })}
			></mo-icon>
		`
	}

	protected get popoverTemplate() {
		return this.pickerHidden ? html.nothing : html`
			<mo-popover tabindex='-1'
				.anchor=${this} target='picker'
				?open=${bind(this, 'open', { sourceUpdated: () => setTimeout(() => this.calendar?.setNavigatingValue(this.controller.navigationDate)) })}
			>
				${cache(!this.open ? html.nothing : html`
					<mo-flex direction='horizontal'>
						${this.presetsTemplate === html.nothing ? html.nothing : html`
							<mo-flex id='presets'>
								${this.presetsTemplate}
							</mo-flex>
						`}
						${this.popoverSelectionTemplate}
					</mo-flex>
				`)}
			</mo-popover>
		`
	}

	protected get popoverSelectionTemplate() {
		return html`
			<mo-flex id='selector' direction='horizontal' style='flex: 1'>
				${this.dateTemplate}
				${this.timeTemplate}
			</mo-flex>
		`
	}

	protected get presetsTemplate(): HTMLTemplateResult {
		const groups = this.controller.presets
		return !groups.length ? html.nothing : join(
			groups.map(group => html`${group.map(preset => this.getPresetTemplate(preset.label, () => preset.value))}`),
			html`<mo-line></mo-line>`
		) as unknown as HTMLTemplateResult
	}

	protected getPresetTemplate(label: string, value: () => T) {
		const v = value()
		if (v !== undefined && v !== null && this.controller.isDisabled(v)) {
			return html.nothing
		}
		const handlePresetClick = () => {
			this.handleChange(v)
			this.calendar?.setNavigatingValue(v instanceof DateTimeRange ? v.start! : v instanceof DateTime ? v : undefined!, 'smooth')
		}
		return html`<mo-list-item @click=${handlePresetClick}>${label}</mo-list-item>`
	}

	protected get dateTemplate() {
		return this.calendarTemplate
	}

	protected get calendarTemplate() {
		return html`
			<mo-calendar
				.precision=${this.precision > FieldDateTimePrecision.Day ? FieldDateTimePrecision.Day : this.precision}
				.value=${this.controller.calendarValue}
				.min=${this.min}
				.max=${this.max}
				.dateDisabled=${this.dateDisabled}
				@dateClick=${(e: CustomEvent<DateTime>) => this.controller.pick(e.detail, this.precision)}
			></mo-calendar>
		`
	}

	private get timeTemplate() {
		const { navigationDate } = this.controller
		return this.precision <= FieldDateTimePrecision.Day ? html.nothing : html`
			<mo-flex gap='0.5rem' style='border-inline-start: 1px solid var(--mo-color-transparent-gray-3); min-height: 0'>
				<mo-flex direction='horizontal' style='flex: 1; min-height: 0'>
					${this.getTimeListTemplate(FieldDateTimePrecision.Hour)}
					${this.getTimeListTemplate(FieldDateTimePrecision.Minute)}
					${this.getTimeListTemplate(FieldDateTimePrecision.Second)}
				</mo-flex>
				<div class='timezone' title=${ifDefined(navigationDate.formatToParts({ timeZoneName: 'long' }).find(x => x.type === 'timeZoneName')?.value)}>
					${navigationDate.formatToParts({ timeZoneName: 'shortOffset' }).find(x => x.type === 'timeZoneName')?.value}
				</div>
			</mo-flex>
		`
	}

	private getTimeListTemplate(precision: FieldDateTimePrecision) {
		if (this.precision < precision) {
			return html.nothing
		}
		const { controller } = this
		const navigate = (e: CustomEvent<DateTime>) => controller.navigationDate = e.detail
		const pick = (e: CustomEvent<DateTime>) => controller.pick(e.detail, precision)
		switch (precision) {
			case FieldDateTimePrecision.Hour: return html`
				<mo-hour-list style='flex: 1' .hourCycle=${this.hourCycle} .navigationDate=${controller.navigationDate} .value=${controller.selectedDate} @navigate=${navigate} @change=${pick}></mo-hour-list>
			`
			case FieldDateTimePrecision.Minute: return html`
				<mo-minute-list style='flex: 1' .navigationDate=${controller.navigationDate} .value=${controller.selectedDate} @navigate=${navigate} @change=${pick}></mo-minute-list>
			`
			default: return html`
				<mo-second-list style='flex: 1' .navigationDate=${controller.navigationDate} .value=${controller.selectedDate} @navigate=${navigate} @change=${pick}></mo-second-list>
			`
		}
	}
}