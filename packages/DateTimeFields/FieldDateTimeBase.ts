
import { cache, css, html, live, property, style, bind, state, query, ifDefined, type HTMLTemplateResult } from '@a11d/lit'
import { InputFieldComponent } from '@3mo/field'
import { type MaterialIcon } from '@3mo/icon'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'
import type { Calendar } from './selection/index.js'

/**
 * @attr open - Whether the date picker is open
 * @attr pickerHidden - Hide the date picker
 * @attr shortcutReferenceDate - The date to use as a reference for shortcuts
 * @attr precision - The precision of the date picker. Defaults to 'minute'
 */
export abstract class FieldDateTimeBase<T> extends InputFieldComponent<T> {
	@property({ type: Boolean, reflect: true }) open = false
	@property({ type: Boolean }) pickerHidden = false
	@property({ type: Object }) shortcutReferenceDate = new DateTime
	@property({ type: String, converter: value => FieldDateTimePrecision.parse(value || undefined) }) precision = FieldDateTimePrecision.Minute

	@state() navigationDate = new DateTime()

	@query('mo-calendar') protected readonly calendar?: Calendar

	protected override connected() {
		Localizer.languages.change.subscribe(this.handleLanguageChange)
	}

	protected override disconnected() {
		Localizer.languages.change.unsubscribe(this.handleLanguageChange)
	}

	private handleLanguageChange = () => {
		this.navigationDate = new DateTime(this.navigationDate)
	}

	protected readonly calendarIconButtonIcon: MaterialIcon = 'today'

	protected abstract get selectedDate(): DateTime | undefined

	protected get formatOptions(): Intl.DateTimeFormatOptions {
		return {
			calendar: this.selectedDate?.calendarId,
			timeZone: this.selectedDate?.timeZoneId,
			...this.precision.formatOptions,
		}
	}

	protected override valueUpdated() {
		super.valueUpdated()
		this.resetNavigationDate()
	}

	protected abstract resetNavigationDate(): void

	protected override handleChange(value?: T, e?: Event) {
		super.handleChange(value, e)
		this.inputStringValue = this.valueToInputValue(value)
	}

	protected override get isActive() {
		return super.isActive || this.open
	}

	protected get placeholder() {
		return ''
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
				min-height: 175px;
			}

			.timezone {
				padding: 0.4rem;
				font-size: small;
				text-align: center;
				font-weight: 500;
				color: var(--mo-color-gray);
			}

			input::placeholder {
				color: transparent;
			}

			mo-field[active]:not([dense]) input::placeholder {
				color: var(--mo-color-gray);
			}

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
		return html`
			<input
				part='input'
				?readonly=${this.readonly}
				?required=${this.required}
				?disabled=${this.disabled}
				placeholder=${this.placeholder}
				.value=${live(this.inputStringValue || '')}
				@input=${(e: Event) => this.handleInput(this.inputValueToValue(this.inputElement.value || ''), e)}
				@change=${(e: Event) => this.handleChange(this.inputValueToValue(this.inputElement.value || ''), e)}
			>
		`
	}

	protected abstract inputValueToValue(value: string): T | undefined
	protected abstract override valueToInputValue(value: T | undefined): string

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
			<mo-icon tabindex='-1' slot='end'
				icon=${this.calendarIconButtonIcon}
				${style({ color: this.isActive ? 'var(--mo-color-accent)' : 'var(--mo-color-gray)', fontSize: '22px', marginBlockStart: '2px', cursor: 'pointer', userSelect: 'none' })}
			></mo-icon>
		`
	}

	protected get popoverTemplate() {
		return this.pickerHidden ? html.nothing : html`
			<mo-popover tabindex='-1'
				.anchor=${this} target='field'
				?open=${bind(this, 'open', { sourceUpdated: () => setTimeout(() => this.calendar?.setNavigatingValue(this.navigationDate)) })}
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
			<mo-flex id='selector' direction='horizontal' style='height: 100%; flex: 1'>
				${this.dateTemplate}
				${this.timeTemplate}
			</mo-flex>
		`
	}

	protected abstract get presetsTemplate(): HTMLTemplateResult

	protected getPresetTemplate(label: string, value: () => T) {
		const handlePresetClick = () => {
			const v = value()
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
				.value=${this.calendarValue}
				@dateClick=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, this.precision)}
			></mo-calendar>
		`
	}

	protected abstract get calendarValue(): DateTimeRange | undefined

	private get timeTemplate() {
		return this.precision <= FieldDateTimePrecision.Day ? html.nothing : html`
			<mo-flex gap='0.5rem' style='border-inline-start: 1px solid var(--mo-color-transparent-gray-3)'>
				<mo-flex direction='horizontal' style='flex: 1'>
					${this.hourListTemplate}
					${this.minuteListTemplate}
					${this.secondListTemplate}
				</mo-flex>
				<div class='timezone' title=${ifDefined(this.navigationDate?.formatToParts({ timeZoneName: 'long' }).find(x => x.type === 'timeZoneName')?.value)}>
					${this.navigationDate?.formatToParts({ timeZoneName: 'shortOffset' }).find(x => x.type === 'timeZoneName')?.value}
				</div>
			</mo-flex>
		`
	}

	private get hourListTemplate() {
		return this.precision < FieldDateTimePrecision.Hour ? html.nothing : html`
			<mo-hour-list style='flex: 1'
				.navigationDate=${bind(this, 'navigationDate')}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Hour)}
			></mo-hour-list>
		`
	}

	private get minuteListTemplate() {
		return this.precision < FieldDateTimePrecision.Minute ? html.nothing : html`
			<mo-minute-list style='flex: 1'
				.navigationDate=${bind(this, 'navigationDate')}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Minute)}
			></mo-minute-list>
		`
	}

	private get secondListTemplate() {
		return this.precision < FieldDateTimePrecision.Second ? html.nothing : html`
			<mo-second-list style='flex: 1'
				.navigationDate=${bind(this, 'navigationDate')}
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Second)}
			></mo-second-list>
		`
	}

	protected handleSelectedDateChange(date: DateTime, precision: FieldDateTimePrecision) {
		date
		precision
		this.change.dispatch(this.value)
		this.requestUpdate()
	}
}