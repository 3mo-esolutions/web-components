import { Component, component, css, html, nothing, property } from '@a11d/lit'
import { LitVirtualizer } from '@lit-labs/virtualizer'
import { Scroller } from '@3mo/scroller'
import { NoIntrinsicDimensionsController } from '@3mo/no-intrinsic-dimensions-controller'

LitVirtualizer.elementStyles.push(Scroller.scrollbarStyles)

/**
 * @attr items
 * @attr getItemTemplate
 */
@component('mo-virtualized-scroller')
export class VirtualizedScroller<T = unknown> extends Component {
	@property({ type: Array }) items = new Array<T>()
	@property({ type: Object }) getItemTemplate: LitVirtualizer['renderItem'] = (() => nothing)

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

	protected readonly noIntrinsicDimensionsController = new NoIntrinsicDimensionsController(this)

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