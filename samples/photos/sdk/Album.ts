import { Api } from './ApiClient.js'

export class Album {
	static getAll = () => Api.get<Array<Album>>('/albums')
	static get = (id: number) => Api.get<Album>(`/album/${id}`)

	readonly id!: number
	readonly userId!: number
	readonly title!: string
}