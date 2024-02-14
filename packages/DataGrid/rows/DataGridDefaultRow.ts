import { css, component, html } from '@a11d/lit'
import { DataGridRow } from './DataGridRow.js'
import type { DataGrid } from '../DataGrid.js'

@component('mo-data-grid-default-row')
export class DataGridDefaultRow<TData, TDetailsElement extends Element | undefined = undefined> extends DataGridRow<TData, TDetailsElement> {
	static override get styles() {
		return css`
			${super.styles}

			mo-grid {
				height: var(--mo-data-grid-row-height);
				grid-template-columns: var(--mo-data-grid-columns);
				column-gap: var(--mo-data-grid-columns-gap);
			}

			mo-flex {
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			}

			#selectionContainer {
				height: var(--mo-data-grid-row-height);
			}

			#detailsContainer [instanceof*=mo-data-grid] {
				--mo-data-grid-header-background: rgba(var(--mo-color-foreground-base), 0.04);
				--mo-data-grid-alternating-background: transparent;
				--mo-data-grid-content-min-height: 0px;
			}

			#detailsContainer [instanceof*=mo-data-grid]:not([headerHidden]) {
				background: var(--mo-color-transparent-gray-1);
			}

			:host-context(:not([hasDetails]):not([selectionMode=single]):not([selectionMode=multiple])) #detailsContainer > [instanceof*=mo-data-grid]:not([headerHidden]) {
				margin: 16px var(--mo-details-data-grid-start-margin);
				width: calc(100% - calc(var(--mo-details-data-grid-start-margin) * 2));
			}

			:host-context(:not([hasDetails]):not([selectionMode=single]):not([selectionMode=multiple])) #detailsContainer > [instanceof*=mo-data-grid] {
				padding: 0px !important;
			}

			:host-context(:not([hasDetails]):not([selectionMode=single]):not([selectionMode=multiple])) #detailsContainer > [instanceof*=mo-data-grid][headerHidden] {
				margin-inline-start: var(--mo-details-data-grid-start-margin);
				width: calc(100% - var(--mo-details-data-grid-start-margin));
			}

			@supports (not selector(:host-context([data-has-details]))) {
				:host([data-has-details=true]) #detailsContainer > [instanceof*=mo-data-grid]:not([headerHidden]) {
					margin: 16px var(--mo-details-data-grid-start-margin);
					width: calc(100% - calc(var(--mo-details-data-grid-start-margin) * 2));
				}
				:host([data-has-details=true]) #detailsContainer > [instanceof*=mo-data-grid] {
					padding: 0px !important;
				}
				:host([data-has-details=true]) #detailsContainer > [instanceof*=mo-data-grid][headerHidden] {
					margin-inline-start: var(--mo-details-data-grid-start-margin);
					width: calc(100% - var(--mo-details-data-grid-start-margin));
				}
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
			${this.contextMenuIconButtonTemplate}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-default-row': DataGridRow<unknown>
	}
}