import { component, html, state, ifDefined, type HTMLTemplateResult } from '@a11d/lit'
import { type DialogComponent } from '@a11d/lit-application'
import { type BaseDialogParameters, getContentTemplate } from '@3mo/dialog'
import { type EntityId, FetchableDialogComponent } from './FetchableDialogComponent.js'

export interface GenericFetchableDialogParameters<T, Dialog extends DialogComponent<any, any> = GenericFetchableDialog<T>> extends BaseDialogParameters<Dialog> {
	readonly secondaryButtonText?: string
	readonly entity: T
	readonly id?: EntityId
	readonly fetch: FetchableDialogComponent<T, GenericFetchableDialogParameters<T>, T>['fetch']
}

@component('mo-generic-fetchable-dialog')
export class GenericFetchableDialog<T> extends FetchableDialogComponent<T, GenericFetchableDialogParameters<T, GenericFetchableDialog<T>>, T> {
	@state() entity = this.parameters.entity
	protected override fetch = this.parameters.fetch

	protected override get template(): HTMLTemplateResult {
		const { heading, primaryButtonText, secondaryButtonText, blocking, size, content } = this.parameters
		return html`
			<mo-fetchable-dialog
				heading=${ifDefined(heading)}
				primaryButtonText=${ifDefined(primaryButtonText)}
				secondaryButtonText=${ifDefined(secondaryButtonText)}
				?blocking=${blocking}
				size=${ifDefined(size)}
			>
				${getContentTemplate(this, content)}
			</mo-fetchable-dialog>
		`
	}
}