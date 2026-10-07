import { component, property, css, Component, html, event, isServer, type PropertyValues } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import { MdCheckbox } from '@material/web/checkbox/checkbox.js'
import '@3mo/theme'

/**
 * A checkbox with an optional label, which can also show a partial selection.
 *
 * @element mo-checkbox
 *
 * @attr label - The label of the checkbox.
 * @attr disabled - Whether the checkbox is disabled or not.
 * @attr selected - Whether the checkbox is selected or not. This can be set to 'indeterminate' to show a dash instead of a check-mark.
 *
 * @cssprop --mo-checkbox-accent-color - The color of the selected box, its focus ring and its state layer
 * @cssprop --mo-checkbox-disabled-color - The color of a disabled checkbox and its label
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
				font-size: 0.875rem;
			}

			:host([disabled]) {
				pointer-events: none;
			}

			md-checkbox {
				flex-shrink: 0;
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
				display: flex;
				gap: 0.5rem;
				-webkit-font-smoothing: antialiased;
				user-select: none;

				&[data-disabled] {
					color: var(--mo-checkbox-disabled-color, var(--mo-color-gray));
					opacity: 0.5;
				}

				md-checkbox {
					margin-block-start: max(0px, calc(calc(1lh - 18px) / 2));
				}
			}
		`
	}

	protected override get template() {
		return !this.label ? this.checkboxTemplate : html`
			<label ?data-disabled=${this.disabled}>
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

// A server calls "willUpdate" but not "update", in which "md-checkbox" records the previous state its classes show.
const willUpdate = MdCheckbox.prototype['willUpdate']
MdCheckbox.prototype['willUpdate'] = function (this: MdCheckbox, changedProperties: PropertyValues) {
	if (isServer) {
		Object.assign(this, { prevChecked: this.checked, prevDisabled: this.disabled, prevIndeterminate: this.indeterminate })
	}
	willUpdate.call(this, changedProperties)
}

declare global {
	type CheckboxSelection = boolean | 'indeterminate'
	interface HTMLElementTagNameMap {
		'mo-checkbox': Checkbox
	}
}
