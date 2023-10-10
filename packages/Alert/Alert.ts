import { component, css, Component, html, property, ifDefined, event } from '@a11d/lit'
import { MaterialIcon } from '@3mo/icon'
import { SlotController } from '@3mo/slot-controller'

export enum AlertType {
	Info = 'info',
	Success = 'success',
	Warning = 'warning',
	Error = 'error',
}

/**
 * @element mo-alert
 *
 * @attr heading
 * @attr type
 * @attr collapsible
 * @attr open
 *
 * @slot - The default slot is used to provide the content of the alert.
 *
 * @cssprop --mo-alert-border-radius
 * @cssprop --mo-alert-color-base
 * @cssprop --mo-alert-body-color-base
 *
 * @fires openChange - Fired when the alert is opened or closed.
 */
@component('mo-alert')
export class Alert extends Component {
	private static readonly iconByType = new Map<AlertType, MaterialIcon>([
		[AlertType.Info, 'info'],
		[AlertType.Success, 'check_circle'],
		[AlertType.Warning, 'warning'],
		[AlertType.Error, 'error'],
	])

	@event() readonly openChange!: EventDispatcher<boolean>

	@property({ type: String, reflect: true }) heading?: string
	@property({ type: String, reflect: true }) type = AlertType.Info
	@property({ type: Boolean, reflect: true }) collapsible = false
	@property({ type: Boolean, reflect: true }) open = false

	static override get styles() {
		return css`
			:host {
				width: 100%;
			}

			:host([type=success]) {
				--mo-alert-color-base: var(--mo-color-green-base);
			}

			:host([type=warning]) {
				--mo-alert-color-base: var(--mo-color-yellow-base);
			}

			:host([type=error]) {
				--mo-alert-color-base: var(--mo-color-red-base);
			}

			:host([type=info]) {
				--mo-alert-color-base: var(--mo-color-blue-base);
			}

			mo-flex[role=alert] {
				position: relative;
				border-radius: var(--mo-alert-border-radius, var(--mo-border-radius));
				padding: 8px;
				border-radius: var(--mo-alert-border-radius, var(--mo-border-radius));

				color: rgba(var(--mo-alert-color-base), 1);
				background: rgba(var(--mo-alert-color-base), 0.12);
			}

			slot {
				grid-column: 2 / -1;
				color: rgba(var(--mo-alert-body-color-base, var(--mo-color-foreground-base), 0.9));
				display: block;
			}

			:host([collapsible][heading]:not([open])) slot {
				display: none;
			}

			mo-grid {
				align-items: center;
				gap: 4px 12px;
				grid-template-columns: auto 1fr;
			}

			:host([collapsible]) mo-grid {
				grid-template-columns: auto 1fr auto;
			}

			mo-heading {
				flex: 1;
			}

			mo-icon-button {
				align-self: center;
			}

			mo-icon {
				align-self: start
			}

			:host([collapsible]) mo-icon {
				align-self: center;
			}
		`
	}

	protected readonly slotController = new SlotController(this)

	protected override get template() {
		return html`
			<mo-flex role='alert'>
				<mo-grid>
					${this.iconTemplate}
					${this.headingTemplate}
					${this.expandIconTemplate}
					${this.slotTemplate}
				</mo-grid>
			</mo-flex>
		`
	}

	protected get iconTemplate() {
		return html`<mo-icon icon=${ifDefined(Alert.iconByType.get(this.type))}></mo-icon>`
	}

	protected get headingTemplate() {
		return !this.heading ? html.nothing : html`
			<mo-heading part='heading' typography='heading4'>${this.heading}</mo-heading>
		`
	}

	protected get expandIconTemplate() {
		return !this.collapsible || !this.heading ? html.nothing : html`
			<mo-expand-collapse-icon-button
				?open=${this.open}
				@click=${() => this.toggleOpen()}
			></mo-expand-collapse-icon-button>
		`
	}

	protected toggleOpen() {
		this.open = !this.open
		this.openChange.dispatch(this.open)
	}

	protected get slotTemplate() {
		return !this.slotController.hasAssignedContent('') ? html.nothing : html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-alert': Alert
	}
}