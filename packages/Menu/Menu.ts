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
		if (this.open) {
			this.list.focusController.focusIn()
		} else {
			this.list.focusController.focusOut()
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
				@openChange=${(e: CustomEvent<boolean>) => this.setOpen(e.detail)}
				.coordinates=${this.coordinates}
				.shouldOpen=${this.shouldOpen}
				.cssRoot=${this}
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