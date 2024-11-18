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