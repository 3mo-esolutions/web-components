import { css, component, html } from '@a11d/lit'
import { DataGridRow } from './DataGridRow.js'
import type { DataGrid } from '../DataGrid.js'

@component('mo-data-grid-default-row')
export class DataGridDefaultRow<TData, TDetailsElement extends Element | undefined = undefined> extends DataGridRow<TData, TDetailsElement> {
	static override get styles() {
		return css`
			${super.styles}

			:host {
				display: grid;
				grid-template-columns: subgrid;
				grid-column: -1 / 1;
				min-height: var(--mo-data-grid-row-height);
			}

			mo-flex {
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			}

			#selectionContainer {
				height: var(--mo-data-grid-row-height);
			}

			#detailsContainer {
				grid-column: -1 / 1;
			}

			:host(:not([has-sub-data])) #detailsContainer {
				background: color-mix(in srgb, var(--mo-color-accent), transparent 95%);
        padding-left: 20px;
        width: calc(100% - 20px);
				--mo-data-grid-border-top: none;
			}

      :host([has-checkbox]:not([has-sub-data])) #detailsContainer {
        padding-left: 60px !important;
        width: calc(100% - 60px) !important;
      }

			:host([has-sub-data]) #detailsContainer {
				display: grid;
				grid-template-columns: subgrid;
			}

			#detailsContainer [instanceof*=mo-data-grid] {
				--mo-data-grid-alternating-background: transparent;
				--_content-min-height-default: 0px;
			}

			#detailsContainer [instanceof*=mo-data-grid]:not([headerHidden]) {
				background: var(--mo-color-transparent-gray-1);
			}

			:host([data-grid-has-details]) #detailsContainer > [instanceof*=mo-data-grid][headerHidden] {
				margin-inline-start: var(--mo-details-data-grid-start-margin);
				width: calc(100% - var(--mo-details-data-grid-start-margin));
			}

			:host([data-grid-has-details]) #detailsContainer > [instanceof*=mo-data-grid]:not([headerHidden]) {
				margin: 16px var(--mo-details-data-grid-start-margin);
				width: calc(100% - calc(var(--mo-details-data-grid-start-margin) * 2));
			}

			:host([data-grid-has-details]) #detailsContainer > [instanceof*=mo-data-grid] {
				padding: 0px !important;
			}
		`
	}

	override updated(...parameters: Parameters<DataGridRow<TData, TDetailsElement>['updated']>) {
		super.updated(...parameters)
		const subDataGrid = this.renderRoot.querySelector<DataGrid<TData, TDetailsElement>>('[instanceof*=mo-data-grid]')
		if (subDataGrid) {
			subDataGrid.preventVerticalContentScroll = true
		}
	}

	protected override get rowTemplate() {
		return html`
			${this.detailsExpanderTemplate}
			${this.selectionTemplate}
			${this.dataGrid.columns.map(column => this.getCellTemplate(column))}
			${this.fillerTemplate}
			${this.contextMenuIconButtonTemplate}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-default-row': DataGridRow<unknown>
	}
}