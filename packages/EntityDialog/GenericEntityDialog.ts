import { component, html, state, ifDefined, HTMLTemplateResult } from '@a11d/lit'
import { BaseDialogParameters, getContentTemplate } from '@3mo/dialog'
import { EntityDialogComponent } from './EntityDialogComponent.js'
import { EntityId } from '@3mo/fetchable-dialog'

interface GenericEntityDialogParameters<T> extends BaseDialogParameters<GenericEntityDialog<T>> {
	readonly secondaryButtonText?: string
	readonly id?: EntityId
	readonly entity: T
	readonly fetch: EntityDialogComponent<T, GenericEntityDialogParameters<T>, T>['fetch']
	readonly save: EntityDialogComponent<T, GenericEntityDialogParameters<T>, T>['save']
	readonly delete?: EntityDialogComponent<T, GenericEntityDialogParameters<T>, T>['delete']
}

@component('mo-generic-entity-dialog')
export class GenericEntityDialog<T> extends EntityDialogComponent<T, GenericEntityDialogParameters<T>, T> {
	@state() entity = this.parameters.entity
	protected override fetch = this.parameters.fetch
	protected override save = this.parameters.save
	protected override delete = this.parameters.delete

	protected override get template(): HTMLTemplateResult {
		const { heading, primaryButtonText, secondaryButtonText, blocking, size, content } = this.parameters
		return html`
			<mo-entity-dialog
				heading=${heading}
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