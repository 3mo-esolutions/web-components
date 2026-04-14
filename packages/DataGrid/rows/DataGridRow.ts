import { css, property, Component, html, query, queryAll, type HTMLTemplateResult, LitElement, live, style, unsafeCSS } from '@a11d/lit'
import { equals } from '@a11d/equals'
import { DirectionsByLanguage } from '@3mo/localization'
import { popover } from '@3mo/popover'
import { ContextMenu } from '@3mo/context-menu'
import { type DataGridColumn } from '../DataGridColumn.js'
import { type DataGridCell, DataGridPrimaryContextMenuItem, type DataRecord, ReorderabilityState } from '../index.js'

export abstract class DataGridRow<TData, TDetailsElement extends Element | undefined = undefined> extends Component {
	@queryAll('mo-data-grid-cell') readonly cells!: Array<DataGridCell<any, TData, TDetailsElement>>
	@queryAll('[mo-data-grid-row]') readonly subRows!: Array<DataGridRow<TData, TDetailsElement>>
	@query('#contentContainer') readonly content!: HTMLElement

	@property({ type: Boolean }) isIntersecting = true

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

	getCell(column: DataGridColumn<TData>) {
		return this.cells.find(cell => cell.column[equals](column))
	}

	override connected() {
		if ((this.index ?? 0) < 25) {
			this.isIntersecting = true
		}
	}

	protected override initialized() {
		this.toggleAttribute('mo-data-grid-row', true)
		this.dataGrid.rowIntersectionObserver?.observe(this)
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

			:host([data-reorderability=${unsafeCSS(ReorderabilityState.Dragging)}]) {
				opacity: 0.5;
			}

			:host([data-reorderability=${unsafeCSS(ReorderabilityState.DropBefore)}]) {
				border-top: 2px solid var(--mo-color-accent);
			}

			:host([data-reorderability=${unsafeCSS(ReorderabilityState.DropAfter)}]) {
				border-bottom: 2px solid var(--mo-color-accent);
			}

			#reorderability {
				position: sticky;
				z-index: 2;
				width: 20px;
				height: 100%;
				background: var(--mo-data-grid-sticky-part-color);

				mo-icon-button {
					cursor: grab;
					opacity: 0.5;
				}
			}

			#detailsExpanderContainer {
				position: sticky;
				z-index: 2;
				height: 100%;
				inset-inline-start: 0px;
				background: var(--mo-data-grid-sticky-expander-part-color, var(--mo-data-grid-sticky-part-color));
				display: flex;
				align-items: center;
			}

			#selectionContainer {
				width: 40px;
				position: sticky;
				z-index: 2;
				height: 100%;
				background: var(--mo-data-grid-sticky-part-color);
			}

			:host(:hover) {
				#contentContainer {
					--mo-data-grid-sticky-part-color: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-accent) 25%) !important;
					color: inherit;
					background: var(--mo-color-accent-transparent) !important;
				}
			}

			:host([data-has-alternating-background]) {
				#contentContainer, #detailsContainer:not(:has([instanceof*=mo-data-grid])) {
					background: var(--mo-data-grid-alternating-background);
					--mo-data-grid-sticky-part-color: light-dark(
						color-mix(in srgb, var(--mo-color-surface), black 5%),
						color-mix(in srgb, var(--mo-color-surface), black 20%)
					);
				}
			}

			#contentContainer {
				position: relative;
				grid-column: -1 / 1;
				border-block-end: var(--mo-data-grid-border);
			}

			#contextMenuIconButtonContainer {
				height: 100%;
				place-self: end;
				position: sticky;
				inset-inline-end: 0px;
				z-index: 3;
				background: var(--mo-data-grid-sticky-part-color);
			}

			#contextMenuIconButton {
				opacity: 0.5;
				color: var(--mo-color-gray);
			}

			:host([selected]), :host([data-context-menu-open]) {
				#contentContainer {
					--mo-data-grid-sticky-part-color: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-accent)) !important;
					background: var(--mo-data-grid-selection-background) !important;
				}

				#contextMenuIconButton {
					color: currentColor;
					opacity: 1;
				}
			}

			#contentContainer:hover #contextMenuIconButton {
				color: currentColor;
				opacity: 1;
			}

			#detailsExpanderIconButton {
				height: var(--mo-data-grid-row-height);
				transition: transform 250ms;
				flex-shrink: 0;
				--md-icon-button-state-layer-height: 20px;
				--md-icon-button-state-layer-width: 20px;
				--md-icon-button-icon-size: 18px;
				width: var(--_expander-size, 26px);
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 18px;

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
					padding-inline: var(--mo-data-grid-cell-padding);
					padding-block: 1rem;

					&[mo-data-grid-row] {
						grid-column: -1 / 1;
						padding: 0;
					}

					&[instanceof*=mo-data-grid] {
						padding-inline: 0;
						--mo-data-grid-header-background: color-mix(in srgb, var(--mo-color-foreground), transparent 96%);
						--mo-data-grid-alternating-background: transparent;
						--_content-min-height-default: 0px;
					}
				}
			}

			#tree-guides {
				height: 100%;
				display: flex;
				pointer-events: none;
			}

			.tree-guide {
				width: var(--_expander-size, 26px);
				height: 100%;
				position: relative;
				flex-shrink: 0;
			}

			.tree-guide[data-type=line]::before {
				content: '';
				position: absolute;
				inset-inline-start: 50%;
				top: 0;
				height: 100%;
				border-inline-start: 1px solid var(--mo-color-gray-transparent);
			}

			.tree-guide[data-type=branch]::before {
				content: '';
				position: absolute;
				inset-inline-start: 50%;
				top: 0;
				height: 100%;
				border-inline-start: 1px solid var(--mo-color-gray-transparent);
			}

			.tree-guide[data-type=branch]::after {
				content: '';
				position: absolute;
				inset-inline-start: 50%;
				top: 50%;
				width: 50%;
				border-top: 1px solid var(--mo-color-gray-transparent);
			}

			.tree-guide[data-type=last-branch]::before {
				content: '';
				position: absolute;
				inset-inline-start: 50%;
				top: 0;
				height: 50%;
				border-inline-start: 1px solid var(--mo-color-gray-transparent);
			}

			.tree-guide[data-type=last-branch]::after {
				content: '';
				position: absolute;
				inset-inline-start: 50%;
				top: 50%;
				width: 50%;
				border-top: 1px solid var(--mo-color-gray-transparent);
			}
		`
	}

	protected override get template() {
		this.style.setProperty('--_level', this.level.toString())
		const isLastInEntireGroup = (() => {
			if (this.level === 0 || this.detailsOpen) return false
			let record: DataRecord<TData> | undefined = this.dataRecord
			while (record && record.level > 0) {
				if (!record.isLastChild) return false
				record = record.parentRecord
			}
			return true
		})()
		const showBorder = (this.level === 0 && !this.detailsOpen) || isLastInEntireGroup
		this.style.setProperty('--_level-border-display', showBorder ? 'block' : 'none')
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

	protected get treeGuideTemplate() {
		if (this.level === 0) {
			return html.nothing
		}

		const chain = new Array<DataRecord<TData>>()
		let current: DataRecord<TData> | undefined = this.dataRecord
		while (current && current.level > 0) {
			chain.unshift(current)
			current = current.parentRecord
		}

		return html`
			<div id='tree-guides'>
				${chain.map((record, index) => {
					const isLast = index === chain.length - 1
					const type = isLast
						? (record.isLastChild ? 'last-branch' : 'branch')
						: (record.isLastChild ? 'blank' : 'line')
					return html`<span class='tree-guide' data-type=${type}></span>`
				})}
			</div>
		`
	}

	protected get reorderabilityTemplate() {
		return !this.dataGrid.reorderabilityController.enabled ? html.nothing : html`
			<mo-flex id='reorderability' justifyContent='center' alignItems='center' ${style({ insetInlineStart: this.dataGrid.columnsController.getStickyColumnInsetInline('reordering') })}>
				<mo-icon-button icon='drag_handle'></mo-icon-button>
			</mo-flex>
		`
	}

	protected get detailsExpanderTemplate() {
		return this.dataGrid.hasDetails === false ? html.nothing : html`
			<div id='detailsExpanderContainer'
				${style({ insetInlineStart: this.dataGrid.columnsController.getStickyColumnInsetInline('details') })}
				@click=${(e: Event) => e.stopPropagation()}
				@dblclick=${(e: Event) => e.stopPropagation()}
			>
				${this.treeGuideTemplate}
				${this.hasDetails === false ? html.nothing : html`
					<mo-icon-button id='detailsExpanderIconButton'
						icon='keyboard_arrow_right'
						?data-rtl=${DirectionsByLanguage.get() === 'rtl'}
						@click=${() => this.toggleDetails()}
					></mo-icon-button>
				`}
			</div>
		`
	}

	protected get selectionTemplate() {
		return !this.dataGrid.hasSelection ? html.nothing : html`
			<mo-flex id='selectionContainer' justifyContent='center' alignItems='center'
				?data-has-details=${this.dataGrid.hasDetails}
				${style({ insetInlineStart: this.dataGrid.columnsController.getStickyColumnInsetInline('selection') })}
				@click=${(e: Event) => e.stopPropagation()}
				@dblclick=${(e: Event) => e.stopPropagation()}
			>
				<mo-checkbox
					tabindex='-1'
					?disabled=${this.dataRecord.isSelectable === false}
					.selected=${live(this.selected)}
					@change=${(e: CustomEvent<boolean>) => this.dataGrid.selectionController.setSelection(this.data, e.detail, true)}
				></mo-checkbox>
			</mo-flex>
		`
	}

	protected getCellTemplate(column: DataGridColumn<TData>) {
		return column.hidden ? html.nothing : html`
			<mo-data-grid-cell
				.row=${this as any}
				.column=${column}
				.value=${KeyPath.get(this.data, column.dataSelector as any)}
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
			<mo-flex id='contextMenuIconButtonContainer' justifyContent='center'>
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

		return !this.dataRecord.hasSubData ? html.nothing : html`
			${this.dataRecord.getSubDataByLevel(this.level + 1)?.map(data => this.dataGrid.getRowTemplate(data))}
		`
	}

	protected handleContentClick() {
		if (this.dataGrid.selectOnClick) {
			this.dataGrid.selectionController.setSelection(this.data, true)
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
			ContextMenu.openInstance?.items.find(item => item instanceof DataGridPrimaryContextMenuItem && !item.disabled)?.click()
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
			this.dataGrid.select([this.data])
		}
	}

	private get contextMenuTemplate() {
		return this.dataGrid.contextMenuController.getMenuContentTemplate(
			!this.dataGrid.selectability || !this.dataGrid.selectedData.length || !this.dataRecord.isSelected
				? [this.data]
				: this.dataGrid.selectedData
		)
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