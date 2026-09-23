import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { bind, Component, component, css, html, property, query, state, type PropertyValues } from '@a11d/lit'
import p from '../package.json'
import '../index.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import { FieldDateTimeController } from './FieldDateTimeController.js'
import { dateTimeConverter } from '../dateTimeConverter.js'
import type { Calendar } from '../selection/index.js'

export default {
	title: 'Selection & Input / Date Time Fields / Field Date Time',
	component: 'mo-field-date-time',
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

export const FieldDateTime: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, precision, min, max }) => html`
		<mo-field-date-time
			label=${label}
			?required=${required}
			?disabled=${disabled}
			?readonly=${readonly}
			?dense=${dense}
			precision=${precision}
			min=${min}
			max=${max}
		></mo-field-date-time>
	`
}

export const DateDisabled: StoryObj = {
	render: ({ precision }) => html`
		<mo-field-date-time label='Weekends disabled' precision=${precision}
			.dateDisabled=${(date: DateTime) => date.dayOfWeek === 6 || date.dayOfWeek === 7}
		></mo-field-date-time>
	`
}

/** A form field of the plain kind: the label above an outlined box, a message below, and a card for the picker. */
@component('story-custom-date-time-field')
class StoryCustomDateTimeField extends Component {
	@property() label = 'Appointment'
	@property({ type: Object }) value?: Date
	@property({ type: String, converter: value => FieldDateTimePrecision.parse(value || undefined) }) precision = FieldDateTimePrecision.Day
	@property({ type: Object, converter: dateTimeConverter }) min?: DateTime
	@property({ type: Object, converter: dateTimeConverter }) max?: DateTime
	@property({ type: Boolean }) required = false
	@property({ type: Boolean }) disabled = false
	@property({ type: Boolean }) readonly = false
	@property({ type: Boolean, reflect: true }) open = false

	@state() private touched = false

	@query('mo-calendar') private readonly calendar?: Calendar

	readonly controller = new FieldDateTimeController(this, host => ({
		get value() { return host.value },
		get precision() { return host.precision },
		get min() { return host.min },
		get max() { return host.max },
		get label() { return host.label },
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

	private get message() {
		if (!this.invalid) {
			return this.precision > FieldDateTimePrecision.Day ? 'Type a date and time, or pick one.' : 'Type a date, or pick one.'
		}
		return this.value ? 'This date is not available.' : 'Required.'
	}

	private change(value: Date | undefined) {
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
				width: 18rem;
				font-family: system-ui, sans-serif;
				font-size: 0.875rem;
			}

			.label {
				font-weight: 500;
			}

			.box {
				anchor-name: --story-date-box;
				display: flex;
				align-items: center;
				gap: 0.5rem;
				height: 2.5rem;
				padding-inline: 0.75rem 0.25rem;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: 0.5rem;
				background: var(--mo-color-surface);
				transition: border-color 150ms, box-shadow 150ms;

				&:focus-within, :host([open]) & {
					border-color: var(--mo-color-accent);
					box-shadow: 0 0 0 3px color-mix(in srgb, var(--mo-color-accent) 20%, transparent);
				}

				&[data-invalid] {
					border-color: var(--mo-color-red);
				}

				:host([disabled]) & {
					opacity: 0.5;
				}
			}

			.segments {
				flex: 1;
				white-space: nowrap;
				font-variant-numeric: tabular-nums;
				cursor: text;

				& > * {
					outline: none;
					caret-color: transparent;
					user-select: none;
				}

				& > [role] {
					border-radius: 0.2rem;
					padding-inline: 1px;

					&[data-placeholder] {
						color: var(--mo-color-gray);
					}

					&:focus {
						background: color-mix(in srgb, var(--mo-color-accent) 18%, transparent);
					}
				}

				& > [aria-hidden] {
					color: var(--mo-color-gray);
				}
			}

			button {
				font: inherit;
				color: inherit;
				cursor: pointer;
			}

			#toggle {
				display: grid;
				place-items: center;
				width: 2rem;
				height: 2rem;
				border: none;
				border-radius: 0.375rem;
				background: transparent;
				color: var(--mo-color-gray);

				&:hover {
					background: var(--mo-color-transparent-gray-1);
				}
			}

			.message {
				font-size: 0.75rem;
				color: var(--mo-color-gray);

				&[data-invalid] {
					color: var(--mo-color-red);
				}
			}

			mo-popover {
				position-anchor: --story-date-box;
				margin-block-start: 0.375rem;
				background: transparent;
			}

			.card {
				display: flex;
				flex-direction: column;
				width: min-content;
				gap: 0.75rem;
				padding: 0.75rem;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: 0.75rem;
				background: var(--mo-color-surface);
				color: var(--mo-color-foreground);
				box-shadow: 0 12px 32px rgb(0 0 0 / 0.16);
				font-family: system-ui, sans-serif;
				font-size: 0.875rem;
			}

			.presets {
				display: flex;
				flex-wrap: wrap;
				gap: 0.375rem;

				button {
					padding: 0.25rem 0.625rem;
					border: 1px solid var(--mo-color-transparent-gray-3);
					border-radius: 999px;
					background: transparent;
					font-size: 0.8rem;

					&:hover {
						background: var(--mo-color-transparent-gray-1);
					}
				}
			}

			.pickers {
				display: flex;
				gap: 0.5rem;
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

			.footer {
				display: flex;
				justify-content: space-between;

				button {
					padding: 0.375rem 0.875rem;
					border: none;
					border-radius: 0.5rem;
					background: transparent;
				}

				.primary {
					background: var(--mo-color-accent);
					color: var(--mo-color-on-accent, white);
				}
			}
		`
	}

	protected override get template() {
		const { controller } = this
		return html`
			<div class='label'>${this.label}${this.required ? ' *' : ''}</div>
			<div class='box' ?data-invalid=${this.invalid}>
				<div class='segments' ${controller.group.ref()}>
					${controller.segments.segments.map(segment => html`<span ${controller.segment.ref(segment)}></span>`)}
				</div>
				<button id='toggle' tabindex='-1' aria-label='Choose a date' ?disabled=${this.disabled || this.readonly}>
					<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>
						<rect x='3' y='4' width='18' height='18' rx='2'></rect>
						<path d='M16 2v4M8 2v4M3 10h18'></path>
					</svg>
				</button>
			</div>
			<div class='message' ?data-invalid=${this.invalid}>${this.message}</div>
			<mo-popover .anchor=${this} target='toggle' ?open=${bind(this, 'open')}>
				${!this.open ? html.nothing : this.cardTemplate}
			</mo-popover>
		`
	}

	private get cardTemplate() {
		const { controller } = this
		const navigate = (e: CustomEvent<DateTime>) => controller.navigationDate = e.detail
		const pick = (e: CustomEvent<DateTime>) => controller.pick(e.detail)
		return html`
			<div class='card'>
				${!controller.presets.length ? html.nothing : html`
					<div class='presets'>
						${controller.presets.flat().map(preset => html`<button @click=${() => this.change(preset.value)}>${preset.label}</button>`)}
					</div>
				`}
				<div class='pickers'>
					<mo-calendar
						.precision=${this.precision > FieldDateTimePrecision.Day ? FieldDateTimePrecision.Day : this.precision}
						.value=${controller.calendarValue}
						.min=${this.min}
						.max=${this.max}
						@dateClick=${pick}
					></mo-calendar>
					${this.precision <= FieldDateTimePrecision.Day ? html.nothing : html`
						<div class='time'>
							<mo-hour-list .navigationDate=${controller.navigationDate} .value=${controller.selectedDate} @navigate=${navigate} @change=${pick}></mo-hour-list>
							<mo-minute-list .navigationDate=${controller.navigationDate} .value=${controller.selectedDate} @navigate=${navigate} @change=${pick}></mo-minute-list>
						</div>
					`}
				</div>
				<div class='footer'>
					<button @click=${() => this.change(undefined)}>Clear</button>
					<button class='primary' @click=${() => { this.open = false; controller.focus() }}>Done</button>
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
				story: '`FieldDateTimeController` carries everything `mo-field-date-time` does - the segments at any precision, the picker\'s position and what picking in it means, the presets, the minimum and maximum, and the validity - so that a date field of another design only renders it.'
			}
		}
	},
	render: ({ precision, required, disabled, readonly, min, max }) => html`
		<story-custom-date-time-field precision=${precision} min=${min} max=${max} ?required=${required} ?disabled=${disabled} ?readonly=${readonly}></story-custom-date-time-field>
	`
}

declare global {
	interface HTMLElementTagNameMap {
		'story-custom-date-time-field': StoryCustomDateTimeField
	}
}