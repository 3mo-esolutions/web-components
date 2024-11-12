import { Component, component, css, event, eventListener, html, property, queryConnectedInstances } from '@a11d/lit'
import { PopoverPlacement } from './PopoverPlacement.js'
import { PopoverPositionController } from './PopoverPositionController.js'
import { PopoverAlignment } from './PopoverAlignment.js'
import { type PopoverCoordinates } from './PopoverCoordinates.js'
import { type Middleware, type ComputePositionReturn } from '@floating-ui/dom'

/**
 * @element mo-popover
 *
 * @attr fixed - Whether the popover is fixed.
 * @attr coordinates - The coordinates of the popover.
 * @attr anchor - The anchor element for the popover.
 * @attr target - The target element for the popover.
 * @attr placement - The placement of the popover relative to the anchor.
 * @attr alignment - The alignment of the popover relative to the anchor.
 * @attr offset - The offset of the popover.
 * @attr open - Whether the popover is open.
 * @attr manual - Whether the popover is manually controlled:
 * 	- When true, the popover is only opened or closed when the open attribute is set.
 * 	- When true, the popover is not opened when the anchor is clicked and not closed when outside of the popover is clicked.
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

	@property({ type: Boolean, reflect: true }) fixed = false
	@property({ type: Array }) coordinates?: PopoverCoordinates
	@property({ type: Object }) anchor?: HTMLElement
	@property() target?: string
	@property({ reflect: true }) placement = PopoverPlacement.BlockEnd
	@property({ reflect: true }) alignment = PopoverAlignment.Start
	@property({ type: Number }) offset?: number
	@property({ type: Boolean, reflect: true }) open = false
	@property({ type: Boolean }) manual = false

	@property({ type: Object }) shouldOpen?: (e: Event) => boolean
	@property({ type: Array }) positionMiddleware?: Array<Middleware>
	@property({ type: Object }) positionComputed?: (response: ComputePositionReturn) => void

	protected readonly positionController = new PopoverPositionController(this)

	setOpen(open: boolean) {
		if (this.open !== open) {
			this.open = open
			this.openChange.dispatch(open)
			if (open) {
				this.updateComplete.then(() => this.focus())
			} else {
				this.anchor?.focus()
			}
		}
	}

	@eventListener({ target: document, type: 'keydown', options: { capture: true } })
	protected handleDocumentKeyDown(e: KeyboardEvent) {
		if (this.manual || this.open === false) {
			return
		}

		if ([...Popover.instances].filter(i => i.open).at(-1) !== this) {
			return
		}

		if (e.key === 'Escape' || e.key === 'Esc') {
			e.stopPropagation()
			this.setOpen(false)
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
		if (this.manual) {
			return
		}

		const composedPath = e.composedPath()
		if (this.open && composedPath.includes(this) === false) {
			e.stopPropagation()
			this.setOpen(false)
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
			this.setOpen(true)
		}
	}

	override focus(options?: FocusOptions | undefined) {
		super.focus(options)
		this.querySelector<HTMLElement>('[autofocus]')?.focus?.()
	}

	static get translationStyles() {
		return css`
			:host(:not([fixed])[data-placement=block-start]) {
				inset-block-end: 100%;
			}
			:host(:not([fixed])[data-placement=block-end]) {
				inset-block-start: 100%;
			}
			:host(:not([fixed])[data-placement=inline-start]) {
				inset-inline-end: 100%;
			}
			:host(:not([fixed])[data-placement=inline-end]) {
				inset-inline-start: 100%;
			}

			:host(:not([fixed])[data-placement=block-start][data-alignment=start]),
			:host(:not([fixed])[data-placement=block-end][data-alignment=start]) {
				--mo-popover-translate-x: 0%;
				inset-inline-start: 0;
			}
			:host(:not([fixed])[data-placement=block-start][data-alignment=center]),
			:host(:not([fixed])[data-placement=block-end][data-alignment=center]) {
				--mo-popover-translate-x: -50%;
				left: 50%;
			}
			:host(:not([fixed])[data-placement=block-start][data-alignment=end]),
			:host(:not([fixed])[data-placement=block-end][data-alignment=end]) {
				--mo-popover-translate-x: 0%;
				inset-inline-end: 0;
			}

			:host(:not([fixed])[data-placement=inline-start][data-alignment=start]),
			:host(:not([fixed])[data-placement=inline-end][data-alignment=start]) {
				--mo-popover-translate-y: 0%;
				inset-block-start: 0;
			}
			:host(:not([fixed])[data-placement=inline-start][data-alignment=center]),
			:host(:not([fixed])[data-placement=inline-end][data-alignment=center]) {
				--mo-popover-translate-y: -50%;
				top: 50%;
			}
			:host(:not([fixed])[data-placement=inline-start][data-alignment=end]),
			:host(:not([fixed])[data-placement=inline-end][data-alignment=end]) {
				--mo-popover-translate-y: 0%;
				inset-block-end: 0;
			}
		`
	}

	static override get styles() {
		return css`
			:host {
				position: absolute;
				box-shadow: var(--mo-shadow);
				width: max-content;
				z-index: 99;
				/* Do not move these to default values as resetting these values are important to prevent inheriting them from other parent popovers */
				--mo-popover-translate-x: 0%;
				--mo-popover-translate-y: 0%;
				transform: translate(var(--mo-popover-translate-x), var(--mo-popover-translate-y));
			}

			:host(:not([open])) {
				display: none !important;
			}

			:host([fixed]) {
				position: fixed;
			}

			${Popover.translationStyles}
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