import { Component, component, css, event, html, property } from '@a11d/lit'
import type { MaterialIcon } from '@3mo/icon'

/**
 * @element mo-tree-item
 *
 * A row of a tree and the group of the rows nested in it. A `mo-tree-item` child assigns itself to that
 * group, so a tree is nesting alone:
 *
 * ```html
 * <mo-tree-item value='documents' open>Documents
 *   <mo-tree-item value='taxes'>Taxes</mo-tree-item>
 * </mo-tree-item>
 * ```
 *
 * `open` is the item's own state, whoever sets it: written by hand, bound by the consumer, or set by the
 * tree as the row is opened — and reported by `openChange` either way. `value`, `selected` and `disabled`
 * are read the same way, and the tree stamps `aria-expanded`, `aria-selected`, `aria-disabled`, the cursor
 * and `--mo-tree-level` — which the row indents by — back onto the item. Its look is `::part(row)`'s.
 *
 * @attr value - What the tree reports this item as. An item without one is not in the tree's `value`.
 * @attr open - Whether the nested items are shown.
 * @attr selected - Whether the item starts out selected.
 * @attr disabled - Neither navigable nor selectable.
 * @attr icon - An icon before the content.
 *
 * @slot - The content of the row.
 * @slot start - Placed before the content, in place of the icon.
 * @slot end - Placed after the content.
 * @slot children - The nested items, which a `mo-tree-item` child joins on its own.
 *
 * @csspart row - The row: the item without its nested items.
 * @csspart indicator - The chevron which opens and closes the row.
 * @csspart group - What the nested items sit in, and what slides and fades as the row opens and closes.
 *
 * @fires openChange - Whether the nested items are shown, whenever that changes. It bubbles, which is how the tree follows its items.
 */
@component('mo-tree-item')
export class TreeItem extends Component {
	@event({ bubbles: true, composed: true }) readonly openChange!: EventDispatcher<boolean>

	@property() value?: string
	@property({
		type: Boolean,
		reflect: true,
		updated(this: TreeItem, open: boolean, previous: boolean | undefined) {
			if (previous !== undefined) {
				this.openChange.dispatch(open)
			}
		}
	}) open = false
	@property({ type: Boolean, reflect: true }) selected = false
	@property({ type: Boolean, reflect: true }) disabled = false
	@property() icon?: MaterialIcon

	/** The nested items. */
	get items(): Array<TreeItem> {
		return [...this.children].filter((child): child is TreeItem => child instanceof TreeItem)
	}

	override connectedCallback() {
		super.connectedCallback()
		if (!this.slot && this.parentElement instanceof TreeItem) {
			this.slot = 'children'
		}
	}

	static override get styles() {
		return css`
			:host {
				--_easing: cubic-bezier(0.4, 0, 0.2, 1);
				--_duration: var(--mo-duration-quick, 250ms);
				--_indentation: calc(var(--mo-tree-level, 0) * 20px);
				display: block;
				color: var(--mo-color-foreground);
				outline: none;
			}

			[part=row] {
				display: flex;
				align-items: center;
				gap: 0.5rem;
				box-sizing: border-box;
				min-block-size: 40px;
				padding-inline: var(--_indentation) 0.75rem;
				cursor: pointer;
				user-select: none;
				/* One guide line per level, drawn under the chevrons of the levels above. */
				background-image: repeating-linear-gradient(to right,
					transparent 0, transparent 13.5px,
					var(--mo-color-transparent-gray-3) 13.5px, var(--mo-color-transparent-gray-3) 14.5px,
					transparent 14.5px, transparent 20px);
				background-size: var(--_indentation) 100%;
				background-repeat: no-repeat;

				&:hover {
					background-color: var(--mo-color-transparent-gray-1);
				}

				:host([data-navigability=current]) & {
					background-color: var(--mo-color-transparent-gray-2);
				}

				:host(:focus-visible) & {
					outline: 2px solid var(--mo-color-accent);
					outline-offset: -2px;
				}

				:host([aria-selected=true]) & {
					background-color: color-mix(in srgb, var(--mo-color-accent), transparent 88%);
					color: color-mix(in srgb, var(--mo-color-accent), var(--mo-color-foreground) 25%);
				}

				:host([aria-disabled=true]) & {
					opacity: 0.5;
					cursor: default;
					pointer-events: none;
				}

				:host([data-separator]) & {
					border-block-start: 1px solid var(--mo-color-transparent-gray-3);
				}
			}

			[part=indicator] {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				inline-size: 1.75rem;
				block-size: 1.75rem;
				flex: 0 0 auto;
				border-radius: 50%;
				color: var(--mo-color-gray);
				/* A row without children keeps the width, so that the content of every row lines up. */
				visibility: hidden;

				&:hover {
					background-color: var(--mo-color-transparent-gray-2);
				}

				mo-icon {
					font-size: 20px;
					transition: rotate var(--_duration) var(--_easing);
				}

				:host([aria-expanded]) & {
					visibility: visible;
				}

				:host(:dir(rtl)) & mo-icon {
					rotate: 180deg;
				}

				:host([aria-expanded=true]) & mo-icon {
					rotate: 90deg;
				}
			}

			.content {
				flex: 1;
				min-inline-size: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			slot[name=start] mo-icon {
				font-size: 22px;
				opacity: 0.75;
			}

			/* The rows never move: the group they sit in is what slides, from no rows tall to as tall as
			   they are, which a grid track interpolates in every engine. */
			[part=group] {
				display: grid;
				grid-template-rows: 0fr;
				opacity: 0;
				visibility: hidden;
				transition:
					grid-template-rows var(--_duration) var(--_easing),
					opacity var(--_duration) var(--_easing),
					visibility var(--_duration);

				> div {
					min-block-size: 0;
					overflow: hidden;
				}

				:host([aria-expanded=true]) & {
					grid-template-rows: 1fr;
					opacity: 1;
					visibility: visible;
				}
			}

			@media (prefers-reduced-motion: reduce) {
				[part=group], [part=indicator] mo-icon {
					transition: none;
				}
			}
		`
	}

	protected override get template() {
		return html`
			<div part='row'>
				<span part='indicator' aria-hidden='true'>
					<mo-icon icon='chevron_right'></mo-icon>
				</span>
				<slot name='start'>
					${!this.icon ? html.nothing : html`<mo-icon icon=${this.icon}></mo-icon>`}
				</slot>
				<span class='content'>
					<slot></slot>
				</span>
				<slot name='end'></slot>
			</div>
			<div part='group' role='group'>
				<div>
					<slot name='children'></slot>
				</div>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tree-item': TreeItem
	}
}