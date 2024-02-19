import { component, style, Component, css, html, ifDefined, property } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { tooltip } from '@3mo/tooltip'
import { type Checkbox } from '@3mo/checkbox'
import { ColumnDefinition } from './ColumnDefinition.js'
import { DataGrid } from './DataGrid.js'

Localizer.register('de', {
	'Settings': 'Einstellungen',
	'Extended Filters': 'Weitere Filter',
	'Columns': 'Spalten',
	'Font Size': 'Schriftgröße',
	'Row Height': 'Zeilenhöhe',
	'Tools': 'Tools',
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

			mo-flex[slot=heading] {
				align-items: center;
			}

			mo-flex[slot=heading] div {
				color: var(--mo-color-gray);
				margin-inline-start: 8px;
				font-size: small;
			}

			mo-section::part(root) {
				height: unset !important;
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
			<mo-flex gap='14px'>
				<slot name='filter'></slot>
			</mo-flex>
		`
	}

	protected get settingsTemplate() {
		return html`
			<mo-flex gap='14px'>
				<slot name='settings'></slot>

				<mo-section>
					<mo-flex slot='heading' direction='horizontal'>
						<mo-heading typography='heading4'>${t('Columns')}</mo-heading>
						<div>${this.dataGrid.visibleColumns.length.format()} / ${this.dataGrid.columns.length.format()}</div>
					</mo-flex>
					${this.dataGrid.columns.map(this.getColumnTemplate)}
				</mo-section>

				<mo-section>
					<mo-flex slot='heading' direction='horizontal'>
						<mo-heading typography='heading4'>${t('Font Size')}</mo-heading>
						<div>${(this.dataGrid.cellFontSize * 100).formatAsPercent()}</div>
					</mo-flex>

					<mo-slider min='0.8' max='1.2' step='0.1'
						value=${this.dataGrid.cellFontSize}
						@input=${(e: CustomEvent<number>) => this.dataGrid.cellFontSize = e.detail}
					></mo-slider>
				</mo-section>

				<mo-section>
					<mo-flex slot='heading' direction='horizontal'>
						<mo-heading typography='heading4'>${t('Row Height')}</mo-heading>
						<div>${this.dataGrid.rowHeight.format()} px</div>
					</mo-flex>

					<mo-slider min='30' max='60' step='5'
						value=${this.dataGrid.rowHeight}
						@input=${(e: CustomEvent<number>) => this.dataGrid.rowHeight = e.detail}
					></mo-slider>
				</mo-section>
			</mo-flex>
		`
	}

	private readonly getColumnTemplate = (column: ColumnDefinition<TData>) => {
		const change = async (e: CustomEvent<undefined>) => {
			column.hidden = (e.target as Checkbox)?.selected === false
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