import { component, eventListener, html, ifDefined, property } from '@a11d/lit'
import { SelectionListItemWithControl } from './SelectionListItemWithControl.js'
import '@3mo/radio'

/**
 * @element mo-radio-list-item
 *
 * @attr selectionControlAlignment - The alignment of the radio relative to the list item content
 * @attr name - The name of the radio
 * @attr selected - Whether the radio is selected
 *
 * @slot - Default slot for content
 *
 * @event change - Dispatched when the radio value changes
 */
@component('mo-radio-list-item')
export class RadioListItem extends SelectionListItemWithControl {
	@property() name?: string
	@property({ type: Boolean }) selected = false

	override role = 'menuitemradio'

	protected get selectionControlTemplate() {
		return html`
			<mo-radio tabindex='-1'
				name=${ifDefined(this.name)}
				?selected=${this.selected}
				@click=${(e: MouseEvent) => e.stopImmediatePropagation()}
				@change=${(e: CustomEvent<boolean>) => this.handleChange(e.detail)}
			></mo-radio>
		`
	}

	@eventListener('click')
	protected handleClick() {
		this.handleChange(true)
	}

	protected handleChange(value: boolean) {
		if (this.selected !== value) {
			this.selected = value
			this.change.dispatch(value)
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-radio-list-item': RadioListItem
	}
}