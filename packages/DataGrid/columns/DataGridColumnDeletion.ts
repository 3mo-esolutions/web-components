import { component, html, event, property, style } from '@a11d/lit'
import { type MaterialIcon } from '@3mo/icon'
import { Localizer } from '@3mo/localization'
import { tooltip } from '@3mo/tooltip'
import { DataGridColumnComponent } from './DataGridColumnComponent.js'

Localizer.dictionaries.add('de', {
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
export class DataGridColumnDeletion<TData> extends DataGridColumnComponent<TData, never> {
	@event() readonly delete!: EventDispatcher<TData>

	@property() tooltipText?: string
	@property() icon: MaterialIcon = 'delete'
	@property({ type: Boolean }) prevent = false

	override nonSortable = true
	override nonEditable = true

	getContentTemplate = (_: never, data?: TData) => this.prevent ? html.nothing : html`
		<mo-icon-button icon=${this.icon}
			${tooltip(this.tooltipText ?? t('Delete position'))}
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