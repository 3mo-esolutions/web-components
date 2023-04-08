import { component, css, html, property, eventListener } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { ListItem } from './ListItem.js'

/**
 * @element mo-collapsible-list-item
 *
 * @attr open - Whether the list item is open
 *
 * @slot details - The details of the list item
 */
@component('mo-collapsible-list-item')
export class CollapsibleListItem extends ListItem {
	@property({
		type: Boolean,
		updated(this: CollapsibleListItem) {
			if (this.open) {
				this.focusFirstChild()
			}
		}
	}) private open = false

	static override get styles() {
		return css`
			${super.styles}

			:host {
				height: unset;
				min-height: 48px;
				padding-inline-end: 0px;
			}

			details {
				width: 100%;
			}

			summary {
				list-style: none;
			}

			summary::-webkit-details-marker, summary::marker {
				display: none;
			}

			slot[name=details] {
				display: block;
			}

			mo-icon {
				margin-inline-end: 16px;
			}
		`
	}

	private readonly slotController = new SlotController(this)

	private get hasDetails() {
		return this.slotController.hasAssignedElements('details')
	}

	protected override get template() {
		return !this.hasDetails ? super.template : html`
			<details ?open=${this.open}>
				<summary class='container' tabindex='-1'>
					${super.template}
					<mo-icon icon=${!this.open ? 'arrow_drop_down' : 'arrow_drop_up'}></mo-icon>
				</summary>
				<slot name='details'></slot>
			</details>
		`
	}

	@eventListener({ target: window, type: 'keydown' })
	handleItemKeyDown(event: KeyboardEvent) {
		if (!this.focused) {
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

	private async focusFirstChild() {
		await this.updateComplete
		const firstChild = this.slotController.getAssignedElements('details')[0] as HTMLElement
		firstChild?.focus()
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-collapsible-list-item': CollapsibleListItem
	}
}