import { component, html, property, query } from '@a11d/lit'
import { type GetItemTemplate, type VirtualizedScroller } from '@3mo/virtualized-scroller'
import { List, listItem } from '@3mo/list'

/**
 * A list that renders list items from an array, only while they are near the viewport, so it scrolls through thousands.
 *
 * @element mo-virtualized-list
 *
 * @attr data - The items, one list item each.
 * @attr getItemTemplate - A function that returns the list item of an item.
 */
@component('mo-virtualized-list')
export class VirtualizedList<T = unknown> extends List {
	@property({ type: Array }) data = new Array<T>()
	@property({ type: Object }) getItemTemplate: GetItemTemplate<T> = () => html.nothing

	@query('mo-virtualized-scroller') protected readonly virtualizedScroller!: VirtualizedScroller

	override get items() {
		return (this.virtualizedScroller?.renderedItems ?? []).filter(e => !!e[listItem]) as Array<HTMLElement>
	}

	get itemsLength() {
		return this.data.length
	}

	getItem(index: number) {
		return this.virtualizedScroller?.getElement(index)
	}

	getRenderedItemIndex(item: HTMLElement) {
		return this.virtualizedScroller?.getRenderedElementIndex(item)
	}

	protected override get template() {
		return html`
			<mo-virtualized-scroller
				.items=${this.data}
				.getItemTemplate=${this.getItemTemplate}
			></mo-virtualized-scroller>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-virtualized-list': VirtualizedList
	}
}
