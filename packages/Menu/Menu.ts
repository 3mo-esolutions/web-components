import { Component, component, css, event, html, ifDefined, property, query, state, unsafeCSS } from '@a11d/lit'
import { Popover, PopoverAlignment, PopoverCoordinates, PopoverPlacement } from '@3mo/popover'
import { SlotController } from '@3mo/slot-controller'
import { ListElement, SelectableList } from '@3mo/list'
import { MenuController } from './MenuController.js'
import { MenuPlacement } from './MenuPlacement.js'

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

	openWith(e: PointerEvent | PopoverCoordinates) {
		if (e instanceof PointerEvent) {
			e.preventDefault()
			e.stopImmediatePropagation()
			this.popover.coordinates = [e.clientX, e.clientY]
		} else {
			this.popover.coordinates = e
		}
		this.open = true
	}

	static override get styles() {
		return css`
			:host {
				display: content;
				position: relative;
			}

			mo-popover {
				border-radius: var(--mo-toolbar-border-radius, var(--mo-border-radius, 4px));
				background: var(--mo-color-surface, #fff);
				border-radius: var(--mo-border-radius, 4px);
				/*overflow: hidden;*/
				transition-duration: 100ms;
				transition-property: opacity, transform;
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.BlockStart)}"] {
				transform: scaleY(0.9);
				transform-origin: bottom;
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.BlockEnd)}"] {
				transform: scaleY(0.9);
				transform-origin: top;
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.InlineStart)}"] {
				transform: scaleY(0.9);
				transform-origin: right;
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.InlineEnd)}"] {
				transform: scaleY(0.9);
				transform-origin: left;
			}

			mo-popover[open] {
				transform: scaleY(1);
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
				@openChange=${this.handleOpenChange.bind(this)}
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

	protected handleOpenChange(e: CustomEvent<boolean>) {
		this.open = e.detail
		if (this.open === false) {
			this.list.listItemsKeyboardController.unfocus()
		}
		this.list.listItemsKeyboardController.forceFocused = this.open
		this.openChange.dispatch(this.open)
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