import { Component, component, css, html, isServer, type PropertyValues } from '@a11d/lit'
import { styleProperty } from '@3mo/style-property'
import type * as CSS from 'csstype'

const lanesConverter = {
	fromStyle: (value: string) => value,
	toStyle: (value: string | number) => {
		const lanes = String(value).trim()
		return /^\d+$/.test(lanes) ? `repeat(${lanes}, 1fr)` : lanes
	},
}

/**
 * @element mo-masonry
 *
 * @ssr true
 *
 * @attr columns - Lanes of a vertical »waterfall« masonry, tunneled to `grid-template-columns`. Additionally accepts a bare lane count (e.g. `4` equals `repeat(4, 1fr)`).
 * @attr rows - Lanes of a horizontal »brick« masonry, tunneled to `grid-template-rows`. Defining these instead of `columns` flips the masonry to flow sideways.
 * @attr rowGap - Tunnels `row-gap` CSS property.
 * @attr columnGap - Tunnels `column-gap` CSS property.
 * @attr gap - Tunnels `gap` CSS property.
 * @attr tolerance - Placement tolerance tunneled to `flow-tolerance` / `item-tolerance`. `0` always packs items into the shortest lane while larger values preserve more of the natural item order. Defaults to `1em`.
 *
 * @slot - The content of the masonry container.
 */
@component('mo-masonry')
export class Masonry extends Component {
	/** Whether the browser lays items out as native masonry. When false, items fall back to a regular grid with aligned rows. */
	static get supported() {
		return isServer === false && (
			globalThis.CSS.supports('display', 'grid-lanes')
				|| globalThis.CSS.supports('display', 'masonry')
				|| globalThis.CSS.supports('grid-template-rows', 'masonry')
		)
	}

	@styleProperty({ styleKey: 'gridTemplateColumns', styleConverter: lanesConverter }) columns!: number | CSS.Property.GridTemplateColumns<string>
	@styleProperty({ styleKey: 'gridTemplateRows', styleConverter: lanesConverter }) rows!: number | CSS.Property.GridTemplateRows<string>
	@styleProperty() rowGap!: CSS.Property.RowGap<string>
	@styleProperty() columnGap!: CSS.Property.ColumnGap<string>
	@styleProperty() gap!: CSS.Property.Gap<string>
	@styleProperty({ styleKey: '--mo-masonry-tolerance' }) tolerance!: string

	/**
	 * Only `display: grid-lanes` infers the masonry axis from the defined lanes on its own. The other syntaxes
	 * need it spelled out, which is what the reflected `horizontal` attribute drives until they are gone.
	 */
	protected override update(props: PropertyValues<this>) {
		this.toggleAttribute('horizontal', !!this.style.gridTemplateRows && !this.style.gridTemplateColumns)
		super.update(props)
	}

	static override get styles() {
		return css`
			:host {
				display: grid;
			}

			/* Without native masonry the items stay in aligned rows, so a horizontal one at least has to flow sideways: */
			@supports not ((display: grid-lanes) or (display: masonry) or (grid-template-rows: masonry)) {
				:host([horizontal]) {
					grid-auto-flow: column;
				}
			}

			/* First-draft syntax; e.g. Firefox behind the "layout.css.grid-template-masonry-value.enabled" flag: */
			@supports (grid-template-rows: masonry) {
				:host {
					grid-template-rows: masonry;
				}

				:host([horizontal]) {
					grid-template-columns: masonry;
				}
			}

			/* Interim Chromium 140+ syntax behind the "CSS Masonry Layout" flag: */
			@supports (display: masonry) {
				:host {
					display: masonry;
					grid-template-rows: initial;
					item-tolerance: var(--mo-masonry-tolerance, 1em);
				}

				:host([horizontal]) {
					masonry-direction: row;
				}
			}

			/* Standardized CSS Grid Level 3 syntax; e.g. Safari 26.4+: */
			@supports (display: grid-lanes) {
				:host {
					display: grid-lanes;
					grid-template-rows: initial;
					flow-tolerance: var(--mo-masonry-tolerance, 1em);
				}
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-masonry': Masonry
	}
}