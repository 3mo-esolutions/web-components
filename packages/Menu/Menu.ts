import { Component, component, css, event, html, ifDefined, property, query, state, type PropertyValues } from '@a11d/lit'
import { Popover, type PopoverCoordinates } from '@3mo/popover'
import { SlotController } from '@3mo/slot-controller'
import { disabledProperty } from '@3mo/disabled-property'
import { listItems, SelectableListSelectability, type ListItem } from '@3mo/list'
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
	static readonly preventClose: typeof MenuController.preventClose = MenuController.preventClose

	@event() readonly change!: EventDispatcher<Array<number>>
	@event() readonly openChange!: EventDispatcher<boolean>
	@event() readonly itemsChange!: EventDispatcher<Array<ListItem & HTMLElement>>

	override readonly tabIndex = -1

	protected readonly slotController = new SlotController(this)

	@property({ type: Object }) anchor!: HTMLElement
	@property() placement?: MenuPlacement
	@property() alignment?: MenuAlignment
	@property({ type: Boolean, reflect: true }) open = false
	@property() target?: string
	@property({ type: Boolean }) manual = false
	@property({ type: Boolean }) preventOpenOnAnchorEnter = false
	@property() selectability = SelectableListSelectability.Multiple
	@property({ type: Array, bindingDefault: true }) value?: Array<number>
	@disabledProperty() disabled = false

	@state() protected coordinates?: PopoverCoordinates

	@query('slot') private readonly slotElement?: HTMLSlotElement

	private _items = new Array<ListItem & HTMLElement>()
	get items() { return this._items }

	protected readonly controller = new MenuController(this, host => {
		const menu = host as Menu
		return {
			get items() { return menu.items },
			get expanded() { return menu.open },
			handleExpandedChange: open => menu.setOpen(open),
			get selectability() { return menu.selectability },
			get value() { return menu.value },
			handleChange: value => {
				menu.value = value
				menu.change.dispatch(value)
			},
		}
	})

	/** A manual menu opens some other way, such as by a right-click, so its anchor is no menu button. */
	protected override willUpdate(props: PropertyValues<this>) {
		super.willUpdate(props)
		this.controller.trigger.set(this.manual ? undefined : this.anchor)
	}

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
			>
				<div part='list' ${this.controller.menu.ref()}>
					<slot @slotchange=${() => this.handleItemsChange()}></slot>
				</div>
			</mo-popover>
		`
	}

	private shouldOpen = (e: Event) => {
		return Popover.shouldOpen.call(this, e)
			|| ((e as any)[Popover.isSyntheticClickEvent] === true && this.preventOpenOnAnchorEnter === false)
	}

	protected handleItemsChange() {
		this._items = (this.slotElement?.[listItems] ?? []) as Array<ListItem & HTMLElement>
		this.controller.handleItemsChange()
		this.itemsChange.dispatch(this.items)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-menu': Menu
	}
}