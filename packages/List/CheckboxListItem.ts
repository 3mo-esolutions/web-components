import { component, eventListener, html, property } from '@a11d/lit'
import { SelectionListItemWithControl } from './SelectionListItemWithControl.js'
import { Checkbox } from '@3mo/checkbox'

/**
 * @element mo-checkbox-list-item
 *
 * @attr selectionControlAlignment - The alignment of the checkbox relative to the list item content
 * @attr indeterminate - Whether the checkbox is indeterminate
 * @attr selected - The value of the checkbox
 *
 * @slot - Default slot for content
 *
 * @event change - Dispatched when the checkbox value changes
 */
@component('mo-checkbox-list-item')
export class CheckboxListItem extends SelectionListItemWithControl<CheckboxSelection> {
	@property({ type: Boolean, converter: Checkbox.selectedPropertyConverter }) override selected: CheckboxSelection = false

	override role = 'menuitemcheckbox'

	protected get selectionControlTemplate() {
		return html`
			<mo-checkbox tabindex='-1'
				.selected=${this.selected || false}
				@click=${(e: MouseEvent) => e.stopImmediatePropagation()}
				@change=${(e: CustomEvent<CheckboxSelection>) => this.handleChange(e.detail)}
			></mo-checkbox>
		`
	}

	@eventListener('click')
	protected handleClick() {
		this.handleChange(!this.selected)
	}

	protected handleChange(selected: CheckboxSelection) {
		this.selected = selected
		this.change.dispatch(selected)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-checkbox-list-item': CheckboxListItem
	}
}