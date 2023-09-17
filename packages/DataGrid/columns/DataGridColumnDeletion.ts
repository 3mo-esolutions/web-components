import { component, html, event, nothing, property, style } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { tooltip } from '@3mo/tooltip'
import { DataGridColumn } from './DataGridColumn.js'

Localizer.register('de', {
	'Delete position': 'Position entfernen'
})

/**
 * @element mo-data-grid-column-deletion
 *
 * @attr prevent - Prevents the deletion button from being displayed
 *
 * @fires delete
 */
@component('mo-data-grid-column-deletion')
export class DataGridColumnDeletion<TData> extends DataGridColumn<TData, never> {
	@event() readonly delete!: EventDispatcher<TData>

	@property({ type: Boolean }) prevent = false

	override width = '40px'
	override nonSortable = true
	override nonEditable = true

	getContentTemplate = (_: never, data?: TData) => this.prevent ? nothing : html`
		<mo-icon-button icon='delete' ${tooltip('Delete position')}
			${style({ color: 'var(--mo-color-gray)', height: '40px' })}
			@click=${() => !data ? void 0 : this.delete.dispatch(data)}
		></mo-icon-button>
	`

	getEditContentTemplate = undefined
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-deletion': DataGridColumnDeletion<unknown>
	}
}