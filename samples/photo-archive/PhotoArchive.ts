import { component, DataGridSelectability, DialogDeletion, html, ModdableDataGrid } from '@3mo/del'
import { Photo, type PhotoParameters } from './Photo.js'
import { PhotoDialog } from './PhotoDialog.js'
import './AlbumSelectField.js'

/** Every photo of every album, filtered by album and saved as views, with a preview in the details and a dialog to open one. */
@component('recipe-photo-archive')
export class PhotoArchive extends ModdableDataGrid<Photo, PhotoParameters> {
	override parameters: PhotoParameters = {}
	override fetch = Photo.getAll
	override selectability = DataGridSelectability.Multiple
	override multipleDetails = true
	override primaryContextMenuItemOnDoubleClick = true

	override get toolbarDefaultTemplate() {
		return html`
			<recipe-album-select-field multiple default='All' style='min-width: 220px' ${this.parametersBinder.bind('albumIds')}></recipe-album-select-field>
		`
	}

	override get columnsTemplate() {
		return html`
			<mo-data-grid-column-text heading='Title' dataSelector='title' width='2fr'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Album' dataSelector='album.title' width='1fr'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Photographer' dataSelector='album.owner' width='1fr'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Taken' dataSelector='takenAt' width='120px'></mo-data-grid-column-date>
			<mo-data-grid-column-text heading='Dimensions' dataSelector='dimensions' width='120px'></mo-data-grid-column-text>
		`
	}

	override getRowDetailsTemplate = (photo: Photo) => html`
		<img src=${photo.thumbnailUrl} alt=${photo.title} style='display: block; height: 150px; margin-block: 8px; border-radius: var(--mo-border-radius)'>
	`

	override getRowContextMenuTemplate = (photos: Array<Photo>) => html`
		${photos.length !== 1 ? html.nothing : html`
			<mo-data-grid-primary-context-menu-item icon='open_in_new' @click=${() => new PhotoDialog({ id: photos[0]!.id }).confirm()}>Open</mo-data-grid-primary-context-menu-item>
		`}
		<mo-context-menu-item icon='delete' @click=${() => this.delete(photos)}>Delete</mo-context-menu-item>
	`

	private async delete(photos: Array<Photo>) {
		await new DialogDeletion({
			label: photos.length === 1 ? photos[0]!.title : `${photos.length} photos`,
			deletionAction: () => Photo.delete(photos),
		}).confirm()
		await this.requestFetch()
	}
}
