import { component, html, property } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { FetchableDialog } from '@3mo/fetchable-dialog'
import { getEntityLabel } from './getEntityLabel.js'

Localizer.dictionaries.add('de', {
	'Create ${label:string}': '${label:string} erstellen',
	'Edit ${label:string}': '${label:string} bearbeiten',
})

@component('mo-entity-dialog')
export class EntityDialog<TEntity extends object> extends FetchableDialog<TEntity> {
	@property({ type: Boolean }) preventPrimaryOnCtrlS = false
	@property({ type: Object }) entity!: TEntity
	@property({ type: Object }) save!: () => (TEntity | void) | PromiseLike<TEntity | void>
	@property({ type: Object }) delete?: () => void | PromiseLike<void>
	@property({ type: Object }) parameters!: { readonly id?: unknown }

	protected override get dialogHeading() {
		return super.dialogHeading || this.entityHeading
	}

	get entityHeading() {
		return !this.parameters.id
			? t('Create ${label:string}', { label: getEntityLabel(this.entity) })
			: t('Edit ${label:string}', { label: getEntityLabel(this.entity) })
	}

	protected override get primaryActionDefaultTemplate() {
		return this.primaryButtonText === '' ? html.nothing : html`
			<mo-loading-button type='elevated' ?disabled=${this.fetcherController.pending}>
				${this.primaryButtonText || t('Save')}
			</mo-loading-button>
		`
	}

	protected override get secondaryActionDefaultTemplate() {
		return !this.delete || this.secondaryButtonText === '' ? super.secondaryActionDefaultTemplate : html`
			<mo-loading-button type='outlined' style='--mo-button-accent-color: var(--mo-color-red)' ?disabled=${this.fetcherController.pending}>
				${this.secondaryButtonText || t('Delete')}
			</mo-loading-button>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-entity-dialog': EntityDialog<object>
	}
}