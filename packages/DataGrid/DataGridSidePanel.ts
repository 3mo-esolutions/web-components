import { component, style, Component, css, html, ifDefined, nothing, property } from '@a11d/lit'
import { Localizer, LanguageCode } from '@3mo/localization'
import { tooltip } from '@3mo/tooltip'
import { type Checkbox } from '@3mo/checkbox'
import { ColumnDefinition } from './ColumnDefinition.js'
import { DataGrid } from './DataGrid.js'

Localizer.register(LanguageCode.German, {
	'Settings': 'Einstellungen',
	'Extended Filters': 'Weitere Filter',
	'Export as Excel file': 'Als Excel-Datei Exportieren',
	'Columns': 'Spalten',
})

export const enum DataGridSidePanelTab {
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
				width: calc(100% - calc(2 * 14px));
				padding: 0 14px;
				margin-top: 14px;
				overflow-x: hidden;
			}

			mo-scroller::part(container) {
				width: calc(100% - calc(2 * 14px));
			}

			mo-section mo-checkbox {
				margin-inline-start: -6px;
			}

			mo-section mo-icon-button {
				margin-inline-start: -10px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-flex ${style({ height: '100%' })}>
				${this.dataGrid.hasToolbar || this.dataGrid.hasFilters === false ? nothing : html`
					<mo-tab-bar
						value=${ifDefined(this.dataGrid.sidePanelTab)}
						@change=${(e: CustomEvent<DataGridSidePanelTab | undefined>) => this.dataGrid.navigateToSidePanelTab(e.detail ?? DataGridSidePanelTab.Settings)}
					>
						<mo-tab icon='filter_list' value=${DataGridSidePanelTab.Filters}></mo-tab>
						<mo-tab icon='settings' value=${DataGridSidePanelTab.Settings}></mo-tab>
					</mo-tab-bar>
				`}

				${this.dataGrid.hasToolbar === false && this.dataGrid.hasFilters === true ? nothing : html`
					<mo-flex id='flexHeading' direction='horizontal' alignItems='center'>
						<mo-heading typography='heading6' ${style({ width: '*', color: 'var(--mo-color-on-surface)' })}>${t(this.dataGrid.sidePanelTab === DataGridSidePanelTab.Filters ? 'Extended Filters' : 'Settings')}</mo-heading>
						<mo-icon-button icon='close' dense
							${tooltip(t('Close'))}
							${style({ cursor: 'pointer', color: 'var(--mo-color-gray)' })}
							@click=${() => this.dataGrid.navigateToSidePanelTab(undefined)}
						></mo-icon-button>
					</mo-flex>
				`}

				<mo-scroller ${style({ height: '*' })}>
					${this.dataGrid.sidePanelTab === DataGridSidePanelTab.Filters ? this.filtersTemplate : this.settingsTemplate}
				</mo-scroller>
			</mo-flex>
		`
	}

	protected get filtersTemplate() {
		return html`
			<mo-flex gap='14px'>
				<slot name='filter'></slot>
			</mo-flex>
		`
	}

	protected get settingsTemplate() {
		return html`
			<mo-flex gap='14px'>
				<slot name='settings'></slot>

				<mo-section heading=${t('Columns')}>
					${this.dataGrid.columns.map(this.getColumnTemplate)}
				</mo-section>

				<mo-section heading='Tools'>
					<mo-icon-button icon='file_download'
						${tooltip('Export as Excel file')}
						@click=${() => this.dataGrid.exportExcelFile()}
					></mo-icon-button>
				</mo-section>
			</mo-flex>
		`
	}

	private readonly getColumnTemplate = (column: ColumnDefinition<TData>) => {
		const change = async (e: CustomEvent<undefined>) => {
			column.hidden = (e.target as Checkbox)?.checked === false
			this.dataGrid.setColumns(this.dataGrid.columns)
			this.dataGrid.requestUpdate()
			await this.dataGrid.updateComplete
		}
		return html`
			<mo-checkbox ${style({ height: '30px' })}
				label=${column.heading}
				?checked=${column.hidden === false}
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