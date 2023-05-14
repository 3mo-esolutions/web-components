import { Component, component, css, event, html, ifDefined, property, query, state, unsafeCSS } from '@a11d/lit'
import { Popover, PopoverAlignment, PopoverCoordinates, PopoverPlacement } from '@3mo/popover'
import { SlotController } from '@3mo/slot-controller'
import { ListElement, ListItem, SelectableList } from '@3mo/list'
import { MenuController } from './MenuController.js'
import { NestedMenuItem } from './NestedMenuItem.js'

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
 *
 * @slot - Default slot for list items
 *
 * @fires change - Fired when the menu value changes.
 * @fires openChange - Fired when the menu open state changes.
 */
@component('mo-menu')
export class Menu extends Component {
	@event() readonly change!: EventDispatcher<Array<number>>
	@event() readonly openChange!: EventDispatcher<boolean>

	override readonly role = 'menu'
	override readonly tabIndex = -1

	readonly slotController = new SlotController(this)
	readonly menuKeyboardController = new MenuController(this)

	@property({ type: Object }) anchor!: HTMLElement
	@property() placement?: PopoverPlacement
	@property() alignment?: PopoverAlignment
	@property({ type: Boolean, reflect: true }) open?: boolean
	@property({ type: Boolean }) fixed = false
	@property({ type: Boolean }) manualOpen = false
	@property() opener?: string
	@property() selectionMode?: SelectableList['selectionMode']
	@property({ type: Object }) value?: SelectableList['value']

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
		this.open = open
		this.openChange.dispatch(open)

		if (this.list) {
			if (this.open === false) {
				this.list.listItemsKeyboardController.unfocus()

				this.items.forEach(x => {
					if (x instanceof NestedMenuItem) {
						x.open = false
					}
				})
			}
			this.list.listItemsKeyboardController.forceFocused = this.open as boolean
		}
	}

	static override get styles() {
		return css`
			:host {
				display: content;
				position: static;
			}

			mo-popover {
				border-radius: var(--mo-toolbar-border-radius, var(--mo-border-radius, 4px));
				background: var(--mo-color-surface, #fff);
				border-radius: var(--mo-border-radius, 4px);
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
					selectionMode=${this.selectionMode}
					.value=${this.value}
					@change=${this.handleChange.bind(this)}
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
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-menu': Menu
	}
}