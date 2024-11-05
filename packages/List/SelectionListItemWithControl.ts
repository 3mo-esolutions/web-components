import { html, type HTMLTemplateResult, property } from '@a11d/lit'
import { SelectionListItem } from './SelectionListItem.js'

export abstract class SelectionListItemWithControl<T = boolean> extends SelectionListItem<T> {
	@property() selectionControlAlignment: 'start' | 'end' = 'end'

	protected override get template() {
		return html`
			${this.selectionControlAlignment === 'start' ? this.selectionControlContainerTemplate : html.nothing}
			${super.template}
			${this.selectionControlAlignment === 'end' ? this.selectionControlContainerTemplate : html.nothing}
		`
	}

	private get selectionControlContainerTemplate() {
		return html`
			<div style='margin-inline-start: auto'>
				${this.selectionControlTemplate}
			</div>
		`
	}

	protected abstract get selectionControlTemplate(): HTMLTemplateResult
}