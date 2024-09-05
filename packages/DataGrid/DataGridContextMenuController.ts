import { Controller, html, style } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { type DataGrid } from './index.js'

Localizer.dictionaries.add('de', {
	'selected': 'ausgewählt',
})

export class DataGridContextMenuController<TData> extends Controller {
	private static readonly infoStyle = {
		padding: '10px 16px',
		color: 'var(--mo-color-gray)',
		pointerEvents: 'none',
		fontSize: 'small',
	}

	private static readonly infoCountStyle = {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: '12px',
		height: '100%',
		color: 'var(--mo-color-on-accent)',
		background: 'var(--mo-color-accent)',
		padding: '2px 4px',
		marginInlineEnd: '4px',
		borderRadius: '100px',
	}

	constructor(override readonly host: DataGrid<TData, any>) {
		super(host)
	}

	get hasContextMenu() {
		return this.host.getRowContextMenuTemplate !== undefined
	}

	getMenuContentTemplate(data = this.host.selectedData) {
		return !this.hasContextMenu ? html.nothing : html`
			${data.length === 1 ? html.nothing : html`
				<div ${style(DataGridContextMenuController.infoStyle)}>
					<span ${style(DataGridContextMenuController.infoCountStyle)}>${data.length.format()}</span>
					${t('selected')}
				</div>
				<mo-line></mo-line>
			`}
			${this.host.getRowContextMenuTemplate?.(data) ?? html.nothing}
		`
	}
}