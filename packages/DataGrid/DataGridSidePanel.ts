import { component, style, Component, css, html, property } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { tooltip } from '@3mo/tooltip'
import { type DataGrid } from './DataGrid.js'

Localizer.dictionaries.add('de', {
	'Extended Filters': 'Weitere Filter',
})

export enum DataGridSidePanelTab {
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
				&::part(heading) {
					font-size: min(1em, 14px);
					letter-spacing: 0.15px;
				}
			}

		`
	}

	protected override get template() {
		return html`
			<mo-flex ${style({ position: 'absolute', inset: '0' })}>
				${this.dataGrid.hasToolbar === false && this.dataGrid.hasFilters === true ? html.nothing : html`
					<mo-flex id='flexHeading' direction='horizontal' alignItems='center'>
						<mo-heading typography='heading6' ${style({ flex: '1', color: 'var(--mo-color-on-surface)' })}>${t('Extended Filters')}</mo-heading>
						<mo-icon-button icon='close' dense
							${tooltip(t('Close'))}
							${style({ color: 'var(--mo-color-gray)' })}
							@click=${() => this.dataGrid.navigateToSidePanelTab(undefined)}
						></mo-icon-button>
					</mo-flex>
				`}

				<mo-scroller ${style({ flex: '1' })}>
					${this.filtersTemplate}
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
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-side-panel': DataGridSidePanel<unknown>
	}
}