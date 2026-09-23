import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, html, property } from '@a11d/lit'
import p from './package.json'
import { FieldTimeController } from './FieldTimeController.js'
import './index.js'

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

/** A departure time on a 24-hour clock, with a picker of the quarter hours instead of the wheels. */
@component('story-custom-time-field')
class StoryCustomTimeField extends Component {
	private static readonly quarters = Array.from({ length: 24 * 4 }, (_, index) => ({ hour: Math.floor(index / 4), minute: index % 4 * 15 }))

	@property() label = 'Departure'
	@property() value?: string
	@property({ type: Boolean }) required = false
	@property({ type: Boolean }) disabled = false
	@property({ type: Boolean }) readonly = false
	@property({ type: Boolean, reflect: true }) open = false

	readonly controller = new FieldTimeController(this, host => ({
		hourCycle: 'h23',
		get value() { return host.value },
		get label() { return host.label },
		get required() { return host.required },
		get disabled() { return host.disabled },
		get readonly() { return host.readonly },
		get handlePickerOpen() { return host.disabled || host.readonly ? undefined : () => host.open = true },
		handleChange: value => host.value = value,
	}))

	private pick(hour: number, minute: number) {
		this.controller.pick(this.controller.navigationDate.with({ hour, minute }))
		this.open = false
		this.controller.focus()
	}

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
				flex-direction: column;
				gap: 0.5rem;
				font-family: system-ui, sans-serif;
			}

			label {
				font-size: 0.75rem;
				font-weight: 600;
				letter-spacing: 0.08em;
				text-transform: uppercase;
				color: var(--mo-color-gray);
			}

			.field {
				display: inline-flex;
				align-items: center;
				gap: 0.75rem;
				padding: 0.5rem 0.5rem 0.5rem 1rem;
				border-radius: 999px;
				background: var(--mo-color-transparent-gray-1);
				outline: 2px solid transparent;
				transition: outline-color 150ms;

				&:focus-within {
					outline-color: var(--mo-color-accent);
				}
			}

			.segments {
				white-space: nowrap;
				font-size: 2rem;
				font-weight: 300;
				font-variant-numeric: tabular-nums;
				cursor: text;

				& > * {
					outline: none;
					caret-color: transparent;
					user-select: none;
				}

				& > [role] {
					padding-inline: 0.15em;
					border-radius: 0.25em;

					&[data-placeholder] {
						color: var(--mo-color-gray);
					}

					&:focus {
						background: var(--mo-color-accent);
						color: var(--mo-color-on-accent, white);
					}
				}

				& > [aria-hidden] {
					color: var(--mo-color-gray);
				}
			}

			button {
				border: none;
				border-radius: 999px;
				padding: 0.5rem 0.9rem;
				background: var(--mo-color-accent);
				color: var(--mo-color-on-accent, white);
				font: inherit;
				cursor: pointer;
			}

			.quarters {
				display: grid;
				grid-template-columns: repeat(4, 1fr);
				gap: 0.25rem;
				max-height: 180px;
				overflow: auto;

				button {
					background: var(--mo-color-transparent-gray-1);
					color: inherit;
					font-variant-numeric: tabular-nums;

					&[aria-pressed=true] {
						background: var(--mo-color-accent);
						color: var(--mo-color-on-accent, white);
					}
				}
			}

			.hint {
				font-size: 0.8rem;
				color: var(--mo-color-gray);
			}
		`
	}

	protected override get template() {
		const selected = this.controller.selectedDate
		const pad = (value: number) => String(value).padStart(2, '0')
		return html`
			<label>${this.label}</label>
			<div class='field'>
				<div class='segments' ${this.controller.group.ref()}>
					${this.controller.segments.segments.map(segment => html`<span ${this.controller.segment.ref(segment)}></span>`)}
				</div>
				<button tabindex='-1' ?disabled=${this.disabled || this.readonly} @click=${() => this.open = !this.open}>${this.open ? 'Close' : 'Quarters'}</button>
			</div>
			${!this.open ? html.nothing : html`
				<div class='quarters'>
					${StoryCustomTimeField.quarters.map(({ hour, minute }) => html`
						<button aria-pressed=${selected?.hour === hour && selected.minute === minute} @click=${() => this.pick(hour, minute)}>${pad(hour)}:${pad(minute)}</button>
					`)}
				</div>
			`}
			<div class='hint'>Value: ${this.value ?? '—'} · ${this.controller.checkValidity() ? 'valid' : 'required'}</div>
		`
	}
}

export const WithController: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: '`FieldTimeController` carries everything `mo-field-time` does - the segments, the `HH:mm` value, the picker key and the validity - so that a time field of another design only renders it. Alt+ArrowDown opens this one\'s own picker.'
			}
		}
	},
	render: ({ required, disabled, readonly }) => html`
		<story-custom-time-field ?required=${required} ?disabled=${disabled} ?readonly=${readonly}></story-custom-time-field>
	`
}

declare global {
	interface HTMLElementTagNameMap {
		'story-custom-time-field': StoryCustomTimeField
	}
}