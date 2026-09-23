import { bind, cache, component, css, html, property, style } from '@a11d/lit'
import { FieldComponent } from '@3mo/field'
import { Localizer } from '@3mo/localization'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import { dateTimeConverter } from '../dateTimeConverter.js'
import { FieldTimeController } from './FieldTimeController.js'
import { hourCycleConverter, segmentsStyles, type HourCycle } from '../segments/index.js'

Localizer.dictionaries.add('de', {
	'Time': 'Uhrzeit',
})

/**
 * A time-of-day field. Its value is the 24-hour `HH:mm` (or `HH:mm:ss` at second precision) string the
 * native time input uses, so that it drops in where one was, while the segments follow the language's
 * own clock — "02:07 PM" for English, "14:07" for German — and the popover offers the hour and minute wheels.
 *
 * Its behaviour is {@link FieldTimeController}, for a time field of another design.
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

	readonly controller = new FieldTimeController(this, host => ({
		get value() { return host.value },
		get precision() { return host.precision },
		get hourCycle() { return host.hourCycle },
		get referenceDate() { return host.shortcutReferenceDate },
		get label() { return host._label },
		get disabled() { return host.disabled },
		get readonly() { return host.readonly },
		get required() { return host.required },
		get invalid() { return host.invalid },
		get handlePickerOpen() { return host.pickerHidden ? undefined : () => host.open = true },
		handleInput: value => host.handleInput(value),
		handleChange: value => host.handleChange(value),
	}))

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
			<div part='segments' ${this.controller.group.ref()}>
				${this.controller.segments.segments.map(segment => html`<span part=${segment.editable ? 'segment' : 'literal'} ${this.controller.segment.ref(segment)}></span>`)}
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
		const { controller } = this
		const navigate = (e: CustomEvent<DateTime>) => controller.navigationDate = e.detail
		const pick = (e: CustomEvent<DateTime>) => controller.pick(e.detail)
		return this.pickerHidden ? html.nothing : html`
			<mo-popover tabindex='-1' .anchor=${this} target='picker' ?open=${bind(this, 'open')}>
				${cache(!this.open ? html.nothing : html`
					<mo-flex id='selector' direction='horizontal'>
						<mo-hour-list style='flex: 1' .hourCycle=${this.hourCycle} .navigationDate=${controller.navigationDate} .value=${controller.selectedDate} @navigate=${navigate} @change=${pick}></mo-hour-list>
						<mo-minute-list style='flex: 1' .navigationDate=${controller.navigationDate} .value=${controller.selectedDate} @navigate=${navigate} @change=${pick}></mo-minute-list>
						${this.precision < FieldDateTimePrecision.Second ? html.nothing : html`
							<mo-second-list style='flex: 1' .navigationDate=${controller.navigationDate} .value=${controller.selectedDate} @navigate=${navigate} @change=${pick}></mo-second-list>
						`}
					</mo-flex>
				`)}
			</mo-popover>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-time': FieldTime
	}
}