import { component, html, event, property, style } from '@a11d/lit'
import { type MaterialIcon } from '@3mo/icon'
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

	@property() icon: MaterialIcon = 'delete'
	@property({ type: Boolean }) prevent = false

	override width = '40px'
	override nonSortable = true
	override nonEditable = true

	getContentTemplate = (_: never, data?: TData) => this.prevent ? html.nothing : html`
		<mo-icon-button icon=${this.icon}
			${tooltip(t('Delete position'))}
			${style({ color: 'var(--mo-color-gray)', height: '40px', display: 'flex' })}
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