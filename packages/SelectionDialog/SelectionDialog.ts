import { component, css, html, join, query, state, type HTMLTemplateResult, type TemplateResult } from '@a11d/lit'
import { DialogActionKey, DialogComponent } from '@a11d/lit-application'
import { label } from '@a11d/metadata'
import { DialogSize } from '@3mo/dialog'
import { type DataGrid, DataGridSelectability } from '@3mo/data-grid'
import '@3mo/localization'
import '@3mo/loading-button'

export type SelectionDialogParameters<TData, TMultipleSelection extends boolean = false> = {
	/** The type of the entries, whose `@label` names them in the default heading. */
	readonly data: Constructor<TData>
	/** A template holding the data grid to select from, plain or fetchable. */
	readonly dataGridTemplate: TemplateResult
	readonly multipleSelection?: TMultipleSelection
	readonly heading?: string
	readonly primaryButtonText?: string
	readonly size?: Exclude<DialogSize, DialogSize.Small>
}

export type SelectionDialogResult<TData, TMultipleSelection extends boolean> = TMultipleSelection extends true ? Array<TData> : TData

/**
 * A dialog for picking an entry, or several with `multipleSelection`, from the data grid of its `dataGridTemplate`.
 * A click selects a row; the primary button, or the first item of a row's context menu, confirms with the selected entries.
 *
 * @element mo-selection-dialog
 *
 * @i18n "Apply selection"
 * @i18n "Select ${label:string}"
 */
@component('mo-selection-dialog')
export class SelectionDialog<TData, TMultipleSelection extends boolean = false> extends DialogComponent<
	SelectionDialogParameters<TData, TMultipleSelection>,
	SelectionDialogResult<TData, TMultipleSelection>
> {
	@state() selectedData = new Array<TData>()

	@query('[instanceof~=mo-data-grid]') private readonly dataGrid!: DataGrid<TData>

	static override get styles() {
		return css`
			mo-dialog {
				--mo-dialog-divider-color: transparent;
				height: 800px;

				&::part(content) {
					padding: 0;
				}

				&::part(footer) {
					border-top: 1px solid var(--mo-color-transparent-gray-3);
				}
			}
		`
	}

	protected override async initialized() {
		if (!this.dataGrid) {
			throw new Error('SelectionDialog requires a data grid in its dataGridTemplate')
		}

		// A server-rendered grid must hydrate as it was rendered before it is configured.
		await this.dataGrid.updateComplete
		this.dataGrid.selectOnClick = true
		this.dataGrid.detailsOnClick = true
		this.dataGrid.multipleDetails = true
		this.dataGrid.selectability = this.parameters.multipleSelection ? DataGridSelectability.Multiple : DataGridSelectability.Single
		this.dataGrid.selectionChange.subscribe(this.handleSelectionChange)
		const getContextMenuTemplate = this.dataGrid.getRowContextMenuTemplate
		this.dataGrid.getRowContextMenuTemplate = (data: Array<TData>) => html`${join([
			html`
				<mo-data-grid-primary-context-menu-item icon=${this.parameters.multipleSelection ? 'done_all' : 'done'} @click=${() => this.confirmWith(data)}>
					${this.primaryButtonText}
				</mo-data-grid-primary-context-menu-item>
			`,
			getContextMenuTemplate?.(data),
		].filter(Boolean), html`<mo-line></mo-line>`)}`
	}

	protected override disconnected() {
		this.dataGrid?.selectionChange.unsubscribe(this.handleSelectionChange)
	}

	private readonly handleSelectionChange = () => this.selectedData = [...this.dataGrid.selectedData]

	/** A row's context menu acts on the rows it was opened for, which need not be selected. */
	private confirmWith(data: Array<TData>) {
		this.selectedData = data
		return this.handleAction(DialogActionKey.Primary)
	}

	private get primaryButtonText() {
		return this.parameters.primaryButtonText ?? t('Apply selection')
	}

	protected override get template() {
		return html`
			<mo-dialog size=${this.parameters.size ?? DialogSize.Medium} heading=${this.parameters.heading ?? t('Select ${label:string}', { label: label.get(this.parameters.data) ?? '' })}>
				${this.parameters.dataGridTemplate}
				${this.footerTemplate}
				<mo-loading-button slot='primaryAction' type='elevated' ?disabled=${!this.selectedData.length}>
					${this.primaryButtonText}
				</mo-loading-button>
			</mo-dialog>
		`
	}

	protected get footerTemplate(): HTMLTemplateResult | typeof html.nothing {
		return html.nothing
	}

	protected override primaryAction(): SelectionDialogResult<TData, TMultipleSelection> | Promise<SelectionDialogResult<TData, TMultipleSelection>> {
		return (this.parameters.multipleSelection ? this.selectedData : this.selectedData[0]) as SelectionDialogResult<TData, TMultipleSelection>
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selection-dialog': SelectionDialog<unknown, boolean>
	}
}
