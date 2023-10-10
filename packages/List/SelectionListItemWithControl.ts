import { html, HTMLTemplateResult, property } from '@a11d/lit'
import { SelectionListItem } from './SelectionListItem.js'

export abstract class SelectionListItemWithControl<T = boolean> extends SelectionListItem<T> {
	@property() selectionControlAlignment: 'start' | 'end' = 'end'

	protected override get template() {
		return html`
			${this.selectionControlAlignment === 'start' ? this.selectionControlTemplate : html.nothing}
			${super.template}
			${this.selectionControlAlignment === 'end' ? this.selectionControlTemplate : html.nothing}
		`
	}

	protected abstract get selectionControlTemplate(): HTMLTemplateResult
}