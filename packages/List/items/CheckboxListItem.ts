import { component, event, eventListener, html, ifDefined, property } from '@a11d/lit'
import { ControlListItem } from './ControlListItem.js'
import '@3mo/checkbox'

/**
 * @element mo-checkbox-list-item
 *
 * @attr controlAlignment - The alignment of the checkbox relative to the list item content
 * @attr checked - Whether the checkbox is checked
 * @attr indeterminate - Whether the checkbox is indeterminate
 * @attr value - The value of the checkbox
 *
 * @slot - Default slot for content
 *
 * @event change - Dispatched when the checkbox value changes
 */
@component('mo-checkbox-list-item')
export class CheckboxListItem extends ControlListItem {
	@event() readonly change!: EventDispatcher<CheckboxValue>

	@property({ type: Boolean }) checked = false
	@property({ type: Boolean }) indeterminate = false
	@property() value?: CheckboxValue

	override role = 'menuitemcheckbox'

	protected get controlTemplate() {
		return html`
			<mo-checkbox tabindex='-1'
				?checked=${this.checked}
				?indeterminate=${this.indeterminate}
				value=${ifDefined(this.value)}
				@click=${(e: MouseEvent) => e.stopImmediatePropagation()}
				@change=${(e: CustomEvent<CheckboxValue>) => this.handleChange(e.detail)}
			></mo-checkbox>
		`
	}

	@eventListener('click')
	protected handleClick() {
		this.handleChange(this.checked ? 'unchecked' : 'checked')
	}

	protected handleChange(value: CheckboxValue) {
		this.checked = value === 'checked'
		this.indeterminate = value === 'indeterminate'
		this.value = value
		this.change.dispatch(value)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-checkbox-list-item': CheckboxListItem
	}
}