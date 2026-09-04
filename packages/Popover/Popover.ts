import { Component, component, css, event, eventListener, html, property, query } from '@a11d/lit'
import { PopoverPlacement } from './PopoverPlacement.js'
import { type PopoverCoordinates } from './PopoverCoordinates.js'
import { PopoverAlignment } from './PopoverAlignment.js'
import { PopoverFloatingUiPositionController } from './PopoverFloatingUiPositionController.js'
import { PopoverCssAnchorPositionController } from './PopoverCssAnchorPositionController.js'

export type PopoverMode = 'auto' | 'manual' | 'hint'

/**
 * @element mo-popover
 *
 * @attr coordinates - The coordinates of the popover.
 * @attr anchor - The anchor element for the popover.
 * @attr target - The target element for the popover.
 * @attr placement - The placement of the popover relative to the anchor.
 * @attr alignment - The alignment of the popover relative to the anchor.
 * @attr offset - The offset of the popover.
 * @attr open - Whether the popover is open.
 * @attr mode - Whether the popover is manually controlled:
 * 	- `auto` (default): can be "light dismissed" — this means that you can hide the popover by clicking outside it or pressing the Esc key. Showing an auto popover will generally close other auto popovers that are already displayed, unless they are nested.
 * 	- `manual`: cannot be "light dismissed" and are not automatically closed. Popovers must explicitly be opened via setting the `open` property. Multiple independent manual popovers can be shown simultaneously.
 * 	- `hint`: do not close auto popovers when they are displayed, but will close other hint popovers. They can be light dismissed and will respond to close requests.
 *
 * @slot - Default slot for popover content
 *
 * @fires openChange - Dispatched when the popover is opened or closed.
 */
@component('mo-popover')
export class Popover extends Component {
	static override shadowRootOptions: ShadowRootInit = { ...Component.shadowRootOptions, delegatesFocus: true }

	static readonly isSyntheticClickEvent = Symbol('isSyntheticClickEvent')
	static shouldOpen(this: { anchor?: HTMLElement, target?: string }, e: Event) {
		return !!this.anchor
			&& e.composedPath().includes(this.anchor)
			&& (!this.target || e.composedPath().some(target => target instanceof Element && target.id === this.target))
	}

	@event() readonly openChange!: EventDispatcher<boolean>

	@property({ reflect: true, updated(this: Popover) { this.popover = this.mode } }) mode: PopoverMode = 'auto'
	@property({ type: Array }) coordinates?: PopoverCoordinates
	@property({ type: Object, updated(this: Popover) { this.anchorUpdated() } }) anchor?: HTMLElement
	@property() target?: string
	@property({ reflect: true }) placement = PopoverPlacement.BlockEnd
	@property({ reflect: true }) alignment = PopoverAlignment.Start
	@property({ type: Number }) offset?: number
	@property({ type: Boolean, reflect: true, updated(this: Popover) { this.openUpdated() } }) open = false
	@property({ type: Object, noAccessor: true }) shouldOpen?: (e: Event) => boolean

	readonly positionController = PopoverCssAnchorPositionController.supported
		? new PopoverCssAnchorPositionController(this)
		: new PopoverFloatingUiPositionController(this)

	@query('[part=arrow]') readonly arrowElement?: HTMLElement

	// Bound synchronously, as a gap after an anchor or open change would miss the very interaction causing it
	private readonly handleAnchorClick = (e: Event) => this.handleClick(e)
	private readonly handleAnchorKeyDownEvent = (e: Event) => this.handleAnchorKeyDown(e as KeyboardEvent)
	private readonly handleDocumentClick = (e: Event) => this.handleClick(e)

	private subscribedAnchor?: HTMLElement
	protected anchorUpdated() {
		this.subscribedAnchor?.removeEventListener('click', this.handleAnchorClick)
		this.subscribedAnchor?.removeEventListener('keydown', this.handleAnchorKeyDownEvent)
		this.subscribedAnchor = this.anchor
		this.subscribedAnchor?.addEventListener('click', this.handleAnchorClick)
		this.subscribedAnchor?.addEventListener('keydown', this.handleAnchorKeyDownEvent)
	}

	override connectedCallback() {
		super.connectedCallback()
		this.anchorUpdated()
	}

	override disconnectedCallback() {
		super.disconnectedCallback()
		this.subscribedAnchor?.removeEventListener('click', this.handleAnchorClick)
		this.subscribedAnchor?.removeEventListener('keydown', this.handleAnchorKeyDownEvent)
		this.subscribedAnchor = undefined
		document.removeEventListener('click', this.handleDocumentClick)
	}

	protected openUpdated() {
		if (this.open) {
			document.addEventListener('click', this.handleDocumentClick)
		} else {
			document.removeEventListener('click', this.handleDocumentClick)
		}

		if (this.isConnected && this.open !== this.matches(':popover-open')) {
			if (this.open) {
				// The source establishes the implicit anchor used for native anchor positioning
				// alongside a sensible keyboard focus navigation order. Engines without support
				// for the options parameter ignore it altogether.
				const source = this.positionController instanceof PopoverCssAnchorPositionController
					? this.positionController.anchorElement
					: this.anchor
				this.showPopover({ source })
			} else {
				this.hidePopover()
			}
		}
	}

	@eventListener('toggle')
	protected handleToggle(e: ToggleEvent) {
		const open = e.newState === 'open'
		// Follows platform-driven toggles too: "Esc" light dismissal and native invoker buttons
		this.open = open
		this.openChange.dispatch(open)
		if (this.mode !== 'hint' && !open) {
			const target = this.target ? this.anchor?.closest(`#${this.target}`) : this.anchor
			if (target && target instanceof HTMLElement) {
				target.focus()
			}
		}
	}

	protected handleAnchorKeyDown(e: KeyboardEvent) {
		if (this.open === false && e.key === 'Enter') {
			(e as any)[Popover.isSyntheticClickEvent] = true
			// Prevent synthetic click event by the browser
			// because this will only happen when the anchor is focusable
			// but we need to intercept the event regardless
			this.handleClick(e, true)
		}
	}

	/**
	 * Marks an interaction as handled, so that one opening the popover from outside — still propagating
	 * towards the document as the light-dismiss listener appears — does not dismiss it right away.
	 */
	consumeInteraction(event: Event) {
		this.lastHandledClickEvent = event
	}

	private lastHandledClickEvent?: Event
	protected handleClick(e: Event, preventDefault = false) {
		if (this.lastHandledClickEvent === e) {
			// Reaches this handler through both the anchor and, while open, the document listener
			return
		}
		this.lastHandledClickEvent = e

		if (this.mode === 'manual') {
			return
		}

		const composedPath = e.composedPath()
		if (this.open && composedPath.includes(this) === false) {
			e.stopPropagation()
			this.open = false
			if (this.anchor && composedPath.includes(this.anchor)) {
				return
			}
		}

		const shouldOpen = this.shouldOpen ?? Popover.shouldOpen.bind(this)
		if (this.open === false && shouldOpen(e)) {
			// Stopping propagation here, on the anchor, would cut off handlers further up, e.g. a parent menu's auto-close
			if (preventDefault) {
				e.preventDefault()
				e.stopPropagation()
			}
			this.open = true
		}
	}

	static override get styles() {
		return css`
			:host {
				box-shadow: var(--mo-shadow);
				margin: 0;
				padding: 0;
				border: 1px solid var(--mo-color-transparent-gray-3);
				overflow: unset;
				transition: opacity 125ms, transform 125ms, display 0ms allow-discrete;
			}

			:host([open]) {
				opacity: 1;
				@starting-style { opacity: 0; }
			}

			:host(:not([open])) {
				opacity: 0;
				display: none !important;
			}

			${PopoverCssAnchorPositionController.styles}

			[part=arrow] {
				display: none;
				position: absolute;
				pointer-events: none;
				clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
				background: inherit;
				z-index: -1;
				width: 1rem;
				aspect-ratio: 1 / 1;
				&[data-placement=top] {
					transform: translateY(-50%);
					top: 0;
				}
				&[data-placement=bottom] {
					transform: translateY(50%);
					bottom: 0;
				}
				&[data-placement=left] {
					transform: translateX(-50%);
					left: 0;
				}
				&[data-placement=right] {
					transform: translateX(50%);
					right: 0;
				}
			}
		`
	}

	protected override get template() {
		return html`
			<div part='arrow'></div>
			<slot></slot>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-popover': Popover
	}

	interface HTMLElement {
		showPopover(options?: { source?: HTMLElement }): void
	}
}