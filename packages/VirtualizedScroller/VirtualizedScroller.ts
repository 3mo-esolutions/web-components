import { Component, component, css, html, property, query, queryAll } from '@a11d/lit'
import { LitVirtualizer } from '@lit-labs/virtualizer'
import { type RenderItemFunction, virtualizerRef } from '@lit-labs/virtualizer/virtualize.js'
import { Scroller } from '@3mo/scroller'

LitVirtualizer.elementStyles.push(Scroller.scrollbarStyles as any)

export type GetItemTemplate<T> = RenderItemFunction<T>

export interface VirtualizedElement {
	scrollIntoView(options?: ScrollIntoViewOptions): void
}

/**
 * @attr items
 * @attr getItemTemplate
 */
@component('mo-virtualized-scroller')
export class VirtualizedScroller<T = unknown> extends Component {
	@property({ type: Array }) items = new Array<T>()
	@property({ type: Object }) getItemTemplate: GetItemTemplate<T> = (() => html.nothing)

	static override get styles() {
		return css`
			:host {
				display: block;
				position: relative;
				width: 100%;
				height: 100%;
			}
		`
	}

	@queryAll('lit-virtualizer > *') readonly renderedItems!: Array<HTMLElement>

	@query('lit-virtualizer') protected readonly virtualizerElement!: LitVirtualizer<T>

	private get virtualizer() {
		return (this.virtualizerElement as any)[virtualizerRef] as {
			readonly _first: number
			readonly _last: number
			element(index: number): VirtualizedElement | undefined
		}
	}

	getRenderedElementIndex(element: HTMLElement) {
		const indexInRenderedElements = this.renderedItems.indexOf(element)

		if (indexInRenderedElements === -1) {
			return undefined
		}

		return this.virtualizer._first + indexInRenderedElements
	}

	getElement(index: number): Element | VirtualizedElement | undefined {
		const isIndexInRenderedElements = index >= this.virtualizer._first && index <= this.virtualizer._last
		return isIndexInRenderedElements
			? this.renderedItems[index - this.virtualizer._first]
			: this.virtualizer.element(index)
	}

	protected override get template() {
		return html`
			<mo-scroller>
				<lit-virtualizer .items=${this.items} .renderItem=${this.getItemTemplate}></lit-virtualizer>
			</mo-scroller>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-virtualized-scroller': VirtualizedScroller
	}
}