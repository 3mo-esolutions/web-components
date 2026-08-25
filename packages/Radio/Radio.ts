import { component, property, css, Component, html, event, query } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import '@material/web/radio/radio.js'
import '@3mo/theme'
import { RadioGroupController } from './RadioGroupController.js'
// eslint-disable-next-line no-duplicate-imports
import type { MdRadio } from '@material/web/radio/radio.js'

/**
 * @element mo-radio
 *
 * @attr label - The label of the radio.
 * @attr name - The name of the radio group. Radios sharing a name are mutually exclusive document-wide.
 * @attr disabled - Whether the radio is disabled or not.
 * @attr selected - Whether the radio is selected or not.
 *
 * @cssprop --mo-radio-accent-color
 * @cssprop --mo-radio-disabled-color
 * @cssprop --mo-radio-unchecked-color
 *
 * @fires change - Dispatched when the selected state of the radio changes.
 */
@component('mo-radio')
export class Radio extends Component {
	@event() readonly change!: EventDispatcher<boolean>

	@property() label = ''
	@property({ updated(this: Radio, _: string, previousName?: string) { this.group.handleNameChange(previousName) } }) name = ''
	@disabledProperty() disabled = false

	private _selected = false
	// Synchronous deselection ensures the last assigned radio wins under Lit's batched updates
	@property({ type: Boolean, bindingDefault: true, event: 'change' })
	get selected() { return this._selected }
	set selected(value: boolean) {
		this._selected = value
		this.group.handleSelectedChange()
	}

	protected readonly group = new RadioGroupController(this)

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
			}

			:host([disabled]) {
				pointer-events: none;
			}

			md-radio {
				/* Centers 20px md-radio within 40px footprint and provides spacing to label */
				margin: 10px;

				--md-radio-selected-icon-color: var(--mo-radio-accent-color, var(--mo-color-accent));
				--md-radio-selected-hover-icon-color: var(--mo-radio-accent-color, var(--mo-color-accent));
				--md-radio-selected-focus-icon-color: var(--mo-radio-accent-color, var(--mo-color-accent));
				--md-radio-selected-pressed-icon-color: var(--mo-radio-accent-color, var(--mo-color-accent));

				--md-radio-hover-state-layer-color: var(--mo-radio-accent-color, var(--mo-color-accent));
				--md-radio-pressed-state-layer-color: var(--mo-radio-accent-color, var(--mo-color-accent));
				--md-radio-selected-hover-state-layer-color: var(--mo-radio-accent-color, var(--mo-color-accent));
				--md-radio-selected-pressed-state-layer-color: var(--mo-radio-accent-color, var(--mo-color-accent));

				--md-focus-ring-color: var(--mo-radio-accent-color, var(--mo-color-accent));

				--md-radio-icon-color: var(--mo-radio-unchecked-color, color-mix(in srgb, currentColor, transparent 20%));
				--md-radio-hover-icon-color: var(--mo-radio-unchecked-color, color-mix(in srgb, currentColor, transparent 20%));
				--md-radio-focus-icon-color: var(--mo-radio-unchecked-color, color-mix(in srgb, currentColor, transparent 20%));
				--md-radio-pressed-icon-color: var(--mo-radio-unchecked-color, color-mix(in srgb, currentColor, transparent 20%));

				/* Prevent double-dimming since custom colors already include opacity */
				--md-radio-disabled-selected-icon-color: var(--mo-radio-disabled-color, var(--mo-color-gray-transparent));
				--md-radio-disabled-selected-icon-opacity: 1;
				--md-radio-disabled-unselected-icon-color: var(--mo-radio-disabled-color, var(--mo-color-gray-transparent));
				--md-radio-disabled-unselected-icon-opacity: 1;
			}

			label {
				display: flex;
				align-items: center;
				color: var(--mo-color-foreground);
				font-size: 0.875rem;
				line-height: 1.25rem;
				-webkit-font-smoothing: antialiased;
				user-select: none;
			}

			:host([disabled]) label {
				color: var(--mo-radio-disabled-color, var(--mo-color-gray));
				opacity: 0.5;
			}
		`
	}

	@query('md-radio') readonly radioElement?: MdRadio

	override focus(options?: FocusOptions) {
		this.radioElement?.focus(options)
	}

	// Always render <label> with touch-target='none' on md-radio to prevent md's 48px touch target
	// from overlapping adjacent radios while keeping the 40px click area.
	protected override get template() {
		return html`
			<label>
				${this.radioTemplate}
				${this.label}
			</label>
		`
	}

	protected get radioTemplate() {
		return html`
			<md-radio touch-target='none'
				name=${this.name}
				?disabled=${this.disabled}
				?checked=${this.selected}
				@change=${this.handleChange.bind(this)}
			></md-radio>
		`
	}

	protected handleChange(event: Event) {
		event.stopImmediatePropagation()
		this.selected = true
		this.change.dispatch(true)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-radio': Radio
	}
}