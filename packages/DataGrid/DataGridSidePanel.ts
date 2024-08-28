import { component, style, Component, css, html, ifDefined, property, bind } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { tooltip } from '@3mo/tooltip'
import { type DataGridColumn } from './DataGridColumn.js'
import { type DataGrid } from './DataGrid.js'

Localizer.dictionaries.add('de', {
	'Settings': 'Einstellungen',
	'Extended Filters': 'Weitere Filter',
	'Columns': 'Spalten',
	'Font Size': 'Schriftgröße',
	'Row Height': 'Zeilenhöhe',
	'Tools': 'Tools',
	'Design': 'Design',
})

export enum DataGridSidePanelTab {
	Settings = 'settings',
	Filters = 'filters',
}

/**
 * @element mo-data-grid-side-panel
 * @attr dataGrid
 * @attr tab
 */
@component('mo-data-grid-side-panel')
export class DataGridSidePanel<TData> extends Component {
	@property({ type: Object }) dataGrid!: DataGrid<TData, any>
	@property() tab?: DataGridSidePanelTab

	static override get styles() {
		return css`
			:host {
				display: inline-block !important;
				transition: 250ms;
				width: 100%;
				height: 100%;
				transform-origin: right center;
				z-index: 10;
			}

			:host(:not([hidden])) {
				border-inline-start: var(--mo-data-grid-border);
				background: var(--mo-color-transparent-gray-1);
				opacity: 1;
			}

			:host([hidden]) {
				opacity: 0;
				transform: scale(0, 1);
				width: 0;
			}

			#flexHeading {
				border-top: var(--mo-data-grid-border);
				border-bottom: var(--mo-data-grid-border);
				height: var(--mo-data-grid-header-height);
				padding-inline-start: 14px;
			}

			mo-scroller {
				overflow-x: hidden;
			}

			mo-section {
				padding: 10px 14px 20px;
				border-bottom: var(--mo-data-grid-border);
			}

			mo-section::part(heading) {
				font-size: min(1em, 14px);
				letter-spacing: 0.15px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-flex ${style({ height: '100%' })}>
				${this.dataGrid.hasToolbar || this.dataGrid.hasFilters === false ? html.nothing : html`
					<mo-tab-bar ${style({ height: '60px' })}
						value=${ifDefined(this.dataGrid.sidePanelTab)}
						@change=${(e: CustomEvent<DataGridSidePanelTab | undefined>) => this.dataGrid.navigateToSidePanelTab(e.detail ?? DataGridSidePanelTab.Settings)}
					>
						<mo-tab value=${DataGridSidePanelTab.Filters}>
							<mo-icon icon='filter_list'></mo-icon>
							${t('Extended Filters')}
						</mo-tab>
						<mo-tab value=${DataGridSidePanelTab.Settings}>
							<mo-icon icon='settings'></mo-icon>
							${t('Settings')}
						</mo-tab>
					</mo-tab-bar>
				`}

				${this.dataGrid.hasToolbar === false && this.dataGrid.hasFilters === true ? html.nothing : html`
					<mo-flex id='flexHeading' direction='horizontal' alignItems='center'>
						<mo-heading typography='heading6' ${style({ flex: '1', color: 'var(--mo-color-on-surface)' })}>${t(this.dataGrid.sidePanelTab === DataGridSidePanelTab.Filters ? 'Extended Filters' : 'Settings')}</mo-heading>
						<mo-icon-button icon='close' dense
							${tooltip(t('Close'))}
							${style({ cursor: 'pointer', color: 'var(--mo-color-gray)' })}
							@click=${() => this.dataGrid.navigateToSidePanelTab(undefined)}
						></mo-icon-button>
					</mo-flex>
				`}

				<mo-scroller ${style({ flex: '1' })}>
					${this.dataGrid.sidePanelTab === DataGridSidePanelTab.Filters ? this.filtersTemplate : this.settingsTemplate}
				</mo-scroller>
			</mo-flex>
		`
	}

	protected get filtersTemplate() {
		return html`
			<mo-flex gap='14px' style='padding: 14px'>
				<slot name='filter'></slot>
			</mo-flex>
		`
	}

	protected get settingsTemplate() {
		return html`
			<mo-flex>
				<slot name='settings'></slot>

				<mo-section heading=${t('Design')}>
					<mo-flex gap='16px'>
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
		`
	}

	private readonly getColumnTemplate = (column: DataGridColumn<TData>) => {
		const change = async (e: CustomEvent<boolean>) => {
			column.hidden = e.detail === false
			this.dataGrid.setColumns(this.dataGrid.columns)
			this.dataGrid.requestUpdate()
			await this.dataGrid.updateComplete
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
		'mo-data-grid-side-panel': DataGridSidePanel<unknown>
	}
}