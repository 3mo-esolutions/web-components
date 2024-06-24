import { component, html, css, property, Component, event } from '@a11d/lit'
import { PageComponent } from '@a11d/lit-application'
import { SlotController } from '@3mo/slot-controller'

/**
 * @element mo-page
 *
 * @attr heading - The page heading
 * @attr fullHeight - Whether the page should take up the full height of the viewport
 * @attr headerHidden - Whether the page header should be hidden
 *
 * @slot - The page content
 * @slot heading - The page heading
 * @slot action - The page action
 *
 * @csspart header - The page header
 * @csspart heading - The page heading
 * @csspart action - The page action
 *
 * @fires pageHeadingChange - Dispatched when the page heading changes
 */
@component('mo-page')
@PageComponent.pageElement()
export class Page extends Component {
	@event({ bubbles: true, composed: true, cancelable: true }) readonly pageHeadingChange!: EventDispatcher<string>

	@property({ updated(this: Page, value: string) { this.pageHeadingChange.dispatch(value) } }) heading = ''
	@property({ type: Boolean, reflect: true }) fullHeight = false
	@property({ type: Boolean }) headerHidden = false

	static override get styles() {
		return css`
			:host {
				display: inherit;
				animation: transitionIn 150ms;
			}

			@keyframes transitionIn
			{
				0% {
					visibility: hidden;
					opacity: 0;
				}
				100% {
					visibility: visible;
					opacity: 1;
				}
			}

			:host([fullHeight]) {
				box-sizing: border-box;
				height: 100%;
				width: 100%;
			}

			mo-flex[part=header] {
				--_margin-alteration: calc(-1 * max(min(1rem, 1vw), min(1rem, 1vh)));
				min-height: 42px;
				margin: var(--_margin-alteration) var(--_margin-alteration) 0 var(--_margin-alteration);
				padding: 0 14px;
				border-block-end: 1px solid var(--mo-color-transparent-gray-3);
			}

			#container {
				height: 100%;
			}

			:host([fullHeight]) ::slotted(*:not([slot])) {
				height: 100%;
				width: 100%;
			}

			slot[name=action] {
				display: flex;
				flex-direction: row-reverse;
				gap: 8px;
				flex: 1;
			}
		`
	}

	private readonly slotController = new SlotController(this)

	private get hasHeading() {
		return !!this.heading || this.slotController.hasAssignedElements('heading')
	}

	private get hasActions() {
		return this.slotController.hasAssignedElements('action')
	}

	private get hasHeader() {
		return !this.headerHidden && (this.hasHeading || this.hasActions)
	}

	protected override get template() {
		return html`
			<mo-flex id='container' gap='var(--mo-page-gap, 14px)'>
				${this.headerTemplate}
				${this.contentTemplate}
			</mo-flex>
		`
	}

	protected get headerTemplate() {
		return !this.hasHeader ? html.nothing : html`
			<mo-flex part='header' direction='horizontal' alignItems='center'>
				<mo-heading typography='heading5'>
					<slot name='heading' part='heading'>
						${this.heading}
					</slot>
				</mo-heading>
				<slot name='action' part='action'></slot>
			</mo-flex>
		`
	}

	protected get contentTemplate() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-page': Page
	}
}