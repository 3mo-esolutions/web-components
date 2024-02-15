import { css, property, Component, html, queryAll, style, HTMLTemplateResult, LitElement, event } from '@a11d/lit'
import { ContextMenu } from '@3mo/context-menu'
import { ColumnDefinition } from '../ColumnDefinition.js'
import { DataGrid, DataGridCell, DataGridPrimaryContextMenuItem, DataGridSelectionMode } from '../index.js'

/**
 * @attr dataGrid
 * @attr data
 * @attr selected
 * @attr contextMenuOpen
 * @attr detailsOpen
 *
 * @fires detailsOpenChange - Fired when the details open state changes
 */
export abstract class DataGridRow<TData, TDetailsElement extends Element | undefined = undefined> extends Component {
	@event() readonly detailsOpenChange!: EventDispatcher<boolean>

	@queryAll('mo-data-grid-cell') readonly cells!: Array<DataGridCell<any, TData, TDetailsElement>>

	@property({ type: Object }) dataGrid!: DataGrid<TData, TDetailsElement>
	@property({ type: Object }) data!: TData
	@property({ type: Boolean, reflect: true }) selected = false
	@property({
		type: Boolean,
		reflect: true,
		updated(this: DataGridRow<TData, TDetailsElement>, detailsOpen: boolean, wasDetailsOpen?: boolean) {
			if (wasDetailsOpen !== undefined) {
				if (detailsOpen) {
					this.dataGrid.rowDetailsOpen.dispatch(this)
				} else {
					this.dataGrid.rowDetailsClose.dispatch(this)
				}
			}
		}
	}) detailsOpen = false

	@property({ type: Boolean, reflect: true }) protected contextMenuOpen = false

	get detailsElement() {
		return this.renderRoot.querySelector('#detailsContainer')?.firstElementChild as TDetailsElement as TDetailsElement | undefined
	}

	protected override initialized() {
		this.toggleAttribute('mo-data-grid-row', true)
	}

	override updated(...parameters: Parameters<Component['updated']>) {
		this.cells.forEach(cell => cell.requestUpdate())
		if (this.detailsElement instanceof LitElement) {
			this.detailsElement.requestUpdate()
		}
		super.updated(...parameters)
	}

	protected get hasDetails() {
		return this.dataGrid.hasDetail(this.data)
	}

	static override get styles() {
		return css`
			:host {
				display: block;
				position: relative;
				height: auto;
				width: 100%;
			}

			:host(:hover) #contentContainer {
				color: inherit;
				background: var(--mo-color-accent-transparent) !important;
			}

			:host(:hover) #contentContainer::before, #detailsContainer::before {
				content: '';
				width: 2px;
				height: 100%;
				top: 0;
				inset-inline-start: 0;
				position: absolute;
				background-color: var(--mo-color-accent);
			}

			:host([data-has-alternating-background]) {
				background: var(--mo-data-grid-alternating-background);
			}

			#contentContainer {
				cursor: pointer;
				transition: 250ms;
			}

			:host([selected]) #contentContainer, :host([contextMenuOpen]) #contentContainer {
				background: var(--mo-data-grid-selection-background) !important;
			}

			:host([selected]:not(:last-of-type)) #contentContainer:after {
				content: '';
				position: absolute;
				bottom: 0;
				inset-inline-start: 0;
				width: 100%;
				border-bottom: 1px solid var(--mo-color-gray-transparent);
			}

			#contextMenuIconButton {
				transition: 250ms;
				opacity: 0.5;
				color: var(--mo-color-gray);
			}

			:host([selected]) #contextMenuIconButton, :host([contextMenuOpen]) #contextMenuIconButton {
				color: var(--mo-color-foreground);
				opacity: 1;
			}

			#contentContainer:hover #contextMenuIconButton {
				color: var(--mo-color-accent);
				opacity: 1;
			}

			#detailsExpanderIconButton {
				transition: 250ms;
			}

			#detailsExpanderIconButton:hover {
				color: var(--mo-color-accent);
			}

			:host([detailsOpen]) #detailsExpanderIconButton {
				transform: rotate(90deg);
			}

			#detailsContainer {
				display: inline-block;
				padding: 0;
				width: 100%;
			}

			#detailsContainer:empty {
				display: none;
			}

			#detailsContainer > :first-child {
				padding: 8px 0;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-grid id='contentContainer'
				@click=${() => this.handleContentClick()}
				@dblclick=${() => this.handleContentDoubleClick()}
				@auxclick=${(e: PointerEvent) => e.button !== 1 ? void 0 : this.handleContentMiddleClick()}
				@contextmenu=${(e: PointerEvent) => this.openContextMenu(e)}
			>
				${this.rowTemplate}
			</mo-grid>
			<slot id='detailsContainer'>${this.detailsOpen ? this.detailsTemplate : html.nothing}</slot>
		`
	}

	protected abstract get rowTemplate(): HTMLTemplateResult

	protected get detailsExpanderTemplate() {
		return this.dataGrid.hasDetails === false ? html.nothing : html`
			<mo-flex justifyContent='center' alignItems='center' ${style({ width: 'var(--mo-data-grid-column-details-width)' })}
				@click=${(e: Event) => e.stopPropagation()}
				@dblclick=${(e: Event) => e.stopPropagation()}
			>
			${this.hasDetails === false ? html.nothing : html`
				<mo-icon-button id='detailsExpanderIconButton' ${style({ color: 'var(--mo-color-foreground)' })}
					icon=${getComputedStyle(this).direction === 'rtl' ? 'keyboard_arrow_left' : 'keyboard_arrow_right'}
					?disabled=${this.dataGrid.hasDataDetail?.(this.data) === false}
					@click=${() => this.toggleDetails()}
				></mo-icon-button>
			`}
			</mo-flex>
		`
	}

	protected get selectionTemplate() {
		return this.dataGrid.hasSelection === false || this.dataGrid.selectionCheckboxesHidden ? html.nothing : html`
			<mo-flex id='selectionContainer' ${style({ width: 'var(--mo-data-grid-column-selection-width)' })} justifyContent='center' alignItems='center'
				@click=${(e: Event) => e.stopPropagation()}
				@dblclick=${(e: Event) => e.stopPropagation()}
			>
				<mo-checkbox
					tabindex='-1'
					?disabled=${this.dataGrid.isDataSelectable?.(this.data) === false}
					?selected=${this.selected}
					@change=${(e: CustomEvent<boolean>) => this.setSelection(e.detail)}
				></mo-checkbox>
			</mo-flex>
		`
	}

	protected getCellTemplate(column: ColumnDefinition<TData, KeyPathValueOf<TData, KeyPathOf<TData>>>) {
		return column.hidden ? html.nothing : html`
			<mo-data-grid-cell
				.row=${this as any}
				.column=${column}
				.value=${getValueByKeyPath(this.data, column.dataSelector as any)}
			></mo-data-grid-cell>
		`
	}

	protected get contextMenuIconButtonTemplate() {
		return this.dataGrid.hasContextMenu === false ? html.nothing : html`
			<mo-flex justifyContent='center' alignItems='center'
				@click=${this.openContextMenu}
				@dblclick=${(e: Event) => e.stopPropagation()}
			>
				<mo-icon-button id='contextMenuIconButton' icon='more_vert'></mo-icon-button>
			</mo-flex>
		`
	}

	protected get detailsTemplate() {
		return !this.hasDetails
			? html.nothing
			: this.dataGrid.getRowDetailsTemplate?.(this.data)
			?? html.nothing
	}

	private setSelection(selected: boolean) {
		this.selected = selected
		this.dataGrid.selectionController.setSelection(this.data, selected)
	}

	protected handleContentClick() {
		if (this.dataGrid.selectOnClick || this.dataGrid.selectionCheckboxesHidden) {
			this.setSelection(this.dataGrid.selectionCheckboxesHidden || !this.selected)
		}

		if (this.dataGrid.detailsOnClick && this.dataGrid.hasDetails) {
			this.toggleDetails()
		}

		this.dataGrid.rowClick.dispatch(this)
	}

	protected async handleContentDoubleClick() {
		await this.clickOnPrimaryContextMenuItemIfApplicable()
		this.dataGrid.rowDoubleClick.dispatch(this)
	}

	protected async handleContentMiddleClick() {
		await this.clickOnPrimaryContextMenuItemIfApplicable()
		this.dataGrid.rowMiddleClick.dispatch(this)
	}

	private async clickOnPrimaryContextMenuItemIfApplicable() {
		if (this.dataGrid.hasContextMenu === true && this.dataGrid.primaryContextMenuItemOnDoubleClick === true) {
			await this.openContextMenu()
			ContextMenu.openInstance?.items.find(item => item instanceof DataGridPrimaryContextMenuItem)?.click()
			this.contextMenuOpen = false
		}
	}

	async openContextMenu(mouseEvent?: MouseEvent) {
		if (!this.dataGrid.hasContextMenu) {
			return
		}

		mouseEvent?.stopPropagation()

		if (this.dataGrid.selectedData.includes(this.data) === false) {
			this.dataGrid.select(this.dataGrid.selectionMode !== DataGridSelectionMode.None ? [this.data] : [])
		}

		const contextMenu = ContextMenu.open(mouseEvent || [0, 0], this.contextMenuTemplate)
		this.contextMenuOpen = true
		const handler = (open: boolean) => {
			this.contextMenuOpen = open
			if (open === false) {
				contextMenu.openChange.unsubscribe(handler)
			}
		}
		contextMenu.openChange.subscribe(handler)

		await this.updateComplete
	}

	private get contextMenuData() {
		return this.dataGrid.selectionMode === DataGridSelectionMode.None || this.dataGrid.selectedData.length === 0
			? [this.data]
			: this.dataGrid.selectedData
	}

	private get contextMenuTemplate() {
		return this.dataGrid.getRowContextMenuTemplate?.(this.contextMenuData) ?? html.nothing
	}

	async closeContextMenu() {
		this.contextMenuOpen = false
		await this.updateComplete
	}

	protected toggleDetails() {
		this.setDetailsOpen(!this.detailsOpen)
	}

	protected setDetailsOpen(value: boolean) {
		this.detailsOpen = value
		this.detailsOpenChange.dispatch(value)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-row': DataGridRow<unknown>
	}
}