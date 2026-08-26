import { Component, EventListenerController, component, css, event, html, ifDefined, property, query, state } from '@a11d/lit'
import { Popover, type PopoverCoordinates } from '@3mo/popover'
import { SlotController } from '@3mo/slot-controller'
import { disabledProperty } from '@3mo/disabled-property'
import { listItem, SelectableListSelectability, type ListElement, type ListItem, type SelectableList } from '@3mo/list'
import type { MenuPlacement, MenuAlignment } from './index.js'

export function isMenu(element: EventTarget): element is HTMLElement {
	return element instanceof HTMLElement
		&& element.role === 'menu'
}

/**
 * @element mo-menu
 *
 * @attr anchor - The element that the menu is anchored to.
 * @attr placement - The placement of the menu.
 * @attr open - Whether the menu is open.
 * @attr target - The target of the menu.
 * @attr manual - Whether the menu is opened manually. This won't affect the opening triggers via the keyboard.
 * @attr preventOpenOnAnchorEnter - Whether the menu should not open when the Enter key is pressed on the anchor.
 * @attr selectability - The selectability of the menu. Default is `multiple`.
 * @attr value - The value of the menu.
 * @attr disabled - Whether the menu is disabled.
 *
 * @slot - Default slot for list items
 *
 * @fires change - Dispatched when the menu value changes.
 * @fires openChange - Dispatched when the menu open state changes.
 * @fires itemsChange - Dispatched when the menu items change.
 *
 * @csspart popover - The popover part of the menu.
 * @csspart list - The list part of the menu.
 *
 * @cssprop --mo-menu-resize-duration - The duration of the animation of a size change triggered via "animateResize".
 */
@component('mo-menu')
export class Menu extends Component {
	static readonly preventClose = Symbol('Menu.preventClose')

	@event() readonly change!: EventDispatcher<Array<number>>
	@event() readonly openChange!: EventDispatcher<boolean>
	@event() readonly itemsChange!: EventDispatcher<Array<ListItem & HTMLElement>>

	override readonly role = 'menu'
	override readonly tabIndex = -1

	protected readonly slotController = new SlotController(this)
	protected readonly anchorKeyDownEventController = new EventListenerController(this, {
		type: 'keydown',
		target: () => this.anchor || [],
		listener: (event: KeyboardEvent) => {
			if (this.manual || event.ctrlKey || event.shiftKey || event.composedPath().some(isMenu)) {
				return
			}

			switch (event.key) {
				case 'Down':
				case 'ArrowDown':
				case 'Up':
				case 'ArrowUp':
				case 'Home':
				case 'PageUp':
				case 'End':
				case 'PageDown':
					if (this.open === false) {
						// Prevent scrolling the page
						event.preventDefault()
						event.stopPropagation()
						this.setOpen(true)
					}
					break
				case 'Tab':
					if (this.open === true) {
						event.stopPropagation()
						this.setOpen(false)
					}
					break
				default:
					break
			}
		}
	})


	@property({
		type: Object,
		updated(this: Menu) { this.anchorKeyDownEventController.resubscribe() },
	}) anchor!: HTMLElement
	@property() placement?: MenuPlacement
	@property() alignment?: MenuAlignment
	@property({ type: Boolean, reflect: true, updated(this: Menu) { this.openUpdated() } }) open = false
	@property() target?: string
	@property({ type: Boolean }) manual = false
	@property({ type: Boolean }) preventOpenOnAnchorEnter = false
	@property() selectability = SelectableListSelectability.Multiple
	@property({ type: Array, bindingDefault: true }) value?: SelectableList['value']
	@disabledProperty() disabled = false

	@state() protected coordinates?: PopoverCoordinates

	@query('mo-selectable-list') readonly list!: ListElement & SelectableList
	@query('mo-popover') private readonly popoverElement?: Popover

	/**
	 * Applies a change to the menu's content, e.g. filtering its items, and animates the menu from the size
	 * it had to the one the change results in. A transition cannot do this on its own, as a content-driven
	 * height computes to "auto" both before and after such a change - and a menu which is scrolling its items
	 * does not change height at all until the remaining ones fit into it.
	 */
	animateResize(change: () => void) {
		const popover = this.popoverElement

		if (!this.open || !popover) {
			change()
			return
		}

		// Lest the release of a previous change cuts this one short, e.g. while a search is being typed.
		this.cancelHeightRelease?.()

		const from = popover.getBoundingClientRect().height
		change()
		popover.style.height = ''
		const to = popover.getBoundingClientRect().height

		if (from === to) {
			return
		}

		popover.style.height = `${from}px`
		// Reading the layout back computes the height the transition then starts from.
		popover.offsetHeight
		popover.style.height = `${to}px`

		this.releaseHeightWhenResized(popover)
	}

	private cancelHeightRelease?: () => void

	private releaseHeightWhenResized(popover: Popover) {
		const handleTransitionEnd = (event: TransitionEvent) => {
			if (event.target === popover && event.propertyName === 'height') {
				release()
			}
		}
		// A transition which does not run at all - be it a zeroed duration or a tab which is not being painted - shall not leave the height pinned either.
		const timeoutHandle = setTimeout(() => release(), Menu.getTransitionDuration(popover) + 50)

		const stop = () => {
			popover.removeEventListener('transitionend', handleTransitionEnd)
			clearTimeout(timeoutHandle)
			this.cancelHeightRelease = undefined
		}

		// Sizing itself by its content again once it has reached the size the change resulted in.
		const release = () => {
			stop()
			popover.style.height = ''
		}

		popover.addEventListener('transitionend', handleTransitionEnd)
		this.cancelHeightRelease = stop
	}

	private static getTransitionDuration(element: Element) {
		const durations = getComputedStyle(element).transitionDuration
			.split(',')
			.map(duration => parseFloat(duration) * 1000)
			.filter(duration => !Number.isNaN(duration))
		return Math.max(0, ...durations)
	}

	get items() { return this.list.items as Array<ListItem & HTMLElement> }

	openWith(e: MouseEvent | PopoverCoordinates) {
		if (e instanceof MouseEvent) {
			e.preventDefault()
			e.stopImmediatePropagation()
			this.coordinates = [e.clientX, e.clientY]
		} else {
			this.coordinates = e
		}
		this.setOpen(true)
	}

	setOpen(open: boolean) {
		if (!this.disabled && this.open !== open) {
			this.open = open
			this.openChange.dispatch(open)
		}
	}

	protected openUpdated() {
		if (!this.open) {
			// Dropped rather than remembered, so that the next opening starts from whatever is selected
			// by then instead of resuming where the closed one left off.
			this.list.focusController.focusedItemIndex = undefined
			this.list.focusController.focusOut()
		}
	}

	protected handlePopoverOpenChange(open: boolean) {
		this.setOpen(open)
		if (open) {
			// Deliberately here and not in `openUpdated`: that runs while the popover is still
			// `display: none`, where an unlaid-out list cannot be scrolled to its selected item.
			this.list.focusController.focusIn()
		}
	}

	static override get styles() {
		return css`
			:host {
				display: contents;
				position: static;
				font-size: 0.875rem;
			}

			:host([disabled]) {
				pointer-events: none;
			}

			mo-popover {
				border-radius: var(--mo-toolbar-border-radius, var(--mo-border-radius));
				background: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-gray) 8%);
				border-radius: var(--mo-border-radius);
				/* Only ever animated in tandem with "animateResize", which turns the content-driven height into a length to start from. */
				--mo-popover-resize-duration: var(--mo-menu-resize-duration, var(--mo-duration-quick, 250ms));
			}
		`
	}

	protected override get template() {
		return html`
			<mo-popover part='popover'
				.anchor=${this.anchor}
				mode=${ifDefined(this.manual ? 'manual' : undefined)}
				target=${ifDefined(this.target)}
				placement=${ifDefined(this.placement)}
				alignment=${ifDefined(this.alignment)}
				?open=${this.open}
				@openChange=${(e: CustomEvent<boolean>) => this.handlePopoverOpenChange(e.detail)}
				.coordinates=${this.coordinates}
				.shouldOpen=${this.shouldOpen}
			>
				<mo-selectable-list part='list'
					selectability=${ifDefined(this.selectability)}
					.value=${this.value ?? []}
					@change=${this.handleChange.bind(this)}
					@click=${this.handleMenuClick.bind(this)}
					@itemsChange=${this.handleItemsChange.bind(this)}
					@listKeyDown=${(e: CustomEvent<KeyboardEvent>) => this.dispatchEvent(new CustomEvent('listKeyDown', { detail: e.detail }))}
				>
					<slot></slot>
				</mo-selectable-list>
			</mo-popover>
		`
	}

	private shouldOpen = (e: Event) => {
		return Popover.shouldOpen.call(this, e)
			|| ((e as any)[Popover.isSyntheticClickEvent] === true && this.preventOpenOnAnchorEnter === false)
	}

	protected handleChange(e: CustomEvent<Array<number>>) {
		this.value = e.detail
		this.change.dispatch(e.detail)
	}

	protected handleMenuClick(e: PointerEvent & { [Menu.preventClose]?: boolean }) {
		if (e[Menu.preventClose] !== true &&
			e.composedPath().some(element => !!(element as Element)[listItem])
		) {
			this.setOpen(false)
		}
	}

	protected handleItemsChange() {
		this.itemsChange.dispatch(this.items)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-menu': Menu
	}
}