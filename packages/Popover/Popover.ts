import { Component, component, css, event, eventListener, html, property, query } from '@a11d/lit'
import { type Middleware } from '@floating-ui/dom'
import { PopoverPlacement } from './PopoverPlacement.js'
import { PopoverFloatingUiPositionController } from './PopoverFloatingUiPositionController.js'
import { PopoverCssAnchorPositionController } from './PopoverCssAnchorPositionController.js'
import { PopoverAlignment } from './PopoverAlignment.js'
import { type PopoverCoordinates } from './PopoverCoordinates.js'

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
	@property({ type: Object }) anchor?: HTMLElement
	@property() target?: string
	@property({ reflect: true }) placement = PopoverPlacement.BlockEnd
	@property({ reflect: true }) alignment = PopoverAlignment.Start
	@property({ type: Number }) offset?: number
	@property({ type: Boolean, reflect: true, updated(this: Popover) { if (this.isConnected) { this.togglePopover(this.open) } } }) open = false
	@property({ type: Object }) shouldOpen?: (e: Event) => boolean

	@property({ type: Array }) positionMiddleware?: Array<Middleware>

	@property({ type: Object }) cssRoot?: HTMLElement

	protected readonly positionController = PopoverCssAnchorPositionController.supported
		? new PopoverCssAnchorPositionController(this)
		: new PopoverFloatingUiPositionController(this)

	@query('[part=arrow]') readonly arrowElement?: HTMLElement

	@eventListener('beforetoggle')
	protected handleBeforeToggle(e: ToggleEvent) {
		const open = e.newState === 'open'
		this.openChange.dispatch(open)
		if (this.mode !== 'hint' && !open) {
			const target = this.target ? this.anchor?.closest(`#${this.target}`) : this.anchor
			if (target && target instanceof HTMLElement) {
				target.focus()
			}
		}
	}

	@eventListener({
		target(this: Popover) { return this.anchor ?? [] },
		type: 'keydown'
	})
	protected handleAnchorKeyDown(e: KeyboardEvent) {
		if (this.open === false && e.key === 'Enter') {
			(e as any)[Popover.isSyntheticClickEvent] = true
			// Prevent synthetic click event by the browser
			// because this will only happen when the anchor is focusable
			// but we need to intercept the event regardless
			this.handleClick(e, true)
		}
	}

	@eventListener({ target: document, type: 'click' })
	protected handleClick(e: Event, preventDefault = false) {
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
			e.stopPropagation()
			if (preventDefault) {
				e.preventDefault()
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
				border: none;
				overflow: unset;
			}

			:host(:not([open])) {
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
}