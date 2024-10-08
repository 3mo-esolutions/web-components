import { component, html, property, style } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { FieldText } from './FieldText.js'

Localizer.dictionaries.add('de', {
	'Search': 'Suche',
})

/**
 * @element mo-field-search
 *
 * @i18n "Search"
 */
@component('mo-field-search')
export class FieldSearch extends FieldText {
	override get inputType() {
		return 'search'
	}

	@property() override label = t('Search')
	@property({ event: 'input' }) override value?: string

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
			${this.clearIconButtonTemplate}
			${super.endSlotTemplate}
		`
	}

	protected get clearIconButtonTemplate() {
		return !this.inputStringValue ? html.nothing : html`
			<mo-icon-button slot='end' icon='cancel' dense
				style='color: var(--mo-color-gray)'
				@click=${() => this.clear()}
			></mo-icon-button>
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