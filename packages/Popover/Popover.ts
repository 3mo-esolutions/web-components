import { Component, component, css, event, eventListener, html, property, queryConnectedInstances } from '@a11d/lit'
import { PopoverPlacement } from './PopoverPlacement.js'
import { PopoverPositionController } from './PopoverPositionController.js'
import { PopoverAlignment } from './PopoverAlignment.js'
import { type PopoverCoordinates } from './PopoverCoordinates.js'
import { type Middleware, type ComputePositionReturn } from '@floating-ui/dom'

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

	@queryConnectedInstances() private static readonly instances: Set<Popover>

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
	@property({ type: Object }) positionComputed?: (response: ComputePositionReturn) => void

	protected readonly positionController = new PopoverPositionController(this)

	@eventListener('beforetoggle')
	protected handleBeforeToggle(e: ToggleEvent) {
		const open = e.newState === 'open'
		this.openChange.dispatch(open)
		if (this.mode !== 'hint') {
			if (open) {
				this.updateComplete.then(() => this.focus())
			} else {
				const target = this.target ? this.anchor?.closest(`#${this.target}`) : this.anchor
				if (target && target instanceof HTMLElement) {
					target.focus()
				}
			}
		}
	}

	@eventListener({ target: document, type: 'keydown', options: { capture: true } })
	protected handleDocumentKeyDown(e: KeyboardEvent) {
		if (this.mode === 'manual' || this.open === false) {
			return
		}

		if ([...Popover.instances].filter(i => i.open).at(-1) !== this) {
			return
		}

		if (e.key === 'Escape' || e.key === 'Esc') {
			e.stopPropagation()
			this.open = false
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
			}

			:host(:not([open])) {
				display: none !important;
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-popover': Popover
	}
}