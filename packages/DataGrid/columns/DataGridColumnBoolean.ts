import { component, html, property, style } from '@a11d/lit'
import '@3mo/localization'
import { type DataGridColumnAlignment } from '../controller/DataGridColumn.js'
import { DataGridColumnComponent } from './DataGridColumnComponent.js'

/**
 * A column showing a boolean as a dot, colored for true and for false, and nothing for undefined.
 *
 * @element mo-data-grid-column-boolean
 *
 * @attr trueColor - The color of the dot for true values
 * @attr falseColor - The color of the dot for false values
 *
 * @i18n "Yes"
 * @i18n "No"
 */
@component('mo-data-grid-column-boolean')
export class DataGridColumnBoolean<TData> extends DataGridColumnComponent<TData, boolean> {
	@property() trueColor = 'var(--mo-color-green)'
	@property() falseColor = 'var(--mo-color-red)'

	override textAlign: DataGridColumnAlignment = 'center'

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	override getContentTemplate(value: boolean | undefined, _data: TData) {
		return value === undefined ? html.nothing : html`
			<span title=${value ? t('Yes') : t('No')}
				${style({ display: 'inline-block', verticalAlign: 'middle', width: '8px', height: '8px', borderRadius: '50%', background: value ? this.trueColor : this.falseColor })}
			></span>
		`
	}

	override getEditContentTemplate(value: boolean | undefined, data: TData) {
		return html`
			<mo-checkbox autofocus
				?selected=${value}
				@change=${(e: CustomEvent<boolean>) => this.handleEdit(e.detail, data)}
				${style({ justifySelf: this.textAlign })}
			></mo-checkbox>
		`
	}

	override *generateCsvValue(value: boolean): Generator<string> {
		yield value ? '1' : '0'
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-boolean': DataGridColumnBoolean<unknown>
	}
}
