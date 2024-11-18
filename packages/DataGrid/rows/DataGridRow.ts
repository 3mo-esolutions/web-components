import { css, property, Component, html, query, queryAll, style, type HTMLTemplateResult, LitElement, live } from '@a11d/lit'
import { equals } from '@a11d/equals'
import { DirectionsByLanguage } from '@3mo/localization'
import { popover } from '@3mo/popover'
import { ContextMenu } from '@3mo/context-menu'
import { type DataGridColumn } from '../DataGridColumn.js'
import { type DataGridCell, DataGridPrimaryContextMenuItem, DataGridSelectionMode, type DataRecord } from '../index.js'

export abstract class DataGridRow<TData, TDetailsElement extends Element | undefined = undefined> extends Component {
	@queryAll('mo-data-grid-cell') readonly cells!: Array<DataGridCell<any, TData, TDetailsElement>>
	@queryAll('[mo-data-grid-row]') readonly subRows!: Array<DataGridRow<TData, TDetailsElement>>
	@query('#contentContainer') readonly content!: HTMLElement

	@property({
		type: Boolean,
		updated(this: DataGridRow<TData, TDetailsElement>) {
			if (this.isIntersecting) {
				this.dataGrid.rowIntersectionObserver?.unobserve?.(this)
			}
		}
	}) isIntersecting = false

	@property({ type: Object }) dataRecord!: DataRecord<TData>
	get dataGrid() { return this.dataRecord.dataGrid }
	get data() { return this.dataRecord.data }
	get index() { return this.dataRecord.index }
	get level() { return this.dataRecord.level }
	get selected() { return this.dataRecord.isSelected }
	get detailsOpen() { return this.dataRecord.detailsOpen }

	get detailsElement() {
		return this.renderRoot.querySelector('#detailsContainer')?.firstElementChild as TDetailsElement as TDetailsElement | undefined
	}

	getCell(column: DataGridColumn<TData, any>) {
		return this.cells.find(cell => cell.column[equals](column))
	}

	override connected() {
		if ((this.index ?? 0) < 25) {
			this.isIntersecting = true
		}
	}

	protected override initialized() {
		this.toggleAttribute('mo-data-grid-row', true)
		if (this.isIntersecting === false) {
			this.dataGrid.rowIntersectionObserver?.observe(this)
		}
	}

	protected override disconnected() {
		this.dataGrid.rowIntersectionObserver?.unobserve?.(this)
	}

	override updated(...parameters: Parameters<Component['updated']>) {
		this.cells.forEach(cell => cell.requestUpdate())
		this.subRows.forEach(subRow => subRow.requestUpdate())
		if (this.detailsElement instanceof LitElement) {
			this.detailsElement.requestUpdate()
		}
		super.updated(...parameters)
	}

	protected get hasDetails() {
		return this.dataGrid.detailsController.hasDetail(this.dataRecord)
	}

	static override get styles() {
		return css`
			:host {
				display: block;
				position: relative;
				height: auto;
				width: 100%;
			}

			:host([data-has-alternating-background]:hover) #contentContainer {
				--mo-data-grid-sticky-part-color: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-accent) 25%);
			}

			:host(:hover) #contentContainer {
				--mo-data-grid-sticky-part-color: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-accent) 25%);
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
				z-index: 2;
			}

			:host([data-has-alternating-background]) {
				background: var(--mo-data-grid-alternating-background);
				--mo-data-grid-sticky-part-color: color-mix(in srgb, var(--mo-color-surface), black var(--mo-data-grid-alternating-background-transparency));
			}

			#contentContainer {
				grid-column: -1 / 1;
				cursor: pointer;
			}

			#contextMenuIconButton {
				opacity: 0.5;
				color: var(--mo-color-gray);
			}

			:host([selected]) #contentContainer,
			:host([data-context-menu-open]) #contentContainer {
				--mo-data-grid-sticky-part-color: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-accent)) !important;
				background: var(--mo-data-grid-selection-background) !important;
			}

			:host([selected]) #contextMenuIconButton,
			:host([data-context-menu-open]) #contextMenuIconButton {
				color: currentColor;
				opacity: 1;
			}

			#contentContainer:hover #contextMenuIconButton {
				color: currentColor;
				opacity: 1;
			}

			#detailsExpanderIconButton {
				transition: transform 250ms;

				&[data-rtl] {
					transform: rotate(180deg);
				}
			}

			:host([detailsOpen]) #detailsExpanderIconButton {
				transform: rotate(90deg);
			}

			#detailsContainer {
				display: grid;
				grid-template-columns: subgrid;
				grid-column: -1 / 1;

				&:empty {
					display: none;
				}

				& > * {
					grid-column: data / -1;
					box-sizing: border-box;
					margin-inline: var(--mo-data-grid-cell-padding);
					margin-block: 16px;

					&[mo-data-grid-row] {
						grid-column: -1 / 1;
						margin: 0;
					}

					&[instanceof*=mo-data-grid] {
						margin-inline: 0;
					}
				}
			}

			mo-data-grid-cell:first-of-type:not([alignment=end]), mo-data-grid-cell[alignment=end]:first-of-type + mo-data-grid-cell {
				margin-inline-start: calc(var(--_level, 0) * var(--mo-data-grid-column-sub-row-indentation, 20px));
			}
		`
	}

	protected override get template() {
		this.style.setProperty('--_level', this.level.toString())
		this.toggleAttribute('selected', this.dataRecord.isSelected)
		this.toggleAttribute('detailsOpen', this.dataRecord.detailsOpen)
		return !this.isIntersecting ? html.nothing : html`
			<mo-grid id='contentContainer' columns='subgrid'
				@click=${() => this.handleContentClick()}
				@dblclick=${() => this.handleContentDoubleClick()}
				@auxclick=${(e: PointerEvent) => e.button !== 1 ? void 0 : this.handleContentMiddleClick()}
				${this.contextMenuTemplate === html.nothing ? html.nothing : popover(() => html`
					<mo-context-menu @openChange=${(e: CustomEvent<boolean>) => this.handleContextMenuOpenChange(e.detail)}>
						${this.contextMenuTemplate}
					</mo-context-menu>
				`)}
			>
				${this.rowTemplate}
			</mo-grid>
			<slot id='detailsContainer'>${this.detailsOpen ? this.detailsTemplate : html.nothing}</slot>
		`
	}

	protected abstract get rowTemplate(): HTMLTemplateResult

	protected get detailsExpanderTemplate() {
		return this.dataGrid.hasDetails === false ? html.nothing : html`
			<mo-flex justifyContent='center' alignItems='center'
				${style({ position: 'sticky', zIndex: '2', insetInlineStart: '0px', background: 'var(--mo-data-grid-sticky-expander-part-color, var(--mo-data-grid-sticky-part-color))' })}
				@click=${(e: Event) => e.stopPropagation()}
				@dblclick=${(e: Event) => e.stopPropagation()}
			>
				${this.hasDetails === false ? html.nothing : html`
					<mo-icon-button id='detailsExpanderIconButton'
						icon='keyboard_arrow_right'
						?data-rtl=${DirectionsByLanguage.get() === 'rtl'}
						@click=${() => this.toggleDetails()}
					></mo-icon-button>
				`}
			</mo-flex>
		`
	}

	protected get selectionTemplate() {
		return this.dataGrid.hasSelection === false || this.dataGrid.selectionCheckboxesHidden ? html.nothing : html`
			<mo-flex id='selectionContainer' justifyContent='center' alignItems='center'
				${style({ width: 'var(--mo-data-grid-column-selection-width)', position: 'sticky', zIndex: '2', insetInlineStart: this.dataGrid.hasDetails ? '20px' : '0px', height: '100%', background: 'var(--mo-data-grid-sticky-part-color)' })}
				@click=${(e: Event) => e.stopPropagation()}
				@dblclick=${(e: Event) => e.stopPropagation()}
			>
				<mo-checkbox
					tabindex='-1'
					?disabled=${this.dataRecord.isSelectable === false}
					.selected=${live(this.selected)}
					@change=${(e: CustomEvent<boolean>) => this.setSelection(e.detail)}
				></mo-checkbox>
			</mo-flex>
		`
	}

	protected getCellTemplate(column: DataGridColumn<TData, KeyPathValueOf<TData, KeyPathOf<TData>>>) {
		return column.hidden ? html.nothing : html`
			<mo-data-grid-cell
				.row=${this as any}
				.column=${column}
				.value=${getValueByKeyPath(this.data, column.dataSelector as any)}
				@keydown=${this.delegateToCell('handleKeyDown')}
				@dblclick=${this.delegateToCell('handleDoubleClick')}
			></mo-data-grid-cell>
		`
	}

	private readonly delegateToCell = (method: 'handleDoubleClick' | 'handleKeyDown') => (e: Event) => {
		const target = e.target as DataGridCell<any, TData, TDetailsElement>
		target?.[method]?.(e as any)
	}

	protected get fillerTemplate() {
		return html`<span></span>`
	}

	protected get contextMenuIconButtonTemplate() {
		return this.dataGrid.hasContextMenu === false ? html.nothing : html`
			<mo-flex justifyContent='center' ${style({ height: '100%', placeSelf: 'end', position: 'sticky', insetInlineEnd: '0px', zIndex: '3', background: 'var(--mo-data-grid-sticky-part-color)' })}>
				<mo-icon-button id='contextMenuIconButton' icon='more_vert' dense
					@click=${this.openContextMenu}
					@dblclick=${(e: Event) => e.stopPropagation()}
				></mo-icon-button>
			</mo-flex>
		`
	}

	protected get detailsTemplate() {
		if (!this.hasDetails) {
			return html.nothing
		}

		if (this.dataGrid.getRowDetailsTemplate) {
			return this.dataGrid.getRowDetailsTemplate(this.data)
		}

		this.toggleAttribute('has-sub-data', !!this.dataRecord.hasSubData)

		return !this.dataRecord.hasSubData ? html.nothing : html`
			${this.dataRecord.getSubDataByLevel(this.level + 1)?.map(data => this.dataGrid.getRowTemplate(data))}
		`
	}

	private setSelection(selected: boolean) {
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
			await this.closeContextMenu()
		}
	}

	async openContextMenu(event?: PointerEvent) {
		if (this.dataGrid.hasContextMenu) {
			event?.stopPropagation()
			this.content?.dispatchEvent(new MouseEvent('contextmenu', event))

			// We need this only for testing environments, but should not be necessary.
			this.handleContextMenuOpenChange(true)

			await this.updateComplete
		}
	}

	protected handleContextMenuOpenChange(open: boolean) {
		this.toggleAttribute('data-context-menu-open', open)

		if (this.dataRecord.isSelected === false) {
			this.dataGrid.select(this.dataGrid.selectionMode !== DataGridSelectionMode.None ? [this.data] : [])
		}
	}

	private get contextMenuData() {
		return this.dataGrid.selectionMode === DataGridSelectionMode.None || this.dataGrid.selectedData.length === 0
			? [this.data]
			: this.dataGrid.selectedData
	}

	private get contextMenuTemplate() {
		return this.dataGrid.contextMenuController.getMenuContentTemplate(this.contextMenuData)
	}

	async closeContextMenu() {
		ContextMenu.openInstance?.close()
		await this.updateComplete
	}

	toggleDetails() {
		this.dataGrid.detailsController.toggle(this.dataRecord)
		if (this.dataRecord.detailsOpen) {
			this.dataGrid.rowDetailsOpen.dispatch(this)
		} else {
			this.dataGrid.rowDetailsClose.dispatch(this)
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-row': DataGridRow<unknown>
	}
}