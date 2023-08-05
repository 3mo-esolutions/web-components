import { component, property, css, Component, html, event } from '@a11d/lit'
import { Formfield as FormField } from '@material/mwc-formfield'
import { disabledProperty } from '@3mo/disabled-property'
import '@material/mwc-checkbox'
import '@3mo/theme'

/**
 * @element mo-checkbox
 *
 * @attr label
 * @attr disabled
 * @attr value
 * @attr checked
 * @attr indeterminate
 *
 * @cssprop --mo-checkbox-accent-color
 * @cssprop --mo-checkbox-disabled-color
 * @cssprop --mo-checkbox-unchecked-color
 * @cssprop --mo-checkbox-ink-color
 *
 * @fires change - Fired when the checked state of the checkbox changes.
 */
@component('mo-checkbox')
export class Checkbox extends Component {
	@event() readonly change!: EventDispatcher<CheckboxValue>

	@property() label = ''
	@disabledProperty() disabled = false
	@property({ type: Boolean }) checked = false
	@property({ type: Boolean }) indeterminate = false
	@property()
	get value(): CheckboxValue {
		if (this.indeterminate) {
			return 'indeterminate'
		} else if (this.checked) {
			return 'checked'
		} else {
			return 'unchecked'
		}
	}

	set value(value: CheckboxValue) {
		if (value === 'indeterminate') {
			this.indeterminate = true
		} else if (value === 'checked') {
			this.indeterminate = false
			this.checked = true
		} else {
			this.indeterminate = false
			this.checked = false
		}
	}

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
			}

			:host([disabled]) {
				pointer-events: none;
			}

			mwc-checkbox {
				--mdc-theme-secondary: var(--mo-checkbox-accent-color, var(--mo-color-accent));
				--mdc-checkbox-touch-target-size: 36px;
				--mdc-checkbox-ripple-size: 36px;
				--mdc-checkbox-disabled-color: var(--mo-checkbox-disabled-color, var(--mo-color-gray-transparent));
				--mdc-checkbox-unchecked-color: var(--mo-checkbox-unchecked-color, var(--mo-color-foreground-transparent));
				--mdc-checkbox-ink-color: var(--mo-checkbox-ink-color, var(--mo-color-on-accent));
			}

			mwc-formfield::part(label) {
				padding-inline-start: 0px;
				text-align: start;
				color: var(--mo-color-foreground);
			}

			:host([disabled]) mwc-formfield::part(label) {
				color: var(--mo-checkbox-disabled-color, var(--mo-color-gray-transparent));
			}
		`
	}

	protected override get template() {
		return html`
			<mwc-formfield label=${this.label}>
				<mwc-checkbox reducedTouchTarget
					?disabled=${this.disabled}
					?indeterminate=${this.indeterminate}
					?checked=${this.checked}
					@change=${this.handleChange.bind(this)}
				></mwc-checkbox>
			</mwc-formfield>
		`
	}

	protected handleChange(event: Event) {
		event.stopImmediatePropagation()
		const checkbox = event.target as HTMLInputElement
		this.checked = checkbox.checked
		this.indeterminate = checkbox.indeterminate
		this.change.dispatch(this.value)
	}
}

FormField.addInitializer(async element => {
	const formField = element as FormField
	await formField.updateComplete
	formField.renderRoot.querySelector('label')?.setAttribute('part', 'label')
})

declare global {
	type CheckboxValue = 'checked' | 'unchecked' | 'indeterminate'
	interface HTMLElementTagNameMap {
		'mo-checkbox': Checkbox
	}
}