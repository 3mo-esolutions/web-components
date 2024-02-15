import { component, html, css, property, Component, event } from '@a11d/lit'
import { PageComponent } from '@a11d/lit-application'
import { SlotController } from '@3mo/slot-controller'

/**
 * @element mo-page
 *
 * @attr heading
 * @attr fullHeight
 * @attr headerHidden
 *
 * @slot - Page content
 * @slot heading
 * @slot headingDetails
 *
 * @fires pageHeadingChange - Dispatched when the page heading changes
 */
@component('mo-page')
@PageComponent.pageElement()
export class MaterialPage extends Component {
	@event({ bubbles: true, composed: true, cancelable: true }) readonly pageHeadingChange!: EventDispatcher<string>

	@property({ updated(this: MaterialPage, value: string) { this.pageHeadingChange.dispatch(value) } }) heading = ''
	@property({ type: Boolean, reflect: true }) fullHeight = false
	@property({ type: Boolean }) headerHidden = false

	static override get styles() {
		return css`
			:host {
				display: inherit;
				animation: transitionIn 250ms;
			}

			slot[name=heading] {
				font-size: medium;
				color: var(--mo-color-foreground);
				font-weight: 500;
				letter-spacing: 0.015em;
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
   		 	padding: 0 var(--mo-thickness-xl);
    		background-color: white;
    		box-shadow: 0px 5px 5px -3px rgba(var(--mo-shadow-base), 0.2), 0px 8px 10px 1px rgba(var(--mo-shadow-base), 0.1), 0px 3px 14px 2px rgba(var(--mo-shadow-base), 0.02);
			}

			#container {
				height: 100%;
			}

			:host([fullHeight]) ::slotted(*:not([slot])) {
				height: 100%;
				width: 100%;
			}

			@keyframes transitionIn
			{
				0% {
					visibility: hidden;
					transform: translate3d(0, 100px, 100px);
					opacity: 0;
				}
				100% {
					visibility: visible;
					transform: translate3d(0);
					opacity: 1;
				}
			}
		`
	}

	protected override initialized() {
		this.setAttribute('exportparts', 'header:pageHeader,heading:pageHeading,headingDetails:pageHeadingDetails')
	}

	private readonly slotController = new SlotController(this)

	private get hasHeading() {
		return !!this.heading || this.slotController.hasAssignedElements('heading')
	}

	private get hasHeadingDetails() {
		return this.slotController.hasAssignedElements('headingDetails')
	}

	private get hasHeader() {
		return !this.headerHidden && (this.hasHeading || this.hasHeadingDetails)
	}

	protected override get template() {
		return html`
			<mo-flex id='container' gap='var(--mo-thickness-xl)'>
				${this.headerTemplate}
				${this.contentTemplate}
			</mo-flex>
		`
	}

	protected get headerTemplate() {
		return !this.hasHeader ? html.nothing : html`
			<mo-flex part='header' direction='horizontal' justifyContent='space-between' alignItems='center'>
				${this.headingContentTemplate}
			</mo-flex>
		`
	}

	protected get headingContentTemplate() {
		return !this.hasHeading && !this.hasHeadingDetails ? html.nothing : html`
			<slot name='heading' part='heading'>${this.heading}</slot>
			<slot name='headingDetails' part='headingDetails'></slot>
		`
	}

	protected get contentTemplate() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-page': MaterialPage
	}
}