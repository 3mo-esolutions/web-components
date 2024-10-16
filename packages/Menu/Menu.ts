import { Component, EventListenerController, component, css, event, html, ifDefined, property, query, state } from '@a11d/lit'
import { Popover, type PopoverCoordinates } from '@3mo/popover'
import { SlotController } from '@3mo/slot-controller'
import { disabledProperty } from '@3mo/disabled-property'
import type { Middleware } from '@floating-ui/dom'
import type { ListElement, ListItem, SelectableList } from '@3mo/list'
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
 * @attr fixed - Whether the menu's position is fixed.
 * @attr manual - Whether the menu is opened manually. This won't affect the opening triggers via the keyboard.
 * @attr selectionMode - The selection mode of the menu.
 * @attr value - The value of the menu.
 * @attr disabled - Whether the menu is disabled.
 *
 * @slot - Default slot for list items
 *
 * @fires change - Dispatched when the menu value changes.
 * @fires openChange - Dispatched when the menu open state changes.
 * @fires itemsChange - Dispatched when the menu items change.
 */
@component('mo-menu')
export class Menu extends Component {
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
			if (this.manual || event.ctrlKey || event.shiftKey) {
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
	@property({ type: Boolean }) fixed = false
	@property({ type: Boolean }) manual = false
	@property({ type: Boolean }) preventOpenOnAnchorEnter = false
	@property() selectionMode?: SelectableList['selectionMode']
	@property({ type: Array, bindingDefault: true }) value?: SelectableList['value']
	@disabledProperty() disabled = false

	@state() protected coordinates?: PopoverCoordinates
	@state() protected positionMiddleware = new Array<Middleware>()

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
				/*overflow: hidden;*/
				transition: opacity 100ms;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-popover part='popover'
				.anchor=${this.anchor}
				?fixed=${this.fixed}
				?manual=${this.manual}
				target=${ifDefined(this.target)}
				placement=${ifDefined(this.placement)}
				alignment=${ifDefined(this.alignment)}
				?open=${this.open}
				@openChange=${(e: CustomEvent<boolean>) => this.setOpen(e.detail)}
				.coordinates=${this.coordinates}
				.shouldOpen=${this.shouldOpen}
				.positionMiddleware=${this.positionMiddleware}
			>
				<mo-selectable-list
					selectionMode=${ifDefined(this.selectionMode)}
					.value=${this.value ?? []}
					@change=${this.handleChange.bind(this)}
					@menuItemClick=${this.handleMenuItemClick.bind(this)}
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

	protected handleMenuItemClick() {
		this.setOpen(false)
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