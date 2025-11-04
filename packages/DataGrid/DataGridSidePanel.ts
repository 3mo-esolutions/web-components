import { component, style, Component, css, html, ifDefined, property } from '@a11d/lit'
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

	get density() {
		const [fontSize, rowHeight] = [this.dataGrid.cellFontSize, this.dataGrid.rowHeight]
		switch (true) {
			case fontSize === 0.8 && rowHeight === 2:
				return 'compact'
			case fontSize === 1 && rowHeight === 2.5:
				return 'comfortable'
			case fontSize === 1.2 && rowHeight === 3:
				return 'spacious'
			default:
				return undefined
		}
	}
	set density(value: 'compact' | 'comfortable' | 'spacious' | undefined) {
		switch (value) {
			case 'compact':
				[this.dataGrid.cellFontSize, this.dataGrid.rowHeight] = [0.8, 2]
				break
			case 'comfortable':
				[this.dataGrid.cellFontSize, this.dataGrid.rowHeight] = [1, 2.5]
				break
			case 'spacious':
				[this.dataGrid.cellFontSize, this.dataGrid.rowHeight] = [1.2, 3]
				break
		}
	}

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
				&::part(heading) {
					font-size: min(1em, 14px);
					letter-spacing: 0.15px;
				}
			}

			mo-button-group {
				display: flex;
				justify-content: center;
				padding: 1rem;
				mo-button:not([selected]) {
					--mo-color-accent: var(--mo-color-gray);
				}
				mo-icon {
					margin-top: 3px;
					font-size: 18px;
				}
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
				<mo-button-group type='outlined'>
					<mo-button ?selected=${this.density === 'compact'} @click=${() => this.density = 'compact'}>
						<mo-flex>
							<mo-icon icon='density_small'></mo-icon>
							<span>${t('Compact')}</span>
						</mo-flex>
					</mo-button>
					<mo-button ?selected=${this.density === 'comfortable'} @click=${() => this.density = 'comfortable'}>
						<mo-flex>
							<mo-icon icon='density_medium'></mo-icon>
							<span>${t('Comfortable')}</span>
						</mo-flex>
					</mo-button>
					<mo-button ?selected=${this.density === 'spacious'} @click=${() => this.density = 'spacious'}>
						<mo-flex>
							<mo-icon icon='density_large'></mo-icon>
							<span>${t('Spacious')}</span>
						</mo-flex>
					</mo-button>
				</mo-button-group>

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