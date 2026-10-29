import { component, html, event, property } from '@a11d/lit'
import { type MaterialIcon } from '@3mo/icon'
import '@3mo/localization'
import { DataGridColumnIconButton } from './DataGridColumnIconButton.js'

/**
 * @element mo-data-grid-column-deletion
 *
 * @attr prevent - Prevents the deletion button from being displayed
 * @attr icon - The icon to display. Defaults to 'delete'
 * @attr tooltip - The tooltip to display. Defaults to 'Delete position'
 *
 * @i18n "Delete position"
 *
 * @fires delete
 */
@component('mo-data-grid-column-deletion')
export class DataGridColumnDeletion<TData> extends DataGridColumnIconButton<TData> {
	@event() readonly delete!: EventDispatcher<TData>

	@property({ type: Boolean }) prevent = false
	@property() override icon: MaterialIcon = 'delete'

	override nonEditable = true

	override getContentTemplate(value: unknown, data?: TData) {
		return this.prevent ? html.nothing : super.getContentTemplate(value, data)
	}

	protected override get tooltipText() {
		return this.tooltip ?? t('Delete position')
	}

	protected override handleClick(data: TData) {
		super.handleClick(data)
		this.delete.dispatch(data)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-deletion': DataGridColumnDeletion<unknown>
	}
}
