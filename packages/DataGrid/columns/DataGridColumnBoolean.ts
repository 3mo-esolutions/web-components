import { component, html, property, style } from '@a11d/lit'
import { type MaterialIcon } from '@3mo/icon'
import { DataGridColumnComponent } from './DataGridColumnComponent.js'

/**
 * @element mo-data-grid-column-boolean
 *
 * @attr trueIcon - Icon to show for true values
 * @attr falseIcon - Icon to show for false values
 * @attr trueIconColor - Color of the true icon
 * @attr falseIconColor - Color of the false icon
 */
@component('mo-data-grid-column-boolean')
export class DataGridColumnBoolean<TData> extends DataGridColumnComponent<TData, boolean> {
	@property() trueIcon: MaterialIcon = 'done'
	@property() falseIcon: MaterialIcon = 'clear'

	@property() trueIconColor = 'var(--mo-color-accent)'
	@property() falseIconColor = 'var(--mo-color-gray)'

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getContentTemplate(value: boolean | undefined, _data: TData) {
		return html`
			<mo-flex justifyContent='center' ${style({ height: '100%' })}>
				<mo-icon icon=${value ? this.trueIcon : this.falseIcon} ${style({ color: value ? this.trueIconColor : this.falseIconColor })}></mo-icon>
			</mo-flex>
		`
	}

	getEditContentTemplate(value: boolean | undefined, data: TData) {
		return html`
			<mo-checkbox autofocus
				?selected=${value}
				@change=${(e: CustomEvent<boolean>) => this.handleEdit(e.detail, data)}
			></mo-checkbox>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-boolean': DataGridColumnBoolean<unknown>
	}
}