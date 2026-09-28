import { component, html, property } from '@a11d/lit'
import '@3mo/localization'
import { FetchableDialog } from '@3mo/fetchable-dialog'
import { getEntityLabel } from './getEntityLabel.js'

/**
 * A dialog that fetches an entity to edit, saves it with its primary button or Ctrl+S, and deletes it with its secondary one.
 *
 * @element mo-entity-dialog
 *
 * @attr preventPrimaryOnCtrlS - Whether Ctrl+S leaves the entity unsaved.
 * @attr entity - The entity being edited. Set by the `EntityDialogComponent` rendering the dialog.
 * @attr save - The function that saves the entity. Set by the `EntityDialogComponent` rendering the dialog.
 * @attr delete - The function that deletes the entity, which adds the Delete button. Set by the `EntityDialogComponent` rendering the dialog.
 * @attr parameters - The parameters of the dialog, whose `id` decides between creating and editing. Set by the `EntityDialogComponent` rendering the dialog.
 */
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