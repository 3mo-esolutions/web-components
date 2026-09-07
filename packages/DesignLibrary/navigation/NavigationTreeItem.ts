import { component, css, property } from '@a11d/lit'
import { TreeItem } from '@3mo/tree'

/**
 * A row of the navigation drawer's tree. The router marks the row of the current page with
 * `data-router-selected`, which this item styles and reports upwards, so that the tree can reveal it.
 *
 * @element mo-navigation-tree-item
 *
 * @fires navigationSelected - Dispatched when the router marks this item as the current page.
 */
@component('mo-navigation-tree-item')
export class NavigationTreeItem extends TreeItem {
	@property({
		type: Boolean,
		attribute: 'data-router-selected',
		updated(this: NavigationTreeItem, selected: boolean) {
			if (selected) {
				this.dispatchEvent(new CustomEvent('navigationSelected', { bubbles: true, composed: true }))
			}
		}
	}) routerSelected = false

	static override get styles() {
		return css`
			${super.styles}

			[part=row] {
				/* A child's label lines up under its parent's, the first step clearing the parent's icon. */
				padding-inline: calc(12px + var(--mo-tree-level, 0) * 16px + min(var(--mo-tree-level, 0), 1) * 14px) 8px;
				min-block-size: 28px;
				/* Rows breathe by the space between them rather than by their own height. */
				margin: 1px 8px;
				border-radius: var(--mo-border-radius);
				font-size: 0.875rem;
				line-height: 1.25;
				/* The group draws one line for the whole nested block; the tree's own guides would be one per level. */
				background-image: none;
			}

			/* A row of the top level heads a section, and carries the weight of one. */
			:host(:not([slot=children])) [part=row] {
				min-block-size: 34px;
				font-weight: 500;
			}

			slot[name=start] mo-icon {
				font-size: 20px;
				opacity: 0.7;
			}

			@media not (any-pointer: fine) {
				[part=row] {
					min-block-size: 36px;
				}

				:host(:not([slot=children])) [part=row] {
					min-block-size: 40px;
				}
			}

			/* A separator parts two sections, so it is a line with air around it rather than a border drawn
			   on the rounded block of the row below it — and it starts where the guide line of a nested
			   block runs, so that the two meet at a corner instead of crossing. */
			:host([data-separator]) {
				margin-block-start: 5px;
				padding-block-start: 5px;
				background-image: linear-gradient(var(--mo-color-transparent-gray-3) 0 0);
				background-size: calc(100% - 30px) 1px;
				background-position: 30px 0;
				background-repeat: no-repeat;
			}

			:host([data-separator]) [part=row] {
				border-block-start: none;
			}

			:host([data-router-selected]) [part=row] {
				background-color: var(--mo-color-accent-transparent);
				color: var(--mo-color-accent);
			}

			[part=indicator] {
				order: 1;
				margin-inline-start: auto;
				inline-size: 1.5rem;
				block-size: 1.5rem;

				mo-icon {
					font-size: 18px;
				}
			}

			/* A row with nothing to open keeps no room for the chevron it does not draw. */
			:host(:not([aria-expanded])) [part=indicator] {
				display: none;
			}

			/* One line for the whole nested block, drawn by the outermost group alone: a deeper one would lay
			   a second over it, and two of the same translucent grey read as a brighter stripe. It runs down
			   the centre of the icon of the row it belongs to. */
			:host(:not([slot=children])) [part=group] > div {
				background-image: linear-gradient(var(--mo-color-transparent-gray-3) 0 0);
				background-size: 1px 100%;
				background-position: 30px 0;
				background-repeat: no-repeat;
			}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation-tree-item': NavigationTreeItem
	}
}