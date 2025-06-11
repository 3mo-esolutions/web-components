import { component, css, html, property, eventListener, Component, query } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { MutationController } from '@3mo/mutation-observer'
import '@3mo/expand-collapse-icon-button'
import { listItem, listItems } from './extensions.js'

/**
 * @element mo-collapsible-list-item
 *
 * @attr open - Whether the list item is open
 *
 * @slot - The parent list item
 * @slot details - The nested list items
 *
 * @csspart summary - The summary element hosting the parent list item
 * @csspart details - The details element hosting the nested list items
 * @csspart expand-collapse-icon-button - The expand/collapse icon button
 */
@component('mo-collapsible-list-item')
export class CollapsibleListItem extends Component {
	@property({ type: Boolean, updated(this: CollapsibleListItem) { this.openUpdated() } }) open = false

	@query('details') private readonly detailsElement!: HTMLDetailsElement

	protected readonly slotController = new SlotController(this)
	protected readonly mutationObserver = new MutationController(this, {
		config: { subtree: true, attributes: true, attributeFilter: ['selected', 'data-router-selected'] },
		callback: () => {
			if (this[listItems].some(d => 'selected' in d && d.selected === true)) {
				this.open = true
			}
		}
	})

	override get [listItem](): Element {
		return this.slotController.getAssignedElements('').find(e => !!e[listItem])!
	}

	override get [listItems](): Array<Element> {
		return [
			this[listItem]!,
			...this.slotController.getAssignedElements('details').flatMap(e => e[listItems] ?? [])
		]
	}

	private openUpdated() {
		this.slotController.getAssignedElements('details')
			.map(item => item[listItem])
			.forEach(item => item?.setAttribute('aria-hidden', String(!this.open)))
	}

	static override get styles() {
		return css`
			:host {
				display: block;
			}

			details {
				width: 100%;
			}

			summary {
				position: relative;
				list-style: none;
			}

			summary::-webkit-details-marker, summary::marker {
				display: none;
			}

			slot[name=details] {
				display: block;
			}

			mo-expand-collapse-icon-button {
				position: absolute;
				inset-inline-end: 16px;
				inset-block-start: 50%;
				transform: translateY(-50%);
			}
		`
	}

	protected override get template() {
		return !this[listItems]?.length ? super.template : html`
			<details ?open=${this.open} @toggle=${() => { this.open = this.detailsElement.open }}>
				<summary tabindex='-1' part='summary'>
					<slot></slot>
					<mo-expand-collapse-icon-button tabindex='-1'
						part='expand-collapse-icon-button'
						?open=${this.open}
					></mo-expand-collapse-icon-button>
				</summary>
				<slot name='details' part='details'></slot>
			</details>
		`
	}

	@eventListener({ target: window, type: 'keydown' })
	handleItemKeyDown(event: KeyboardEvent) {
		if (!this[listItem]?.hasAttribute('focused')) {
			return
		}

		if (event.key === 'ArrowRight') {
			event.stopPropagation()
			this.open = true
		}

		if (event.key === 'ArrowLeft') {
			event.stopPropagation()
			this.open = false
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-collapsible-list-item': CollapsibleListItem
	}
}