import { component, property, html, nothing, TemplateResult } from '@a11d/lit'
import { FetchableDialogComponentParameters as EntityWithId } from '@3mo/fetchable-dialog'
import { EntityDialogComponent } from '@3mo/entity-dialog'
import { FetchableDataGridParametersType, FetchableDataGrid } from '@3mo/fetchable-data-grid'

type CreateAction = (() => unknown | PromiseLike<unknown>)
type EditAction<TEntity extends EntityWithId> = ((entity: TEntity) => unknown | PromiseLike<unknown>)

type CreateOrEditAction<TEntity extends EntityWithId> = CreateAction | EditAction<TEntity>

/**
 * @element mo-entity-data-grid - A data grid that supports CRUD operations.
 *
 * @attr create - The create action can be either a function or a class that extends EntityDialogComponent.
 * @attr edit - The edit action can be either a function or a class that extends EntityDialogComponent.
 * @attr isEntityEditable - A predicate that determines whether an entity is editable.
 * @attr createOrEdit - The createOrEdit is an aggregate of the create and edit actions. It can be either a function or a class that extends EntityDialogComponent.
 * @attr delete - The delete action can be either a function or a class that extends EntityDialogComponent.
 * @attr isEntityDeletable - A predicate that determines whether an entity is deletable.
 * @attr hideFab - Whether to hide the floating action button.
 */
@component('mo-entity-data-grid')
export class EntityDataGrid<TEntity extends EntityWithId, TDataFetcherParameters extends FetchableDataGridParametersType = Record<string, never>, TDetailsElement extends Element | undefined = undefined> extends FetchableDataGrid<TEntity, TDataFetcherParameters, TDetailsElement> {
	@property({ type: Object }) create?: CreateAction | Constructor<EntityDialogComponent<TEntity>>

	@property({ type: Object }) edit?: EditAction<TEntity> | Constructor<EntityDialogComponent<TEntity>>
	@property({ type: Object }) isEntityEditable?: (entity: TEntity) => boolean

	@property({
		type: Object,
		updated(this: EntityDataGrid<TEntity>) {
			if (this.createOrEdit) {
				this.create = this.createOrEdit as CreateAction
				this.edit = this.createOrEdit
			}
		}
	}) createOrEdit?: CreateOrEditAction<TEntity> | Constructor<EntityDialogComponent<TEntity>>

	@property({ type: Object }) delete?: (...entities: Array<TEntity>) => void | PromiseLike<void>
	@property({ type: Object }) isEntityDeletable?: (entity: TEntity) => boolean

	@property({ type: Object }) rowContextMenuTemplate?: (rowData: Array<TEntity>) => TemplateResult
	@property({ type: Boolean }) hideFab = false

	override readonly primaryContextMenuItemOnDoubleClick = true
	override parameters = {} as TDataFetcherParameters

	async createAndRefetch() {
		if (!this.create) {
			return
		}

		await (
			this.isEntityDialogClass(this.create)
				? this.confirmEntityDialog(new this.create({}))
				: this.create()
		)

		await this.requestFetch()
	}

	async editAndRefetch(entity: TEntity) {
		if (!this.edit) {
			return
		}

		await (
			this.isEntityDialogClass(this.edit)
				? this.confirmEntityDialog(new this.edit({ id: entity.id }))
				: this.edit(entity)
		)

		await this.requestFetch()
	}

	protected override get fabTemplate() {
		return html`
			${!this.create || this.hideFab ? nothing : html`<mo-fab icon='add' @click=${() => this.createAndRefetch()}></mo-fab>`}
			${super.fabTemplate}
		`
	}

	override getRowContextMenuTemplate = (entities: Array<TEntity>) => {
		return html`
			${this.rowContextMenuTemplate?.(entities) ?? nothing}
			${this.getEditContextMenuItemTemplate(entities)}
			${this.getDeleteContextMenuItemTemplate(entities)}
		`
	}

	private getEditContextMenuItemTemplate(entities: Array<TEntity>) {
		const nonEditable = !this.edit || entities.length !== 1 || this.isEntityEditable?.(entities[0]!) === false
		return nonEditable ? nothing : html`
			<mo-data-grid-primary-context-menu-item icon='edit' data-test-id='edit' @click=${() => this.editAndRefetch(entities[0]!)}>
				${t('Edit')}
			</mo-data-grid-primary-context-menu-item>
		`
	}

	private getDeleteContextMenuItemTemplate(entities: Array<TEntity>) {
		const nonDeletable = !this.delete || entities.some(entity => this.isEntityDeletable?.(entity) === false)
		return nonDeletable ? nothing : html`
			<mo-context-menu-item icon='delete' data-test-id='delete' @click=${() => this.deleteAndRefetch(entities)}>
				${t('Delete')}
			</mo-context-menu-item>
		`
	}

	private async confirmEntityDialog(dialog: EntityDialogComponent<TEntity>) {
		try {
			await dialog.confirm()
		} finally {
			// Continue
		}
	}

	private async deleteAndRefetch(entities: Array<TEntity>) {
		if (!this.delete) {
			return
		}
		await this.delete(...entities)
		await this.requestFetch()
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	private isEntityDialogClass(fn: Function): fn is Constructor<EntityDialogComponent<TEntity>> {
		return typeof fn === 'function' && /^class\s/.test(fn.toString())
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-entity-data-grid': EntityDataGrid<object>
	}
}