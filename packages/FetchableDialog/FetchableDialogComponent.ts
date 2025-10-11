import { type PropertyValues, state, Binder } from '@a11d/lit'
import { DialogComponent, type DialogParameters } from '@a11d/lit-application'
import { FetchableDialog } from './FetchableDialog.js'

export type EntityId = number | string
export type FetchableDialogComponentParameters = { readonly id?: EntityId }

export abstract class FetchableDialogComponent<
	TEntity,
	TParameters extends Exclude<DialogParameters, void> = FetchableDialogComponentParameters,
	TResult = void
> extends DialogComponent<TParameters, TResult> {
	static {
		state()(FetchableDialogComponent.prototype, 'entity')
	}

	protected abstract entity: TEntity
	protected abstract fetch(id: EntityId): TEntity | Promise<TEntity>

	get fetcherController() { return this.dialogElement.fetcherController }

	readonly entityBinder: Binder<TEntity> = new Binder<TEntity>(this, 'entity')

	// @ts-expect-error Property stays readonly
	override get dialogElement() {
		// @ts-expect-error Accessing the super dialogElement's getter
		if (super.dialogElement instanceof FetchableDialog === false) {
			throw new Error('FetchableDialogComponent must be used with an mo-fetchable-dialog element or a subclass thereof')
		}
		// @ts-expect-error Accessing the super dialogElement's getter
		return super.dialogElement as FetchableDialog<TEntity>
	}

	protected override firstUpdated(props: PropertyValues<this>) {
		super.firstUpdated(props)
		this.dialogElement.fetch = () => !this.parameters.id ? this.entity : this.fetch(this.parameters.id)
	}

	override async connectedCallback() {
		await super.connectedCallback()
		await new Promise(requestAnimationFrame)
		await this.dialogElement.fetcherController.taskComplete
		this.entity = this.dialogElement.fetcherController.value!
	}
}