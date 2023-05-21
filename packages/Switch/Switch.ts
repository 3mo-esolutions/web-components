import { component, property, css, Component, html, event } from '@a11d/lit'
import { Formfield as FormField } from '@material/mwc-formfield'
import { disabledProperty } from '@3mo/disabled-property'
import '@material/mwc-switch'
import '@3mo/theme'

/**
 * @element mo-switch
 *
 * @attr label
 * @attr disabled
 * @attr selected
 *
 * @cssprop --mo-switch-unchecked-color
 * @cssprop --mo-switch-accent-color
 * @cssprop --mo-switch-disabled-color
 * @cssprop --mo-switch-unselected-handle-color
 * @cssprop --mo-switch-unselected-track-color
 * @cssprop --mo-switch-selected-track-color
 *
 * @cssprop --mo-switch-selected-icon-color
 *
 * @fires change - Fired when the checked state of the switch changes.
 */
@component('mo-switch')
export class Switch extends Component {
	@event() readonly change!: EventDispatcher<boolean>

	@property() label = ''
	@disabledProperty() disabled = false
	@property({ type: Boolean }) selected = false

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
			}

			mwc-switch {
				--mdc-theme-primary: var(--mo-switch-accent-color, var(--mo-color-accent));
				--mdc-theme-secondary: var(--mdc-theme-primary);
				--mdc-switch-touch-target-size: 36px;
				--mdc-switch-ripple-size: 36px;

				--mdc-switch-selected-handle-color: var(--mdc-theme-primary);
				--mdc-switch-selected-focus-handle-color: var(--mdc-switch-selected-handle-color);
				--mdc-switch-selected-hover-handle-color: var(--mdc-switch-selected-handle-color);
				--mdc-switch-selected-pressed-handle-color: var(--mdc-switch-selected-handle-color);

				--mdc-switch-selected-track-color: var(--mo-switch-selected-track-color, rgba(var(--mo-color-accent-base), 0.5));
				--mdc-switch-selected-focus-track-color: var(--mdc-switch-selected-track-color);
				--mdc-switch-selected-hover-track-color: var(--mdc-switch-selected-track-color);
				--mdc-switch-selected-pressed-track-color: var(--mdc-switch-selected-track-color);

				--mdc-switch-selected-focus-state-layer-color: var(--mdc-theme-primary);
				--mdc-switch-selected-hover-state-layer-color: var(--mdc-theme-primary);
				--mdc-switch-selected-pressed-state-layer-color: var(--mdc-theme-primary);
				--mdc-switch-selected-icon-color: var(--mo-switch-selected-icon-color, var(--mo-color-on-accent));

				--mdc-switch-unselected-handle-color: var(--mo-switch-unselected-handle-color, var(--mo-color-foreground));
				--mdc-switch-unselected-focus-handle-color: var(--mdc-switch-unselected-handle-color);
				--mdc-switch-unselected-hover-handle-color: var(--mdc-switch-unselected-handle-color);
				--mdc-switch-unselected-pressed-handle-color: var(--mdc-switch-unselected-handle-color);

				--mdc-switch-unselected-track-color: var(--mo-switch-unselected-track-color, rgba(var(--mo-color-foreground-base), 0.25));
				--mdc-switch-unselected-focus-track-color: var(--mdc-switch-unselected-track-color);
				--mdc-switch-unselected-hover-track-color: var(--mdc-switch-unselected-track-color);
				--mdc-switch-unselected-pressed-track-color: var(--mdc-switch-unselected-track-color);

				--mdc-switch-unselected-state-layer-color: var(--mo-switch-unselected-state-layer-color, var(--mo-color-foreground));
				--mdc-switch-unselected-focus-state-layer-color: var(--mdc-switch-unselected-state-layer-color);
				--mdc-switch-unselected-hover-state-layer-color: var(--mdc-switch-unselected-state-layer-color);
				--mdc-switch-unselected-pressed-state-layer-color: var(--mdc-switch-unselected-state-layer-color);

				--mdc-switch-unselected-icon-color: var(--mo-color-background);
			}

			mwc-formfield::part(label) {
				padding-inline-start: 0px;
				text-align: start;
			}

			:host([disabled]) mwc-formfield::part(label) {
				color: var(--mo-switch-disabled-color, var(--mo-color-gray-transparent));
			}
		`
	}

	protected override get template() {
		return html`
			<mwc-formfield label=${this.label}>
				<mwc-switch
					?disabled=${this.disabled}
					?selected=${this.selected}
					@click=${this.handleClick.bind(this)}
				></mwc-switch>
			</mwc-formfield>
		`
	}

	protected handleClick() {
		this.selected = !this.selected
		this.change.dispatch(this.selected)
	}
}

FormField.addInitializer(async element => {
	const formField = element as FormField
	await formField.updateComplete
	formField.renderRoot.querySelector('label')?.setAttribute('part', 'label')
})

declare global {
	interface HTMLElementTagNameMap {
		'mo-switch': Switch
	}
}