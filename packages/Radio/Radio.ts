import { component, property, css, Component, html, event } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import '@material/mwc-radio'
import '@3mo/theme'

/**
 * @element mo-radio
 *
 * @attr label
 * @attr name
 * @attr disabled
 * @attr selected
 *
 * @cssprop --mo-radio-accent-color
 * @cssprop --mo-radio-disabled-color
 * @cssprop --mo-radio-unchecked-color
 * @cssprop --mo-radio-ink-color
 *
 * @fires change - Fired when the selected state of the radio changes.
 */
@component('mo-radio')
export class Radio extends Component {
	@event() readonly change!: EventDispatcher<boolean>

	@property() label = ''
	@property() name = ''
	@disabledProperty() disabled = false
	@property({ type: Boolean, bindingDefault: true, event: 'change' }) selected = false

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
			}

			:host([disabled]) {
				pointer-events: none;
			}

			mwc-radio {
				--mdc-theme-secondary: var(--mo-radio-accent-color, var(--mo-color-accent));
				--mdc-radio-touch-target-size: 36px;
				--mdc-radio-ripple-size: 36px;
				--mdc-radio-disabled-color: var(--mo-radio-disabled-color, var(--mo-color-gray-transparent));
				--mdc-radio-unchecked-color: var(--mo-radio-unchecked-color, var(--mo-color-foreground-transparent));
				--mdc-radio-ink-color: var(--mo-radio-ink-color, var(--mo-color-on-accent));
			}

			label {
				display: flex;
				align-items: center;
				color: var(--mo-color-foreground);
				font-size: 0.875rem;
				line-height: 1.25rem;
				letter-spacing: 0.0178571429em;
				-webkit-font-smoothing: antialiased;
			}

			:host([disabled]) label {
				color: var(--mo-radio-disabled-color, var(--mo-color-gray));
				opacity: 0.5;
			}
		`
	}

	protected override get template() {
		return !this.label ? this.radioTemplate : html`
			<label>
				${this.radioTemplate}
				${this.label}
			</label>
		`
	}

	protected get radioTemplate() {
		return html`
			<mwc-radio reducedTouchTarget global
				name=${this.name}
				?disabled=${this.disabled}
				?checked=${this.selected}
				@checked=${this.handleChange.bind(this)}
			></mwc-radio>
		`
	}

	protected handleChange(event: Event) {
		event.stopImmediatePropagation()
		this.selected = (event.target as HTMLInputElement).checked
		this.change.dispatch(this.selected)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-radio': Radio
	}
}