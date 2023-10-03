import { component, property, css, Component, html, event } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import '@material/web/switch/switch.js'
import '@3mo/theme'
import { MdSwitch } from '@material/web/switch/switch.js'

/**
 * @element mo-switch
 *
 * @attr label
 * @attr disabled
 * @attr selected
 *
 * @cssprop --mo-switch-accent-color
 * @cssprop --mo-switch-unselected-color
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

			:host([disabled]) {
				pointer-events: none;
			}

			md-switch {
				margin-block: 7px;
				padding-inline-start: 3px;
				--md-switch-container-shape: var(--mo-border-radius);

				--md-switch-state-layer-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-hover-state-layer-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-focus-state-layer-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-pressed-state-layer-color: var(--mo-switch-accent-color, var(--mo-color-accent));

				--md-switch-selected-state-layer-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-selected-hover-state-layer-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-selected-focus-state-layer-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-selected-pressed-state-layer-color: var(--mo-switch-accent-color, var(--mo-color-accent));

				--md-switch-disabled-handle-color: var(--mo-switch-unselected-color, var(--mo-color-foreground));
				--md-switch-handle-color: var(--mo-switch-unselected-color, var(--mo-color-foreground));
				--md-switch-hover-handle-color: var(--mo-switch-unselected-color, var(--mo-color-foreground));
				--md-switch-focus-handle-color: var(--mo-switch-unselected-color, var(--mo-color-foreground));
				--md-switch-pressed-handle-color: var(--mo-switch-unselected-color, var(--mo-color-foreground));

				--md-switch-disabled-track-color: var(--mo-switch-unselected-color, var(--mo-color-foreground));
				--md-switch-track-color: var(--mo-switch-unselected-color, var(--mo-color-foreground));
				--md-switch-hover-track-color: var(--mo-switch-unselected-color, var(--mo-color-foreground));
				--md-switch-focus-track-color: var(--mo-switch-unselected-color, var(--mo-color-foreground));
				--md-switch-pressed-track-color: var(--mo-switch-unselected-color, var(--mo-color-foreground));

				--md-focus-ring-color: var(--mo-switch-accent-color, var(--mo-color-accent));

				--md-switch-disabled-selected-track-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-selected-track-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-selected-hover-track-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-selected-focus-track-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-selected-pressed-track-color: var(--mo-switch-accent-color, var(--mo-color-accent));

				--md-switch-disabled-selected-handle-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-selected-handle-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-selected-hover-handle-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-selected-focus-handle-color: var(--mo-switch-accent-color, var(--mo-color-accent));
				--md-switch-selected-pressed-handle-color: var(--mo-switch-accent-color, var(--mo-color-accent));

				--md-switch-disabled-handle-opacity: 1;
				--md-switch-handle-opacity: 1;
				--md-switch-hover-handle-opacity: 1;
				--md-switch-focus-handle-opacity: 1;
				--md-switch-pressed-handle-opacity: 1;

				--md-switch-track-height: 14px;
				--md-switch-track-width: 36px;
				--md-switch-handle-height: 20px;
				--md-switch-handle-width: 20px;
				--md-switch-track-outline-width: 0px;
			}

			md-switch::part(track)::before {
				opacity: 0.5;
			}

			label {
				display: flex;
				align-items: center;
				gap: 11px;
				color: var(--mo-color-foreground);
				font-size: 0.875rem;
				line-height: 1.25rem;
				letter-spacing: 0.0178571429em;
				-webkit-font-smoothing: antialiased;
			}

			:host([disabled]) label {
				color: var(--mo-color-gray);
				opacity: 0.5;
			}
		`
	}

	protected override get template() {
		return !this.label ? this.switchTemplate : html`
			<label>
				${this.switchTemplate}
				${this.label}
			</label>
		`
	}

	protected get switchTemplate() {
		return html`
			<md-switch
				?disabled=${this.disabled}
				?selected=${this.selected}
				@click=${this.handleClick.bind(this)}
			></md-switch>
		`
	}

	protected handleClick() {
		this.selected = !this.selected
		this.change.dispatch(this.selected)
	}
}

MdSwitch.addInitializer(s => s.addController({
	hostUpdated: () => s.renderRoot.querySelector('.track')?.part.add('track'),
}))

declare global {
	interface HTMLElementTagNameMap {
		'mo-switch': Switch
	}
}