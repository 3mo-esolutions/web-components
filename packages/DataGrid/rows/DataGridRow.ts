import { css, property, Component, html, query, queryAll, style, type HTMLTemplateResult, LitElement, event, state } from '@a11d/lit'
import { popover } from '@3mo/popover'
import { ContextMenu } from '@3mo/context-menu'
import { type DataGridColumn } from '../DataGridColumn.js'
import { type DataGrid, type DataGridCell, DataGridPrimaryContextMenuItem, DataGridSelectionMode } from '../index.js'

/**
 * @attr dataGrid
 * @attr data
 * @attr selected
 * @attr detailsOpen
 *
 * @fires detailsOpenChange - Dispatched when the details open state changes
 */
export abstract class DataGridRow<TData, TDetailsElement extends Element | undefined = undefined> extends Component {
	@event() readonly detailsOpenChange!: EventDispatcher<boolean>

	@queryAll('mo-data-grid-cell') readonly cells!: Array<DataGridCell<any, TData, TDetailsElement>>
	@queryAll('[mo-data-grid-row]') readonly subRows!: Array<DataGridRow<TData, TDetailsElement>>
	@query('#contentContainer') readonly content!: HTMLElement

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

	@property({
		type: Number,
		updated(this: DataGridRow<TData, TDetailsElement>) {
			this.style.setProperty('--_level', this.level.toString())
		}
	}) level = 0

	@state() isIntersecting = false

	get detailsElement() {
		return this.renderRoot.querySelector('#detailsContainer')?.firstElementChild as TDetailsElement as TDetailsElement | undefined
	}

	getCell(column: DataGridColumn<TData, any>) {
		return this.cells.find(cell => cell.column === column)
	}

	protected override initialized() {
		this.toggleAttribute('mo-data-grid-row', true)
		if (this.dataGrid.rowIntersectionObserver) {
			this.dataGrid.rowIntersectionObserver.observe(this)
		} else {
			this.isIntersecting = true
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
				grid-column: -1 / 1;
				cursor: pointer;
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

			:host([selected]), :host([data-context-menu-open]) {
				#contentContainer {
					background: var(--mo-data-grid-selection-background) !important;
					--mo-data-grid-sticky-part-color: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-accent));
				}

				#contextMenuIconButton {
					color: var(--mo-color-foreground);
					opacity: 1;
				}
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

			:host(:not([has-sub-data])) #detailsContainer > :first-child {
				padding: 8px 0;
			}

			mo-data-grid-cell:first-of-type:not([alignment=end]), mo-data-grid-cell[alignment=end]:first-of-type + mo-data-grid-cell {
				margin-inline-start: calc(var(--_level, 0) * var(--mo-data-grid-column-sub-row-indentation, 20px));
			}
		`
	}

	protected override get template() {
		return !this.isIntersecting ? html.nothing : html`
			<mo-grid id='contentContainer' columns='subgrid'
				@click=${() => this.handleContentClick()}
				@dblclick=${() => this.handleContentDoubleClick()}
				@auxclick=${(e: PointerEvent) => e.button !== 1 ? void 0 : this.handleContentMiddleClick()}
				${this.contextMenuTemplate === html.nothing ? html.nothing : popover(() => html`
					<mo-context-menu @openChange=${(e: CustomEvent<boolean>) => this.toggleAttribute('data-context-menu-open', e.detail)}>
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
			<mo-flex id='selectionContainer' justifyContent='center' alignItems='center'
				${style({ width: 'var(--mo-data-grid-column-selection-width)', position: 'sticky', zIndex: '2', insetInlineStart: this.dataGrid.hasDetails ? '20px' : '0px', padding: this.dataGrid.hasDetails ? '1px 0' : undefined, background: 'var(--mo-data-grid-sticky-part-color)' })}
				@click=${(e: Event) => e.stopPropagation()}
				@dblclick=${(e: Event) => e.stopPropagation()}
			>
				<mo-checkbox
					tabindex='-1'
					?disabled=${this.dataGrid.selectionController.isSelectable(this.data) === false}
					?selected=${this.selected}
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
			></mo-data-grid-cell>
		`
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

		const subData = this.dataGrid.getSubData(this.data)
		this.toggleAttribute('has-sub-data', !!subData)

		if (subData) {
			return html`
				${subData.map(data => this.dataGrid.getRowTemplate(data, undefined, this.level + 1))}
			`
		}

		return html.nothing
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
		if (!this.dataGrid.hasContextMenu) {
			return
		}

		event?.stopPropagation()

		if (this.dataGrid.selectedData.includes(this.data) === false) {
			this.dataGrid.select(this.dataGrid.selectionMode !== DataGridSelectionMode.None ? [this.data] : [])
		}

		await this.updateComplete

		this.content?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, composed: true, ...(event ?? {}) }))
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
		ContextMenu.openInstance?.close()
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