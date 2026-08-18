import { component, event, eventListener, property, queryAsync } from '@a11d/lit'
import { Selectability, SelectabilityController, SelectabilityInteraction, SelectabilityStamping } from '@3mo/selectability'
import { List } from './List.js'

export class SelectionListItemChangeEvent<T> extends CustomEvent<T> {
	static readonly type = 'change'
	readonly selected: boolean
	constructor(value: T, selected: boolean) {
		super(SelectionListItemChangeEvent.type, { bubbles: true, detail: value })
		this.selected = selected
	}
}

export { Selectability as SelectableListSelectability } from '@3mo/selectability'

/**
 * @element mo-selectable-list
 *
 * @attr selectability - The selectability of the list
 * @attr value - The selected list items' indices
 *
 * @slot - Default slot for list items
 *
 * @fires change - Dispatched when the selected list items change
 */
@component('mo-selectable-list')
export class SelectableList extends List {
	@event() readonly change!: EventDispatcher<Array<number>>

	@property({ type: Array, bindingDefault: true }) value = new Array<number>()
	@property() selectability = Selectability.Single

	@queryAsync('slot') protected readonly slotElement!: Promise<HTMLSlotElement>

	readonly selectabilityController: SelectabilityController<HTMLElement>

	constructor() {
		super()
		const component = this
		this.selectabilityController = new SelectabilityController<HTMLElement>(this, {
			get selectability() { return component.selectability },
			get items() { return component.items },
			get selection() { return component.selectionFromValue },
			handleChange: ({ selection }) => {
				component.value = selection.map(item => component.items.indexOf(item))
				component.syncItems()
				component.change.dispatch(component.value)
			},
			interaction: SelectabilityInteraction.Manual,
			stamping: SelectabilityStamping.None,
		})
	}

	/** The value's indices resolved to their elements — the list's own state stays the indices. */
	private get selectionFromValue() {
		return this.value
			.map(index => this.items[index])
			.filter((item): item is HTMLElement => !!item)
	}

	/** Items announce their own state as they are clicked, so after the controller has ruled on it
	 * they are told what the answer actually was — including the ones that were not touched. */
	private syncItems() {
		for (const item of this.items) {
			const selected = this.selectabilityController.isSelected(item)
			if ('selected' in item) {
				(item as HTMLElement & { selected: unknown }).selected = selected
			} else {
				item.toggleAttribute('selected', selected)
			}
		}
	}

	/** The topmost selected item — the `ListElement` hook the roving focus starts from. */
	get defaultFocusedItemIndex() {
		return this.value.length === 0 ? undefined : Math.min(...this.value)
	}

	@eventListener({ type: 'change', target(this: SelectableList) { return this.slotElement } })
	protected handleChange(event: CustomEvent) {
		if (event instanceof SelectionListItemChangeEvent) {
			event.stopImmediatePropagation()
			const item = event.target as HTMLElement
			if (this.items.includes(item)) {
				// An item that carries its own control speaks only for itself, which is what `preserve`
				// means — and what single selectability goes on ignoring.
				this.selectabilityController.select(item, { selected: event.selected, preserve: true, event })
			}
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selectable-list': List
	}
}