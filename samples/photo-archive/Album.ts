import { albums, people, respond, type Album as AlbumData } from '../../stories/index.js'

/** An album as the server returns it. */
export class Album {
	static getAll = () => respond(albums.map(album => new Album(album)), 300)

	readonly id!: number
	readonly title!: string
	readonly owner!: string

	get photographer() {
		return people.find(person => person.name === this.owner)
	}

	constructor(init: AlbumData) {
		Object.assign(this, init)
	}
}