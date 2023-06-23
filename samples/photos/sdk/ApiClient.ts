type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export class Api {
	private static readonly url = 'https://jsonplaceholder.typicode.com'

	static get<T = any>(route: string) {
		return this.fetch<T>('GET', route)
	}

	private static async fetch<T = any>(method: HttpMethod, route: string) {
		const response = await fetch(Api.url + route, { method: method })

		if (response.status >= 400) {
			throw new Error('Network error')
		}

		return await response.json() as T
	}
}