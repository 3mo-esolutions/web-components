import { component, property, css, Component, html, event } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import { Formfield as FormField } from '@material/mwc-formfield'
import '@material/mwc-radio'
import '@3mo/theme'

/**
 * @element mo-radio
 *
 * @attr label
 * @attr name
 * @attr disabled
 * @attr checked
 *
 * @cssprop --mo-radio-accent-color
 * @cssprop --mo-radio-disabled-color
 * @cssprop --mo-radio-unchecked-color
 * @cssprop --mo-radio-ink-color
 *
 * @fires change - Fired when the checked state of the radio changes.
 */
@component('mo-radio')
export class Radio extends Component {
	@event() readonly change!: EventDispatcher<boolean>

	@property() label = ''
	@property() name = ''
	@disabledProperty() disabled = false
	@property({ type: Boolean }) checked = false

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

			mwc-formfield::part(label) {
				padding-inline-start: 0px;
				margin-inline-start: -2px;
				text-align: start;
			}

			:host([disabled]) mwc-formfield::part(label) {
				color: var(--mo-radio-disabled-color, var(--mo-color-gray-transparent));
			}
		`
	}

	protected override get template() {
		return html`
			<mwc-formfield label=${this.label}>
				<mwc-radio reducedTouchTarget global
					name=${this.name}
					?disabled=${this.disabled}
					?checked=${this.checked}
					@checked=${this.handleChange.bind(this)}
				></mwc-radio>
			</mwc-formfield>
		`
	}

	protected handleChange(event: Event) {
		event.stopImmediatePropagation()
		this.checked = (event.target as HTMLInputElement).checked
		this.change.dispatch(this.checked)
	}
}

FormField.addInitializer(async element => {
	const formField = element as FormField
	await formField.updateComplete
	formField.renderRoot.querySelector('label')?.setAttribute('part', 'label')
})

declare global {
	interface HTMLElementTagNameMap {
		'mo-radio': Radio
	}
}