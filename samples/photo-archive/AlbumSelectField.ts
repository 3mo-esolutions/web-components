import { component, FieldFetchableSelect, html } from '@3mo/del'
import { Album } from './Album.js'

/** Selects albums, fetched from the server. */
@component('recipe-album-select-field')
export class AlbumSelectField extends FieldFetchableSelect<Album> {
	override label = 'Album'
	override fetch = Album.getAll
	override optionTemplate = (album: Album) => html`<mo-option value=${album.id} .data=${album}>${album.title}</mo-option>`
}