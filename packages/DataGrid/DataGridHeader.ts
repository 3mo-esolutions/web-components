import { component, Component, css, html, property, event, style, live, queryAll, repeat, bind } from '@a11d/lit'
import { observeResize } from '@3mo/resize-observer'
import { Localizer } from '@3mo/localization'
import { DataGridSelectability, type DataGrid, type DataGridColumn, type DataGridColumnHeader, ReorderabilityController } from './index.js'
import type { DataGridColumnsController } from './DataGridColumnsController.js'

Localizer.dictionaries.add('en', {
	'Actions for ${count:pluralityNumber} selected entries': [
		'Actions for the selected entry',
		'Actions for ${count} selected entries',
	],
})

Localizer.dictionaries.add('de', {
	'Actions for ${count:pluralityNumber} selected entries': [
		'Optionen für den ausgewählten Eintrag',
		'Optionen für ${count} ausgewählte Einträge',
	],
	'Settings': 'Einstellungen',
	'Columns': 'Spalten',
	'Font Size': 'Schriftgröße',
	'Row Height': 'Zeilenhöhe',
	'Design': 'Design',
})

@component('mo-data-grid-header')
export class DataGridHeader<TData> extends Component {
	@event() readonly pageChange!: EventDispatcher<number>
	@event() readonly modeSelectionChange!: EventDispatcher<string>

	@property({ type: Object }) dataGrid!: DataGrid<TData, any>
	@property({ type: Boolean, reflect: true }) overlayOpen = false

	@queryAll('mo-data-grid-column-header') private readonly columnHeaders!: Array<DataGridColumnHeader>

	readonly reorderabilityController = new ReorderabilityController(this, {
		handleReorder: (source, destination) => {
			const sourceColumn = this.dataGrid.visibleColumns[source]!
			const destinationColumn = this.dataGrid.visibleColumns[destination]!
			const sourceIndex = this.dataGrid.columns.indexOf(sourceColumn)
			const destinationIndex = this.dataGrid.columns.indexOf(destinationColumn)
			this.dataGrid.columns.splice(sourceIndex, 1)
			this.dataGrid.columns.splice(destinationIndex, 0, sourceColumn)
			this.dataGrid.setColumns(this.dataGrid.columns)
		}
	})

	protected override connected() {
		this.dataGrid.dataChange.subscribe(this.handleDataGridDataChange)
	}

	protected override disconnected() {
		this.dataGrid.dataChange.unsubscribe(this.handleDataGridDataChange)
	}

	private readonly handleDataGridDataChange = () => {
		this.requestUpdate()
	}

	protected override updated(...parameters: Parameters<Component['updated']>) {
		super.updated(...parameters)
		this.columnHeaders.forEach(h => h.requestUpdate())
	}

	static override get styles() {
		return css`
			:host {
				--mo-data-grid-header-separator-height: 15px;
				--mo-data-grid-header-separator-width: 2px;
				display: grid;
				grid-template-columns: subgrid;
				position: sticky;
				grid-column: -1 / 1;
				background: var(--mo-data-grid-header-background, var(--mo-data-grid-sticky-part-color));
				top: 0;
				z-index: 4;
				font-size: small;
				border-block: var(--mo-data-grid-border);
				height: var(--mo-data-grid-header-height);
			}

			.reorder, .details, .selection, .actions, .context-menu {
				position: sticky;
				background: var(--mo-data-grid-sticky-part-color);
				z-index: 5;
			}

			.actions, .context-menu {
				inset-inline-end: 0px;
			}

			.actions {
				mo-icon-button {
					color: var(--mo-color-accent);
					font-size: large;
				}
			}

			.context-menu {
				background-color: var(--mo-color-surface);
				background-color: var(--mo-color-accent);
				mo-icon-button {
					color: var(--mo-color-on-accent);
					font-size: 20px;
				}
			}

			mo-popover {
				background: var(--mo-color-surface);
				border-radius: var(--mo-border-radius);
				box-shadow: var(--mo-shadow);

				mo-section {
					padding: 10px 14px 20px;
					border-bottom: var(--mo-data-grid-border);
					&::part(heading) {
						font-size: min(1em, 14px);
						letter-spacing: 0.15px;
					}
				}
			}
		`
	}

	protected override get template() {
		return html`
			${this.reorderabilityTemplate}
			${this.detailsExpanderTemplate}
			${this.selectionTemplate}
			${this.contentTemplate}
			${this.fillerTemplate}
			${this.actionsTemplate}
		`
	}

	private get reorderabilityTemplate() {
		return !this.dataGrid.reorderabilityController.visible ? html.nothing : html`
			<mo-flex class='reorder'
				${style({ insetInlineStart: this.dataGrid.columnsController.getStickyColumnInsetInline('reordering') })}
				${this.getResizeObserver('reordering')}
			></mo-flex>
		`
	}

	private get detailsExpanderTemplate() {
		return this.dataGrid.hasDetails === false ? html.nothing : html`
			<mo-flex class='details' justifyContent='center' alignItems='center'
				${style({ insetInlineStart: this.dataGrid.columnsController.getStickyColumnInsetInline('details') })}
				${this.getResizeObserver('details')}
			>
				${!this.dataGrid.hasDetails || !this.dataGrid.multipleDetails ? html.nothing : html`
					<mo-icon-button dense
						icon=${this.dataGrid.allRowDetailsOpen ? 'unfold_less' : 'unfold_more'}
						@click=${() => this.toggleAllDetails()}
					></mo-icon-button>
				`}
			</mo-flex>
		`
	}

	private get selectionTemplate() {
		return !this.dataGrid.hasSelection ? html.nothing : html`
			<mo-flex class='selection' justifyContent='center' alignItems='center'
				${style({ insetInlineStart: this.dataGrid.columnsController.getStickyColumnInsetInline('selection') })}
				${this.getResizeObserver('selection')}
			>
				${this.dataGrid.selectability !== DataGridSelectability.Multiple ? html.nothing : html`
					<mo-checkbox .selected=${live(this.selection)} @change=${this.handleSelectionChange}></mo-checkbox>
				`}
			</mo-flex>
		`
	}

	private get selection() {
		switch (this.dataGrid.selectedData.length) {
			case 0:
				return false
			case this.dataGrid.dataLength:
				return true
			default:
				return 'indeterminate'
		}
	}

	private readonly handleSelectionChange = (e: CustomEvent<CheckboxSelection>) => {
		const previousSelection = this.selection
		const selection = e.detail
		if (previousSelection === 'indeterminate' || selection === false) {
			this.dataGrid.deselectAll()
		} else {
			this.dataGrid.selectAll()
		}
	}

	private get contentTemplate() {
		return html`
			${repeat(this.dataGrid.visibleColumns, c => c.dataSelector, (column, index) => html`
				<mo-data-grid-column-header .reorderabilityController=${this.reorderabilityController} .index=${index} .column=${column}></mo-data-grid-column-header>
			`)}
		`
	}

	private get fillerTemplate() {
		return html`<span></span>`
	}

	private get actionsTemplate() {
		return this.dataGrid.hasContextMenu && this.dataGrid.selectedData.length > 1 ? this.contextMenuTemplate : this.columnsTemplate
	}

	private get contextMenuTemplate() {
		return html`
			<mo-flex class='context-menu' alignItems='end' justifyContent='center' ${this.getResizeObserver('actions')}>
				<mo-popover-container>
					<mo-icon-button dense icon='more_vert' title=${t('Actions for ${count:pluralityNumber} selected entries', { count: this.dataGrid.selectedData.length })}></mo-icon-button>

					<mo-menu slot='popover'>
						${this.dataGrid.contextMenuController.getMenuContentTemplate()}
					</mo-menu>
				</mo-popover-container>
			</mo-flex>
		`
	}

	private get columnsTemplate() {
		return html`
			<mo-flex class='actions' alignItems='end' justifyContent='center' ${this.getResizeObserver('actions')}>
				<mo-popover-container>
					<mo-icon-button dense>
						<mo-icon slot='icon' variant='outlined' icon='view_column' style='color: var(--mo-color-gray)'></mo-icon>
					</mo-icon-button>
					<mo-popover slot='popover'>
						<mo-scroller style='max-height: 45vh; min-width: 15rem; overflow-y: auto; overflow-x: hidden;'>
							<mo-flex>
								<mo-section heading=${t('Design')}>
									<mo-flex gap='1rem'>
										<mo-field-select label=${t('Font Size')} ${bind(this, 'dataGrid', { keyPath: 'cellFontSize' as any })}>
											${Array.from({ length: 5 }).map((_, i) => {
												const value = 0.8 + i * 0.1
												return html`<mo-option value=${value}>${(value * 100).formatAsPercent()}</mo-option>`
											})}
										</mo-field-select>
										<mo-field-select label=${t('Row Height')} ${bind(this, 'dataGrid', { keyPath: 'rowHeight' as any })}>
											${Array.from({ length: 7 }).map((_, i) => {
												const value = 30 + i * 5
												return html`<mo-option value=${value}>${value.format()}px</mo-option>`
											})}
										</mo-field-select>
									</mo-flex>
								</mo-section>

								<mo-section .heading=${html`
									${t('Columns')}
									<span style='color: var(--mo-color-gray)'>
										${this.dataGrid.visibleColumns.length.format()}/${this.dataGrid.columns.length.format()}
									</span>
								`}>
									${this.dataGrid.columns.map(this.getColumnTemplate)}
								</mo-section>
							</mo-flex>
						</mo-scroller>
					</mo-popover>
				</mo-popover-container>
			</mo-flex>
		`
	}

	private getResizeObserver(column: Parameters<DataGridColumnsController<TData>['setColumnWidth']>[0]) {
		return observeResize(([entry]) => this.dataGrid.columnsController.setColumnWidth(column, entry?.contentRect.width ?? 0))
	}

	private toggleAllDetails() {
		this.dataGrid.toggleRowDetails()
		this.requestUpdate()
	}

	private readonly getColumnTemplate = (column: DataGridColumn<TData>) => {
		const change = (e: CustomEvent<boolean>) => {
			column.hidden = e.detail === false
			this.dataGrid.setColumns(this.dataGrid.columns)
		}
		return html`
			<mo-checkbox ${style({ height: '30px' })}
				label=${column.heading}
				?selected=${column.hidden === false}
				@change=${change}
			></mo-checkbox>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-header': DataGridHeader<unknown>
	}
}