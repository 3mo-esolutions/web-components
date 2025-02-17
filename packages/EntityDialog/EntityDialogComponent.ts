import { eventListener, type PropertyValues } from '@a11d/lit'
import { DialogActionKey, type DialogParameters, NotificationComponent } from '@a11d/lit-application'
import { Localizer } from '@3mo/localization'
import { type FetchableDialogComponentParameters, FetchableDialogComponent } from '@3mo/fetchable-dialog'
import { EntityDialog } from './EntityDialog.js'
import { getEntityLabel } from './getEntityLabel.js'

Localizer.dictionaries.add('de', {
	'${label:string} saved successfully.': '${label:string} erfolgreich gespeichert.',
	'Open': 'Öffnen',
})

export abstract class EntityDialogComponent<
	TEntity extends object,
	TParameters extends Exclude<DialogParameters, void> = FetchableDialogComponentParameters,
	TResult = TEntity
> extends FetchableDialogComponent<TEntity, TParameters, TResult | undefined> {
	protected abstract save(entity: TEntity): (TEntity | void) | PromiseLike<TEntity | void>
	protected abstract delete?(entity: TEntity): void | PromiseLike<void>

	override get dialogElement() {
		if (super.dialogElement instanceof EntityDialog === false) {
			throw new Error('EntityDialogComponent must be used with an mo-entity-dialog element or a subclass thereof')
		}
		return super.dialogElement as EntityDialog<TEntity>
	}

	override async confirm(...parameters: Parameters<FetchableDialogComponent<TEntity, TParameters, TResult | undefined>['confirm']>) {
		const result = await super.confirm(...parameters)
		this.notifySuccess(result)
		return result
	}

	protected notifySuccess(result?: TResult | undefined) {
		const DialogConstructor = this.constructor as Constructor<EntityDialogComponent<TEntity>>
		const id = result !== null && typeof result === 'object' && 'id' in result ? result.id : this.parameters.id
		NotificationComponent.notifySuccess(this.successMessage, {
			title: t('Open'),
			handleClick: () => void new DialogConstructor({ id }).confirm(),
		})
	}

	protected get successMessage() {
		return t('${label:string} saved successfully.', { label: getEntityLabel(this.entity) })
	}

	protected override firstUpdated(props: PropertyValues<this>) {
		super.firstUpdated(props)
		this.dialogElement.save = () => this.save(this.entity)
		if (this.delete && this.parameters.id) {
			this.dialogElement.delete = () => this.delete?.(this.entity)
		}
	}

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		this.dialogElement.parameters = this.parameters
		this.dialogElement.entity = this.entity
	}

	@eventListener({ target: window, type: 'keydown' })
	protected override async handleKeyDown(e: KeyboardEvent) {
		await super.handleKeyDown(e)
		if (!this.dialogElement.preventPrimaryOnCtrlS && e.code === 'KeyS' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			(document.activeElement as HTMLElement)?.blur()
			await this.handleAction(DialogActionKey.Primary)
		}
	}

	protected override async primaryAction() {
		return (await this.save(this.entity) || undefined) as TResult | undefined
	}

	protected override async secondaryAction() {
		if (this.parameters.id === undefined) {
			throw new Error('Cannot delete a new entity')
		}
		await this.delete?.(this.entity)
		return undefined
	}
}