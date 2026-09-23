import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { bind, Component, component, css, html, property, query, state, type PropertyValues } from '@a11d/lit'
import p from '../package.json'
import '../index.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import { FieldDateTimeRangeController, type FieldDateTimeRangeSelection } from './FieldDateTimeRangeController.js'
import { dateTimeConverter } from '../dateTimeConverter.js'
import type { DateTimeSegmentsController } from '../segments/index.js'
import type { Calendar } from '../selection/index.js'

export default {
	title: 'Selection & Input / Date Time Fields / Field Date Time Range',
	component: 'mo-field-date-time-range',
	args: {
		precision: FieldDateTimePrecision.Minute.toString(),
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
		min: '',
		max: '',
	},
	argTypes: {
		precision: {
			control: 'select',
			options: FieldDateTimePrecision.all.map(p => p.toString()),
		}
	},
	package: p,
	decorators: [story => html`<div style='height: 250px'>${story()}</div>`]
} as Meta

export const FieldDateTimeRange: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, precision, min, max }) => html`
		<mo-field-date-time-range
			label=${label}
			precision=${precision}
			?required=${required}
			?disabled=${disabled}
			?readonly=${readonly}
			?dense=${dense}
			min=${min}
			max=${max}
		></mo-field-date-time-range>
	`
}

export const DateDisabled: StoryObj = {
	render: ({ precision }) => html`
		<mo-field-date-time-range label='Weekends disabled' precision=${precision}
			.dateDisabled=${(date: DateTime) => date.dayOfWeek === 6 || date.dayOfWeek === 7}
		></mo-field-date-time-range>
	`
}

/** A booking form's stay: two boxes side by side, one per end, and a card with the presets beside the calendar. */
@component('story-custom-date-range-field')
class StoryCustomDateRangeField extends Component {
	@property({ type: Object }) value?: DateTimeRange
	@property({ type: String, converter: value => FieldDateTimePrecision.parse(value || undefined) }) precision = FieldDateTimePrecision.Day
	@property({ type: Object, converter: dateTimeConverter }) min?: DateTime
	@property({ type: Object, converter: dateTimeConverter }) max?: DateTime
	@property({ type: Boolean }) required = false
	@property({ type: Boolean }) disabled = false
	@property({ type: Boolean }) readonly = false
	@property({ type: Boolean, reflect: true }) open = false

	@state() private touched = false

	@query('mo-calendar') private readonly calendar?: Calendar

	readonly controller = new FieldDateTimeRangeController(this, host => ({
		label: 'Stay',
		get value() { return host.value },
		get precision() { return host.precision },
		get min() { return host.min },
		get max() { return host.max },
		get required() { return host.required },
		get disabled() { return host.disabled },
		get readonly() { return host.readonly },
		get invalid() { return host.invalid },
		get handlePickerOpen() { return host.disabled || host.readonly ? undefined : () => host.open = true },
		handleChange: value => host.change(value),
	}))

	private get invalid(): boolean {
		return this.touched && !this.controller.checkValidity()
	}

	private get summary() {
		const { start, end } = this.value ?? {}
		if (this.invalid) {
			return start || end ? 'These dates are not available.' : 'Required.'
		}
		if (!start || !end) {
			return 'Type the dates, or pick them.'
		}
		const days = Math.round((end.dayStart.valueOf() - start.dayStart.valueOf()) / 86_400_000)
		return days === 1 ? '1 night' : `${days} nights`
	}

	private change(value: DateTimeRange | undefined) {
		this.value = value
		this.touched = true
	}

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		if (props.has('open') && this.open) {
			setTimeout(() => this.calendar?.setNavigatingValue(this.controller.navigationDate))
		}
	}

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
				flex-direction: column;
				gap: 0.375rem;
				font-family: system-ui, sans-serif;
				font-size: 0.875rem;
			}

			.ends {
				anchor-name: --story-range-ends;
				display: flex;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: 0.75rem;
				background: var(--mo-color-surface);

				&[data-invalid] {
					border-color: var(--mo-color-red);
				}

				:host([disabled]) & {
					opacity: 0.5;
				}
			}

			.end {
				display: flex;
				flex-direction: column;
				gap: 0.125rem;
				width: 10rem;
				padding: 0.5rem 0.875rem;
				border-radius: 0.75rem;
				cursor: text;
				outline: 2px solid transparent;
				transition: outline-color 150ms, background 150ms;

				& + .end {
					border-inline-start: 1px solid var(--mo-color-transparent-gray-3);
				}

				&:focus-within, &[data-selected] {
					outline-color: var(--mo-color-foreground);
					background: var(--mo-color-transparent-gray-1);
				}
			}

			.caption {
				font-size: 0.7rem;
				font-weight: 700;
				letter-spacing: 0.04em;
				text-transform: uppercase;
			}

			.segments {
				white-space: nowrap;
				font-variant-numeric: tabular-nums;

				& > * {
					outline: none;
					caret-color: transparent;
					user-select: none;
				}

				& > [role] {
					border-radius: 0.2rem;

					&[data-placeholder] {
						color: var(--mo-color-gray);
					}

					&:focus {
						background: var(--mo-color-foreground);
						color: var(--mo-color-background);
					}
				}

				& > [aria-hidden] {
					color: var(--mo-color-gray);
				}
			}

			.bar {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 0.5rem;
				color: var(--mo-color-gray);
				font-size: 0.75rem;

				&[data-invalid] {
					color: var(--mo-color-red);
				}
			}

			button {
				font: inherit;
				color: inherit;
				cursor: pointer;
			}

			#toggle {
				padding: 0;
				border: none;
				background: none;
				color: var(--mo-color-foreground);
				font-weight: 600;
				text-decoration: underline;
			}

			mo-popover {
				position-anchor: --story-range-ends;
				margin-block-start: 0.5rem;
				background: transparent;
			}

			.card {
				display: flex;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: 1rem;
				background: var(--mo-color-surface);
				color: var(--mo-color-foreground);
				box-shadow: 0 16px 40px rgb(0 0 0 / 0.18);
				font-family: system-ui, sans-serif;
				font-size: 0.875rem;
				overflow: hidden;
			}

			.presets {
				display: flex;
				flex-direction: column;
				gap: 0.125rem;
				width: 9rem;
				max-height: 450px;
				padding: 0.75rem 0.5rem;
				overflow: auto;
				border-inline-end: 1px solid var(--mo-color-transparent-gray-3);

				button {
					padding: 0.375rem 0.625rem;
					border: none;
					border-radius: 0.5rem;
					background: transparent;
					text-align: start;

					&:hover {
						background: var(--mo-color-transparent-gray-1);
					}
				}

				hr {
					width: 100%;
					margin: 0.25rem 0;
					border: none;
					border-block-start: 1px solid var(--mo-color-transparent-gray-3);
				}
			}

			.main {
				display: flex;
				flex-direction: column;
			}

			.tabs {
				display: flex;
				gap: 0.25rem;
				padding: 0.75rem 0.75rem 0;

				button {
					flex: 1;
					padding: 0.375rem;
					border: none;
					border-radius: 999px;
					background: var(--mo-color-transparent-gray-1);

					&[aria-pressed=true] {
						background: var(--mo-color-foreground);
						color: var(--mo-color-background);
					}
				}
			}

			.pickers {
				display: flex;
				padding: 0.5rem 0.75rem;
				height: min(450px, 100vh);

				mo-calendar {
					width: 17rem;
				}

				.time {
					display: flex;
					width: 9rem;
					border-inline-start: 1px solid var(--mo-color-transparent-gray-3);

					& > * {
						flex: 1;
					}
				}
			}
		`
	}

	protected override get template() {
		const { controller } = this
		const selected = this.open ? controller.selection : undefined
		return html`
			<div class='ends' ?data-invalid=${this.invalid}>
				${this.getEndTemplate('Check-in', controller.startSegments, selected === 'start')}
				${this.getEndTemplate('Check-out', controller.endSegments, selected === 'end')}
			</div>
			<div class='bar' ?data-invalid=${this.invalid}>
				<span>${this.summary}</span>
				<button id='toggle' tabindex='-1' ?disabled=${this.disabled || this.readonly}>${this.open ? 'Close calendar' : 'Show calendar'}</button>
			</div>
			<mo-popover .anchor=${this} target='toggle' ?open=${bind(this, 'open')}>
				${!this.open ? html.nothing : this.cardTemplate}
			</mo-popover>
		`
	}

	private getEndTemplate(caption: string, segments: DateTimeSegmentsController, selected: boolean) {
		return html`
			<div class='end' ?data-selected=${selected} @pointerdown=${(e: PointerEvent) => this.handleEndPointerDown(e, segments)}>
				<span class='caption'>${caption}</span>
				<div class='segments' ${segments.group.ref()}>
					${segments.segments.map(segment => html`<span ${segments.segment.ref(segment)}></span>`)}
				</div>
			</div>
		`
	}

	/** A press on an end's box, beside its segments, enters them. */
	private handleEndPointerDown(event: PointerEvent, segments: DateTimeSegmentsController) {
		const group = segments.group.value
		if (group && !event.composedPath().includes(group)) {
			event.preventDefault()
			segments.focus()
		}
	}

	private get cardTemplate() {
		const { controller } = this
		const navigate = (e: CustomEvent<DateTime>) => controller.navigationDate = e.detail
		const time = (precision: FieldDateTimePrecision) => (e: CustomEvent<DateTime>) => controller.pick(e.detail, precision)
		const tab = (selection: FieldDateTimeRangeSelection, label: string) => html`
			<button aria-pressed=${controller.selection === selection} @click=${() => controller.selection = selection}>${label}</button>
		`
		return html`
			<div class='card'>
				${!controller.presets.length ? html.nothing : html`
					<div class='presets'>
						${controller.presets.map((group, index) => html`
							${index === 0 ? html.nothing : html`<hr>`}
							${group.map(preset => html`<button @click=${() => this.change(preset.value)}>${preset.label}</button>`)}
						`)}
					</div>
				`}
				<div class='main'>
					<div class='tabs'>
						${tab('start', 'Check-in')}
						${tab('end', 'Check-out')}
					</div>
					<div class='pickers'>
						<mo-calendar
							.precision=${this.precision > FieldDateTimePrecision.Day ? FieldDateTimePrecision.Day : this.precision}
							.value=${controller.calendarValue}
							.min=${this.min}
							.max=${this.max}
							@dateClick=${(e: CustomEvent<DateTime>) => controller.pick(e.detail, this.precision)}
						></mo-calendar>
						${this.precision <= FieldDateTimePrecision.Day ? html.nothing : html`
							<div class='time'>
								<mo-hour-list .navigationDate=${controller.navigationDate} .value=${controller.selectedDate} @navigate=${navigate} @change=${time(FieldDateTimePrecision.Hour)}></mo-hour-list>
								<mo-minute-list .navigationDate=${controller.navigationDate} .value=${controller.selectedDate} @navigate=${navigate} @change=${time(FieldDateTimePrecision.Minute)}></mo-minute-list>
							</div>
						`}
					</div>
				</div>
			</div>
		`
	}
}

export const WithController: StoryObj = {
	args: { precision: FieldDateTimePrecision.Day.toString() },
	parameters: {
		docs: {
			description: {
				story: '`FieldDateTimeRangeController` carries everything `mo-field-date-time-range` does - a group of segments per end with the arrow keys crossing between them, the end the picker edits, range shortcuts, the presets and the validity - so that a range field of another design only renders it. Here the two ends are separate boxes.'
			}
		}
	},
	render: ({ precision, required, disabled, readonly, min, max }) => html`
		<story-custom-date-range-field precision=${precision} min=${min} max=${max} ?required=${required} ?disabled=${disabled} ?readonly=${readonly}></story-custom-date-range-field>
	`
}

declare global {
	interface HTMLElementTagNameMap {
		'story-custom-date-range-field': StoryCustomDateRangeField
	}
}