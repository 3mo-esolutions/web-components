import { component, property, css, Component, html, event } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import '@material/web/checkbox/checkbox.js'
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

			md-checkbox {
				margin-block: 7px;
				--md-checkbox-container-shape: var(--mo-border-radius);

				--md-checkbox-selected-disabled-container-color: var(--mo-checkbox-disabled-color, var(--mo-color-gray));
				--md-checkbox-selected-disabled-container-opacity: 0.5;
				--md-checkbox-selected-container-color: var(--mo-checkbox-accent-color, var(--mo-color-accent));
				--md-checkbox-selected-hover-container-color: var(--mo-checkbox-accent-color, var(--mo-color-accent));
				--md-checkbox-selected-focus-container-color: var(--mo-checkbox-accent-color, var(--mo-color-accent));
				--md-checkbox-selected-pressed-container-color: var(--mo-checkbox-accent-color, var(--mo-color-accent));

				--md-checkbox-state-layer-color: var(--mo-checkbox-accent-color, var(--mo-color-accent));
				--md-checkbox-hover-state-layer-color: var(--mo-checkbox-accent-color, var(--mo-color-accent));
				--md-checkbox-focus-state-layer-color: var(--mo-checkbox-accent-color, var(--mo-color-accent));
				--md-checkbox-pressed-state-layer-color: var(--mo-checkbox-accent-color, var(--mo-color-accent));

				--md-focus-ring-color: var(--mo-checkbox-accent-color, var(--mo-color-accent));
			}

			label {
				display: flex;
				align-items: center;
				gap: 8px;
				color: var(--mo-color-foreground);
				font-size: 0.875rem;
				line-height: 1.25rem;
				letter-spacing: 0.0178571429em;
				-webkit-font-smoothing: antialiased;
			}

			label > md-checkbox {
				--md-checkbox-selected-disabled-container-opacity: 1;
			}

			:host([disabled]) label {
				color: var(--mo-checkbox-disabled-color, var(--mo-color-gray));
				opacity: 0.5;
			}
		`
	}

	protected override get template() {
		return !this.label ? this.checkboxTemplate : html`
			<label>
				${this.checkboxTemplate}
				${this.label}
			</label>
		`
	}

	protected get checkboxTemplate() {
		return html`
			<md-checkbox
				?disabled=${this.disabled}
				?indeterminate=${this.indeterminate}
				?checked=${this.checked}
				@change=${this.handleChange.bind(this)}
			></md-checkbox>
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

declare global {
	type CheckboxValue = 'checked' | 'unchecked' | 'indeterminate'
	interface HTMLElementTagNameMap {
		'mo-checkbox': Checkbox
	}
}