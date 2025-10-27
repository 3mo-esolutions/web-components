import { component, css, Component, html, property, ifDefined, event } from '@a11d/lit'
import { type MaterialIcon } from '@3mo/icon'
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
 * @ssr true
 *
 * @attr heading - The heading of the alert.
 * @attr type - The type can be 'info', 'success', 'warning', or 'error'.
 * @attr collapsible - Whether the alert can be collapsed.
 * @attr open - Whether the alert is open. Only applies when the alert is @see {collapsible}.
 *
 * @slot - The default slot is used to provide the content of the alert.
 *
 * @cssprop --mo-alert-color - The color of the alert.
 *
 * @fires openChange - Dispatched when the alert is opened or closed.
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
				height: fit-content;
				border-radius: var(--mo-border-radius);
			}

			:host([type=success]) {
				--mo-alert-color: var(--mo-color-green);
			}

			:host([type=warning]) {
				--mo-alert-color: var(--mo-color-yellow);
			}

			:host([type=error]) {
				--mo-alert-color: var(--mo-color-red);
			}

			:host([type=info]) {
				--mo-alert-color: var(--mo-color-blue);
			}

			mo-grid {
				position: relative;
				height: 100%;
				border-radius: inherit;
				box-sizing: border-box;
				padding: 0.5rem;
				background: color-mix(in srgb, var(--mo-alert-color), transparent 75%);
				column-gap: 0.75rem;
				grid-template-columns: auto 1fr auto;
				grid-template-rows: auto 1fr;
				grid-template-areas:
					'icon content content'
					'xxx content content';
				&[data-has-heading] {
					grid-template-areas:
						'icon heading heading'
						'xxx content content';

					&[data-collapsible] {
						grid-template-areas:
						'icon heading expand-icon'
						'xxx content content';
					}
				}
			}

			mo-icon {
				grid-area: icon;
				align-self: center;
			}

			mo-heading {
				grid-area: heading;
				align-self: center;
			}

			mo-expand-collapse-icon-button {
				grid-area: expand-icon;
				align-self: center;
			}

			mo-icon, mo-heading, mo-expand-collapse-icon-button {
				color: color-mix(in srgb, var(--mo-alert-color), var(--mo-color-foreground) 25%);
			}

			slot {
				display: block;
				grid-area: content;
				color: color-mix(in srgb, currentColor, transparent 10%);
				interpolate-size: allow-keywords;
				transition: height 0.25s ease, opacity 0.25s ease, margin 0.25s ease;
				overflow: hidden;
				&[data-has-heading] {
					margin-block-start: 8px;
				}
				&[data-collapsed], &[data-empty] {
					height: 0;
					margin-block-start: 0;
				}
			}
		`
	}

	protected readonly slotController = new SlotController(this)

	protected override get template() {
		return html`
			<mo-grid role='alert' ?data-has-heading=${!!this.heading} ?data-collapsible=${!!this.heading && this.collapsible}>
				${this.iconTemplate}
				${this.headingTemplate}
				${this.expandIconTemplate}
				${this.slotTemplate}
			</mo-grid>
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
		return html`
			<slot
				?data-has-heading=${!!this.heading}
				?data-collapsed=${!!this.heading && this.collapsible && !this.open}
				?data-empty=${!this.slotController.hasAssignedContent('')}
			></slot>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-alert': Alert
	}
}