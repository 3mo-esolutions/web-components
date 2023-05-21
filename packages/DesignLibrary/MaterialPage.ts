import { component, html, css, property, Component, event, nothing } from '@a11d/lit'
import { PageComponent } from '@a11d/lit-application'
import { SlotController } from '@3mo/slot-controller'

/**
 * @element mo-page
 *
 * @attr heading
 * @attr fullHeight
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

	static override get styles() {
		return css`
			:host {
				display: inherit;
				animation: transitionIn 250ms;
			}

			slot[name=heading] {
				font-size: large;
				color: var(--mo-color-accent);
			}

			:host([fullHeight]) {
				box-sizing: border-box;
				height: 100%;
				width: 100%;
			}

			mo-flex[part=header] {
				min-height: 42px;
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

	protected override get template() {
		return html`
			<mo-flex id='container' gap='var(--mo-thickness-xl)'>
				<mo-flex part='header' direction='horizontal' justifyContent='space-between' alignItems='center'>
					${this.headingContentTemplate}
				</mo-flex>
				${this.contentTemplate}
			</mo-flex>
		`
	}

	protected get headingContentTemplate() {
		return !this.hasHeading && !this.hasHeadingDetails ? nothing : html`
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