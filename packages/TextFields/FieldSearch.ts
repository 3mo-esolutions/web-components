import { component, html, style } from '@a11d/lit'
import { FieldText } from './FieldText.js'

/**
 * @element mo-field-search
 */
@component('mo-field-search')
export class FieldSearch extends FieldText {
	override readonly inputType = 'search'

	protected override get startSlotTemplate() {
		return html`
			<mo-icon slot='start' icon='search'
				@click=${() => this.focus()}
				${style({ color: this.focusController.focused ? 'var(--mo-color-accent)' : 'var(--mo-color-gray)' })}
			></mo-icon>
			${super.startSlotTemplate}
		`
	}

	protected override get endSlotTemplate() {
		return html`
			<mo-icon-button slot='end' icon='cancel' dense
				${style({ color: 'var(--mo-color-gray)', visibility: !this.value ? 'hidden' : 'visible' })}
				@click=${() => this.clear()}
			></mo-icon-button>
			${super.endSlotTemplate}
		`
	}

	protected clear() {
		if (this.value) {
			this.handleInput('')
			this.handleChange('')
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-search': FieldSearch
	}
}