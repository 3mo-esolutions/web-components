import { component, css, Component, html, property, ifDefined, nothing, style } from '@a11d/lit'
import { MaterialIcon } from '@3mo/icon'
import { SlotController } from '@3mo/slot-controller'
import '@3mo/icon-button'
import '@3mo/flex'
import '@3mo/grid'
import '@3mo/heading'

export const enum AlertType {
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
 */
@component('mo-alert')
export class Alert extends Component {
	private static readonly iconByType = new Map<AlertType, MaterialIcon>([
		[AlertType.Info, 'info'],
		[AlertType.Success, 'check_circle'],
		[AlertType.Warning, 'warning'],
		[AlertType.Error, 'error'],
	])

	@property({ type: String, reflect: true }) heading?: string
	@property({ type: String, reflect: true }) type = AlertType.Info
	@property({ type: Boolean, reflect: true }) collapsible = false
	@property({ type: Boolean, reflect: true }) open = false

	static override get styles() {
		return css`
			:host {
				--mo-alert-success-color-base : 93, 170, 96;
				--mo-alert-warning-color-base: 232, 152, 35;
				--mo-alert-error-color-base: 221, 61, 49;
				--mo-alert-info-color-base: 0, 119, 200;
				width: 100%;
			}

			:host([type=success]) {
				--mo-alert-color-base: var(--mo-alert-success-color-base);
			}

			:host([type=warning]) {
				--mo-alert-color-base: var(--mo-alert-warning-color-base);
			}

			:host([type=error]) {
				--mo-alert-color-base: var(--mo-alert-error-color-base);
			}

			:host([type=info]) {
				--mo-alert-color-base: var(--mo-alert-info-color-base);
			}

			mo-flex[role=alert] {
				position: relative;
				border-radius: var(--mo-alert-border-radius, var(--mo-border-radius, 4px));
				padding: 8px;
				border-radius: var(--mo-alert-border-radius, var(--mo-border-radius, 4px));

				color: rgba(var(--mo-alert-color-base), 1);
				background: rgba(var(--mo-alert-color-base), 0.12);
			}

			slot {
				grid-column: 2 / -1;
				color: rgba(var(--mo-alert-body-color-base, var(--mo-color-foreground-base, 0, 0, 0), 0.9));
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
		`
	}

	protected readonly slotController = new SlotController(this)

	private get isCollapsible() {
		return this.collapsible && this.heading
	}

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
		return html`
			<mo-icon
				${style({ alignSelf: this.collapsible ? 'center' : 'start' })}
				icon=${ifDefined(Alert.iconByType.get(this.type))}
			></mo-icon>
		`
	}

	protected get headingTemplate() {
		return !this.heading ? nothing : html`
			<mo-heading part='heading' typography='heading4' ${style({ width: '*' })}>${this.heading}</mo-heading>
		`
	}

	protected get expandIconTemplate() {
		return !this.isCollapsible ? nothing : html`
			<mo-icon-button dense ${style({ alignSelf: 'center' })}
				icon=${this.open ? 'expand_less' : 'expand_more'}
				@click=${() => this.open = !this.open}
			></mo-icon-button>
		`
	}

	protected get slotTemplate() {
		return !this.slotController.hasAssignedNodes('') ? nothing : html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-alert': Alert
	}
}