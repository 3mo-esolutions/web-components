import { Component, component, css, event, html, property } from '@a11d/lit'
import { Selectability } from '@3mo/selectability'
import { SelectionGroupController, type SelectionGroupItem } from './SelectionGroupController.js'

export { Selectability as SelectionGroupSelectability } from '@3mo/selectability'

export type SelectionGroupValue = string | undefined | Array<string>

/**
 * A set of children sharing one selection, one tab stop and one `value` — a question and its answers.
 *
 * It is deliberately unopinionated about what an answer looks like: any element child with a `value` is
 * an item, whether that is a `mo-selectable-button`, a `mo-chip`, a plain `<button>` or something of the
 * consumer's own. What the group is, and what no controller can be on its own, is the container the ARIA
 * pattern requires: the role, the accessible name, the scope, and one bindable fact instead of a
 * `?selected=` expression on every item. The flex is a default, not the reason.
 *
 * Give it an accessible name with `aria-label` or `aria-labelledby` — a set of answers that announces
 * nothing is a bug.
 *
 * @element mo-selection-group
 *
 * @ssr true
 *
 * @attr value - The selected items' values: the value itself in single selectability, an array of them in multiple.
 * @attr selectability - `single`, `multiple`, or omitted for a row of commands.
 * @attr deselectable - Re-activating the selected item clears it. Also makes a single group a toggle group rather than a radio group.
 *
 * @slot - The items.
 *
 * @fires change - Dispatched with the new value when the selection changes.
 */
@component('mo-selection-group')
export class SelectionGroup extends Component {
	@event() readonly change!: EventDispatcher<SelectionGroupValue>

	// An attribute is one item's value; the array form of multiple selectability is assigned as a property,
	// which is the shape `FieldSelect` already has for the same reason.
	@property({ type: String, bindingDefault: true, event: 'change' }) value?: SelectionGroupValue
	@property({ reflect: true }) selectability?: Selectability
	@property({ type: Boolean, reflect: true }) deselectable = false

	// The pattern's own role replaces this one on the first update. It stands so that a group rendered but
	// never updated — server-side — still announces itself as one.
	override role = 'group'

	readonly selectionGroupController = new SelectionGroupController<SelectionGroupItem, SelectionGroup>(this, host => ({
		get items() { return host.items },
		get selectability() { return host.selectability },
		get deselectable() { return host.deselectable },
		get selection() { return host.selectionFromValue },
		handleChange: selection => {
			host.value = host.selectability === Selectability.Multiple
				? selection.map(item => host.valueOfItem(item) ?? '')
				: host.valueOfItem(selection[0])
			host.change.dispatch(host.value)
		},
	}))

	/** Every element child. Which of them a value addresses is decided by {@link valueOfItem}. */
	get items(): ReadonlyArray<SelectionGroupItem> {
		return [...this.children].filter((child): child is SelectionGroupItem => child instanceof HTMLElement)
	}

	/** The property where the item has one — a component may keep a value that is not an attribute — and
	 * the attribute otherwise, which is what makes a plain `<button value=…>` an item. */
	protected valueOfItem(item?: SelectionGroupItem) {
		return item === undefined ? undefined : item.value ?? item.getAttribute('value') ?? undefined
	}

	/** The value's entries resolved to their items — the group's own state stays the value. */
	private get selectionFromValue() {
		const values = this.value === undefined ? [] : this.value instanceof Array ? this.value : [this.value]
		return values
			.map(value => this.items.find(item => this.valueOfItem(item) === value))
			.filter((item): item is SelectionGroupItem => !!item)
	}

	static override get styles() {
		return css`
			:host {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				gap: 0.5rem;
			}
		`
	}

	protected override get template() {
		return html`<slot @slotchange=${() => this.selectionGroupController.handleItemsChange()}></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selection-group': SelectionGroup
	}
}