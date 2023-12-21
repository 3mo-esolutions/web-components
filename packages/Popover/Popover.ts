import { Component, component, css, event, eventListener, html, property } from '@a11d/lit'
import { PopoverPlacement } from './PopoverPlacement.js'
import { PopoverPositionController } from './PopoverPositionController.js'
import { PopoverAlignment } from './PopoverAlignment.js'
import { PopoverCoordinates } from './PopoverCoordinates.js'
import { queryConnectedInstances } from '@3mo/query-connected-instances'

/**
 * @element mo-popover
 *
 * @attr fixed - Whether the popover is fixed.
 * @attr coordinates - The coordinates of the popover.
 * @attr anchor - The anchor element for the popover.
 * @attr placement - The placement of the popover relative to the anchor.
 * @attr alignment - The alignment of the popover relative to the anchor.
 * @attr open - Whether the popover is open.
 * @attr manual - Whether the popover is manually controlled:
 * 	- When true, the popover is only opened or closed when the open attribute is set.
 * 	- When true, the popover is not opened when the anchor is clicked and not closed when outside of the popover is clicked.
 *
 * @slot - Default slot for popover content
 *
 * @fires openChange - Fired when the popover is opened or closed.
 */
@component('mo-popover')
export class Popover extends Component {
	static override shadowRootOptions: ShadowRootInit = { ...Component.shadowRootOptions, delegatesFocus: true }

	@queryConnectedInstances() private static readonly instances: Set<Popover>

	@event() readonly openChange!: EventDispatcher<boolean>

	@property({ type: Boolean, reflect: true }) fixed = false
	@property({ type: Array }) coordinates?: PopoverCoordinates
	@property({ type: Object }) anchor?: HTMLElement
	@property({ reflect: true }) placement = PopoverPlacement.BlockEnd
	@property({ reflect: true }) alignment = PopoverAlignment.Start
	@property({ type: Boolean, reflect: true, updated(this: Popover) { this.openChanged() } }) open = false
	@property({ type: Boolean }) manual = false

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

	private timerId?: number
	protected async openChanged() {
		if (this.timerId) {
			window.clearTimeout(this.timerId)
			this.timerId = undefined
		}

		if (this.open === false) {
			await new Promise(r => this.timerId = window.setTimeout(r, 300))
		}

		this.toggleAttribute('displayOpen', this.open)
	}

	@eventListener({ target: document, type: 'keydown', options: { capture: true } })
	protected handleKeyDown(e: KeyboardEvent) {
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

	@eventListener({ target: document, type: 'click' })
	protected handleClick(e: MouseEvent) {
		if (this.manual) {
			return
		}

		if (this.open && e.composedPath().includes(this) === false) {
			e.stopPropagation()
			this.setOpen(false)
		}

		if (this.open === false && this.anchor && e.composedPath().includes(this.anchor)) {
			e.stopPropagation()
			this.setOpen(true)
		}
	}

	override focus(options?: FocusOptions | undefined) {
		super.focus(options)
		const focusable = (this.querySelector('[autofocus]') ?? this.children[0]) as HTMLElement | undefined
		focusable?.focus?.()
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
				opacity: 0;
				z-index: 99;
				transition: all .3s ease, transform none !important;
				/* Do not move these to default values as resetting these values are important to prevent inheriting them from other parent popovers */
				--mo-popover-translate-x: 0%;
				--mo-popover-translate-y: 0%;
				transform: translate(var(--mo-popover-translate-x), var(--mo-popover-translate-y));
			}

			:host([fixed]) {
				position: fixed;
			}

			:host(:not([open])) {
				visibility: collapse;
				pointer-events: none;
			}

			:host(:not([displayOpen])) {
				display: none;
			}

			:host([open]) {
				opacity: 1;
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