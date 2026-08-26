import { Component, component, css, html, property, type PropertyValues, state, style } from '@a11d/lit'
import { observeResize } from '@3mo/resize-observer'

/**
 * A list of key–value pairs, laid out as a description list which fills the width it is given with as many
 * key–value columns as fit into it.
 *
 * @element mo-key-value-list
 *
 * @attr minColumnWidth - The width in pixels below which a key–value column may not shrink. The list drops a column instead. Defaults to 380.
 * @attr stackingWidth - The width in pixels at or below which every pair places its key above its value. Defaults to 285.
 * @attr alwaysStacked - Whether every pair places its key above its value regardless of the width available.
 * @attr stacked - Whether the pairs are stacked. Derived from the width and therefore read-only.
 *
 * @slot - The pairs of the list. Meant for "mo-key-value" elements, as only those subscribe to its columns.
 *
 * @cssprop --mo-key-value-list-column-template - The tracks of a single key–value column, repeated once per column. Defaults to "minmax(max-content, 1fr) 2fr".
 * @cssprop --mo-key-value-list-column-gap - The gap between two key–value columns. Defaults to "0.75rem".
 * @cssprop --mo-key-value-list-row-gap - The gap between two pairs. Defaults to "0.75rem".
 * @cssprop --mo-key-value-list-divider-color - The color of the dividers drawn between pairs and between columns.
 */
@component('mo-key-value-list')
export class KeyValueList extends Component {
	@property({ type: Number }) minColumnWidth = 380
	@property({ type: Number }) stackingWidth = 285
	@property({ type: Boolean, reflect: true }) alwaysStacked = false

	@state() private width?: number

	get stacked() {
		return this.alwaysStacked || (this.width !== undefined && this.width <= this.stackingWidth)
	}

	get columns() {
		return this.stacked || this.width === undefined
			? 1
			: Math.max(1, Math.floor(this.width / this.minColumnWidth))
	}

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		this.toggleAttribute('stacked', this.stacked)
	}

	static override get styles() {
		return css`
			:host {
				display: block;
				height: fit-content;
				container-type: inline-size;
				overflow: hidden;
			}

			.measure {
				block-size: 0;
			}

			dl {
				display: grid;
				margin: 0;
				align-items: stretch;
				column-gap: var(--mo-key-value-list-column-gap, 0.75rem);
				grid-template-columns: repeat(var(--_columns, 1), var(--mo-key-value-list-column-template, minmax(max-content, 1fr) 2fr));
				--_column-span: 2;
				--_row-divider: var(--mo-key-value-list-divider-color, var(--mo-color-transparent-gray-3));
				--_column-divider: var(--mo-key-value-list-divider-color, var(--mo-color-transparent-gray-3));
			}

			:host([stacked]) dl {
				grid-template-columns: auto;
				--_column-span: 1;
				--_column-divider: transparent;
			}
		`
	}

	protected override get template() {
		return html`
			<div class='measure' ${observeResize(entries => { this.width = entries[0]?.contentRect.width })}></div>
			<dl ${style({ '--_columns': this.columns.toString() })}>
				<slot></slot>
			</dl>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-key-value-list': KeyValueList
	}
}