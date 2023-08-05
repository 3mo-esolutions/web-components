import { Component, component, css, event, html, ifDefined, property, query, state } from '@a11d/lit'
import { Popover, PopoverCoordinates } from '@3mo/popover'
import { SlotController } from '@3mo/slot-controller'
import { disabledProperty } from '@3mo/disabled-property'
import { ListElement, ListItem, SelectableList } from '@3mo/list'
import { MenuController } from './MenuController.js'
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
 * @attr opener - The element id that opens the menu.
 * @attr selectionMode - The selection mode of the menu.
 * @attr value - The value of the menu.
 * @attr disabled - Whether the menu is disabled.
 *
 * @slot - Default slot for list items
 *
 * @fires change - Fired when the menu value changes.
 * @fires openChange - Fired when the menu open state changes.
 * @fires itemsChange - Fired when the menu items change.
 */
@component('mo-menu')
export class Menu extends Component {
	@event() readonly change!: EventDispatcher<Array<number>>
	@event() readonly openChange!: EventDispatcher<boolean>
	@event() readonly itemsChange!: EventDispatcher<Array<ListItem & HTMLElement>>

	override readonly role = 'menu'
	override readonly tabIndex = -1

	readonly slotController = new SlotController(this)
	readonly menuController = new MenuController(this)

	@property({ type: Object }) anchor!: HTMLElement
	@property() placement?: MenuPlacement
	@property() alignment?: MenuAlignment
	@property({ type: Boolean, reflect: true, updated(this: Menu) { this.openUpdated() } }) open = false
	@property({ type: Boolean }) fixed = false
	@property({ type: Boolean }) manualOpen = false
	@property() opener?: string
	@property() selectionMode?: SelectableList['selectionMode']
	@property({ type: Array }) value?: SelectableList['value']
	@disabledProperty() disabled = false

	@state() protected coordinates?: PopoverCoordinates

	@query('mo-popover') readonly popover!: Popover
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
			this.anchor?.focus()
		}
	}

	static override get styles() {
		return css`
			:host {
				display: content;
				position: static;
			}

			:host([disabled]) {
				pointer-events: none;
			}

			mo-popover {
				border-radius: var(--mo-toolbar-border-radius, var(--mo-border-radius));
				background: var(--mo-color-surface);
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
				placement=${ifDefined(this.placement)}
				alignment=${ifDefined(this.alignment)}
				?open=${this.open}
				@openChange=${(e: CustomEvent<boolean>) => this.setOpen(e.detail)}
				?fixed=${this.fixed}
				.coordinates=${this.coordinates}
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