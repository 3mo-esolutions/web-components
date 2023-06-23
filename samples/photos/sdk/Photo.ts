import { Api } from './ApiClient.js'

export class Photo {
	static get = (id: number) => Api.get<Photo>(`/photos/${id}`)

	private static count = -1
	static getAll = async (parameters: {
		albumIds?: Array<number>
		skip?: number
		take?: number
	}) => {
		Photo.count++
		const queryString = (parameters.albumIds?.map(id => `albumId=${id}`) ?? []).join('&')
		const result = await Api.get<Array<Photo>>(`/photos?${queryString}&skip=${parameters.skip}&take=${parameters.take}`)
		await Promise.sleep(500)
		if (parameters.take !== undefined && parameters.skip !== undefined) {
			return {
				data: result.slice(parameters.skip, parameters.skip + parameters.take),
				dataLength: result.length,
				// hasNextPage: (parameters.skip + parameters.take) < result.length,
			}
		}
		// Simulate live data change
		return [...result.slice(0, Photo.count), ...result]
	}

	readonly id!: number
	readonly albumId!: number
	readonly thumbnailUrl!: string
	readonly url!: string
	readonly title!: string
}