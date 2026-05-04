import { css, component, html } from '@a11d/lit'
import { DataGridRow } from './DataGridRow.js'

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

	protected override get rowTemplate() {
		return html`
			${this.reorderabilityTemplate}
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