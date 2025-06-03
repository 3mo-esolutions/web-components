import { component, property, css, Component, html, event } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import '@material/web/checkbox/checkbox.js'
import '@3mo/theme'

/**
 * @element mo-checkbox
 *
 * @ssr true
 *
 * @attr label - The label of the checkbox.
 * @attr disabled - Whether the checkbox is disabled or not.
 * @attr selected - Whether the checkbox is selected or not. This can be set to 'indeterminate' to show a dash instead of a check-mark.
 *
 * @cssprop --mo-checkbox-accent-color
 * @cssprop --mo-checkbox-disabled-color
 *
 * @fires change - Dispatched when the selection state of the checkbox changes.
 */
@component('mo-checkbox')
export class Checkbox extends Component {
	static selectedPropertyConverter = (value: unknown) => value === 'indeterminate' ? value : value === ''

	@event() readonly change!: EventDispatcher<CheckboxSelection>

	@property() label = ''
	@disabledProperty() disabled = false
	@property({
		type: Boolean,
		bindingDefault: true,
		event: 'change',
		converter: Checkbox.selectedPropertyConverter,
	}) selected: CheckboxSelection = false

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
				align-items: center;
			}

			:host([disabled]) {
				pointer-events: none;
			}

			md-checkbox {
				flex-shrink: 0;
				margin-block-start: max(0px, calc(calc(1lh - 18px) / 2));
				--md-checkbox-selected-disabled-container-opacity: 1;
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
				padding-block: 7px;
				display: flex;
				gap: 0.5rem;
				font-size: 0.875rem;
				-webkit-font-smoothing: antialiased;
				user-select: none;
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
				?indeterminate=${this.selected === 'indeterminate'}
				?checked=${this.selected === true}
				@change=${this.handleChange.bind(this)}
			></md-checkbox>
		`
	}

	protected handleChange(event: Event) {
		event.stopImmediatePropagation()
		const checkbox = event.target as HTMLInputElement
		const selection = checkbox.indeterminate ? 'indeterminate' : checkbox.checked
		this.selected = selection
		this.change.dispatch(selection)
	}
}

declare global {
	type CheckboxSelection = boolean | 'indeterminate'
	interface HTMLElementTagNameMap {
		'mo-checkbox': Checkbox
	}
}