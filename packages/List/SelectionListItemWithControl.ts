import { type HTMLTemplateResult, property } from '@a11d/lit'
import { SelectionListItem } from './SelectionListItem.js'

export abstract class SelectionListItemWithControl<T = boolean> extends SelectionListItem<T> {
	@property() selectionControlAlignment: 'start' | 'end' = 'end'

	protected override get startSlotDefaultContent() {
		return this.selectionControlAlignment === 'start' ? this.selectionControlTemplate : super.startSlotDefaultContent
	}

	protected override get endSlotDefaultContent() {
		return this.selectionControlAlignment === 'end' ? this.selectionControlTemplate : super.endSlotDefaultContent
	}

	protected abstract get selectionControlTemplate(): HTMLTemplateResult
}