import { component, html, FieldFetchableSelect } from '@3mo/del'
import { Album } from '../../sdk/index.js'

@component('app-field-select-album')
export class FieldSelectAlbum extends FieldFetchableSelect<Album> {
	override readonly label = 'Album'
	override readonly fetch = Album.getAll
	override readonly optionTemplate = (album: Album) => html`
		<mo-option .data=${album} value=${album.id}>${album.title}</mo-option>
	`
}

declare global {
	interface HTMLElementTagNameMap {
		'app-field-select-album': FieldSelectAlbum
	}
}