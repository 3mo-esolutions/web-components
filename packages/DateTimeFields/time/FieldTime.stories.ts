import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { bind, Component, component, css, event, html, property, state, type PropertyValues } from '@a11d/lit'
import p from '../package.json'
import { FieldTimeController } from './FieldTimeController.js'
import '../index.js'

export default {
	title: 'Selection & Input / Date Time Fields / Field Time',
	component: 'mo-field-time',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
	},
	package: p,
} as Meta

export const FieldTime: StoryObj = {
	decorators: [story => html`<div style='height: 250px; width: 220px'>${story()}</div>`],
	render: ({ label, required, disabled, dense, readonly }) => html`
		<mo-field-time label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense}></mo-field-time>
	`
}

const minutesOf = (time?: string) => {
	const [hour, minute] = time?.split(':').map(Number) ?? []
	return hour === undefined || minute === undefined ? undefined : hour * 60 + minute
}

const dateOf = (minutes: number) => new DateTime().dayStart.with({ hour: Math.floor(minutes / 60), minute: minutes % 60 })

const timeOf = (minutes: number) => [Math.floor(minutes / 60), minutes % 60].map(unit => String(unit).padStart(2, '0')).join(':')

const durationOf = (minutes: number) => {
	const hours = Math.floor(minutes / 60)
	return [hours ? `${hours} h` : '', minutes % 60 ? `${minutes % 60} min` : ''].filter(Boolean).join(' ')
}

/**
 * A time field as a calendar app has it: typed into, or picked from times at a step. Given the time it
 * follows, it offers only later times and says how long each would last.
 */
@component('story-custom-time-field')
class StoryCustomTimeField extends Component {
	@event() readonly change!: EventDispatcher<string | undefined>

	@property() label = 'Time'
	@property() value?: string
	/** The minutes between two suggested times. */
	@property({ type: Number }) step = 30
	/** The time this one follows, e.g. a meeting's start for its end. */
	@property() since?: string
	@property({ type: Boolean }) required = false
	@property({ type: Boolean }) disabled = false
	@property({ type: Boolean }) readonly = false
	@property({ type: Boolean, reflect: true }) open = false

	@state() private touched = false

	readonly controller = new FieldTimeController(this, host => ({
		get value() { return host.value },
		get label() { return host.label },
		get required() { return host.required },
		get disabled() { return host.disabled },
		get readonly() { return host.readonly },
		get invalid() { return host.invalid },
		get handlePickerOpen() { return host.disabled || host.readonly ? undefined : () => host.open = true },
		handleChange: value => host.handleChange(value),
	}))

	private get endsTooEarly() {
		const value = minutesOf(this.value)
		const since = minutesOf(this.since)
		return value !== undefined && since !== undefined && value <= since
	}

	private get invalid(): boolean {
		return this.touched && !this.controller.checkValidity()
	}

	private get suggestions() {
		const since = minutesOf(this.since)
		return Array.from({ length: Math.ceil(24 * 60 / this.step) }, (_, index) => index * this.step)
			.filter(minutes => since === undefined || minutes > since)
	}

	private handleChange(value: string | undefined) {
		this.value = value
		this.touched = true
		this.change.dispatch(value)
	}

	private pick(minutes: number) {
		this.controller.pick(dateOf(minutes))
		this.open = false
		this.controller.focus()
	}

	protected override willUpdate(props: PropertyValues<this>) {
		super.willUpdate(props)
		this.controller.setCustomValidity(this.endsTooEarly ? 'Ends before it starts' : '')
	}

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		if (props.has('open') && this.open) {
			// The list opens at the value, or at the next time to come.
			const target = minutesOf(this.value) ?? new DateTime().hour * 60 + new DateTime().minute
			const options = [...this.renderRoot.querySelectorAll<HTMLElement>('[role=option]')]
			const option = options.find(option => Number(option.dataset.minutes) >= target) ?? options.at(-1)
			option?.scrollIntoView({ block: 'center' })
			option?.focus({ preventScroll: true })
		}
	}

	/** The arrow keys walk the list, Enter picks, and Escape goes back to the segments. */
	private handleListKeyDown(event: KeyboardEvent) {
		const options = [...this.renderRoot.querySelectorAll<HTMLElement>('[role=option]')]
		const index = options.indexOf(this.shadowRoot!.activeElement as HTMLElement)
		const next = new Map([['ArrowDown', index + 1], ['ArrowUp', index - 1], ['Home', 0], ['End', options.length - 1]]).get(event.key)
		if (next !== undefined) {
			event.preventDefault()
			options[Math.max(0, Math.min(options.length - 1, next))]?.focus()
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			options[index]?.click()
		} else if (event.key === 'Escape') {
			this.open = false
			this.controller.focus()
		}
	}

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
				flex-direction: column;
				gap: 0.375rem;
				width: 9.5rem;
				font-family: system-ui, sans-serif;
				font-size: 0.875rem;
			}

			.label {
				font-weight: 500;
			}

			.box {
				anchor-name: --story-time-box;
				display: flex;
				align-items: center;
				gap: 0.25rem;
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

			#toggle {
				display: grid;
				place-items: center;
				width: 2rem;
				height: 2rem;
				border: none;
				border-radius: 0.375rem;
				background: transparent;
				color: var(--mo-color-gray);
				cursor: pointer;

				&:hover {
					background: var(--mo-color-transparent-gray-1);
				}
			}

			.message {
				min-height: 1rem;
				font-size: 0.75rem;
				color: var(--mo-color-red);
			}

			mo-popover {
				position-anchor: --story-time-box;
				margin-block-start: 0.375rem;
				background: transparent;
			}

			[role=listbox] {
				width: 13rem;
				max-height: 16rem;
				padding: 0.25rem;
				overflow: auto;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: 0.75rem;
				background: var(--mo-color-surface);
				color: var(--mo-color-foreground);
				box-shadow: 0 12px 32px rgb(0 0 0 / 0.16);
				font-family: system-ui, sans-serif;
				font-size: 0.875rem;
			}

			[role=option] {
				display: flex;
				justify-content: space-between;
				gap: 0.5rem;
				padding: 0.375rem 0.625rem;
				border-radius: 0.5rem;
				font-variant-numeric: tabular-nums;
				cursor: pointer;
				outline: none;

				&:hover, &:focus {
					background: var(--mo-color-transparent-gray-1);
				}

				&[aria-selected=true] {
					background: color-mix(in srgb, var(--mo-color-accent) 18%, transparent);
					font-weight: 600;
				}

				small {
					color: var(--mo-color-gray);
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
				<button id='toggle' tabindex='-1' aria-label='Suggest times' ?disabled=${this.disabled || this.readonly}>
					<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>
						<circle cx='12' cy='12' r='9'></circle>
						<path d='M12 7v5l3 2'></path>
					</svg>
				</button>
			</div>
			<div class='message'>${!this.invalid ? '' : this.endsTooEarly ? 'Ends before it starts.' : 'Required.'}</div>
			<mo-popover .anchor=${this} target='toggle' ?open=${bind(this, 'open')}>
				${!this.open ? html.nothing : this.listTemplate}
			</mo-popover>
		`
	}

	private get listTemplate() {
		const since = minutesOf(this.since)
		const selected = minutesOf(this.value)
		return html`
			<div role='listbox' aria-label=${this.label} @keydown=${this.handleListKeyDown}>
				${this.suggestions.map(minutes => html`
					<div role='option' tabindex='-1' data-minutes=${minutes} aria-selected=${minutes === selected} @click=${() => this.pick(minutes)}>
						<span>${dateOf(minutes).format({ hour: 'numeric', minute: '2-digit' })}</span>
						${since === undefined ? html.nothing : html`<small>${durationOf(minutes - since)}</small>`}
					</div>
				`)}
			</div>
		`
	}
}

/** A meeting's start and end: moving the start carries the end along, the way a calendar app does. */
@component('story-meeting-times')
class StoryMeetingTimes extends Component {
	@property({ type: Boolean }) required = false
	@property({ type: Boolean }) disabled = false
	@property({ type: Boolean }) readonly = false

	@state() private start?: string = '09:00'
	@state() private end?: string = '09:30'

	private handleStartChange(start: string | undefined) {
		const [previous, next, end] = [minutesOf(this.start), minutesOf(start), minutesOf(this.end)]
		if (previous !== undefined && next !== undefined && end !== undefined) {
			this.end = timeOf(Math.min(end + next - previous, 23 * 60 + 59))
		}
		this.start = start
	}

	static override get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				gap: 0.25rem;
				font-family: system-ui, sans-serif;
				font-size: 0.875rem;
			}

			.times {
				display: flex;
				align-items: center;
				gap: 0.5rem;
			}

			.until {
				color: var(--mo-color-gray);
			}

			.duration {
				color: var(--mo-color-gray);
				font-size: 0.75rem;
			}
		`
	}

	protected override get template() {
		const [start, end] = [minutesOf(this.start), minutesOf(this.end)]
		return html`
			<div class='times'>
				<story-custom-time-field label='Starts' step='15' .value=${this.start}
					?required=${this.required} ?disabled=${this.disabled} ?readonly=${this.readonly}
					@change=${(e: CustomEvent<string | undefined>) => this.handleStartChange(e.detail)}
				></story-custom-time-field>
				<span class='until'>–</span>
				<story-custom-time-field label='Ends' step='15' .value=${this.end} .since=${this.start}
					?required=${this.required} ?disabled=${this.disabled} ?readonly=${this.readonly}
					@change=${(e: CustomEvent<string | undefined>) => this.end = e.detail}
				></story-custom-time-field>
			</div>
			<div class='duration'>${start === undefined || end === undefined || end <= start ? '' : `Lasts ${durationOf(end - start)}`}</div>
		`
	}
}

export const WithController: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: '`FieldTimeController` carries everything `mo-field-time` does - the segments, the `HH:mm` value, the picker key and the validity - so that a time field of another design only renders it. Here, a calendar app\'s meeting times: each field suggests times at a step in its own list, which Alt+ArrowDown opens, the end offers only times after the start along with their duration, and moving the start carries the end along.'
			}
		}
	},
	render: ({ required, disabled, readonly }) => html`
		<story-meeting-times ?required=${required} ?disabled=${disabled} ?readonly=${readonly}></story-meeting-times>
	`
}

declare global {
	interface HTMLElementTagNameMap {
		'story-custom-time-field': StoryCustomTimeField
		'story-meeting-times': StoryMeetingTimes
	}
}