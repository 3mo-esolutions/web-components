import { nothing, css, property, Component, html, state, queryAll, style, HTMLTemplateResult, LitElement, event } from '@a11d/lit'
import { ContextMenu } from '@3mo/context-menu'
import { KeyboardController } from '@3mo/keyboard-controller'
import { ColumnDefinition } from '../ColumnDefinition.js'
import { DataGrid, DataGridCell, DataGridEditability, DataGridPrimaryContextMenuItem, DataGridSelectionMode } from '../index.js'

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
	@property({ type: Boolean, reflect: true }) detailsOpen = false

	@property({ type: Boolean, reflect: true }) protected contextMenuOpen = false
	@state() protected editing = false

	get detailsElement() {
		return this.renderRoot.querySelector('#detailsContainer')?.firstElementChild as TDetailsElement as TDetailsElement | undefined
	}

	protected override connected() {
		this.dataGrid.rowConnected.dispatch(this)
	}

	protected override disconnected() {
		this.dataGrid.rowDisconnected.dispatch(this)
	}

	protected override initialized() {
		this.toggleAttribute('mo-data-grid-row', true)
		this.editing = this.dataGrid.editability === DataGridEditability.Always
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

			:host(:hover) {
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

			#contentContainer {
				cursor: pointer;
				transition: 250ms;
			}

			:host([detailsOpen]) #contentContainer {
				background: var(--mo-data-grid-row-background-on-opened-detail-element, var(--mo-color-accent-transparent));
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
				@contextmenu=${(e: PointerEvent) => this.openContextMenu(e)}
			>
				${this.rowTemplate}
			</mo-grid>
			<slot id='detailsContainer'>${this.detailsOpen ? this.detailsTemplate : nothing}</slot>
		`
	}

	protected abstract get rowTemplate(): HTMLTemplateResult

	protected get detailsExpanderTemplate() {
		return this.dataGrid.hasDetails === false ? nothing : html`
			<mo-flex justifyContent='center' alignItems='center' ${style({ width: 'var(--mo-data-grid-column-details-width)' })}
				@click=${(e: Event) => e.stopPropagation()}
				@dblclick=${(e: Event) => e.stopPropagation()}
			>
			${this.hasDetails === false ? nothing : html`
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
		return this.dataGrid.hasSelection === false ? nothing : html`
			<mo-flex id='selectionContainer' ${style({ width: 'var(--mo-data-grid-column-selection-width)' })} justifyContent='center' alignItems='center'
				@click=${(e: Event) => e.stopPropagation()}
				@dblclick=${(e: Event) => e.stopPropagation()}
			>
				<mo-checkbox
					?disabled=${this.dataGrid.isDataSelectable?.(this.data) === false}
					?checked=${this.selected}
					@change=${(e: CustomEvent<CheckboxValue>) => this.setSelection(e.detail === 'checked')}
				></mo-checkbox>
			</mo-flex>
		`
	}

	protected getCellTemplate(column: ColumnDefinition<TData, KeyPathValueOf<TData, KeyPathOf<TData>>>) {
		return column.hidden ? nothing : html`
			<mo-data-grid-cell
				?editing=${this.editing}
				.row=${this as any}
				.column=${column}
				.value=${getValueByKeyPath(this.data, column.dataSelector as any)}
			></mo-data-grid-cell>
		`
	}

	protected get contextMenuIconButtonTemplate() {
		return this.dataGrid.hasContextMenu === false ? nothing : html`
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
			? nothing
			: this.dataGrid.getRowDetailsTemplate?.(this.data)
			?? nothing
	}

	private setSelection(value: boolean) {
		if (this.dataGrid.hasSelection && this.dataGrid.isSelectable(this.data)) {
			this.selected = value

			const lastActiveSelection = this.dataGrid.lastActiveSelection
			let dataToSelect = this.dataGrid.selectedData

			if (this.dataGrid.selectionMode === DataGridSelectionMode.Multiple && KeyboardController.shift && lastActiveSelection) {
				const indexes = [
					this.dataGrid.data.findIndex(data => data === lastActiveSelection.data),
					this.dataGrid.data.findIndex(data => data === this.data),
				].sort((a, b) => a - b)
				const range = this.dataGrid.data.slice(indexes[0]!, indexes[1]! + 1)
				dataToSelect = lastActiveSelection.selected
					? [...dataToSelect, ...range]
					: dataToSelect.filter(d => range.includes(d) === false)
			} else {
				if (value) {
					if (this.dataGrid.selectionMode === DataGridSelectionMode.Multiple) {
						dataToSelect = [...dataToSelect, this.data]
					} else if (this.dataGrid.selectionMode === DataGridSelectionMode.Single) {
						dataToSelect = [this.data]
					}
				} else {
					dataToSelect = dataToSelect.filter(data => data !== this.data)
				}
			}

			this.dataGrid.lastActiveSelection = { data: this.data, selected: value }

			this.dataGrid.select(dataToSelect.filter((value, index, self) => self.indexOf(value) === index))
		}
	}

	protected handleContentClick() {
		if (this.dataGrid.selectOnClick && this.dataGrid.editability !== DataGridEditability.OnRowClick) {
			this.setSelection(!this.selected)
		}

		if (this.dataGrid.detailsOnClick === true && this.dataGrid.editability !== DataGridEditability.OnRowClick) {
			this.toggleDetails()
		}

		if (this.dataGrid.editability === DataGridEditability.OnRowClick) {
			this.enableEditMode()
		}

		this.dataGrid.rowClick.dispatch(this)
	}

	// eslint-disable-next-line @typescript-eslint/member-ordering
	private dataBeforeEdit?: string

	private enableEditMode() {
		this.dataBeforeEdit = JSON.stringify(this.data)
		this.editing = true
		const handleClick = (e: MouseEvent) => {
			if (e.composedPath().includes(this) === false) {
				const dataAfterEdit = JSON.stringify(this.data)
				if (dataAfterEdit !== this.dataBeforeEdit) {
					this.dataGrid.rowEdit.dispatch(this)
				}
				window.removeEventListener('click', handleClick)
				this.editing = false
			}
		}
		window.addEventListener('click', handleClick)
	}

	protected async handleContentDoubleClick() {
		if (this.dataGrid.primaryContextMenuItemOnDoubleClick === true && this.dataGrid.hasContextMenu === true && this.dataGrid.selectionMode === DataGridSelectionMode.None) {
			await this.openContextMenu()
			ContextMenu.openInstance?.items.find(item => item instanceof DataGridPrimaryContextMenuItem)?.click()
			this.contextMenuOpen = false
		}

		this.dataGrid.rowDoubleClick.dispatch(this)
	}

	async openContextMenu(mouseEvent?: MouseEvent) {
		mouseEvent?.stopPropagation()

		if (this.dataGrid.selectedData.includes(this.data) === false) {
			this.dataGrid.select(this.dataGrid.selectionMode !== DataGridSelectionMode.None ? [this.data] : [])
		}

		const contextMenu = ContextMenu.open(mouseEvent || [0, 0], this.contextMenuTemplate)
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
		return this.dataGrid.getRowContextMenuTemplate?.(this.contextMenuData) ?? nothing
	}

	async closeContextMenu() {
		this.contextMenuOpen = false
		await this.updateComplete
	}

	protected toggleDetails() {
		this.setDetails(!this.detailsOpen)
	}

	protected setDetails(value: boolean) {
		this.detailsOpen = value
		this.detailsOpenChange.dispatch(value)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-row': DataGridRow<unknown>
	}
}