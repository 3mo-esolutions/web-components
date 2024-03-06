import { component, html, property } from '@a11d/lit'
import { FetchableDialog } from '@3mo/fetchable-dialog'

@component('mo-entity-dialog')
export class EntityDialog<TEntity> extends FetchableDialog<TEntity> {
	@property({ type: Boolean }) preventPrimaryOnCtrlS = false
	@property({ type: Object }) save!: () => (TEntity | void) | PromiseLike<TEntity | void>
	@property({ type: Object }) delete?: () => void | PromiseLike<void>

	protected override get primaryActionDefaultTemplate() {
		return this.primaryButtonText === '' ? html.nothing : html`
			<mo-loading-button type='raised' ?disabled=${this.fetcherController.isFetching}>
				${this.primaryButtonText || t('Save')}
			</mo-loading-button>
		`
	}

	protected override get secondaryActionDefaultTemplate() {
		return !this.delete || this.secondaryButtonText === '' ? super.secondaryActionDefaultTemplate : html`
			<mo-loading-button type='outlined' style='--mo-button-accent-color: var(--mo-color-red)' ?disabled=${this.fetcherController.isFetching}>
				${this.secondaryButtonText || t('Delete')}
			</mo-loading-button>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-entity-dialog': EntityDialog<unknown>
	}
}