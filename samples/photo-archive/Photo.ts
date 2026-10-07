import { albums, photos, respond, type Photo as PhotoData } from '../../stories/index.js'
import { Album } from './Album.js'

export type PhotoParameters = { readonly albumIds?: ReadonlyArray<number> }

let archive = [...photos]

/** A photo as the server returns it, with its album. */
export class Photo {
	static get = (id: number) => respond(new Photo(archive.find(photo => photo.id === id)!), 500)

	static getAll = ({ albumIds }: PhotoParameters) => respond(archive
		.filter(photo => !albumIds?.length || albumIds.includes(photo.albumId))
		.map(photo => new Photo(photo)), 500)

	static delete = (deleted: ReadonlyArray<Photo>) => {
		archive = archive.filter(photo => !deleted.some(({ id }) => id === photo.id))
		return respond(undefined, 300)
	}

	readonly id!: number
	readonly title!: string
	readonly album: Album
	readonly takenAt!: DateTime
	readonly width!: number
	readonly height!: number
	readonly url!: string
	readonly thumbnailUrl!: string

	get dimensions() {
		return `${this.width} × ${this.height}`
	}

	constructor({ albumId, ...init }: PhotoData) {
		Object.assign(this, init)
		this.album = new Album(albums.find(album => album.id === albumId)!)
	}
}
