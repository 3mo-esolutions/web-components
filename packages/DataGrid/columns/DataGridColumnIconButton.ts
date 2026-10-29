import { component, html, event, property, style } from '@a11d/lit'
import { type MaterialIcon } from '@3mo/icon'
import { tooltip } from '@3mo/tooltip'
import { DataGridColumnComponent } from './DataGridColumnComponent.js'

/**
 * A column with an icon button per row, which stays clickable while the row is edited.
 *
 * @element mo-data-grid-column-icon-button
 *
 * @attr icon - The icon of the buttons
 * @attr tooltip - The tooltip of the buttons
 * @attr disabled - Whether the button of a row is disabled
 *
 * @fires iconClick - Dispatched with the row's data when its button is clicked
 */
@component('mo-data-grid-column-icon-button')
export class DataGridColumnIconButton<TData> extends DataGridColumnComponent<TData, unknown> {
	@event() readonly iconClick!: EventDispatcher<TData>

	@property() icon!: MaterialIcon
	@property() tooltip?: string
	@property({ type: Object }) disabled?: (data: TData) => boolean

	override nonSortable = true

	override getContentTemplate(_: unknown, data?: TData) {
		const disabled = !data ? false : this.disabled?.(data) ?? false
		const tooltipText = this.tooltipText
		return html`
			<mo-icon-button icon=${this.icon} ?disabled=${disabled}
				${!tooltipText ? html.nothing : tooltip(tooltipText)}
				${style({ color: 'var(--mo-color-gray)', height: '40px', display: 'flex' })}
				@click=${() => !data || disabled ? void 0 : this.handleClick(data)}
			></mo-icon-button>
		`
	}

	override getEditContentTemplate = this.getContentTemplate

	protected get tooltipText(): string | undefined {
		return this.tooltip
	}

	protected handleClick(data: TData) {
		this.iconClick.dispatch(data)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-icon-button': DataGridColumnIconButton<unknown>
	}
}
