import { component, eventListener, html, property } from '@a11d/lit'
import { SelectionListItemWithControl } from './SelectionListItemWithControl.js'
import '@3mo/switch'

/**
 * @element mo-switch-list-item
 *
 * @attr selectionControlAlignment - The alignment of the switch relative to the list item content
 * @attr selected - Whether the switch is selected
 *
 * @slot - Default slot for content
 *
 * @event change - Dispatched when the switch value changes
 */
@component('mo-switch-list-item')
export class SwitchListItem extends SelectionListItemWithControl {
	@property({ type: Boolean }) selected = false

	override role = 'menuitemradio'

	protected get selectionControlTemplate() {
		return html`
			<mo-switch tabindex='-1'
				?selected=${this.selected}
				@click=${(e: MouseEvent) => e.stopImmediatePropagation()}
				@change=${(e: CustomEvent<boolean>) => this.handleChange(e.detail)}
			></mo-switch>
		`
	}

	@eventListener('click')
	protected handleClick() {
		this.handleChange(!this.selected)
	}

	protected handleChange(value: boolean) {
		this.selected = value
		this.change.dispatch(value)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-switch-list-item': SwitchListItem
	}
}