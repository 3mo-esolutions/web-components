import { component, html, ModdableDataGrid, style } from '@3mo/del'
import { Photo } from '../../sdk/index.js'

@component('photos-data-grid-photo')
export class DataGridPhoto extends ModdableDataGrid<Photo, FirstParameter<typeof Photo.getAll>> {
	override readonly fetch = Photo.getAll

	override parameters: FirstParameter<typeof Photo.getAll> = {}

	override readonly paginationParameters = () => ({
		take: this.pageSize,
		skip: (this.page - 1) * this.pageSize
	})

	protected override get columnsTemplate() {
		return html`
			<mo-data-grid-column-number width='50px' heading='ID' title='Identifier' dataSelector=${getKeyPath<Photo>('id')}></mo-data-grid-column-number>
			<mo-data-grid-column-number width='50px' heading='Album ID' dataSelector=${getKeyPath<Photo>('albumId')} sumHeading='Summe'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='URL' title='Uniform Resource Locator' dataSelector=${getKeyPath<Photo>('url')}></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Name' dataSelector=${getKeyPath<Photo>('title')}></mo-data-grid-column-text>
		`
	}

	override getRowDetailsTemplate = (photo: Photo) => html`
		<mo-flex ${style({ padding: '10px' })} gap='10px'>
			<mo-heading typography='heading5'>${photo.title}</mo-heading>
			<img ${style({ width: '200px' })} src=${photo.thumbnailUrl} title=${photo.title}>
		</mo-flex>
	`

	override getRowContextMenuTemplate = (rowData: Array<Photo>) => html`
		${rowData.length > 1 ? html.nothing : html`<mo-data-grid-primary-context-menu-item icon='edit' @click=${() => alert('edit')}>Edit</mo-data-grid-primary-context-menu-item>`}
		<mo-context-menu-item icon='delete' @click=${() => alert('delete')}>Delete</mo-context-menu-item>
	`

	override get hasToolbar() {
		return true
	}

	protected override get toolbarDefaultTemplate() {
		return html`
			<app-field-select-album multiple default='All' ${this.parametersBinder.bind('albumIds')}></app-field-select-album>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'photos-data-grid-photo': DataGridPhoto
	}
}