import { component, html, state, ifDefined, type HTMLTemplateResult } from '@a11d/lit'
import { getContentTemplate } from '@3mo/dialog'
import { type GenericFetchableDialogParameters } from '@3mo/fetchable-dialog'
import { EntityDialogComponent } from './EntityDialogComponent.js'

interface GenericEntityDialogParameters<T extends object> extends GenericFetchableDialogParameters<T, GenericEntityDialog<T>> {
	readonly save: EntityDialogComponent<T, GenericEntityDialogParameters<T>, T>['save']
	readonly delete?: EntityDialogComponent<T, GenericEntityDialogParameters<T>, T>['delete']
}

@component('mo-generic-entity-dialog')
export class GenericEntityDialog<T extends object> extends EntityDialogComponent<T, GenericEntityDialogParameters<T>, T> {
	@state() entity = this.parameters.entity
	protected override fetch = this.parameters.fetch
	protected override save = this.parameters.save
	protected override delete = this.parameters.delete

	protected override get template(): HTMLTemplateResult {
		const { heading, primaryButtonText, secondaryButtonText, blocking, size, content } = this.parameters
		return html`
			<mo-entity-dialog
				heading=${ifDefined(heading)}
				primaryButtonText=${ifDefined(primaryButtonText)}
				secondaryButtonText=${ifDefined(secondaryButtonText)}
				?blocking=${blocking}
				size=${ifDefined(size)}
			>
				${getContentTemplate(this, content)}
			</mo-entity-dialog>
		`
	}
}