import { html, HTMLTemplateResult, nothing, property } from '@a11d/lit'
import { ListItem } from './ListItem.js'

export abstract class ControlListItem extends ListItem {
	@property() controlAlignment: 'start' | 'end' = 'end'

	protected override get template() {
		return html`
			${this.controlAlignment === 'start' ? this.controlTemplate : nothing}
			${super.template}
			${this.controlAlignment === 'end' ? this.controlTemplate : nothing}
		`
	}

	protected abstract get controlTemplate(): HTMLTemplateResult
}