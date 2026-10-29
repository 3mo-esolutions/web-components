import { component, html } from '@a11d/lit'
import { DataGridColumnComponent } from '../DataGridColumnComponent.js'
import type { DataGridImagePreviewSource } from './DataGridImagePreview.js'
import type { DataGridImagePreviewButton } from './DataGridImagePreviewButton.js'

/**
 * A column with a button per row which previews the row's image in a popover.
 * Its value is the image source unless `getSource` resolves it, e.g. from a file ID.
 *
 * @element mo-data-grid-column-image-preview
 */
@component('mo-data-grid-column-image-preview')
export class DataGridColumnImagePreview<TData, TValue = string> extends DataGridColumnComponent<TData, TValue> {
	override nonSortable = true
	override nonEditable = true

	/** Resolves a value to its image source, possibly asynchronously, when its preview opens. */
	getSource = (value: TValue): DataGridImagePreviewSource => value as unknown as string | undefined

	/** Content shown above the image in the preview. */
	getPreviewContentTemplate(value: TValue, data: TData): unknown {
		value
		data
		return html.nothing
	}

	override getContentTemplate(value: TValue | undefined, data: TData) {
		return !value ? html.nothing : html`
			<mo-data-grid-image-preview-button .value=${value} .getSource=${this.getSource}>
				${this.getPreviewContentTemplate(value, data)}
			</mo-data-grid-image-preview-button>
		`
	}

	/** Opens the preview of the given row's image. */
	open(data: TData) {
		this.dataGrid
			?.rows.find(row => row.data === data)
			?.getCell(this.column)?.renderRoot
			.querySelector<DataGridImagePreviewButton>('mo-data-grid-image-preview-button')
			?.show()
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-image-preview': DataGridColumnImagePreview<unknown>
	}
}
